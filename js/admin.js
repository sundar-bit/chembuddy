// ChemBuddy - Admin Dashboard Module

(function () {
    'use strict';

    initFirebase();

    var allUsers = {};
    var allProgress = {};
    var allAnalytics = {};
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
    }

    function renderTab() {
        var container = document.getElementById('admin-content');
        switch (currentTab) {
            case 'overview': renderOverview(container); break;
            case 'students': renderStudents(container); break;
            case 'quizzes': renderQuizAnalytics(container); break;
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
            var daily = p.dailyQuizzes || {};
            for (var k in daily) {
                totalScores += daily[k].score || 0;
                totalQuizzes++;
            }
        }
        var avgScore = totalQuizzes > 0 ? (totalScores / totalQuizzes).toFixed(1) : '-';

        var totalStudied = 0;
        for (var uid in allProgress) {
            totalStudied += Object.keys(allProgress[uid].studied || {}).length;
        }

        var html = '';

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
        html += '<th>Name</th><th>College</th><th>Branch</th><th>Equipment</th><th>Daily Avg</th><th>Weekly</th><th>Points</th><th>Last Active</th>';
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
            var daily = p.dailyQuizzes || {};
            var weekly = p.weeklyQuizzes || {};

            var dailyScores = [];
            for (var k in daily) { dailyScores.push(daily[k].score + '/' + daily[k].maxScore); }
            var dailyAvg = dailyScores.length > 0 ? (dailyScores.reduce(function (s, x) { return s + parseInt(x); }, 0) / dailyScores.length).toFixed(1) : '-';

            // Actually compute average from score values
            var totalDailyScore = 0;
            var dailyCount = 0;
            for (var k in daily) { totalDailyScore += daily[k].score; dailyCount++; }
            dailyAvg = dailyCount > 0 ? (totalDailyScore / dailyCount).toFixed(1) + '/5' : '-';

            var weeklyStr = '';
            for (var k in weekly) { weeklyStr += k + ': ' + weekly[k].score + '/' + weekly[k].maxScore + ' '; }

            var points = calcPoints(p);

            html += '<tr class="expandable" data-uid="' + u.uid + '">';
            html += '<td><strong>' + Utils.sanitize(u.data.name || '-') + '</strong></td>';
            html += '<td>' + Utils.sanitize(u.data.college || '-') + '</td>';
            html += '<td>' + Utils.sanitize(u.data.branch || '-') + '</td>';
            html += '<td>' + studiedCount + '</td>';
            html += '<td>' + dailyAvg + '</td>';
            html += '<td>' + (weeklyStr || '-') + '</td>';
            html += '<td><strong>' + points + '</strong></td>';
            html += '<td>' + Utils.formatDate(u.data.lastActiveAt) + '</td>';
            html += '</tr>';

            // Expandable detail row
            html += '<tr class="student-detail-row hidden" id="detail-' + u.uid + '">';
            html += '<td colspan="8"><div class="student-detail-content">';
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
        var daily = p.dailyQuizzes || {};
        var weekly = p.weeklyQuizzes || {};

        var html = '<h4>Quiz Scores</h4>';
        html += '<div class="student-quiz-grid">';

        learningPath.weeks.forEach(function (week) {
            week.days.forEach(function (day) {
                var dayId = 'W' + week.id + 'D' + day.day;
                var quiz = daily[dayId];
                if (quiz) {
                    html += '<div class="student-quiz-cell taken">' + dayId + '<br>' + quiz.score + '/' + quiz.maxScore + '</div>';
                } else {
                    html += '<div class="student-quiz-cell not-taken">' + dayId + '<br>—</div>';
                }
            });

            var weeklyId = 'W' + week.id;
            var wQuiz = weekly[weeklyId];
            if (wQuiz) {
                html += '<div class="student-quiz-cell taken">' + weeklyId + '<br>' + wQuiz.score + '/' + wQuiz.maxScore + '</div>';
            } else {
                html += '<div class="student-quiz-cell not-taken">' + weeklyId + '<br>—</div>';
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

        // Iterate through all quizzes
        var quizIds = [];
        learningPath.weeks.forEach(function (week) {
            week.days.forEach(function (day) {
                quizIds.push({ id: 'W' + week.id + 'D' + day.day, type: 'Daily', label: 'W' + week.id + ' Day ' + day.day });
            });
            quizIds.push({ id: 'W' + week.id, type: 'Weekly', label: 'Week ' + week.id + ' Weekly' });
        });

        quizIds.forEach(function (quiz) {
            var scores = [];
            var isWeekly = quiz.type === 'Weekly';

            for (var uid in allProgress) {
                var p = allProgress[uid];
                var source = isWeekly ? (p.weeklyQuizzes || {}) : (p.dailyQuizzes || {});
                if (source[quiz.id]) {
                    scores.push(source[quiz.id]);
                }
            }

            html += '<div class="quiz-analytics-card">';
            html += '<h4>' + quiz.label + ' <span class="badge badge-primary">' + quiz.type + '</span></h4>';

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

    // === Export Tab ===
    function renderExport(container) {
        var html = '<div class="export-section">';
        html += '<h2>Export Student Data</h2>';
        html += '<p>Download all student data, quiz scores, and progress as a CSV file.</p>';
        html += '<button class="btn btn-primary btn-lg" id="export-csv-btn">📥 Download CSV</button>';
        html += '<p class="text-muted mt-2">' + Object.keys(allUsers).length + ' students • All quiz scores included</p>';
        html += '</div>';

        container.innerHTML = html;

        document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
    }

    function exportCSV() {
        var headers = ['Name', 'Email', 'College', 'Branch', 'Equipment Studied', 'Total Points'];

        // Add quiz columns
        var quizCols = [];
        learningPath.weeks.forEach(function (week) {
            week.days.forEach(function (day) {
                var id = 'W' + week.id + 'D' + day.day;
                quizCols.push(id);
                headers.push(id + ' Score');
            });
            var weeklyId = 'W' + week.id;
            quizCols.push(weeklyId);
            headers.push(weeklyId + ' Weekly Score');
        });

        headers.push('Last Active');

        var rows = [headers.join(',')];

        for (var uid in allUsers) {
            var u = allUsers[uid];
            var p = allProgress[uid] || {};
            var daily = p.dailyQuizzes || {};
            var weekly = p.weeklyQuizzes || {};
            var points = calcPoints(p);

            var row = [
                '"' + (u.name || '').replace(/"/g, '""') + '"',
                '"' + (u.email || '') + '"',
                '"' + (u.college || '').replace(/"/g, '""') + '"',
                '"' + (u.branch || '') + '"',
                Object.keys(p.studied || {}).length,
                points
            ];

            quizCols.forEach(function (qId) {
                var quiz = qId.length === 2 ? weekly[qId] : daily[qId];
                row.push(quiz ? quiz.score + '/' + quiz.maxScore : '-');
            });

            row.push(u.lastActiveAt ? Utils.formatDate(u.lastActiveAt) : '-');
            rows.push(row.join(','));
        }

        var csv = rows.join('\n');
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'chembuddy-report-' + Utils.todayStr() + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        Utils.toast('CSV downloaded!', 'success');
    }

    function calcPoints(progress) {
        var total = 0;
        total += Object.keys(progress.studied || {}).length * 5;
        var daily = progress.dailyQuizzes || {};
        for (var k in daily) { total += (daily[k].points || 0); }
        var weekly = progress.weeklyQuizzes || {};
        for (var k in weekly) { total += (weekly[k].points || 0); }
        return total;
    }
})();
