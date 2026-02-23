// ChemBuddy - Voice-Over Module (Web Speech API)

var Voice = (function () {
    'use strict';

    var synth = window.speechSynthesis;
    var currentUtterance = null;
    var segments = [];
    var currentSegment = 0;
    var isPlaying = false;
    var isPaused = false;
    var activeEquipId = null;
    var onSegmentChange = null;

    // Build speech segments from equipment data
    function buildSegments(equipId) {
        var equip = equipmentDB[equipId];
        if (!equip) return [];

        var segs = [];

        segs.push({ label: 'Name', text: equip.name + '.' });
        segs.push({ label: 'Description', text: equip.description });

        if (equip.principles) {
            segs.push({ label: 'Operating Principles', text: equip.principles });
        }

        if (equip.parts) {
            segs.push({ label: 'Parts of the Equipment', text: equip.parts });
        }

        if (equip.specs && equip.specs.length) {
            var specText = equip.specs.map(function (s) {
                return s.t + ': ' + s.v;
            }).join('. ');
            segs.push({ label: 'Key Specifications', text: specText + '.' });
        }

        if (equip.components && equip.components.length) {
            var compText = 'The major components are: ' + equip.components.join(', ') + '.';
            segs.push({ label: 'Major Components', text: compText });
        }

        if (equip.troubles && equip.troubles.length) {
            var troubleText = equip.troubles.map(function (t) {
                return 'Problem: ' + t.p + '. Cause: ' + t.c + '. Action: ' + t.a;
            }).join('. ');
            segs.push({ label: 'Troubleshooting', text: troubleText + '.' });
        }

        if (equip.safety && equip.safety.length) {
            var safetyText = 'Safety considerations: ' + equip.safety.join('. ') + '.';
            segs.push({ label: 'Safety', text: safetyText });
        }

        return segs;
    }

    function play(equipId, segCallback) {
        // If resuming same equipment from pause
        if (isPaused && activeEquipId === equipId) {
            synth.resume();
            isPaused = false;
            isPlaying = true;
            updateUI(equipId);
            return;
        }

        // Stop any current playback
        stop();

        activeEquipId = equipId;
        onSegmentChange = segCallback || null;
        segments = buildSegments(equipId);
        currentSegment = 0;
        isPlaying = true;
        isPaused = false;

        speakNext();
    }

    function speakNext() {
        if (currentSegment >= segments.length) {
            // Done
            isPlaying = false;
            isPaused = false;
            currentSegment = 0;
            updateUI(activeEquipId);
            if (onSegmentChange) onSegmentChange(-1, null);
            return;
        }

        var seg = segments[currentSegment];
        if (onSegmentChange) onSegmentChange(currentSegment, seg.label);

        currentUtterance = new SpeechSynthesisUtterance(seg.text);
        currentUtterance.rate = 0.95;
        currentUtterance.pitch = 1.0;

        // Try to pick a good English voice
        var voices = synth.getVoices();
        var preferred = voices.find(function (v) {
            return v.lang.startsWith('en') && v.name.toLowerCase().includes('google');
        }) || voices.find(function (v) {
            return v.lang.startsWith('en-') && !v.localService;
        }) || voices.find(function (v) {
            return v.lang.startsWith('en');
        });
        if (preferred) currentUtterance.voice = preferred;

        currentUtterance.onend = function () {
            currentSegment++;
            if (isPlaying && !isPaused) {
                speakNext();
            }
        };

        currentUtterance.onerror = function (e) {
            if (e.error !== 'canceled' && e.error !== 'interrupted') {
                console.warn('Voice error:', e.error);
            }
            // Try next segment on error
            if (isPlaying && !isPaused) {
                currentSegment++;
                speakNext();
            }
        };

        synth.speak(currentUtterance);
        updateUI(activeEquipId);
    }

    function pause() {
        if (isPlaying && !isPaused) {
            synth.pause();
            isPaused = true;
            isPlaying = true;
            updateUI(activeEquipId);
        }
    }

    function stop() {
        synth.cancel();
        isPlaying = false;
        isPaused = false;
        currentSegment = 0;
        segments = [];
        if (activeEquipId) updateUI(activeEquipId);
        if (onSegmentChange) onSegmentChange(-1, null);
        activeEquipId = null;
        currentUtterance = null;
        onSegmentChange = null;
    }

    function skipNext() {
        if (!isPlaying) return;
        synth.cancel();
        currentSegment++;
        speakNext();
    }

    function skipPrev() {
        if (!isPlaying) return;
        synth.cancel();
        currentSegment = Math.max(0, currentSegment - 1);
        speakNext();
    }

    function updateUI(equipId) {
        var bar = document.getElementById('voice-bar-' + equipId);
        if (!bar) return;

        var playBtn = bar.querySelector('.voice-play');
        var pauseBtn = bar.querySelector('.voice-pause');
        var stopBtn = bar.querySelector('.voice-stop');
        var statusEl = bar.querySelector('.voice-status');

        if (activeEquipId !== equipId) {
            // Not active — show play button
            if (playBtn) playBtn.style.display = '';
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (stopBtn) stopBtn.disabled = true;
            if (statusEl) statusEl.textContent = 'Click play to listen';
            return;
        }

        if (isPlaying && !isPaused) {
            if (playBtn) playBtn.style.display = 'none';
            if (pauseBtn) pauseBtn.style.display = '';
            if (stopBtn) stopBtn.disabled = false;
            if (statusEl && segments[currentSegment]) {
                statusEl.textContent = 'Playing: ' + segments[currentSegment].label +
                    ' (' + (currentSegment + 1) + '/' + segments.length + ')';
            }
        } else if (isPaused) {
            if (playBtn) playBtn.style.display = '';
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (stopBtn) stopBtn.disabled = false;
            if (statusEl) statusEl.textContent = 'Paused';
        } else {
            if (playBtn) playBtn.style.display = '';
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (stopBtn) stopBtn.disabled = true;
            if (statusEl) statusEl.textContent = 'Click play to listen';
        }
    }

    // Render voice control bar HTML for an equipment card
    function renderBar(equipId) {
        return '<div class="voice-bar" id="voice-bar-' + equipId + '">' +
            '<button class="voice-btn voice-prev" title="Previous section">⏮</button>' +
            '<button class="voice-btn voice-play" title="Play">▶</button>' +
            '<button class="voice-btn voice-pause" title="Pause" style="display:none">⏸</button>' +
            '<button class="voice-btn voice-stop" title="Stop" disabled>⏹</button>' +
            '<button class="voice-btn voice-next" title="Next section">⏭</button>' +
            '<span class="voice-status">Click play to listen</span>' +
            '</div>';
    }

    // Attach event listeners to a voice bar
    function attachListeners(equipId) {
        var bar = document.getElementById('voice-bar-' + equipId);
        if (!bar) return;

        bar.querySelector('.voice-play').addEventListener('click', function (e) {
            e.stopPropagation();
            play(equipId, function (idx, label) {
                updateUI(equipId);
            });
        });
        bar.querySelector('.voice-pause').addEventListener('click', function (e) {
            e.stopPropagation();
            pause();
        });
        bar.querySelector('.voice-stop').addEventListener('click', function (e) {
            e.stopPropagation();
            stop();
        });
        bar.querySelector('.voice-prev').addEventListener('click', function (e) {
            e.stopPropagation();
            if (activeEquipId === equipId && isPlaying) skipPrev();
        });
        bar.querySelector('.voice-next').addEventListener('click', function (e) {
            e.stopPropagation();
            if (activeEquipId === equipId && isPlaying) skipNext();
        });
    }

    return {
        play: play,
        pause: pause,
        stop: stop,
        renderBar: renderBar,
        attachListeners: attachListeners
    };
})();
