// ChemBuddy - Learning Path Module

var Learn = (function () {
    'use strict';

    var activeTimers = {};

    // An equipment is complete once studied and its quiz taken. While its quiz
    // is still being prepared, studying alone completes it.
    function isEquipmentComplete(equipId, studied, quizzes) {
        if (!studied[equipId]) return false;
        return !!quizzes[equipId] || !QuizEngine.isQuizReady(equipId);
    }

    // With a weekly schedule, equipment opens on its release day. Without one,
    // equipment inside a module unlocks once the previous one is studied.
    function isEquipmentAvailable(mod, index, studied) {
        if (learningPath.hasSchedule()) return learningPath.isReleased(mod.equipment[index].id);
        return index === 0 || !!studied[mod.equipment[index - 1].id];
    }

    // "Mon, 17 Nov"
    function opensLabel(equipId) {
        var date = learningPath.releaseDate(equipId);
        return date ? date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
    }

    function lockedMessage(mod, index) {
        if (learningPath.hasSchedule()) return 'Opens on ' + opensLabel(mod.equipment[index].id);
        return 'Study ' + mod.equipment[index - 1].name + ' first';
    }

    // Next thing to do: the first incomplete equipment that is open. When all
    // open equipment is done, the next one still to open (upcoming: true).
    function getTodayInfo(progress) {
        var studied = progress.studied || {};
        var quizzes = progress.quizzes || {};
        var upcoming = null;

        for (var m = 0; m < learningPath.modules.length; m++) {
            var mod = learningPath.modules[m];
            for (var i = 0; i < mod.equipment.length; i++) {
                var eq = mod.equipment[i];
                if (isEquipmentComplete(eq.id, studied, quizzes)) continue;
                var info = {
                    moduleId: mod.id,
                    moduleTitle: 'Module ' + mod.id + ': ' + mod.title,
                    equipId: eq.id,
                    title: eq.name,
                    position: (i + 1) + ' of ' + mod.equipment.length,
                    quizAvailable: !!studied[eq.id] && !quizzes[eq.id] && QuizEngine.isQuizReady(eq.id)
                };
                if (isEquipmentAvailable(mod, i, studied)) return info;
                if (!upcoming && learningPath.hasSchedule()) {
                    info.upcoming = true;
                    info.opensOn = opensLabel(eq.id);
                    upcoming = info;
                }
            }
        }
        return upcoming; // null = all complete
    }

    function renderOverview(container) {
        var progress = window.ChemBuddy.progress || {};
        var studied = progress.studied || {};
        var quizzes = progress.quizzes || {};

        var html = '<div class="learn-header">';
        html += '<h1>Learning Path</h1>';
        var week = learningPath.currentWeek();
        var pace;
        if (!week) pace = 'self-paced';
        else if (week.week === 0) pace = 'starts ' + opensLabel(learningPath.allEquipment()[0].id);
        else pace = 'week ' + week.week + ' of ' + week.total;
        html += '<p>' + Utils.sanitize(learningPath.title) + ' — ' + learningPath.modules.length + ' modules, ' + pace + '</p>';
        html += '</div>';

        html += '<div class="weeks-grid">';

        learningPath.modules.forEach(function (mod) {
            var totalEquip = mod.equipment.length;
            var studiedEquip = mod.equipment.filter(function (eq) { return studied[eq.id]; }).length;
            var pct = totalEquip > 0 ? Math.round((studiedEquip / totalEquip) * 100) : 0;

            html += '<div class="week-card">';
            html += '<div class="week-card-header">';
            html += '<h2>Module ' + mod.id + ': ' + Utils.sanitize(mod.title) + '</h2>';
            html += '<p>' + Utils.sanitize(mod.description) + '</p>';
            html += '<div class="week-progress-info">';
            html += '<span>' + studiedEquip + '/' + totalEquip + '</span>';
            html += '<div class="progress"><div class="progress-bar" style="width:' + pct + '%"></div></div>';
            html += '<span>' + pct + '%</span>';
            html += '</div></div>';

            html += '<div class="week-card-body">';

            mod.equipment.forEach(function (eq, idx) {
                var quizDone = quizzes[eq.id];
                var isComplete = isEquipmentComplete(eq.id, studied, quizzes);
                var isAvailable = isEquipmentAvailable(mod, idx, studied);

                var statusClass = isComplete ? 'completed' : (isAvailable ? 'available' : 'locked');
                var statusText = isComplete ? '✓ Done' : (isAvailable ? 'Start →' : (learningPath.hasSchedule() ? '🔒 ' + opensLabel(eq.id) : '🔒 Locked'));

                var meta;
                if (quizDone) meta = 'Quiz: ' + quizDone.score + '/' + quizDone.maxScore;
                else if (!QuizEngine.isQuizReady(eq.id)) meta = 'Quiz coming soon';
                else meta = learningPath.quizLength + '-question quiz';

                html += '<div class="day-row" data-equip="' + eq.id + '" data-available="' + isAvailable + '" data-locked-msg="' + (isAvailable ? '' : Utils.sanitize(lockedMessage(mod, idx))) + '">';
                html += '<div class="day-number ' + statusClass + '">' + (idx + 1) + '</div>';
                html += '<div class="day-info"><h4>' + Utils.sanitize(eq.name) + '</h4>';
                html += '<p>' + meta + '</p></div>';
                html += '<div class="day-status ' + statusClass + '">' + statusText + '</div>';
                html += '</div>';
            });

            html += '</div></div>';
        });

        html += '</div>';
        container.innerHTML = html;

        // Equipment row clicks
        container.querySelectorAll('.day-row').forEach(function (row) {
            row.addEventListener('click', function () {
                if (this.dataset.available === 'true') {
                    Router.navigate('/learn/' + this.dataset.equip);
                } else {
                    Utils.toast(this.dataset.lockedMsg, 'warning');
                }
            });
        });
    }

    function renderLesson(container, params) {
        var equipId = params.equipId; // e.g. "centrifugal-pump"
        var found = learningPath.findEquipment(equipId);
        if (!found || !equipmentDB[equipId]) {
            container.innerHTML = '<p>Lesson not found. <a href="#/learn">Back to Learning Path</a></p>';
            return;
        }
        var mod = found.module;
        var lesson = mod.equipment[found.index];

        var progress = window.ChemBuddy.progress || {};
        var studied = progress.studied || {};
        var quizzes = progress.quizzes || {};

        if (!isEquipmentAvailable(mod, found.index, studied)) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔒</div><h3>Locked</h3><p>' + Utils.sanitize(lockedMessage(mod, found.index)) + '.</p><a href="#/learn" class="btn btn-primary mt-2">Back to Learning Path</a></div>';
            return;
        }

        var html = '';
        html += '<a href="#/learn" class="btn btn-outline btn-sm day-back-btn">← Back to Learning Path</a>';

        html += '<div class="day-detail-header">';
        html += '<span class="badge badge-primary">Module ' + mod.id + ' — ' + Utils.sanitize(mod.title) + ' • ' + (found.index + 1) + ' of ' + mod.equipment.length + '</span>';
        html += '<h1>' + Utils.sanitize(lesson.name) + '</h1>';
        html += '</div>';

        // Equipment card
        html += '<div class="day-equipment-list">';
        [equipId].forEach(function (equipId) {
            var equip = equipmentDB[equipId];
            if (!equip) return;

            var isStudied = studied[equipId];
            var statusDot = isStudied ? 'studied' : 'not-started';
            var statusText = isStudied ? 'Studied ✓' : 'Not started';
            var timeSpent = isStudied ? isStudied.timeSpent || 0 : 0;

            html += '<div class="day-equip-card expanded" data-equip="' + equipId + '">';
            html += '<div class="day-equip-header">';
            html += '<h3>' + Utils.sanitize(equip.name) + '</h3>';
            html += '<div class="day-equip-status">';
            if (isStudied) {
                html += '<span class="badge badge-success">' + statusText + '</span>';
            } else {
                html += '<span class="status-dot ' + statusDot + '"></span>';
                html += '<span>' + statusText + '</span>';
            }
            html += '</div></div>';

            // Collapsible content
            html += '<div class="day-equip-content">';

            // Study timer (only if not yet studied)
            if (!isStudied) {
                html += '<div class="study-timer-bar" id="timer-' + equipId + '">';
                html += '<span>Reading time:</span>';
                html += '<div class="progress"><div class="progress-bar" id="progress-' + equipId + '" style="width:0%"></div></div>';
                html += '<span class="timer-text" id="timer-text-' + equipId + '">0:00</span>';
                html += '<button class="btn btn-success btn-sm mark-studied-btn" id="mark-' + equipId + '" disabled>Mark as Studied</button>';
                html += '</div>';
            }

            html += Equipment.renderEquipmentDetail(equipId);
            html += '</div></div>';
        });
        html += '</div>';

        // Quiz section
        html += '<div class="take-quiz-section">' + quizSectionHTML(equipId, lesson.name, studied, quizzes) + '</div>';

        container.innerHTML = html;

        // Attach gallery thumbnail listeners for equipment images
        Equipment.attachGalleryListeners(container);
        // Section and part Listen buttons, tap-to-enlarge images
        Equipment.attachLessonListeners(container);

        // Setup card expand/collapse, timers, and voice
        container.querySelectorAll('.day-equip-card').forEach(function (card) {
            var equipId = card.dataset.equip;
            var header = card.querySelector('.day-equip-header');

            header.addEventListener('click', function () {
                var wasExpanded = card.classList.contains('expanded');
                // Collapse all others
                container.querySelectorAll('.day-equip-card').forEach(function (c) {
                    c.classList.remove('expanded');
                });

                if (!wasExpanded) {
                    card.classList.add('expanded');
                    // Start timer if not studied
                    if (!studied[equipId]) {
                        startStudyTimer(equipId);
                    }
                } else {
                    Voice.stop();
                    stopStudyTimer(equipId);
                }
            });

            // Mark as studied button
            var markBtn = card.querySelector('#mark-' + equipId);
            if (markBtn) {
                markBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    markAsStudied(equipId);
                });
            }
        });

        // One equipment per lesson: it opens expanded, so start the reading timer now
        if (!studied[equipId]) startStudyTimer(equipId);

        // Cleanup function
        return function () {
            Voice.stop();
            Object.keys(activeTimers).forEach(function (id) {
                clearInterval(activeTimers[id].interval);
            });
            activeTimers = {};
        };
    }

    function startStudyTimer(equipId) {
        if (activeTimers[equipId]) return;

        var elapsed = 0;
        var required = 180; // 3 minutes

        var timer = {
            elapsed: 0,
            interval: setInterval(function () {
                timer.elapsed++;
                var pct = Math.min((timer.elapsed / required) * 100, 100);

                var progressBar = document.getElementById('progress-' + equipId);
                var timerText = document.getElementById('timer-text-' + equipId);
                var markBtn = document.getElementById('mark-' + equipId);

                if (progressBar) progressBar.style.width = pct + '%';
                if (timerText) timerText.textContent = Utils.formatTime(timer.elapsed);
                if (markBtn && timer.elapsed >= required) {
                    markBtn.disabled = false;
                    markBtn.textContent = 'Mark as Studied ✓';
                }

                // Update status dot
                var card = document.querySelector('[data-equip="' + equipId + '"]');
                if (card) {
                    var dot = card.querySelector('.status-dot');
                    if (dot) {
                        dot.classList.remove('not-started');
                        dot.classList.add('reading');
                    }
                    var statusSpan = card.querySelector('.day-equip-status span:last-child');
                    if (statusSpan && !statusSpan.classList.contains('badge')) {
                        statusSpan.textContent = 'Reading... ' + Utils.formatTime(timer.elapsed);
                    }
                }
            }, 1000)
        };

        activeTimers[equipId] = timer;
    }

    function stopStudyTimer(equipId) {
        if (activeTimers[equipId]) {
            clearInterval(activeTimers[equipId].interval);
            delete activeTimers[equipId];
        }
    }

    // Body of the quiz box at the bottom of a lesson.
    function quizSectionHTML(equipId, lessonName, studied, quizzes) {
        var quizDone = quizzes[equipId];
        var html = '';
        if (quizDone) {
            html += '<h3>✅ Quiz Completed</h3>';
            html += '<p>Score: ' + quizDone.score + '/' + quizDone.maxScore + ' (' + quizDone.points + ' points)</p>';
            html += '<a href="#/quiz/' + equipId + '/practice" class="btn btn-outline">Practice Again</a>';
        } else if (!QuizEngine.isQuizReady(equipId)) {
            html += '<h3>📝 Quiz Coming Soon</h3>';
            html += '<p>The quiz for this equipment is being prepared. You can continue to the next equipment.</p>';
        } else if (studied[equipId]) {
            html += '<h3>Ready for the Quiz!</h3>';
            html += '<p>' + learningPath.quizLength + ' questions on ' + Utils.sanitize(lessonName) + ' — your first attempt is the one that counts.</p>';
            html += '<a href="#/quiz/' + equipId + '" class="btn btn-primary btn-lg">Take the Quiz →</a>';
        } else {
            html += '<h3>📖 Study First</h3>';
            html += '<p>Read this equipment for at least 3 minutes, then mark it as studied to unlock the quiz.</p>';
        }
        return html;
    }

    // After "Mark as Studied": swap the timer bar for a quiz button right where
    // the student clicked, and refresh the quiz box at the bottom.
    function showQuizUnlocked(equipId) {
        var progress = window.ChemBuddy.progress || {};
        var studied = progress.studied || {};
        var quizzes = progress.quizzes || {};
        var bar = document.getElementById('timer-' + equipId);
        if (bar) {
            var barHtml = '<span class="badge badge-success">Studied ✓</span>';
            if (!quizzes[equipId] && QuizEngine.isQuizReady(equipId)) {
                barHtml += '<a href="#/quiz/' + equipId + '" class="btn btn-primary btn-sm">Take the Quiz →</a>';
            }
            bar.innerHTML = barHtml;
        }
        var status = document.querySelector('[data-equip="' + equipId + '"] .day-equip-status');
        if (status) status.innerHTML = '<span class="badge badge-success">Studied ✓</span>';
        var section = document.querySelector('.take-quiz-section');
        if (section) section.innerHTML = quizSectionHTML(equipId, equipmentDB[equipId].name, studied, quizzes);
    }

    function markAsStudied(equipId) {
        var uid = window.ChemBuddy.user.uid;
        var timer = activeTimers[equipId];
        var timeSpent = timer ? timer.elapsed : 180;

        stopStudyTimer(equipId);

        var studyData = {
            startedAt: Date.now() - (timeSpent * 1000),
            completedAt: Date.now(),
            timeSpent: timeSpent
        };

        // Update local progress immediately so UI reflects change
        if (!window.ChemBuddy.progress.studied) {
            window.ChemBuddy.progress.studied = {};
        }
        window.ChemBuddy.progress.studied[equipId] = studyData;

        db.ref('progress/' + uid + '/studied/' + equipId).set(studyData).then(function () {
            Utils.toast('Equipment marked as studied! +5 points', 'success');
            updateLeaderboardPoints(uid, 5);
            showQuizUnlocked(equipId);
        }).catch(function (err) {
            // Revert local on failure
            delete window.ChemBuddy.progress.studied[equipId];
            Utils.toast('Failed to save. Try again.', 'error');
        });
    }

    function updateLeaderboardPoints(uid, addPoints) {
        var progress = window.ChemBuddy.progress || {};

        var totalPoints = window.ChemBuddy.calculateTotalPoints(progress) + addPoints;
        var studiedCount = Object.keys(progress.studied || {}).length;
        var quizzesDone = Object.keys(progress.quizzes || {}).length;
        var streak = window.ChemBuddy.getStudyStreak(progress);

        var name = displayName();

        var leaderboardData = {
            name: name,
            totalPoints: totalPoints,
            totalQuizzes: quizzesDone,
            totalEquipment: studiedCount,
            bestStreak: streak,
            updatedAt: Date.now()
        };

        db.ref('leaderboard/cumulative/' + uid).set(leaderboardData);
    }

    // Name shown on the leaderboard. Falls back to the email's user part
    // (never the generic "Student") if the profile has not loaded or has no name.
    function displayName() {
        var profile = window.ChemBuddy.profile || {};
        if (profile.name) return profile.name;
        var user = window.ChemBuddy.user;
        if (user && user.email) return user.email.split('@')[0];
        return 'Student';
    }

    return {
        renderOverview: renderOverview,
        renderLesson: renderLesson,
        getTodayInfo: getTodayInfo,
        updateLeaderboardPoints: updateLeaderboardPoints
    };
})();
