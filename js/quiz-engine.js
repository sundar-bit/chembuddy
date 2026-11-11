// ChemBuddy - Quiz Engine Module

var QuizEngine = (function () {
    'use strict';

    var currentQuiz = null;
    var timerInterval = null;

    var POINTS_PER_CORRECT = 10;
    // Time to read the question and all four options, then think. 30s proved
    // too short even for the author (reading alone takes 20-25s).
    var SECONDS_PER_QUESTION = 60; // official attempt only; practice has no time limit
    var MAX_RETAKES = 3; // per equipment, after the official attempt; a retake counts once finished

    // One quiz per equipment; the quiz id is the equipment id.
    function equipmentName(equipId) {
        var found = learningPath.findEquipment(equipId);
        return found ? found.module.equipment[found.index].name : equipId;
    }

    // Number of questions in the bank for this equipment.
    function questionCount(equipId) {
        if (typeof questionBank === 'undefined') return 0;
        return questionBank.filter(function (q) { return q.equipmentId === equipId; }).length;
    }

    // A quiz goes live only once its equipment has a full set of questions.
    function isQuizReady(equipId) {
        return questionCount(equipId) >= learningPath.quizLength;
    }

    function retakesLeft(equipId) {
        var practice = (window.ChemBuddy.progress.practice || {})[equipId];
        return Math.max(0, MAX_RETAKES - (practice ? practice.attempts || 0 : 0));
    }

    function renderQuizList(container) {
        var progress = window.ChemBuddy.progress || {};
        var studied = progress.studied || {};
        var quizzes = progress.quizzes || {};

        var html = '<h1 class="mb-1">My Quizzes</h1>';
        html += '<p class="text-muted mb-3">One quiz per equipment — ' + learningPath.quizLength + ' questions. Your first attempt counts; after that you can retake each quiz up to ' + MAX_RETAKES + ' times for practice.</p>';

        learningPath.modules.forEach(function (mod) {
            html += '<div class="card mb-3"><div class="card-header">Module ' + mod.id + ': ' + Utils.sanitize(mod.title) + '</div>';
            html += '<div class="card-body">';
            html += '<div class="quiz-score-grid mb-2">';
            mod.equipment.forEach(function (eq) {
                var quiz = quizzes[eq.id];
                var label = '<span class="score-label">' + Utils.sanitize(eq.name) + '</span>';

                if (quiz) {
                    html += '<a href="#/quiz/' + eq.id + '" class="quiz-score-cell taken" style="text-decoration:none">' + quiz.score + '/' + quiz.maxScore + label + '</a>';
                } else if (!isQuizReady(eq.id)) {
                    html += '<div class="quiz-score-cell not-taken">Soon' + label + '</div>';
                } else if (studied[eq.id]) {
                    html += '<a href="#/quiz/' + eq.id + '" class="quiz-score-cell" style="background:rgba(26,95,122,0.1);color:var(--primary);text-decoration:none;cursor:pointer">';
                    html += 'Take' + label + '</a>';
                } else {
                    html += '<div class="quiz-score-cell not-taken">—' + label + '</div>';
                }
            });
            html += '</div>';
            html += '</div></div>';
        });

        container.innerHTML = html;
    }

    // Practice: retake a quiz already taken. Saved separately under
    // progress/<uid>/practice/<equipId>; the first attempt stays the official score.
    function renderPractice(container, params) {
        return renderQuiz(container, params, true);
    }

    function renderQuiz(container, params, practice) {
        var quizId = params.quizId; // equipment id, e.g. "centrifugal-pump"

        var progress = window.ChemBuddy.progress || {};
        var studied = progress.studied || {};
        var quizzes = progress.quizzes || {};

        if (!learningPath.findEquipment(quizId)) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">❓</div><h3>Quiz Not Found</h3><a href="#/quizzes" class="btn btn-primary mt-2">All Quizzes</a></div>';
            return;
        }

        // Check if already attempted — only the first attempt counts
        var existing = quizzes[quizId];
        if (existing && !practice) {
            showPreviousResults(container, quizId, existing);
            return;
        }
        if (practice && !existing) {
            Router.navigate('/quiz/' + quizId);
            return;
        }
        if (practice) {
            if (retakesLeft(quizId) === 0) {
                showPreviousResults(container, quizId, existing);
                return;
            }
            showPreQuiz(container, quizId, getQuestionsForQuiz(quizId), true);
            return;
        }

        if (!isQuizReady(quizId)) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><h3>Quiz Being Prepared</h3><p>The quiz for ' + Utils.sanitize(equipmentName(quizId)) + ' will be available soon.</p><a href="#/learn" class="btn btn-primary mt-2">Back to Learning</a></div>';
            return;
        }

        // Check prerequisite: the equipment must be studied first
        if (!studied[quizId]) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📖</div><h3>Study First</h3><p>Study ' + Utils.sanitize(equipmentName(quizId)) + ' before taking its quiz.</p><a href="#/learn/' + quizId + '" class="btn btn-primary mt-2">Go to Lesson</a></div>';
            return;
        }

        // Show pre-quiz screen
        showPreQuiz(container, quizId, getQuestionsForQuiz(quizId));
    }

    function getQuestionsForQuiz(equipId) {
        if (typeof questionBank === 'undefined') return [];
        var pool = questionBank.filter(function (q) { return q.equipmentId === equipId; });
        return Utils.shuffle(pool).slice(0, learningPath.quizLength);
    }

    function showPreQuiz(container, quizId, questions, practice) {
        var pointsPerQ = POINTS_PER_CORRECT;
        var html = '<div class="quiz-body" style="min-height:calc(100vh - 120px)">';
        html += '<div class="quiz-pre">';
        html += '<div class="quiz-pre-icon">📝</div>';
        html += '<h2>' + (practice ? 'Practice' : 'Quiz') + ': ' + Utils.sanitize(equipmentName(quizId)) + '</h2>';
        html += '<p>' + (practice ? 'Retake ' + (MAX_RETAKES - retakesLeft(quizId) + 1) + ' of ' + MAX_RETAKES : 'Test what you learned about this equipment') + '</p>';

        html += '<div class="quiz-meta">';
        html += '<div class="quiz-meta-item"><div class="quiz-meta-value">' + questions.length + '</div><div class="quiz-meta-label">Questions</div></div>';
        html += '<div class="quiz-meta-item"><div class="quiz-meta-value">' + (practice ? 'No' : SECONDS_PER_QUESTION + 's') + '</div><div class="quiz-meta-label">' + (practice ? 'Time Limit' : 'Per Question') + '</div></div>';
        html += '<div class="quiz-meta-item"><div class="quiz-meta-value">' + pointsPerQ + '</div><div class="quiz-meta-label">Pts Each</div></div>';
        html += '</div>';

        if (practice) {
            var official = window.ChemBuddy.progress.quizzes[quizId];
            html += '<p style="font-size:0.85rem;color:var(--text-light);margin-bottom:1.5rem">Practice only — no points, and your official score stays ' + official.score + '/' + official.maxScore + '.</p>';
        } else {
            html += '<p style="font-size:0.85rem;color:var(--text-light);margin-bottom:1.5rem">⚠️ Only this first attempt counts for points and reports. You can retake it up to ' + MAX_RETAKES + ' times for practice afterwards.</p>';
        }
        html += '<button class="btn btn-primary btn-lg" id="start-quiz-btn">' + (practice ? 'Start Practice →' : 'Start Quiz →') + '</button>';
        html += '<br><a href="#/learn" class="btn btn-outline mt-2">Cancel</a>';
        html += '</div></div>';

        container.innerHTML = html;

        document.getElementById('start-quiz-btn').addEventListener('click', function () {
            startQuiz(container, quizId, questions, practice);
        });
    }

    function startQuiz(container, quizId, questions, practice) {
        var state = {
            quizId: quizId,
            practice: !!practice,
            questions: questions,
            currentIndex: 0,
            answers: [],
            score: 0,
            pointsPerCorrect: POINTS_PER_CORRECT,
            timePerQuestion: SECONDS_PER_QUESTION,
            startTime: Date.now()
        };

        currentQuiz = state;
        renderQuestion(container, state);

        return function () {
            if (timerInterval) clearInterval(timerInterval);
        };
    }

    function renderQuestion(container, state) {
        var q = state.questions[state.currentIndex];
        var letters = ['A', 'B', 'C', 'D'];

        var html = '<div class="quiz-overlay">';

        // Header
        html += '<div class="quiz-header">';
        html += '<div class="quiz-header-left">';
        html += '<span class="quiz-title">' + Utils.sanitize(equipmentName(state.quizId)) + '</span>';
        html += '<span class="quiz-counter">' + (state.currentIndex + 1) + ' of ' + state.questions.length + '</span>';
        html += '</div>';
        html += '<button class="quiz-exit-btn" id="quiz-exit">✕ Exit</button>';
        html += '</div>';

        // Progress dots
        html += '<div class="quiz-progress">';
        for (var i = 0; i < state.questions.length; i++) {
            var dotClass = 'quiz-dot';
            if (i === state.currentIndex) dotClass += ' current';
            else if (i < state.answers.length) {
                dotClass += state.answers[i].isCorrect ? ' correct' : ' wrong';
            }
            html += '<div class="' + dotClass + '"></div>';
        }
        html += '</div>';

        // Question
        html += '<div class="quiz-body">';
        html += '<div class="quiz-question-card">';

        // Timer (official attempt only)
        if (!state.practice) {
            html += '<div class="quiz-timer">';
            html += '<div class="timer-ring">';
            html += '<svg viewBox="0 0 64 64"><circle class="timer-ring-bg" cx="32" cy="32" r="30"/>';
            html += '<circle class="timer-ring-fill" id="timer-fill" cx="32" cy="32" r="30"/></svg>';
            html += '<div class="timer-number" id="timer-number">' + state.timePerQuestion + '</div>';
            html += '</div></div>';
        }

        // Question text
        html += '<div class="quiz-question-text">' + Utils.sanitize(q.question) + '</div>';

        // Options
        html += '<div class="quiz-options" id="quiz-options">';
        q.options.forEach(function (opt, idx) {
            html += '<button class="quiz-option" data-idx="' + idx + '">';
            html += '<span class="option-letter">' + letters[idx] + '</span>';
            html += '<span class="option-text">' + Utils.sanitize(opt) + '</span>';
            html += '</button>';
        });
        html += '</div>';

        // Feedback area
        html += '<div class="quiz-feedback" id="quiz-feedback"></div>';

        // Next button (hidden initially)
        html += '<button class="btn btn-primary quiz-next-btn hidden" id="quiz-next">Next Question →</button>';

        html += '</div></div></div>';

        container.innerHTML = html;

        // How long this answer took is recorded in both modes; only the official attempt is timed
        state.questionStart = Date.now();
        if (timerInterval) clearInterval(timerInterval);
        if (!state.practice) startQuestionTimer(state);

        // Option click handlers
        container.querySelectorAll('.quiz-option').forEach(function (btn) {
            btn.addEventListener('click', function () {
                selectAnswer(container, state, parseInt(this.dataset.idx));
            });
        });

        // Exit button
        document.getElementById('quiz-exit').addEventListener('click', function () {
            if (confirm('Are you sure? Your progress will be lost.')) {
                if (timerInterval) clearInterval(timerInterval);
                currentQuiz = null;
                Router.navigate('/quizzes');
            }
        });

        // Next button
        document.getElementById('quiz-next').addEventListener('click', function () {
            nextQuestion(container, state);
        });
    }

    function startQuestionTimer(state) {
        if (timerInterval) clearInterval(timerInterval);

        var remaining = state.timePerQuestion;
        var total = state.timePerQuestion;
        var circumference = 2 * Math.PI * 30; // r=30

        timerInterval = setInterval(function () {
            var fill = document.getElementById('timer-fill');
            var num = document.getElementById('timer-number');

            // The student left the quiz: nothing more to time
            if (!num) {
                clearInterval(timerInterval);
                return;
            }

            remaining--;

            if (num) {
                num.textContent = remaining;
                num.className = 'timer-number';
                if (remaining <= 5) num.className += ' danger';
                else if (remaining <= 10) num.className += ' warning';
            }

            if (fill) {
                var offset = circumference * (1 - remaining / total);
                fill.style.strokeDashoffset = offset;
                // An SVG element's className cannot be assigned
                fill.setAttribute('class', 'timer-ring-fill' + (remaining <= 5 ? ' danger' : (remaining <= 10 ? ' warning' : '')));
            }

            if (remaining <= 0) {
                clearInterval(timerInterval);
                // Auto-submit as unanswered
                var container = document.querySelector('.quiz-overlay').parentElement;
                selectAnswer(container, state, -1); // -1 = timed out
            }
        }, 1000);
    }

    function selectAnswer(container, state, selectedIdx) {
        // One answer per question: later taps must not score again
        if (state.answers.length > state.currentIndex) return;

        if (timerInterval) clearInterval(timerInterval);

        var q = state.questions[state.currentIndex];
        var isCorrect = selectedIdx === q.correct;
        var timeUsed = Math.round((Date.now() - state.questionStart) / 1000);

        state.answers.push({
            questionId: q.id,
            selected: selectedIdx,
            correct: q.correct,
            isCorrect: isCorrect,
            timeTaken: timeUsed
        });

        if (isCorrect) state.score++;

        // Show feedback
        var options = container.querySelectorAll('.quiz-option');
        options.forEach(function (btn) {
            var idx = parseInt(btn.dataset.idx);
            btn.classList.add('disabled');
            if (idx === q.correct) btn.classList.add('correct');
            if (idx === selectedIdx && !isCorrect) btn.classList.add('wrong');
        });

        var feedback = document.getElementById('quiz-feedback');
        if (feedback) {
            feedback.className = 'quiz-feedback show ' + (isCorrect ? 'correct-feedback' : 'wrong-feedback');
            if (selectedIdx === -1) {
                feedback.innerHTML = '<strong>⏰ Time\'s up!</strong><br>' + Utils.sanitize(q.explanation);
            } else {
                feedback.innerHTML = '<strong>' + (isCorrect ? '✓ Correct!' : '✗ Incorrect') + '</strong><br>' + Utils.sanitize(q.explanation);
            }
        }

        // Show next button
        var nextBtn = document.getElementById('quiz-next');
        if (nextBtn) {
            nextBtn.classList.remove('hidden');
            if (state.currentIndex === state.questions.length - 1) {
                nextBtn.textContent = 'See Results →';
            }
        }
    }

    function nextQuestion(container, state) {
        state.currentIndex++;
        if (state.currentIndex >= state.questions.length) {
            finishQuiz(container, state);
        } else {
            renderQuestion(container, state);
        }
    }

    function finishQuiz(container, state) {
        if (timerInterval) clearInterval(timerInterval);

        var points = state.score * state.pointsPerCorrect;
        var totalTime = state.answers.reduce(function (sum, a) { return sum + a.timeTaken; }, 0);
        var uid = window.ChemBuddy.user.uid;

        if (state.practice) {
            savePractice(uid, state);
            showResults(container, state, 0, totalTime);
            return;
        }

        // Save to Firebase
        var path = 'progress/' + uid + '/quizzes/' + state.quizId;

        var quizData = {
            score: state.score,
            maxScore: state.questions.length,
            points: points,
            completedAt: Date.now(),
            timeTaken: totalTime,
            answers: {}
        };

        state.answers.forEach(function (a, i) {
            quizData.answers[i] = a;
        });

        db.ref(path).set(quizData).then(function () {
            Learn.updateLeaderboardPoints(uid, points);
        });

        // Show results
        showResults(container, state, points, totalTime);
    }

    function showResults(container, state, points, totalTime) {
        var pct = state.questions.length > 0 ? Math.round((state.score / state.questions.length) * 100) : 0;
        var gradeClass = pct >= 80 ? 'great' : (pct >= 60 ? 'good' : (pct >= 40 ? 'needs-work' : 'poor'));
        var cheer = Celebrate.message(state.score, state.questions.length, state.practice);

        var html = '<div class="quiz-body" style="min-height:calc(100vh - 56px)">';
        html += '<div class="quiz-results">';

        // Score circle
        html += '<div class="results-score-circle ' + gradeClass + '">';
        html += '<div class="results-score-num">' + state.score + '/' + state.questions.length + '</div>';
        html += '<div class="results-score-label">' + pct + '%</div>';
        html += '</div>';

        html += '<div class="results-cheer results-cheer-' + cheer.band + '">';
        html += '<div class="results-message">' + cheer.title + '</div>';
        html += '<p class="results-cheer-text">' + cheer.text + '</p>';
        html += '</div>';
        if (state.practice) {
            var official = window.ChemBuddy.progress.quizzes[state.quizId];
            html += '<div class="results-points">Practice — your official score stays ' + official.score + '/' + official.maxScore + '</div>';
        } else {
            html += '<div class="results-points">+' + points + ' points earned</div>';
        }

        // Breakdown
        html += '<div class="results-breakdown">';
        state.answers.forEach(function (a, i) {
            var q = state.questions[i];
            html += '<div class="results-row">';
            html += '<span class="results-row-icon">' + (a.isCorrect ? '✅' : (a.selected === -1 ? '⏰' : '❌')) + '</span>';
            html += '<span class="results-row-q">' + Utils.sanitize(q.question).substring(0, 60) + '...</span>';
            html += '<span class="results-row-time">' + a.timeTaken + 's</span>';
            html += '</div>';
        });
        html += '</div>';

        // Lesson feedback: asked once per equipment, after the official attempt
        if (!state.practice) html += feedbackCardHTML(state.quizId);

        // Actions
        html += '<div class="results-actions">';
        html += '<a href="#/learn" class="btn btn-primary">Back to Learning</a>';
        var left = retakesLeft(state.quizId);
        if (left > 0 && state.practice) {
            // Already on the practice page, so a link to it would do nothing
            html += '<button class="btn btn-outline" id="practice-again">Practice Again (' + left + ' left)</button>';
        } else if (left > 0) {
            html += '<a href="#/quiz/' + state.quizId + '/practice" class="btn btn-outline">Practice Again (' + left + ' left)</a>';
        }
        html += '</div>';
        if (left === 0) html += '<p class="text-muted mt-2">You have used all ' + MAX_RETAKES + ' retakes for this quiz.</p>';

        html += '</div></div>';
        container.innerHTML = html;
        currentQuiz = null;
        if (!state.practice) bindFeedback(state.quizId);
        Celebrate.run(cheer.burst);

        var again = document.getElementById('practice-again');
        if (again) {
            again.addEventListener('click', function () {
                renderPractice(container, { quizId: state.quizId });
                window.scrollTo(0, 0);
            });
        }
    }

    function showPreviousResults(container, quizId, data) {
        var pct = data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0;
        var gradeClass = pct >= 80 ? 'great' : (pct >= 60 ? 'good' : (pct >= 40 ? 'needs-work' : 'poor'));

        var html = '<div class="quiz-body" style="min-height:calc(100vh - 120px)">';
        html += '<div class="quiz-results">';

        html += '<div class="results-score-circle ' + gradeClass + '">';
        html += '<div class="results-score-num">' + data.score + '/' + data.maxScore + '</div>';
        html += '<div class="results-score-label">' + pct + '%</div>';
        html += '</div>';

        html += '<h2>Quiz Already Completed</h2>';
        html += '<p class="text-muted mb-2">Quiz: ' + Utils.sanitize(equipmentName(quizId)) + '</p>';
        html += '<div class="results-points">' + data.points + ' points earned • ' + Utils.formatDateTime(data.completedAt) + '</div>';

        var practice = (window.ChemBuddy.progress.practice || {})[quizId];
        if (practice) {
            html += '<p class="text-muted mt-2">Retakes: ' + Math.min(practice.attempts, MAX_RETAKES) + ' of ' + MAX_RETAKES + ' used, best ' + practice.best + '/' + data.maxScore + '</p>';
        }

        // Feedback not yet given (or skipped) for this lesson: offer it here too
        html += feedbackCardHTML(quizId);

        html += '<div class="results-actions mt-3">';
        if (retakesLeft(quizId) > 0) {
            html += '<a href="#/quiz/' + quizId + '/practice" class="btn btn-primary">Practice Again (' + retakesLeft(quizId) + ' left)</a>';
        }
        html += '<a href="#/quizzes" class="btn btn-outline">All Quizzes</a>';
        html += '</div>';

        html += '</div></div>';
        container.innerHTML = html;
        bindFeedback(quizId);
    }

    // === Lesson feedback ===
    // Stored at progress/<uid>/feedback/<equipId> as { stars, comment, at }
    // or { skipped: true, at }. Asked only until answered or skipped.
    function feedbackGiven(quizId) {
        return !!((window.ChemBuddy.progress.feedback || {})[quizId]);
    }

    function feedbackCardHTML(quizId) {
        if (feedbackGiven(quizId)) return '';
        var h = '<div class="feedback-card" id="feedback-card">';
        h += '<div class="feedback-q">How clear and useful was this lesson?</div>';
        h += '<div class="feedback-stars" role="group" aria-label="Rate this lesson from 1 to 5 stars">';
        for (var i = 1; i <= 5; i++) {
            h += '<button type="button" class="feedback-star" data-v="' + i + '" aria-label="' + i + ' star' + (i > 1 ? 's' : '') + '">★</button>';
        }
        h += '</div>';
        h += '<textarea id="feedback-text" class="form-input feedback-text" maxlength="200" rows="2" placeholder="One thing you liked or would improve (optional)"></textarea>';
        h += '<div class="feedback-actions">';
        h += '<button type="button" class="btn btn-primary btn-sm" id="feedback-send" disabled>Send</button>';
        h += '<button type="button" class="btn btn-outline btn-sm" id="feedback-skip">Skip</button>';
        h += '</div></div>';
        return h;
    }

    function bindFeedback(quizId) {
        var card = document.getElementById('feedback-card');
        if (!card) return;
        var stars = 0;
        var btns = card.querySelectorAll('.feedback-star');
        var send = document.getElementById('feedback-send');
        var skip = document.getElementById('feedback-skip');
        var text = document.getElementById('feedback-text');
        Array.prototype.forEach.call(btns, function (b) {
            b.addEventListener('click', function () {
                stars = +b.dataset.v;
                Array.prototype.forEach.call(btns, function (x) { x.classList.toggle('on', +x.dataset.v <= stars); });
                send.disabled = false;
            });
        });
        function save(data, thanks) {
            var progress = window.ChemBuddy.progress;
            progress.feedback = progress.feedback || {};
            progress.feedback[quizId] = data;
            send.disabled = true; skip.disabled = true;
            db.ref('progress/' + window.ChemBuddy.user.uid + '/feedback/' + quizId).set(data).then(function () {
                card.innerHTML = '<div class="feedback-thanks">' + thanks + '</div>';
            }).catch(function (err) {
                delete progress.feedback[quizId];
                send.disabled = !stars; skip.disabled = false;
                Utils.toast('Could not send your feedback: ' + err.message, 'error');
            });
        }
        send.addEventListener('click', function () {
            if (!stars) return;
            save({ stars: stars, comment: text.value.trim().slice(0, 200), at: Date.now() }, 'Thank you for your feedback!');
        });
        skip.addEventListener('click', function () {
            save({ skipped: true, at: Date.now() }, 'No problem. Carry on learning!');
        });
    }

    function savePractice(uid, state) {
        // Count it here too, so the retakes shown next are right before the save returns
        var progress = window.ChemBuddy.progress;
        progress.practice = progress.practice || {};
        var local = progress.practice[state.quizId] || {};
        progress.practice[state.quizId] = {
            attempts: (local.attempts || 0) + 1,
            best: Math.max(local.best || 0, state.score),
            lastScore: state.score,
            lastAt: Date.now()
        };

        db.ref('progress/' + uid + '/practice/' + state.quizId).transaction(function (cur) {
            cur = cur || {};
            return {
                attempts: (cur.attempts || 0) + 1,
                best: Math.max(cur.best || 0, state.score),
                lastScore: state.score,
                lastAt: Date.now()
            };
        });
    }

    return {
        renderQuizList: renderQuizList,
        renderQuiz: renderQuiz,
        renderPractice: renderPractice,
        isQuizReady: isQuizReady,
        questionCount: questionCount,
        retakesLeft: retakesLeft
    };
})();
