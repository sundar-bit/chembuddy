// ChemBuddy - Leaderboard Module

var Leaderboard = (function () {
    'use strict';

    var listeners = [];

    // Only the top 10 are shown, so lower ranks are not discouraged. Everyone
    // else sees their own points without a rank.
    var TOP_N = 10;

    function render(container) {
        var html = '<div class="lb-header">';
        html += '<h1>Leaderboard</h1>';
        html += '<p>Top ' + TOP_N + '</p>';
        html += '</div>';

        html += '<div id="lb-podium" class="lb-podium"></div>';
        html += '<div id="lb-table" class="lb-table"></div>';

        container.innerHTML = html;

        loadLeaderboard();

        // Return cleanup
        return function () {
            listeners.forEach(function (unsub) { unsub(); });
            listeners = [];
        };
    }

    function loadLeaderboard() {
        // Clean up old listeners
        listeners.forEach(function (unsub) { unsub(); });
        listeners = [];

        var ref = db.ref('leaderboard/cumulative');
        var onValue = ref.on('value', function (snap) {
            var data = snap.val() || {};
            var entries = [];

            for (var uid in data) {
                var entry = data[uid];
                entries.push({
                    uid: uid,
                    name: entry.name || 'Student',
                    points: entry.totalPoints || 0,
                    quizzes: entry.totalQuizzes || 0,
                    equipment: entry.totalEquipment || 0,
                    streak: entry.bestStreak || 0
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

        entries.slice(0, TOP_N).forEach(function (e, idx) {
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

        var myIndex = -1;
        entries.forEach(function (e, idx) { if (e.uid === currentUid) myIndex = idx; });
        if (myIndex === -1 || myIndex >= TOP_N) {
            var mine = myIndex === -1 ? 0 : entries[myIndex].points;
            html += '<div class="card mt-2"><div class="card-body text-center">';
            html += '<p><strong>Your points: ' + mine + '</strong></p>';
            html += '<p class="text-muted">Study each week and take the quizzes to climb into the Top ' + TOP_N + '!</p>';
            html += '</div></div>';
        }

        table.innerHTML = html;
    }

    return {
        render: render
    };
})();
