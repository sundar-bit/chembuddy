// ChemBuddy - Leaderboard Module

var Leaderboard = (function () {
    'use strict';

    var listeners = [];

    function render(container) {
        var html = '<div class="lb-header">';
        html += '<h1>Leaderboard</h1>';
        html += '<div class="lb-toggle">';
        html += '<button class="lb-toggle-btn active" data-view="cumulative">All Time</button>';
        html += '<button class="lb-toggle-btn" data-view="weekly">This Week</button>';
        html += '</div></div>';

        html += '<div id="lb-podium" class="lb-podium"></div>';
        html += '<div id="lb-table" class="lb-table"></div>';

        container.innerHTML = html;

        // Toggle buttons
        container.querySelectorAll('.lb-toggle-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                container.querySelectorAll('.lb-toggle-btn').forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');
                loadLeaderboard(this.dataset.view);
            });
        });

        // Load default view
        loadLeaderboard('cumulative');

        // Return cleanup
        return function () {
            listeners.forEach(function (unsub) { unsub(); });
            listeners = [];
        };
    }

    function loadLeaderboard(view) {
        // Clean up old listeners
        listeners.forEach(function (unsub) { unsub(); });
        listeners = [];

        var refPath;
        if (view === 'weekly') {
            var currentWeek = 1; // Simplified for pilot
            var progress = window.ChemBuddy.progress || {};
            var dailyQuizzes = progress.dailyQuizzes || {};
            for (var k in dailyQuizzes) {
                if (k.startsWith('W2')) { currentWeek = 2; break; }
            }
            refPath = 'leaderboard/weekly/' + currentWeek;
        } else {
            refPath = 'leaderboard/cumulative';
        }

        var ref = db.ref(refPath);
        var onValue = ref.on('value', function (snap) {
            var data = snap.val() || {};
            var entries = [];

            for (var uid in data) {
                var entry = data[uid];
                entries.push({
                    uid: uid,
                    name: entry.name || 'Student',
                    points: view === 'weekly' ? (entry.points || 0) : (entry.totalPoints || 0),
                    quizzes: view === 'weekly' ? (entry.quizzesCompleted || 0) : (entry.totalQuizzes || 0),
                    equipment: view === 'weekly' ? (entry.equipmentStudied || 0) : (entry.totalEquipment || 0),
                    streak: entry.streak || entry.bestStreak || 0
                });
            }

            // Sort by points descending
            entries.sort(function (a, b) { return b.points - a.points; });

            renderPodium(entries);
            renderTable(entries);
        });

        listeners.push(function () { ref.off('value', onValue); });
    }

    function renderPodium(entries) {
        var podium = document.getElementById('lb-podium');
        if (!podium || entries.length < 1) {
            if (podium) podium.innerHTML = '';
            return;
        }

        var medals = ['🥈', '🥇', '🥉'];
        var order = [1, 0, 2]; // Silver, Gold, Bronze display order
        var currentUid = window.ChemBuddy.user ? window.ChemBuddy.user.uid : '';

        var html = '';
        order.forEach(function (idx) {
            if (idx >= entries.length) return;
            var e = entries[idx];
            var initial = e.name.charAt(0).toUpperCase();

            html += '<div class="podium-item">';
            html += '<div class="podium-medal">' + medals[idx] + '</div>';
            html += '<div class="podium-avatar">' + initial + '</div>';
            html += '<div class="podium-name" title="' + Utils.sanitize(e.name) + '">' + Utils.sanitize(e.name) + '</div>';
            html += '<div class="podium-points">' + e.points + ' pts</div>';
            html += '<div class="podium-bar"></div>';
            html += '</div>';
        });

        podium.innerHTML = html;
    }

    function renderTable(entries) {
        var table = document.getElementById('lb-table');
        if (!table) return;
        var currentUid = window.ChemBuddy.user ? window.ChemBuddy.user.uid : '';

        if (entries.length === 0) {
            table.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><h3>No entries yet</h3><p>Start studying and taking quizzes to appear here!</p></div>';
            return;
        }

        var html = '<table>';
        html += '<thead><tr><th>Rank</th><th>Name</th><th>Points</th><th>Quizzes</th><th>Equipment</th><th>Streak</th></tr></thead>';
        html += '<tbody>';

        entries.forEach(function (e, idx) {
            var rank = idx + 1;
            var rankClass = rank === 1 ? 'gold' : (rank === 2 ? 'silver' : (rank === 3 ? 'bronze' : ''));
            var isCurrentUser = e.uid === currentUid;

            html += '<tr class="' + (isCurrentUser ? 'current-user' : '') + '">';
            html += '<td class="lb-rank ' + rankClass + '">' + (rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank) + '</td>';
            html += '<td class="lb-name">' + Utils.sanitize(e.name) + (isCurrentUser ? ' (You)' : '') + '</td>';
            html += '<td class="lb-points">' + e.points + '</td>';
            html += '<td>' + e.quizzes + '</td>';
            html += '<td>' + e.equipment + '</td>';
            html += '<td>' + (e.streak > 0 ? '🔥 ' + e.streak : '-') + '</td>';
            html += '</tr>';
        });

        html += '</tbody></table>';
        table.innerHTML = html;
    }

    return {
        render: render
    };
})();
