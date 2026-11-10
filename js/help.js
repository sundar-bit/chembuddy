// ChemBuddy - Help (questions and answers on every feature)
//
// Plain data below, grouped by feature. Each answer is short and matches
// the app's real rules (quiz-engine.js, learn.js, certificate.js, voice.js).
// When a rule changes there, change the answer here too.

var Help = (function () {
    'use strict';

    var CONTACT = 'richa@somaiya.edu';
    var MAIL = '<a href="mailto:' + CONTACT + '">' + CONTACT + '</a>';

    var GROUPS = [
        { icon: '🚀', title: 'Getting Started', items: [
            ['What is ChemBuddy?',
             'ChemBuddy teaches you the equipment you will meet in a chemical plant. Level 1 has 25 equipment in 11 modules. Each one has a lesson with pictures and a short quiz.'],
            ['How do I log in?',
             'Use the email address you gave your college. Only invited students can log in. Forgot your password? Type your email on the login page, then tap <b>Forgot password?</b>. A reset link comes to your email.'],
            ['What should I do first?',
             'Open <b>Home</b>. The card at the top shows your next equipment. Tap <b>Continue Learning</b> to start.'],
            ['Can I use ChemBuddy on my phone?',
             'Yes. It works on phones, tablets and computers. On a phone, tap ☰ at the top to open the menu.']
        ]},
        { icon: '📅', title: 'Weekly Schedule', items: [
            ['When do new lessons open?',
             'A new module opens every Friday at 10 am (Indian time). The first module opens on Friday, 13 November 2026. The last opens on Friday, 22 January 2027.'],
            ['Why is a lesson locked? 🔒',
             'Tap the locked lesson. It tells you why. Either its module has not opened yet, or you must first finish the lesson before it and that lesson\'s quiz.'],
            ['I missed a week. Can I catch up?',
             'Yes. Opened modules stay open. Finish the earlier modules first, in order. Then the newer ones unlock.'],
            ['How much time does each equipment take?',
             'About 25 to 30 minutes, including the quiz. Plan about 1 to 1.5 hours a week.']
        ]},
        { icon: '📚', title: 'Lessons', items: [
            ['How is a lesson laid out?',
             'Each lesson has three pictures, then short sections. They cover how it works, its parts, common problems, what to check in the plant and safety. A recap ends the lesson.'],
            ['How do I see a picture clearly?',
             'Tap the picture. It opens full screen. Tap anywhere to close it. The small pictures below the big one switch between the three views.'],
            ['How do I finish a lesson?',
             'Read the lesson for at least 3 minutes. Then tap <b>Mark as Studied</b>. This unlocks the quiz and gives you 5 points.'],
            ['What are Learn and Browse?',
             '<b>Learn</b> shows your modules in order, with your progress. <b>Browse</b> lists all the equipment by module, with a search box. A locked one opens when its turn comes.']
        ]},
        { icon: '🔊', title: 'Listening to Lessons', items: [
            ['Can the lesson be read aloud?',
             'Yes. Each section has a <b>▶ Play</b> button. It reads that section aloud. The part being read is highlighted.'],
            ['How do I pause and carry on?',
             'Tap <b>Pause</b>. Tap <b>Play</b> again to carry on from the highlighted part.'],
            ['Can I hear just one line?',
             'Yes. Tap the small 🔊 next to a line. Only that line is read.'],
            ['How do I change the reading speed?',
             'Tap <b>0.5x</b>, <b>1x</b> or <b>1.5x</b> next to Play. The new speed starts at once. The app remembers it on this device.'],
            ['I hear nothing. What should I do?',
             'Check that your sound is on and not muted. Close other apps playing sound. Chrome and Edge work best. If it still fails, read the text. Nothing is lost.']
        ]},
        { icon: '📝', title: 'Quizzes', items: [
            ['When can I take the quiz?',
             'After you mark the lesson as studied. Tap <b>Take Quiz</b> at the end of the lesson, or open <b>Quizzes</b>.'],
            ['How does the quiz work?',
             'Each quiz has 10 practical questions. You get 60 seconds for each question. Each correct answer gives 10 points.'],
            ['Which attempt counts?',
             'Only your <b>first attempt</b>. It decides your points, your leaderboard place and your report. So read the lesson well before you start.'],
            ['Can I practise again?',
             'Yes. After the first attempt, you can retake each quiz up to 3 times for practice. Practice has no time limit and gives no points. Your first score stays.'],
            ['What if my internet drops during a quiz?',
             'Reconnect and open the quiz again. If it fails again, write to Richa at ' + MAIL + '. Give the equipment name and the time.']
        ]},
        { icon: '🏆', title: 'Points and Leaderboard', items: [
            ['How do I earn points?',
             '5 points for each lesson you mark as studied. 10 points for each correct answer in a first quiz attempt.'],
            ['Who appears on the leaderboard?',
             'The top 10 students by points. If you are not in the top 10, you still see your own points.'],
            ['What is the Day Streak?',
             'The number of days in a row on which you studied or took a quiz. Study a little every day to keep it going.']
        ]},
        { icon: '👤', title: 'Profile and Photo', items: [
            ['What is on my Profile?',
             'Your name, your progress in each module, the equipment you have studied and your certificate.'],
            ['Can I add my photo?',
             'Yes, if you wish. Tap <b>Add photo</b> on your Profile. You can change it or remove it any time. Only you and the course team can see it.'],
            ['My name is wrong. How do I fix it?',
             'Write to Richa at ' + MAIL + ' with the correct spelling. Your name also appears on your certificate.']
        ]},
        { icon: '⭐', title: 'Feedback', items: [
            ['Why am I asked for stars after a quiz?',
             'We want to know how useful each lesson was. Give 1 to 5 stars and, if you wish, one short comment.'],
            ['Do I have to give feedback?',
             'No. You can tap <b>Skip</b>. You are asked only once for each equipment.']
        ]},
        { icon: '🎓', title: 'Certificate', items: [
            ['How do I get my certificate?',
             'Take the quiz for all 25 Level 1 equipment. Then open your <b>Profile</b> and tap <b>Download Certificate</b>.'],
            ['Can I download it again?',
             'Yes. Every download shows the same date and certificate number.']
        ]},
        { icon: '✉️', title: 'Getting Help', items: [
            ['Something is not working. Whom do I contact?',
             'Write to Richa, your course coordinator, at ' + MAIL + '. Give your name, what you were doing and what you saw. A screenshot helps.'],
            ['The app looks old or broken after an update.',
             'Refresh the page. On a phone, close the browser tab and open the link again.']
        ]}
    ];

    function plain(html) {
        return html.replace(/<[^>]+>/g, '').replace(/"/g, '').toLowerCase();
    }

    function render(container) {
        var html = '<div class="help-page">';
        html += '<div class="help-header"><h1>Help</h1>';
        html += '<p>Tap a question to see the answer.</p>';
        html += '<input type="search" class="help-search" id="help-search" placeholder="Search help, e.g. quiz, photo, speed" aria-label="Search help">';
        html += '</div>';

        GROUPS.forEach(function (group) {
            html += '<section class="help-group">';
            html += '<h2><span class="help-group-icon">' + group.icon + '</span> ' + group.title + '</h2>';
            group.items.forEach(function (item) {
                html += '<details class="help-item" data-text="' + Utils.sanitize(plain(item[0] + ' ' + item[1])) + '">';
                html += '<summary>' + item[0] + '</summary>';
                html += '<div class="help-answer">' + item[1] + '</div>';
                html += '</details>';
            });
            html += '</section>';
        });

        html += '<p class="help-empty" id="help-empty" hidden>No answer matches. Try another word, or write to Richa at ' + MAIL + '.</p>';
        html += '</div>';
        container.innerHTML = html;

        var search = document.getElementById('help-search');
        search.addEventListener('input', function () {
            var q = search.value.trim().toLowerCase();
            var shown = 0;
            container.querySelectorAll('.help-group').forEach(function (group) {
                var groupShown = 0;
                group.querySelectorAll('.help-item').forEach(function (item) {
                    var hit = !q || item.dataset.text.indexOf(q) !== -1;
                    item.hidden = !hit;
                    item.open = !!q && hit;
                    if (hit) groupShown++;
                });
                group.hidden = groupShown === 0;
                shown += groupShown;
            });
            document.getElementById('help-empty').hidden = shown > 0;
        });
    }

    return { render: render, groups: GROUPS };
})();
