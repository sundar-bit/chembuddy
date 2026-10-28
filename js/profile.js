// ChemBuddy - Student Profile Module

var Profile = (function () {
    'use strict';

    function render(container) {
        var profile = window.ChemBuddy.profile || {};
        var progress = window.ChemBuddy.progress || {};
        var studied = progress.studied || {};
        var quizzes = progress.quizzes || {};

        var totalPoints = window.ChemBuddy.calculateTotalPoints(progress);
        var studiedCount = Object.keys(studied).length;
        var quizzesDone = Object.keys(quizzes).length;
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

        // Level 1 certificate
        var total = learningPath.allEquipment().length;
        var done = Certificate.quizzesDone(progress);
        html += '<div class="profile-section">';
        html += '<h2>🎓 Level 1 Certificate</h2>';
        if (Certificate.isEligible(progress)) {
            html += '<p>Congratulations — you have completed every Level 1 quiz!</p>';
            if (progress.certificate) html += '<p class="text-muted">Issued ' + Utils.formatDate(progress.certificate.issuedAt) + ' • ID ' + Utils.sanitize(progress.certificate.certId) + '</p>';
            html += '<button class="btn btn-success mt-2" id="cert-download">Download Certificate</button>';
        } else {
            var cpct = Math.round(done / total * 100);
            html += '<p class="text-muted">Complete all ' + total + ' Level 1 quizzes to earn your certificate.</p>';
            html += '<div class="flex items-center gap-2"><span style="font-size:0.85rem">' + done + '/' + total + ' quizzes</span>';
            html += '<div class="progress" style="flex:1"><div class="progress-bar" style="width:' + cpct + '%"></div></div></div>';
        }
        html += '</div>';

        // Module-by-module breakdown
        learningPath.modules.forEach(function (mod) {
            html += '<div class="profile-section">';
            html += '<h2>Module ' + mod.id + ': ' + Utils.sanitize(mod.title) + '</h2>';

            // Equipment progress
            var modTotal = mod.equipment.length;
            var modStudied = mod.equipment.filter(function (eq) { return studied[eq.id]; }).length;

            var pct = modTotal > 0 ? Math.round((modStudied / modTotal) * 100) : 0;
            html += '<div class="flex items-center gap-2 mb-2">';
            html += '<span class="text-muted" style="font-size:0.85rem">' + modStudied + '/' + modTotal + ' equipment</span>';
            html += '<div class="progress" style="flex:1"><div class="progress-bar" style="width:' + pct + '%"></div></div>';
            html += '<span style="font-size:0.85rem;font-weight:600">' + pct + '%</span>';
            html += '</div>';

            // Quiz scores, one per equipment
            html += '<div class="quiz-score-grid mb-2">';
            mod.equipment.forEach(function (eq) {
                var quiz = quizzes[eq.id];
                if (quiz) {
                    html += '<div class="quiz-score-cell taken">' + quiz.score + '/' + quiz.maxScore;
                    html += '<span class="score-label">' + Utils.sanitize(eq.name) + ' (' + quiz.points + 'pts)</span></div>';
                } else {
                    html += '<div class="quiz-score-cell not-taken">—<span class="score-label">' + Utils.sanitize(eq.name) + '</span></div>';
                }
            });
            html += '</div>';

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

        var certBtn = document.getElementById('cert-download');
        if (certBtn) {
            certBtn.addEventListener('click', function () {
                certBtn.disabled = true;
                certBtn.textContent = 'Preparing…';
                Certificate.download(window.ChemBuddy.user.uid, profile, progress).then(function () {
                    Utils.toast('Certificate downloaded', 'success');
                }).catch(function (err) {
                    Utils.toast('Could not create the certificate: ' + err.message, 'error');
                }).then(function () {
                    certBtn.disabled = false;
                    certBtn.textContent = 'Download Certificate';
                });
            });
        }

        // Logout handler
        document.getElementById('profile-logout').addEventListener('click', function () {
            auth.signOut().then(function () { window.location.href = 'index.html'; });
        });
    }

    return {
        render: render
    };
})();
