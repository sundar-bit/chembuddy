// ChemBuddy - Lesson Narration (Web Speech API)
//
// Narration is per section and per item, never one long stream. A section's
// Play button reads every [data-say] piece inside that section, in order;
// a small 🔊 on a list item reads just that item. The piece being read is
// highlighted and kept in view, so the student always knows where the voice
// is. Pressing another button starts that one instead.
//
// Pause cancels the speech and keeps the place: Play restarts the highlighted
// piece. The browser's own pause() is unreliable on phones, so it is not used.
// A speed button takes effect at once by restarting the current piece. The
// chosen speed applies to all narration and is remembered on this device.

var Voice = (function () {
    'use strict';

    var SPEED_KEY = 'chembuddy.voiceSpeed';
    // 1x stays at the rate the narration has always used.
    var RATES = { '0.5': 0.5, '1': 0.95, '1.5': 1.5 };

    var synth = window.speechSynthesis;
    var queue = [];
    var index = 0;
    var activeBtn = null;
    var activeSection = null;
    var paused = false;
    var speed = loadSpeed();
    var run = 0; // bumped on every stop or pause, so callbacks from a cancelled run are ignored

    function loadSpeed() {
        try {
            var saved = localStorage.getItem(SPEED_KEY);
            return RATES[saved] ? saved : '1';
        } catch (e) {
            return '1';
        }
    }

    function saveSpeed() {
        try { localStorage.setItem(SPEED_KEY, speed); } catch (e) { /* speed still applies for this visit */ }
    }

    // A section's Play/Pause button and speed buttons.
    function controlsHTML() {
        var html = '<div class="say-controls">';
        html += '<button class="say-btn" data-say-section>▶ Play</button>';
        html += '<div class="say-speeds" role="group" aria-label="Reading speed">';
        Object.keys(RATES).sort(function (a, b) { return a - b; }).forEach(function (s) {
            var on = s === speed;
            html += '<button class="say-speed' + (on ? ' active' : '') + '" data-say-speed="' + s + '" aria-pressed="' + on + '">' + s + 'x</button>';
        });
        return html + '</div></div>';
    }

    function pickVoice() {
        var voices = synth.getVoices();
        return voices.find(function (v) {
            return v.lang.startsWith('en') && v.name.toLowerCase().includes('google');
        }) || voices.find(function (v) {
            return v.lang.startsWith('en-') && !v.localService;
        }) || voices.find(function (v) {
            return v.lang.startsWith('en');
        });
    }

    function textOf(el) {
        var text = el.getAttribute('data-say-text') || el.textContent.replace(/🔊|⏹/g, '').trim();
        return SpeechText.speechText(text);
    }

    function setButton(btn, playing) {
        if (!btn) return;
        btn.classList.toggle('playing', playing);
        if (btn.hasAttribute('data-say-section')) {
            btn.textContent = playing ? '⏸ Pause' : '▶ Play';
        } else {
            btn.textContent = playing ? '⏹' : '🔊';
        }
    }

    function clearHighlight() {
        document.querySelectorAll('.speaking').forEach(function (el) { el.classList.remove('speaking'); });
    }

    function keepInView(el) {
        var r = el.getBoundingClientRect();
        if (r.top < 70 || r.bottom > window.innerHeight - 20) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function stop() {
        run++;
        if (synth) synth.cancel();
        clearHighlight();
        setButton(activeBtn, false);
        if (activeSection) activeSection.classList.remove('lesson-section-active');
        activeBtn = null;
        activeSection = null;
        paused = false;
        queue = [];
        index = 0;
    }

    function pause() {
        run++;
        synth.cancel();
        paused = true;
        setButton(activeBtn, false);
    }

    // Starts the current piece again, after a pause or at a new speed.
    function restartCurrent() {
        run++;
        synth.cancel();
        paused = false;
        setButton(activeBtn, true);
        var myRun = run;
        // A short pause after cancel() — some browsers drop speech queued immediately after it
        setTimeout(function () { next(myRun); }, 60);
    }

    function setSpeed(value) {
        speed = value;
        saveSpeed();
        document.querySelectorAll('[data-say-speed]').forEach(function (b) {
            var on = b.getAttribute('data-say-speed') === speed;
            b.classList.toggle('active', on);
            b.setAttribute('aria-pressed', on);
        });
        if (activeBtn && !paused) restartCurrent();
    }

    function speak(elements, btn) {
        stop();
        if (!synth) {
            Utils.toast('Audio is not supported in this browser', 'warning');
            return;
        }
        if (!elements.length) return;
        queue = elements;
        index = 0;
        activeBtn = btn;
        activeSection = btn.closest('.lesson-section');
        setButton(btn, true);
        if (activeSection) activeSection.classList.add('lesson-section-active');
        var myRun = run;
        // A short pause after cancel() — some browsers drop speech queued immediately after it
        setTimeout(function () { next(myRun); }, 60);
    }

    function next(myRun) {
        if (myRun !== run) return;
        clearHighlight();
        if (index >= queue.length) {
            stop();
            return;
        }
        var el = queue[index];
        el.classList.add('speaking');
        keepInView(el);

        var u = new SpeechSynthesisUtterance(textOf(el));
        u.rate = RATES[speed];
        u.pitch = 1.0;
        var voice = pickVoice();
        if (voice) u.voice = voice;
        u.onend = function () {
            if (myRun !== run) return;
            index++;
            next(myRun);
        };
        u.onerror = function (e) {
            if (myRun !== run) return;
            if (e.error !== 'canceled' && e.error !== 'interrupted') console.warn('Voice error:', e.error);
            index++;
            next(myRun);
        };
        synth.speak(u);
    }

    // One delegated listener per lesson container.
    function attach(container) {
        container.addEventListener('click', function (e) {
            var speedBtn = e.target.closest('[data-say-speed]');
            if (speedBtn && container.contains(speedBtn)) {
                e.preventDefault();
                e.stopPropagation();
                setSpeed(speedBtn.getAttribute('data-say-speed'));
                return;
            }
            var btn = e.target.closest('[data-say-section], [data-say-item]');
            if (!btn || !container.contains(btn)) return;
            e.preventDefault();
            e.stopPropagation();
            if (btn === activeBtn) {
                if (!btn.hasAttribute('data-say-section')) stop();
                else if (paused) restartCurrent();
                else pause();
                return;
            }
            if (btn.hasAttribute('data-say-section')) {
                speak(Array.prototype.slice.call(btn.closest('.lesson-section').querySelectorAll('[data-say]')), btn);
            } else {
                speak([btn.closest('[data-say]')], btn);
            }
        });
    }

    // Leaving the page must not leave the voice talking.
    window.addEventListener('hashchange', stop);

    return {
        attach: attach,
        controlsHTML: controlsHTML,
        stop: stop
    };
})();
