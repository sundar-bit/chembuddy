// ChemBuddy - Admin Dashboard Module

(function () {
    'use strict';

    initFirebase();

    var allUsers = {};
    var allProgress = {};
    var allAnalytics = {};
    var allowedEmails = {};
    var inviteOnly = false;
    var accessError = '';
    var currentTab = 'overview';

    // Auth guard
    auth.onAuthStateChanged(function (user) {
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            window.location.href = 'index.html';
            return;
        }
        loadAllData();
    });

    // Tab switching
    document.getElementById('admin-tabs').addEventListener('click', function (e) {
        var btn = e.target.closest('.admin-nav-link');
        if (!btn) return;
        document.querySelectorAll('.admin-nav-link').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        renderTab();
    });

    // Logout
    document.getElementById('admin-logout').addEventListener('click', function () {
        auth.signOut().then(function () { window.location.href = 'index.html'; });
    });

    function loadAllData() {
        db.ref('users').on('value', function (snap) {
            allUsers = snap.val() || {};
            renderTab();
        });

        db.ref('progress').on('value', function (snap) {
            allProgress = snap.val() || {};
            renderTab();
        });

        db.ref('analytics').on('value', function (snap) {
            allAnalytics = snap.val() || {};
            renderTab();
        });

        db.ref('settings/inviteOnly').on('value', function (snap) {
            inviteOnly = snap.val() === true;
            renderTab();
        }, function (err) { accessError = err.message; renderTab(); });

        db.ref('allowedEmails').on('value', function (snap) {
            allowedEmails = snap.val() || {};
            accessError = '';
            renderTab();
        }, function (err) { accessError = err.message; renderTab(); });
    }

    function renderTab() {
        var container = document.getElementById('admin-content');
        switch (currentTab) {
            case 'overview': renderOverview(container); break;
            case 'students': renderStudents(container); break;
            case 'quizzes': renderQuizAnalytics(container); break;
            case 'access': renderAccess(container); break;
            case 'export': renderExport(container); break;
        }
    }

    // === Overview Tab ===
    function renderOverview(container) {
        var userCount = Object.keys(allUsers).length;
        var today = Utils.todayStr();
        var dailyActive = allAnalytics.dailyActive || {};
        var todayActive = dailyActive[today] ? Object.keys(dailyActive[today]).length : 0;

        // Calculate averages
        var totalScores = 0;
        var totalQuizzes = 0;
        for (var uid in allProgress) {
            var p = allProgress[uid];
            var quizzes = p.quizzes || {};
            for (var k in quizzes) {
                totalScores += quizzes[k].score || 0;
                totalQuizzes++;
            }
        }
        var avgScore = totalQuizzes > 0 ? (totalScores / totalQuizzes).toFixed(1) + '/' + learningPath.quizLength : '-';

        var totalStudied = 0;
        for (var uid in allProgress) {
            totalStudied += Object.keys(allProgress[uid].studied || {}).length;
        }

        var html = '';

        var week = learningPath.currentWeek();
        if (week) {
            var thisWeek = week.week > 0 ? learningPath.allEquipment().filter(function (eq) {
                var d = learningPath.releaseDate(eq.id);
                return d && d.getTime() === learningPath.releaseWeeks()[week.week - 1].getTime();
            }).map(function (eq) { return eq.name; }).join(', ') : '';
            html += '<div class="card mb-3"><div class="card-body">';
            html += week.week === 0
                ? '<strong>Weekly release starts ' + Utils.formatDate(learningPath.releaseWeeks()[0]) + '</strong>'
                : '<strong>Week ' + week.week + ' of ' + week.total + '</strong> — open this week: ' + Utils.sanitize(thisWeek);
            html += '</div></div>';
        }

        // Summary cards
        html += '<div class="admin-summary">';
        html += '<div class="admin-stat-card"><div class="stat-icon">👥</div><div class="stat-value">' + userCount + '</div><div class="stat-label">Total Students</div></div>';
        html += '<div class="admin-stat-card"><div class="stat-icon">📱</div><div class="stat-value">' + todayActive + '</div><div class="stat-label">Active Today</div></div>';
        html += '<div class="admin-stat-card"><div class="stat-icon">📊</div><div class="stat-value">' + avgScore + '</div><div class="stat-label">Avg Quiz Score</div></div>';
        html += '<div class="admin-stat-card"><div class="stat-icon">📖</div><div class="stat-value">' + totalStudied + '</div><div class="stat-label">Total Equipment Studied</div></div>';
        html += '</div>';

        // Engagement chart
        html += '<div class="chart-container">';
        html += '<h2>Daily Active Users (Last 14 Days)</h2>';
        html += renderEngagementChart(dailyActive);
        html += '</div>';

        // Recent activity
        html += '<div class="admin-table-container">';
        html += '<div class="admin-table-header"><h2>Recent Students</h2></div>';
        html += '<div class="admin-table-scroll">';
        html += '<table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>College</th><th>Registered</th><th>Last Active</th></tr></thead><tbody>';

        var users = [];
        for (var uid in allUsers) {
            users.push({ uid: uid, data: allUsers[uid] });
        }
        users.sort(function (a, b) { return (b.data.registeredAt || 0) - (a.data.registeredAt || 0); });

        users.slice(0, 10).forEach(function (u) {
            html += '<tr>';
            html += '<td>' + Utils.sanitize(u.data.name || '-') + '</td>';
            html += '<td>' + Utils.sanitize(u.data.email || '-') + '</td>';
            html += '<td>' + Utils.sanitize(u.data.college || '-') + '</td>';
            html += '<td>' + Utils.formatDate(u.data.registeredAt) + '</td>';
            html += '<td>' + Utils.formatDate(u.data.lastActiveAt) + '</td>';
            html += '</tr>';
        });

        html += '</tbody></table></div></div>';
        container.innerHTML = html;
    }

    function renderEngagementChart(dailyActive) {
        var dates = [];
        var today = new Date();
        for (var i = 13; i >= 0; i--) {
            var d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().slice(0, 10));
        }

        var maxCount = 1;
        var counts = dates.map(function (date) {
            var count = dailyActive[date] ? Object.keys(dailyActive[date]).length : 0;
            if (count > maxCount) maxCount = count;
            return { date: date, count: count };
        });

        var html = '<div class="bar-chart">';
        counts.forEach(function (c) {
            var height = c.count > 0 ? Math.max((c.count / maxCount) * 100, 5) : 2;
            html += '<div class="bar-chart-bar" style="height:' + height + '%">';
            html += '<span class="bar-tooltip">' + c.date.slice(5) + ': ' + c.count + ' users</span>';
            html += '</div>';
        });
        html += '</div>';

        html += '<div class="bar-chart-labels">';
        counts.forEach(function (c) {
            html += '<span>' + c.date.slice(8) + '</span>';
        });
        html += '</div>';

        return html;
    }

    // === Students Tab ===
    function renderStudents(container) {
        var html = '<div class="admin-table-container">';
        html += '<div class="admin-table-header"><h2>All Students</h2>';
        html += '<span class="badge badge-primary">' + Object.keys(allUsers).length + ' registered</span></div>';
        html += '<div class="admin-table-scroll">';
        html += '<table class="admin-table"><thead><tr>';
        html += '<th>Name</th><th>Email</th><th>College</th><th>Branch</th><th>Equipment</th><th>Quizzes</th><th>Avg Score</th><th>Points</th><th>Last Active</th>';
        html += '</tr></thead><tbody>';

        var users = [];
        for (var uid in allUsers) {
            users.push({ uid: uid, data: allUsers[uid], progress: allProgress[uid] || {} });
        }
        users.sort(function (a, b) {
            return calcPoints(b.progress) - calcPoints(a.progress);
        });

        users.forEach(function (u) {
            var p = u.progress;
            var studiedCount = Object.keys(p.studied || {}).length;
            var quizzes = p.quizzes || {};

            var totalScore = 0;
            var quizCount = 0;
            for (var k in quizzes) { totalScore += quizzes[k].score; quizCount++; }
            var avgScore = quizCount > 0 ? (totalScore / quizCount).toFixed(1) + '/' + learningPath.quizLength : '-';

            var points = calcPoints(p);

            html += '<tr class="expandable" data-uid="' + u.uid + '">';
            html += '<td><strong>' + Utils.sanitize(u.data.name || '-') + '</strong></td>';
            html += '<td>' + Utils.sanitize(u.data.email || '-') + '</td>';
            html += '<td>' + Utils.sanitize(u.data.college || '-') + '</td>';
            html += '<td>' + Utils.sanitize(u.data.branch || '-') + '</td>';
            html += '<td>' + studiedCount + '</td>';
            html += '<td>' + quizCount + '</td>';
            html += '<td>' + avgScore + '</td>';
            html += '<td><strong>' + points + '</strong></td>';
            html += '<td>' + Utils.formatDate(u.data.lastActiveAt) + '</td>';
            html += '</tr>';

            // Expandable detail row
            html += '<tr class="student-detail-row hidden" id="detail-' + u.uid + '">';
            html += '<td colspan="9"><div class="student-detail-content">';
            html += renderStudentDetail(u);
            html += '</div></td></tr>';
        });

        html += '</tbody></table></div></div>';
        container.innerHTML = html;

        // Row click to expand
        container.querySelectorAll('.expandable').forEach(function (row) {
            row.addEventListener('click', function () {
                var detail = document.getElementById('detail-' + this.dataset.uid);
                if (detail) detail.classList.toggle('hidden');
            });
        });
    }

    function renderStudentDetail(u) {
        var p = u.progress;
        var studied = p.studied || {};
        var quizzes = p.quizzes || {};

        var html = '<h4>Quiz Scores</h4>';
        html += '<div class="student-quiz-grid">';

        learningPath.allEquipment().forEach(function (eq) {
            var quiz = quizzes[eq.id];
            var label = Utils.sanitize(eq.name);
            if (quiz) {
                html += '<div class="student-quiz-cell taken">' + label + '<br>' + quiz.score + '/' + quiz.maxScore + '</div>';
            } else {
                html += '<div class="student-quiz-cell not-taken">' + label + '<br>—</div>';
            }
        });
        html += '</div>';

        // Equipment list
        var studiedList = Object.keys(studied);
        html += '<h4 class="mt-2">Equipment Studied (' + studiedList.length + ')</h4>';
        html += '<p class="text-muted" style="font-size:0.85rem">' + studiedList.join(', ') + '</p>';

        return html;
    }

    // === Quiz Analytics Tab ===
    function renderQuizAnalytics(container) {
        var html = '<h1 class="mb-3">Quiz Analytics</h1>';
        html += '<div class="quiz-analytics-grid">';

        // One quiz per Level 1 equipment
        learningPath.allEquipment().forEach(function (quiz) {
            var scores = [];

            for (var uid in allProgress) {
                var quizzes = allProgress[uid].quizzes || {};
                if (quizzes[quiz.id]) {
                    scores.push(quizzes[quiz.id]);
                }
            }

            html += '<div class="quiz-analytics-card">';
            html += '<h4>' + Utils.sanitize(quiz.name) + ' <span class="badge badge-primary">Module ' + quiz.moduleId + '</span></h4>';

            if (scores.length === 0) {
                html += '<p class="text-muted">No attempts yet</p>';
            } else {
                var scoreVals = scores.map(function (s) { return s.score; });
                var avg = (scoreVals.reduce(function (a, b) { return a + b; }, 0) / scoreVals.length).toFixed(1);
                var max = Math.max.apply(null, scoreVals);
                var min = Math.min.apply(null, scoreVals);

                html += '<div class="quiz-stats-row"><span class="label">Attempts</span><span class="value">' + scores.length + '</span></div>';
                html += '<div class="quiz-stats-row"><span class="label">Average</span><span class="value">' + avg + '/' + scores[0].maxScore + '</span></div>';
                html += '<div class="quiz-stats-row"><span class="label">Highest</span><span class="value">' + max + '/' + scores[0].maxScore + '</span></div>';
                html += '<div class="quiz-stats-row"><span class="label">Lowest</span><span class="value">' + min + '/' + scores[0].maxScore + '</span></div>';

                // Most missed questions
                var questionMisses = {};
                scores.forEach(function (s) {
                    var answers = s.answers || {};
                    for (var i in answers) {
                        var a = answers[i];
                        if (!a.isCorrect) {
                            var qId = a.questionId || ('Q' + i);
                            questionMisses[qId] = (questionMisses[qId] || 0) + 1;
                        }
                    }
                });

                var missed = [];
                for (var qId in questionMisses) { missed.push({ id: qId, count: questionMisses[qId] }); }
                missed.sort(function (a, b) { return b.count - a.count; });

                if (missed.length > 0) {
                    html += '<h4 class="mt-2" style="font-size:0.85rem">Most Missed</h4>';
                    missed.slice(0, 3).forEach(function (m) {
                        var q = typeof questionBank !== 'undefined' ? questionBank.find(function (q) { return q.id === m.id; }) : null;
                        var text = q ? q.question.substring(0, 50) + '...' : m.id;
                        var pct = Math.round((m.count / scores.length) * 100);
                        html += '<div class="missed-q-item"><div class="missed-q-text">' + Utils.sanitize(text) + '</div>';
                        html += '<div class="missed-q-pct">' + pct + '% got wrong</div></div>';
                    });
                }
            }

            html += '</div>';
        });

        html += '</div>';
        container.innerHTML = html;
    }

    // === Student List Tab (invite-only sign-in) ===
    function renderAccess(container) {
        // Keep a half-typed list when the tab re-renders on live data
        var pending = document.getElementById('invite-input');
        var pendingText = pending ? pending.value : '';

        var registered = {};
        for (var uid in allUsers) {
            if (allUsers[uid].email) registered[emailKey(allUsers[uid].email)] = allUsers[uid];
        }
        var keys = Object.keys(allowedEmails).sort();

        var html = '<h1 class="mb-1">Student List</h1>';
        html += '<p class="text-muted mb-3">Only emails on this list can register and use ChemBuddy once invite-only is switched on. Admins are always allowed.</p>';

        if (accessError) {
            html += '<div class="card mb-3" style="border-left:4px solid var(--danger)"><div class="card-body">';
            html += '<strong>The database rules need updating before this list can be used.</strong><br>';
            html += '<span class="text-muted">Publish the new rules from firebase/database.rules.json in the Firebase console, then reload this page. (' + Utils.sanitize(accessError) + ')</span>';
            html += '</div></div>';
        }

        html += '<div class="card mb-3"><div class="card-body">';
        html += '<h3>Invite-only sign-in: ' + (inviteOnly ? '<span class="badge badge-success">ON</span>' : '<span class="badge badge-warning">OFF — anyone can register</span>') + '</h3>';
        if (inviteOnly) {
            html += '<button class="btn btn-outline mt-2" id="invite-toggle">Switch OFF</button>';
        } else {
            html += '<p class="text-muted mt-1">Add the students\' emails below first, then switch it on.</p>';
            html += '<button class="btn btn-primary mt-2" id="invite-toggle"' + (keys.length ? '' : ' disabled') + '>Switch ON</button>';
        }
        html += '</div></div>';

        html += '<div class="card mb-3"><div class="card-body">';
        html += '<h3>Add emails</h3>';
        html += '<p class="text-muted">Paste one or many — separated by new lines, commas or spaces.</p>';
        html += '<textarea id="invite-input" class="form-input" rows="5" style="width:100%;font-family:inherit" placeholder="student1@somaiya.edu&#10;student2@somaiya.edu">' + Utils.sanitize(pendingText) + '</textarea>';
        html += '<button class="btn btn-primary mt-2" id="invite-add">Add to List</button>';
        html += '</div></div>';

        // Registered students who are not on the list would be locked out
        var unlisted = [];
        for (var k in registered) {
            if (!allowedEmails[k] && !ADMIN_EMAILS.includes(registered[k].email)) unlisted.push(registered[k]);
        }
        if (unlisted.length) {
            html += '<div class="card mb-3" style="border-left:4px solid var(--warning)"><div class="card-body">';
            html += '<strong>' + unlisted.length + ' registered account' + (unlisted.length === 1 ? ' is' : 's are') + ' not on the list</strong> — ' + (inviteOnly ? 'they cannot use the app.' : 'they will be locked out when invite-only is switched on.') + '<br>';
            html += '<span class="text-muted">' + unlisted.map(function (u) { return Utils.sanitize((u.name || '-') + ' <' + u.email + '>'); }).join(', ') + '</span>';
            html += '</div></div>';
        }

        html += '<div class="admin-table-container">';
        html += '<div class="admin-table-header"><h2>On the list</h2><span class="badge badge-primary">' + keys.length + ' email' + (keys.length === 1 ? '' : 's') + '</span></div>';
        html += '<div class="admin-table-scroll"><table class="admin-table"><thead><tr><th>Email</th><th>Status</th><th></th></tr></thead><tbody>';
        if (!keys.length) html += '<tr><td colspan="3" class="text-muted">No emails yet.</td></tr>';
        keys.forEach(function (k) {
            var entry = allowedEmails[k] || {};
            var email = entry.email || k.replace(/,/g, '.');
            var user = registered[k];
            html += '<tr><td>' + Utils.sanitize(email) + '</td>';
            html += '<td>' + (user ? '<span class="badge badge-success">Registered — ' + Utils.sanitize(user.name || '') + '</span>' : '<span class="text-muted">Not registered yet</span>') + '</td>';
            html += '<td><button class="btn btn-outline btn-sm invite-remove" data-key="' + Utils.sanitize(k) + '">Remove</button></td></tr>';
        });
        html += '</tbody></table></div></div>';

        container.innerHTML = html;

        document.getElementById('invite-toggle').addEventListener('click', function () {
            var turnOn = !inviteOnly;
            if (turnOn && unlisted.length && !confirm(unlisted.length + ' registered account(s) are not on the list and will be locked out. Switch on anyway?')) return;
            db.ref('settings/inviteOnly').set(turnOn)
                .then(function () { Utils.toast('Invite-only switched ' + (turnOn ? 'ON' : 'OFF'), 'success'); })
                .catch(function (err) { Utils.toast('Could not save: ' + err.message, 'error'); });
        });

        document.getElementById('invite-add').addEventListener('click', function () {
            var input = document.getElementById('invite-input');
            var parts = input.value.split(/[\s,;]+/).map(function (s) { return s.trim(); }).filter(Boolean);
            var updates = {}, bad = [];
            parts.forEach(function (email) {
                if (!/^[^\s@#$\[\]\/]+@[^\s@#$\[\]\/]+\.[^\s@#$\[\]\/]+$/.test(email)) { bad.push(email); return; }
                updates[emailKey(email)] = { email: email.toLowerCase(), addedAt: Date.now() };
            });
            var count = Object.keys(updates).length;
            if (!count) { Utils.toast(bad.length ? 'Not valid emails: ' + bad.join(', ') : 'Paste at least one email', 'warning'); return; }
            db.ref('allowedEmails').update(updates).then(function () {
                input.value = '';
                Utils.toast('Added ' + count + ' email' + (count === 1 ? '' : 's') + (bad.length ? ' — skipped: ' + bad.join(', ') : ''), bad.length ? 'warning' : 'success');
            }).catch(function (err) { Utils.toast('Could not save: ' + err.message, 'error'); });
        });

        container.querySelectorAll('.invite-remove').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var key = this.dataset.key;
                if (!confirm('Remove ' + key.replace(/,/g, '.') + ' from the list?')) return;
                db.ref('allowedEmails/' + key).remove();
            });
        });
    }

    // === Export Tab ===
    var XLSX_URL = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    var JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    var AUTOTABLE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
    var REPORT_FOOTER = '© ChemBuddy by Suraja Technologies and Jignyashika Consulting';

    function renderExport(container) {
        var count = studentRows().length;
        var html = '<div class="export-section">';
        html += '<h2>Download Reports</h2>';
        html += '<p>Every quiz score is the student\'s first attempt — practice attempts never change it.</p>';
        html += '<button class="btn btn-primary btn-lg" id="export-xlsx-btn">📊 Excel Report</button> ';
        html += '<button class="btn btn-primary btn-lg" id="export-pdf-btn">📄 PDF Report</button>';
        html += '<p class="text-muted mt-2">' + count + ' students • Excel: summary, quiz scores, practice and quiz analytics sheets • PDF: class summary for sharing</p>';
        html += '</div>';

        container.innerHTML = html;

        document.getElementById('export-xlsx-btn').addEventListener('click', function () { runExport(this, exportExcel); });
        document.getElementById('export-pdf-btn').addEventListener('click', function () { runExport(this, exportPDF); });
    }

    function runExport(btn, fn) {
        var label = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Preparing…';
        fn().catch(function (err) {
            Utils.toast('Could not create the report: ' + err.message, 'error');
        }).then(function () {
            btn.disabled = false;
            btn.textContent = label;
        });
    }

    // One row per student (admins left out), ranked by points.
    function studentRows() {
        var rows = [];
        for (var uid in allUsers) {
            var u = allUsers[uid];
            if (ADMIN_EMAILS.includes(u.email)) continue;
            var p = allProgress[uid] || {};
            var quizzes = p.quizzes || {};
            var scores = Object.keys(quizzes).map(function (k) { return quizzes[k].score || 0; });
            rows.push({
                uid: uid,
                name: u.name || '-',
                email: u.email || '-',
                college: u.college || '',
                branch: u.branch || '',
                studied: Object.keys(p.studied || {}).length,
                quizzesTaken: scores.length,
                avg: scores.length ? Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length * 10) / 10 : null,
                points: calcPoints(p),
                certificate: p.certificate ? Utils.formatDate(p.certificate.issuedAt) : '',
                lastActive: u.lastActiveAt ? Utils.formatDate(u.lastActiveAt) : '-',
                quizzes: quizzes,
                practice: p.practice || {}
            });
        }
        rows.sort(function (a, b) { return b.points - a.points || a.name.localeCompare(b.name); });
        rows.forEach(function (r, i) { r.rank = i + 1; });
        return rows;
    }

    function quizStats() {
        var rows = studentRows();
        return learningPath.allEquipment().map(function (eq) {
            var s = rows.filter(function (r) { return r.quizzes[eq.id]; }).map(function (r) { return r.quizzes[eq.id].score; });
            return {
                module: 'Module ' + eq.moduleId + ': ' + eq.moduleTitle,
                name: eq.name,
                attempts: s.length,
                avg: s.length ? Math.round(s.reduce(function (a, b) { return a + b; }, 0) / s.length * 10) / 10 : null,
                max: s.length ? Math.max.apply(null, s) : null,
                min: s.length ? Math.min.apply(null, s) : null
            };
        });
    }

    function exportExcel() {
        return Utils.loadScript(XLSX_URL).then(function () {
            var rows = studentRows();
            var equip = learningPath.allEquipment();
            var wb = XLSX.utils.book_new();

            var summary = [['Rank', 'Name', 'Email', 'College', 'Branch', 'Equipment Studied', 'Quizzes Taken', 'Average Score (/' + learningPath.quizLength + ')', 'Total Points', 'Certificate Issued', 'Last Active']];
            rows.forEach(function (r) {
                summary.push([r.rank, r.name, r.email, r.college, r.branch, r.studied, r.quizzesTaken, r.avg === null ? '' : r.avg, r.points, r.certificate, r.lastActive]);
            });
            addSheet(wb, 'Summary', summary);

            var scores = [['Rank', 'Name', 'Email'].concat(equip.map(function (eq) { return eq.name; }))];
            rows.forEach(function (r) {
                scores.push([r.rank, r.name, r.email].concat(equip.map(function (eq) {
                    var q = r.quizzes[eq.id];
                    return q ? q.score : '';
                })));
            });
            addSheet(wb, 'Quiz Scores', scores);

            var practice = [['Name', 'Email', 'Equipment', 'Official Score', 'Practice Attempts', 'Best Practice Score', 'Last Practice']];
            rows.forEach(function (r) {
                equip.forEach(function (eq) {
                    var pr = r.practice[eq.id];
                    if (!pr) return;
                    var q = r.quizzes[eq.id];
                    practice.push([r.name, r.email, eq.name, q ? q.score : '', pr.attempts || 0, pr.best || 0, Utils.formatDate(pr.lastAt)]);
                });
            });
            addSheet(wb, 'Practice', practice);

            var stats = [['Module', 'Equipment', 'Students Attempted', 'Average', 'Highest', 'Lowest']];
            quizStats().forEach(function (s) {
                stats.push([s.module, s.name, s.attempts, s.avg === null ? '' : s.avg, s.max === null ? '' : s.max, s.min === null ? '' : s.min]);
            });
            addSheet(wb, 'Quiz Analytics', stats);

            XLSX.writeFile(wb, 'chembuddy-report-' + localDateStr(new Date()) + '.xlsx');
            Utils.toast('Excel report downloaded', 'success');
        });
    }

    function addSheet(wb, name, aoa) {
        var ws = XLSX.utils.aoa_to_sheet(aoa);
        ws['!cols'] = aoa[0].map(function (h, c) {
            var w = String(h).length;
            aoa.forEach(function (row) { if (row[c] !== undefined) w = Math.max(w, String(row[c]).length); });
            return { wch: Math.min(Math.max(w + 2, 8), 45) };
        });
        XLSX.utils.book_append_sheet(wb, ws, name);
    }

    function exportPDF() {
        return Utils.loadScript(JSPDF_URL).then(function () {
            return Utils.loadScript(AUTOTABLE_URL);
        }).then(function () {
            var rows = studentRows();
            var doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            var navy = [11, 42, 91];

            doc.setFillColor(navy[0], navy[1], navy[2]);
            doc.rect(0, 0, 297, 24, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text('ChemBuddy - Student Progress Report', 14, 15);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('Generated ' + Utils.formatDate(Date.now()), 283, 15, { align: 'right' });

            doc.setTextColor(40, 40, 40);
            doc.setFontSize(11);
            var week = learningPath.currentWeek();
            var line = learningPath.title.replace('—', '-') + ' | ' + learningPath.allEquipment().length + ' equipment in ' + learningPath.modules.length + ' modules';
            if (week && week.week > 0) line += ' | Week ' + week.week + ' of ' + week.total;
            doc.text(line, 14, 33);

            var taken = rows.reduce(function (n, r) { return n + r.quizzesTaken; }, 0);
            var withAvg = rows.filter(function (r) { return r.avg !== null; });
            var classAvg = withAvg.length ? (withAvg.reduce(function (n, r) { return n + r.avg; }, 0) / withAvg.length).toFixed(1) : '-';
            doc.text('Students: ' + rows.length + '    Quizzes taken: ' + taken + '    Class average: ' + classAvg + '/' + learningPath.quizLength + '    Certificates issued: ' + rows.filter(function (r) { return r.certificate; }).length, 14, 40);

            doc.autoTable({
                startY: 46,
                head: [['Rank', 'Name', 'Email', 'Studied', 'Quizzes', 'Avg Score', 'Points', 'Certificate', 'Last Active']],
                body: rows.map(function (r) {
                    return [r.rank, r.name, r.email, r.studied, r.quizzesTaken, r.avg === null ? '-' : r.avg + '/' + learningPath.quizLength, r.points, r.certificate || '-', r.lastActive];
                }),
                headStyles: { fillColor: navy },
                styles: { fontSize: 9 },
                margin: { left: 14, right: 14 }
            });

            doc.addPage();
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('Quiz Results by Equipment (first attempts)', 14, 18);
            doc.autoTable({
                startY: 24,
                head: [['Module', 'Equipment', 'Students Attempted', 'Average', 'Highest', 'Lowest']],
                body: quizStats().map(function (s) {
                    var f = function (v) { return v === null ? '-' : v + '/' + learningPath.quizLength; };
                    return [s.module, s.name, s.attempts, f(s.avg), f(s.max), f(s.min)];
                }),
                headStyles: { fillColor: navy },
                styles: { fontSize: 9 },
                margin: { left: 14, right: 14 }
            });

            var pages = doc.getNumberOfPages();
            for (var i = 1; i <= pages; i++) {
                doc.setPage(i);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(120, 120, 120);
                doc.text(REPORT_FOOTER, 14, 203);
                doc.text('Page ' + i + ' of ' + pages, 283, 203, { align: 'right' });
            }

            doc.save('chembuddy-report-' + localDateStr(new Date()) + '.pdf');
            Utils.toast('PDF report downloaded', 'success');
        });
    }

    function calcPoints(progress) {
        var total = 0;
        total += Object.keys(progress.studied || {}).length * 5;
        var quizzes = progress.quizzes || {};
        for (var k in quizzes) { total += (quizzes[k].points || 0); }
        return total;
    }
})();
