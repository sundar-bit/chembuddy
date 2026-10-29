// ChemBuddy - Lesson Narration (Web Speech API)
//
// Narration is per section and per item, never one long stream. A section's
// 🔊 Listen button reads every [data-say] piece inside that section, in order;
// a small 🔊 on a list item reads just that item. The piece being read is
// highlighted and kept in view, so the student always knows where the voice
// is. Pressing the playing button again stops it; pressing another starts
// that one instead. Buttons can be replayed any number of times.

var Voice = (function () {
    'use strict';

    var synth = window.speechSynthesis;
    var queue = [];
    var index = 0;
    var activeBtn = null;
    var activeSection = null;
    var run = 0; // bumped on every stop, so callbacks from a cancelled run are ignored

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
        return el.getAttribute('data-say-text') || el.textContent.replace(/🔊|⏹/g, '').trim();
    }

    function setButton(btn, playing) {
        if (!btn) return;
        btn.classList.toggle('playing', playing);
        if (btn.hasAttribute('data-say-section')) {
            btn.textContent = playing ? '⏹ Stop' : '🔊 Listen';
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
        queue = [];
        index = 0;
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
        u.rate = 0.95;
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
            var btn = e.target.closest('[data-say-section], [data-say-item]');
            if (!btn || !container.contains(btn)) return;
            e.preventDefault();
            e.stopPropagation();
            if (btn === activeBtn) {
                stop();
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
        stop: stop
    };
})();
