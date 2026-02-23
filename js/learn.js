// ChemBuddy - Learning Path Module

var Learn = (function () {
    'use strict';

    var activeTimers = {};

    function getTodayInfo(progress) {
        var studied = progress.studied || {};
        var dailyQuizzes = progress.dailyQuizzes || {};

        // Find first incomplete day
        for (var w = 0; w < learningPath.weeks.length; w++) {
            var week = learningPath.weeks[w];
            for (var d = 0; d < week.days.length; d++) {
                var day = week.days[d];
                var dayId = 'W' + week.id + 'D' + day.day;
                var allStudied = day.equipmentIds.every(function (id) { return studied[id]; });
                var quizDone = dailyQuizzes[dayId];

                if (!allStudied || !quizDone) {
                    return {
                        weekId: week.id,
                        weekTitle: 'Week ' + week.id + ': ' + week.title,
                        day: day.day,
                        dayId: dayId,
                        title: day.title,
                        description: day.description,
                        equipmentCount: day.equipmentIds.length,
                        quizId: day.quizId,
                        quizAvailable: allStudied && !quizDone
                    };
                }
            }
        }
        return null; // All complete
    }

    function renderOverview(container) {
        var progress = window.ChemBuddy.progress || {};
        var studied = progress.studied || {};
        var dailyQuizzes = progress.dailyQuizzes || {};
        var weeklyQuizzes = progress.weeklyQuizzes || {};

        var html = '<div class="learn-header">';
        html += '<h1>Learning Path</h1>';
        html += '<p>2-Week Pilot Program — Pumps & Heat Exchangers</p>';
        html += '</div>';

        html += '<div class="weeks-grid">';

        learningPath.weeks.forEach(function (week) {
            var totalEquip = 0;
            var studiedEquip = 0;
            week.days.forEach(function (day) {
                totalEquip += day.equipmentIds.length;
                day.equipmentIds.forEach(function (id) {
                    if (studied[id]) studiedEquip++;
                });
            });

            var pct = totalEquip > 0 ? Math.round((studiedEquip / totalEquip) * 100) : 0;

            html += '<div class="week-card">';
            html += '<div class="week-card-header">';
            html += '<h2>Week ' + week.id + ': ' + Utils.sanitize(week.title) + '</h2>';
            html += '<p>' + Utils.sanitize(week.description) + '</p>';
            html += '<div class="week-progress-info">';
            html += '<span>' + studiedEquip + '/' + totalEquip + '</span>';
            html += '<div class="progress"><div class="progress-bar" style="width:' + pct + '%"></div></div>';
            html += '<span>' + pct + '%</span>';
            html += '</div></div>';

            html += '<div class="week-card-body">';

            var prevDayStudied = true;
            week.days.forEach(function (day, idx) {
                var dayId = 'W' + week.id + 'D' + day.day;
                var allStudied = day.equipmentIds.every(function (id) { return studied[id]; });
                var quizDone = dailyQuizzes[dayId];
                var isComplete = allStudied && quizDone;
                var isAvailable = prevDayStudied || idx === 0;

                var statusClass = isComplete ? 'completed' : (isAvailable ? 'available' : 'locked');
                var statusText = isComplete ? '✓ Done' : (isAvailable ? 'Start →' : '🔒 Locked');

                html += '<div class="day-row" data-day="' + dayId + '" data-available="' + isAvailable + '">';
                html += '<div class="day-number ' + statusClass + '">' + day.day + '</div>';
                html += '<div class="day-info"><h4>' + Utils.sanitize(day.title) + '</h4>';
                html += '<p>' + day.equipmentIds.length + ' equipment' + (quizDone ? ' • Quiz: ' + quizDone.score + '/' + quizDone.maxScore : '') + '</p></div>';
                html += '<div class="day-status ' + statusClass + '">' + statusText + '</div>';
                html += '</div>';

                prevDayStudied = allStudied;
            });

            // Weekly quiz card
            var weeklyId = 'W' + week.id;
            var allDailyDone = week.days.every(function (day) {
                return dailyQuizzes['W' + week.id + 'D' + day.day];
            });
            var weeklyDone = weeklyQuizzes[weeklyId];

            if (allDailyDone) {
                html += '<div class="weekly-quiz-card">';
                html += '<div><h3>Weekly Quiz</h3>';
                if (weeklyDone) {
                    html += '<p>Score: ' + weeklyDone.score + '/' + weeklyDone.maxScore + ' (' + weeklyDone.points + ' pts)</p>';
                } else {
                    html += '<p>15 questions • 2x points</p>';
                }
                html += '</div>';
                if (!weeklyDone) {
                    html += '<a href="#/quiz/' + weeklyId + '" class="btn">Take Quiz</a>';
                } else {
                    html += '<span class="badge badge-success">✓ Done</span>';
                }
                html += '</div>';
            }

            html += '</div></div>';
        });

        html += '</div>';
        container.innerHTML = html;

        // Day row clicks
        container.querySelectorAll('.day-row').forEach(function (row) {
            row.addEventListener('click', function () {
                if (this.dataset.available === 'true') {
                    Router.navigate('/learn/' + this.dataset.day);
                } else {
                    Utils.toast('Complete previous days first', 'warning');
                }
            });
        });
    }

    function renderDay(container, params) {
        var dayId = params.dayId; // e.g. "W1D3"
        var match = dayId.match(/W(\d+)D(\d+)/);
        if (!match) { container.innerHTML = '<p>Invalid day.</p>'; return; }

        var weekNum = parseInt(match[1]);
        var dayNum = parseInt(match[2]);
        var week = learningPath.weeks.find(function (w) { return w.id === weekNum; });
        if (!week) { container.innerHTML = '<p>Week not found.</p>'; return; }
        var day = week.days.find(function (d) { return d.day === dayNum; });
        if (!day) { container.innerHTML = '<p>Day not found.</p>'; return; }

        var progress = window.ChemBuddy.progress || {};
        var studied = progress.studied || {};
        var dailyQuizzes = progress.dailyQuizzes || {};

        var html = '';
        html += '<a href="#/learn" class="btn btn-outline btn-sm day-back-btn">← Back to Learning Path</a>';

        html += '<div class="day-detail-header">';
        html += '<span class="badge badge-primary">Week ' + weekNum + ' — ' + Utils.sanitize(week.title) + '</span>';
        html += '<h1>Day ' + dayNum + ': ' + Utils.sanitize(day.title) + '</h1>';
        html += '<p>' + Utils.sanitize(day.description) + '</p>';
        html += '</div>';

        // Equipment cards
        html += '<div class="day-equipment-list">';
        day.equipmentIds.forEach(function (equipId) {
            var equip = equipmentDB[equipId];
            if (!equip) return;

            var isStudied = studied[equipId];
            var statusDot = isStudied ? 'studied' : 'not-started';
            var statusText = isStudied ? 'Studied ✓' : 'Not started';
            var timeSpent = isStudied ? isStudied.timeSpent || 0 : 0;

            html += '<div class="day-equip-card" data-equip="' + equipId + '">';
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

            // Voice-over bar
            html += Voice.renderBar(equipId);

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
        var allStudied = day.equipmentIds.every(function (id) { return studied[id]; });
        var quizDone = dailyQuizzes[dayId];

        html += '<div class="take-quiz-section">';
        if (quizDone) {
            html += '<h3>✅ Quiz Completed</h3>';
            html += '<p>Score: ' + quizDone.score + '/' + quizDone.maxScore + ' (' + quizDone.points + ' points)</p>';
        } else if (allStudied) {
            html += '<h3>Ready for the Quiz!</h3>';
            html += '<p>You\'ve studied all equipment for today.</p>';
            html += '<a href="#/quiz/' + day.quizId + '" class="btn btn-primary btn-lg">Take Today\'s Quiz →</a>';
        } else {
            var studiedCount = day.equipmentIds.filter(function (id) { return studied[id]; }).length;
            html += '<h3>📖 Study First</h3>';
            html += '<p>Read all equipment (min 3 min each) to unlock the quiz. ' + studiedCount + '/' + day.equipmentIds.length + ' done.</p>';
        }
        html += '</div>';

        container.innerHTML = html;

        // Attach gallery thumbnail listeners for equipment images
        Equipment.attachGalleryListeners(container);

        // Setup card expand/collapse, timers, and voice
        container.querySelectorAll('.day-equip-card').forEach(function (card) {
            var equipId = card.dataset.equip;
            var header = card.querySelector('.day-equip-header');

            // Attach voice controls
            Voice.attachListeners(equipId);

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
                    markAsStudied(equipId, dayId);
                });
            }
        });

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

    function markAsStudied(equipId, dayId) {
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
        }).catch(function (err) {
            // Revert local on failure
            delete window.ChemBuddy.progress.studied[equipId];
            Utils.toast('Failed to save. Try again.', 'error');
        });
    }

    function updateLeaderboardPoints(uid, addPoints) {
        var profile = window.ChemBuddy.profile || {};
        var progress = window.ChemBuddy.progress || {};

        var totalPoints = window.ChemBuddy.calculateTotalPoints(progress) + addPoints;
        var studiedCount = Object.keys(progress.studied || {}).length;
        var quizzesDone = Object.keys(progress.dailyQuizzes || {}).length + Object.keys(progress.weeklyQuizzes || {}).length;
        var streak = window.ChemBuddy.getStudyStreak(progress);

        var leaderboardData = {
            name: profile.name || 'Student',
            totalPoints: totalPoints,
            totalQuizzes: quizzesDone,
            totalEquipment: studiedCount,
            bestStreak: streak,
            updatedAt: Date.now()
        };

        db.ref('leaderboard/cumulative/' + uid).set(leaderboardData);

        // Also update weekly
        var currentWeek = getCurrentWeek();
        db.ref('leaderboard/weekly/' + currentWeek + '/' + uid).set({
            name: profile.name || 'Student',
            points: totalPoints,
            quizzesCompleted: quizzesDone,
            equipmentStudied: studiedCount,
            streak: streak,
            updatedAt: Date.now()
        });
    }

    function getCurrentWeek() {
        // Determine which week of the pilot we're in based on progress
        var progress = window.ChemBuddy.progress || {};
        var dailyQuizzes = progress.dailyQuizzes || {};
        // Simple heuristic: if any W2 quiz done, we're in week 2
        for (var k in dailyQuizzes) {
            if (k.startsWith('W2')) return 2;
        }
        return 1;
    }

    return {
        renderOverview: renderOverview,
        renderDay: renderDay,
        getTodayInfo: getTodayInfo,
        updateLeaderboardPoints: updateLeaderboardPoints
    };
})();
