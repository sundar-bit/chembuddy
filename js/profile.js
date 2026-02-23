// ChemBuddy - Student Profile Module

var Profile = (function () {
    'use strict';

    function render(container) {
        var profile = window.ChemBuddy.profile || {};
        var progress = window.ChemBuddy.progress || {};
        var studied = progress.studied || {};
        var dailyQuizzes = progress.dailyQuizzes || {};
        var weeklyQuizzes = progress.weeklyQuizzes || {};

        var totalPoints = window.ChemBuddy.calculateTotalPoints(progress);
        var studiedCount = Object.keys(studied).length;
        var quizzesDone = Object.keys(dailyQuizzes).length + Object.keys(weeklyQuizzes).length;
        var streak = window.ChemBuddy.getStudyStreak(progress);

        var html = '';

        // Profile header
        html += '<div class="profile-header">';
        html += '<h1>' + Utils.sanitize(profile.name || 'Student') + '</h1>';
        html += '<div class="profile-meta">';
        html += '<span>' + Utils.sanitize(profile.email || '') + '</span>';
        if (profile.college) html += '<span>' + Utils.sanitize(profile.college) + '</span>';
        if (profile.branch) html += '<span>' + Utils.sanitize(profile.branch) + '</span>';
        html += '</div>';

        html += '<div class="profile-stats">';
        html += '<div class="profile-stat"><div class="profile-stat-value">' + totalPoints + '</div><div class="profile-stat-label">Total Points</div></div>';
        html += '<div class="profile-stat"><div class="profile-stat-value">' + studiedCount + '</div><div class="profile-stat-label">Equipment</div></div>';
        html += '<div class="profile-stat"><div class="profile-stat-value">' + quizzesDone + '</div><div class="profile-stat-label">Quizzes</div></div>';
        html += '<div class="profile-stat"><div class="profile-stat-value">' + streak + '</div><div class="profile-stat-label">Streak</div></div>';
        html += '</div></div>';

        // Week-by-week breakdown
        learningPath.weeks.forEach(function (week) {
            html += '<div class="profile-section">';
            html += '<h2>Week ' + week.id + ': ' + Utils.sanitize(week.title) + '</h2>';

            // Equipment progress
            var weekStudied = 0;
            var weekTotal = 0;
            week.days.forEach(function (day) {
                weekTotal += day.equipmentIds.length;
                day.equipmentIds.forEach(function (id) {
                    if (studied[id]) weekStudied++;
                });
            });

            var pct = weekTotal > 0 ? Math.round((weekStudied / weekTotal) * 100) : 0;
            html += '<div class="flex items-center gap-2 mb-2">';
            html += '<span class="text-muted" style="font-size:0.85rem">' + weekStudied + '/' + weekTotal + ' equipment</span>';
            html += '<div class="progress" style="flex:1"><div class="progress-bar" style="width:' + pct + '%"></div></div>';
            html += '<span style="font-size:0.85rem;font-weight:600">' + pct + '%</span>';
            html += '</div>';

            // Daily quiz scores
            html += '<h4 class="mb-1">Daily Quizzes</h4>';
            html += '<div class="quiz-score-grid mb-2">';
            week.days.forEach(function (day) {
                var dayId = 'W' + week.id + 'D' + day.day;
                var quiz = dailyQuizzes[dayId];
                if (quiz) {
                    html += '<div class="quiz-score-cell taken">' + quiz.score + '/' + quiz.maxScore;
                    html += '<span class="score-label">Day ' + day.day + ' (' + quiz.points + 'pts)</span></div>';
                } else {
                    html += '<div class="quiz-score-cell not-taken">—<span class="score-label">Day ' + day.day + '</span></div>';
                }
            });
            html += '</div>';

            // Weekly quiz
            var weeklyId = 'W' + week.id;
            var wQuiz = weeklyQuizzes[weeklyId];
            if (wQuiz) {
                html += '<div class="flex items-center justify-between p-2 mb-1" style="background:var(--success-light);border-radius:var(--radius)">';
                html += '<span><strong>Weekly Quiz:</strong> ' + wQuiz.score + '/' + wQuiz.maxScore + '</span>';
                html += '<span class="badge badge-success">' + wQuiz.points + ' pts</span></div>';
            } else {
                html += '<div class="flex items-center justify-between p-2 mb-1" style="background:var(--bg-dark);border-radius:var(--radius)">';
                html += '<span class="text-muted"><strong>Weekly Quiz:</strong> Not attempted</span></div>';
            }

            html += '</div>';
        });

        // Recently studied equipment
        var studiedEntries = [];
        for (var id in studied) {
            studiedEntries.push({ id: id, data: studied[id] });
        }
        studiedEntries.sort(function (a, b) { return (b.data.completedAt || 0) - (a.data.completedAt || 0); });

        if (studiedEntries.length > 0) {
            html += '<div class="profile-section">';
            html += '<h2>Equipment Studied (' + studiedEntries.length + ')</h2>';
            html += '<table class="equip-table"><thead><tr><th>Equipment</th><th>Time Spent</th><th>Date</th></tr></thead><tbody>';
            studiedEntries.forEach(function (entry) {
                var equip = equipmentDB[entry.id];
                var name = equip ? equip.name : entry.id;
                html += '<tr>';
                html += '<td><a href="#/browse/' + entry.id + '">' + Utils.sanitize(name) + '</a></td>';
                html += '<td>' + Utils.formatTime(entry.data.timeSpent || 0) + '</td>';
                html += '<td>' + Utils.formatDate(entry.data.completedAt) + '</td>';
                html += '</tr>';
            });
            html += '</tbody></table>';
            html += '</div>';
        }

        // Account info
        html += '<div class="profile-section">';
        html += '<h2>Account</h2>';
        html += '<p class="text-muted">Registered: ' + Utils.formatDate(profile.registeredAt) + '</p>';
        html += '<button class="btn btn-danger btn-sm mt-2" id="profile-logout">Logout</button>';
        html += '</div>';

        container.innerHTML = html;

        // Logout handler
        document.getElementById('profile-logout').addEventListener('click', function () {
            auth.signOut().then(function () { window.location.href = 'index.html'; });
        });
    }

    return {
        render: render
    };
})();
