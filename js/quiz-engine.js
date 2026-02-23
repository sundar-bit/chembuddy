// ChemBuddy - Quiz Engine Module

var QuizEngine = (function () {
    'use strict';

    var currentQuiz = null;
    var timerInterval = null;

    function renderQuizList(container) {
        var progress = window.ChemBuddy.progress || {};
        var studied = progress.studied || {};
        var dailyQuizzes = progress.dailyQuizzes || {};
        var weeklyQuizzes = progress.weeklyQuizzes || {};

        var html = '<h1 class="mb-1">My Quizzes</h1>';
        html += '<p class="text-muted mb-3">Daily and weekly quizzes to test your knowledge</p>';

        learningPath.weeks.forEach(function (week) {
            html += '<div class="card mb-3"><div class="card-header">Week ' + week.id + ': ' + Utils.sanitize(week.title) + '</div>';
            html += '<div class="card-body">';

            // Daily quizzes
            html += '<div class="quiz-score-grid mb-2">';
            week.days.forEach(function (day) {
                var dayId = 'W' + week.id + 'D' + day.day;
                var quiz = dailyQuizzes[dayId];
                var allStudied = day.equipmentIds.every(function (id) { return studied[id]; });

                if (quiz) {
                    html += '<div class="quiz-score-cell taken">';
                    html += quiz.score + '/' + quiz.maxScore;
                    html += '<span class="score-label">Day ' + day.day + '</span></div>';
                } else if (allStudied) {
                    html += '<a href="#/quiz/' + dayId + '" class="quiz-score-cell" style="background:rgba(26,95,122,0.1);color:var(--primary);text-decoration:none;cursor:pointer">';
                    html += 'Take';
                    html += '<span class="score-label">Day ' + day.day + '</span></a>';
                } else {
                    html += '<div class="quiz-score-cell not-taken">';
                    html += '—';
                    html += '<span class="score-label">Day ' + day.day + '</span></div>';
                }
            });
            html += '</div>';

            // Weekly quiz
            var weeklyId = 'W' + week.id;
            var allDailyDone = week.days.every(function (d) { return dailyQuizzes['W' + week.id + 'D' + d.day]; });
            var wQuiz = weeklyQuizzes[weeklyId];

            if (wQuiz) {
                html += '<div class="flex items-center justify-between p-2" style="background:var(--success-light);border-radius:var(--radius)">';
                html += '<span><strong>Weekly Quiz:</strong> ' + wQuiz.score + '/' + wQuiz.maxScore + ' (' + wQuiz.points + ' pts)</span>';
                html += '<span class="badge badge-success">✓ Done</span></div>';
            } else if (allDailyDone) {
                html += '<div class="flex items-center justify-between p-2" style="background:rgba(26,95,122,0.1);border-radius:var(--radius)">';
                html += '<span><strong>Weekly Quiz:</strong> 15 questions • 2x points</span>';
                html += '<a href="#/quiz/' + weeklyId + '" class="btn btn-primary btn-sm">Take Quiz</a></div>';
            } else {
                html += '<div class="flex items-center justify-between p-2" style="background:var(--bg-dark);border-radius:var(--radius)">';
                html += '<span class="text-muted"><strong>Weekly Quiz:</strong> Complete all daily quizzes first</span>';
                html += '<span class="badge">🔒</span></div>';
            }

            html += '</div></div>';
        });

        container.innerHTML = html;
    }

    function renderQuiz(container, params) {
        var quizId = params.quizId; // e.g. "W1D3" or "W1"
        var isWeekly = quizId.length === 2; // "W1" vs "W1D3"

        var progress = window.ChemBuddy.progress || {};
        var studied = progress.studied || {};
        var dailyQuizzes = progress.dailyQuizzes || {};
        var weeklyQuizzes = progress.weeklyQuizzes || {};

        // Check if already attempted
        var existing = isWeekly ? weeklyQuizzes[quizId] : dailyQuizzes[quizId];
        if (existing) {
            showPreviousResults(container, quizId, existing, isWeekly);
            return;
        }

        // Get questions
        var questions = getQuestionsForQuiz(quizId, isWeekly);
        if (!questions || questions.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">❓</div><h3>No Questions Available</h3><p>Questions for this quiz haven\'t been loaded yet.</p><a href="#/learn" class="btn btn-primary mt-2">Back to Learning</a></div>';
            return;
        }

        // Check prerequisites
        if (!isWeekly) {
            var match = quizId.match(/W(\d+)D(\d+)/);
            if (match) {
                var weekNum = parseInt(match[1]);
                var dayNum = parseInt(match[2]);
                var week = learningPath.weeks.find(function (w) { return w.id === weekNum; });
                var day = week ? week.days.find(function (d) { return d.day === dayNum; }) : null;
                if (day) {
                    var allStudied = day.equipmentIds.every(function (id) { return studied[id]; });
                    if (!allStudied) {
                        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📖</div><h3>Study First</h3><p>You need to study all equipment for this day before taking the quiz.</p><a href="#/learn/' + quizId + '" class="btn btn-primary mt-2">Go to Day</a></div>';
                        return;
                    }
                }
            }
        } else {
            // Weekly: check all daily quizzes done
            var weekNum = parseInt(quizId.slice(1));
            var week = learningPath.weeks.find(function (w) { return w.id === weekNum; });
            if (week) {
                var allDailyDone = week.days.every(function (d) { return dailyQuizzes['W' + weekNum + 'D' + d.day]; });
                if (!allDailyDone) {
                    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><h3>Complete Daily Quizzes First</h3><p>Finish all 5 daily quizzes for Week ' + weekNum + ' to unlock the weekly quiz.</p><a href="#/learn" class="btn btn-primary mt-2">Back to Learning</a></div>';
                    return;
                }
            }
        }

        // Show pre-quiz screen
        showPreQuiz(container, quizId, questions, isWeekly);
    }

    function getQuestionsForQuiz(quizId, isWeekly) {
        if (typeof questionBank === 'undefined') return [];

        if (isWeekly) {
            // Weekly: get all questions for this week with day === null
            var weekNum = parseInt(quizId.slice(1));
            var weeklyQs = questionBank.filter(function (q) { return q.week === weekNum && q.day === null; });
            return Utils.shuffle(weeklyQs).slice(0, 15);
        } else {
            // Daily: get questions for specific day
            var match = quizId.match(/W(\d+)D(\d+)/);
            if (!match) return [];
            var weekNum = parseInt(match[1]);
            var dayNum = parseInt(match[2]);
            return questionBank.filter(function (q) { return q.week === weekNum && q.day === dayNum; });
        }
    }

    function showPreQuiz(container, quizId, questions, isWeekly) {
        var pointsPerQ = isWeekly ? 20 : 10;
        var html = '<div class="quiz-body" style="min-height:calc(100vh - 120px)">';
        html += '<div class="quiz-pre">';
        html += '<div class="quiz-pre-icon">' + (isWeekly ? '🏆' : '📝') + '</div>';
        html += '<h2>' + (isWeekly ? 'Weekly Quiz' : 'Daily Quiz') + ': ' + quizId + '</h2>';
        html += '<p>' + (isWeekly ? 'Test your knowledge across the entire week' : 'Test what you learned today') + '</p>';

        html += '<div class="quiz-meta">';
        html += '<div class="quiz-meta-item"><div class="quiz-meta-value">' + questions.length + '</div><div class="quiz-meta-label">Questions</div></div>';
        html += '<div class="quiz-meta-item"><div class="quiz-meta-value">30s</div><div class="quiz-meta-label">Per Question</div></div>';
        html += '<div class="quiz-meta-item"><div class="quiz-meta-value">' + pointsPerQ + '</div><div class="quiz-meta-label">Pts Each</div></div>';
        html += '</div>';

        html += '<p style="font-size:0.85rem;color:var(--text-light);margin-bottom:1.5rem">⚠️ Single attempt only — no retakes!</p>';
        html += '<button class="btn btn-primary btn-lg" id="start-quiz-btn">Start Quiz →</button>';
        html += '<br><a href="#/learn" class="btn btn-outline mt-2">Cancel</a>';
        html += '</div></div>';

        container.innerHTML = html;

        document.getElementById('start-quiz-btn').addEventListener('click', function () {
            startQuiz(container, quizId, questions, isWeekly);
        });
    }

    function startQuiz(container, quizId, questions, isWeekly) {
        var state = {
            quizId: quizId,
            questions: questions,
            isWeekly: isWeekly,
            currentIndex: 0,
            answers: [],
            score: 0,
            pointsPerCorrect: isWeekly ? 20 : 10,
            timePerQuestion: 30,
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
        html += '<span class="quiz-title">' + state.quizId + '</span>';
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

        // Timer
        html += '<div class="quiz-timer">';
        html += '<div class="timer-ring">';
        html += '<svg viewBox="0 0 64 64"><circle class="timer-ring-bg" cx="32" cy="32" r="30"/>';
        html += '<circle class="timer-ring-fill" id="timer-fill" cx="32" cy="32" r="30"/></svg>';
        html += '<div class="timer-number" id="timer-number">' + state.timePerQuestion + '</div>';
        html += '</div></div>';

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

        // Start timer
        startQuestionTimer(state);

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
            remaining--;
            var fill = document.getElementById('timer-fill');
            var num = document.getElementById('timer-number');

            if (num) {
                num.textContent = remaining;
                num.className = 'timer-number';
                if (remaining <= 5) num.className += ' danger';
                else if (remaining <= 10) num.className += ' warning';
            }

            if (fill) {
                var offset = circumference * (1 - remaining / total);
                fill.style.strokeDashoffset = offset;
                fill.className = 'timer-ring-fill';
                if (remaining <= 5) fill.className += ' danger';
                else if (remaining <= 10) fill.className += ' warning';
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
        if (timerInterval) clearInterval(timerInterval);

        var q = state.questions[state.currentIndex];
        var isCorrect = selectedIdx === q.correct;
        var timeUsed = state.timePerQuestion - parseInt(document.getElementById('timer-number').textContent || '0');

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

        // Save to Firebase
        var uid = window.ChemBuddy.user.uid;
        var path = state.isWeekly
            ? 'progress/' + uid + '/weeklyQuizzes/' + state.quizId
            : 'progress/' + uid + '/dailyQuizzes/' + state.quizId;

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
        var message = pct >= 80 ? 'Excellent!' : (pct >= 60 ? 'Good job!' : (pct >= 40 ? 'Keep practicing!' : 'Review the material'));

        var html = '<div class="quiz-body" style="min-height:calc(100vh - 56px)">';
        html += '<div class="quiz-results">';

        // Score circle
        html += '<div class="results-score-circle ' + gradeClass + '">';
        html += '<div class="results-score-num">' + state.score + '/' + state.questions.length + '</div>';
        html += '<div class="results-score-label">' + pct + '%</div>';
        html += '</div>';

        html += '<div class="results-message">' + message + '</div>';
        html += '<div class="results-points">+' + points + ' points earned</div>';

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

        // Actions
        html += '<div class="results-actions">';
        html += '<a href="#/learn" class="btn btn-primary">Back to Learning</a>';
        html += '<a href="#/leaderboard" class="btn btn-outline">Leaderboard</a>';
        html += '</div>';

        html += '</div></div>';
        container.innerHTML = html;
        currentQuiz = null;
    }

    function showPreviousResults(container, quizId, data, isWeekly) {
        var pct = data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0;
        var gradeClass = pct >= 80 ? 'great' : (pct >= 60 ? 'good' : (pct >= 40 ? 'needs-work' : 'poor'));

        var html = '<div class="quiz-body" style="min-height:calc(100vh - 120px)">';
        html += '<div class="quiz-results">';

        html += '<div class="results-score-circle ' + gradeClass + '">';
        html += '<div class="results-score-num">' + data.score + '/' + data.maxScore + '</div>';
        html += '<div class="results-score-label">' + pct + '%</div>';
        html += '</div>';

        html += '<h2>Quiz Already Completed</h2>';
        html += '<p class="text-muted mb-2">' + (isWeekly ? 'Weekly' : 'Daily') + ' Quiz ' + quizId + '</p>';
        html += '<div class="results-points">' + data.points + ' points earned • ' + Utils.formatDateTime(data.completedAt) + '</div>';

        html += '<div class="results-actions mt-3">';
        html += '<a href="#/learn" class="btn btn-primary">Back to Learning</a>';
        html += '<a href="#/quizzes" class="btn btn-outline">All Quizzes</a>';
        html += '</div>';

        html += '</div></div>';
        container.innerHTML = html;
    }

    return {
        renderQuizList: renderQuizList,
        renderQuiz: renderQuiz
    };
})();
