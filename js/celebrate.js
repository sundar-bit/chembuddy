// ChemBuddy - Quiz result cheer: a personal message by score, plus a short
// fireworks (perfect score) or confetti (great score) burst on a canvas.
// No library. Skipped when the device asks for reduced motion.

var Celebrate = (function () {
    'use strict';

    var COLOURS = ['#f94144', '#f3722c', '#f9c74f', '#90be6d', '#43aa8b', '#4d96ff', '#9b5de5', '#ff6fb5'];

    function firstName() {
        var name = ((window.ChemBuddy && window.ChemBuddy.profile && window.ChemBuddy.profile.name) || '').trim();
        return name ? name.split(/\s+/)[0] : '';
    }

    // Message for a score. Bands follow a 10-question quiz:
    // 10 = perfect, 7-9 = great, 6 = good, 5 and below = stay focused.
    function message(score, total, practice) {
        var name = Utils.sanitize(firstName());
        var hi = name ? 'Hi ' + name + ', ' : '';
        var pct = total > 0 ? score / total : 0;
        if (pct >= 1) return {
            band: 'perfect', burst: practice ? null : 'fireworks',
            title: '🏆 ' + score + ' out of ' + total + '!',
            text: hi + 'you did a fabulous job! Hearty congratulations! 🎉'
        };
        if (pct >= 0.7) return {
            band: 'great', burst: practice ? null : 'confetti',
            title: '🌟 Well done' + (name ? ', ' + name : '') + '!',
            text: 'A great score. Just a little more for a perfect ' + total + '!'
        };
        if (pct >= 0.6) return {
            band: 'good', burst: null,
            title: '👍 Good effort' + (name ? ', ' + name : '') + '!',
            text: 'Re-read the lesson, and aim higher in the next one.'
        };
        return {
            band: 'focus', burst: null,
            title: '💪 Stay focused' + (name ? ', ' + name : '') + '!',
            text: 'Read the lesson again. Go into the next one with full attention, and aim for the full score.'
        };
    }

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function run(kind) {
        if (!kind || reducedMotion()) return;
        var canvas = document.createElement('canvas');
        canvas.className = 'celebrate-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        var dpr = window.devicePixelRatio || 1;
        var W = window.innerWidth, H = window.innerHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        var parts = [];
        var rnd = function (a, b) { return a + Math.random() * (b - a); };
        var colour = function () { return COLOURS[Math.floor(Math.random() * COLOURS.length)]; };

        function burstAt(x, y, n) {
            var c = colour();
            for (var i = 0; i < n; i++) {
                var a = (Math.PI * 2 * i) / n, s = rnd(2, 6);
                parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(50, 80), age: 0,
                             c: Math.random() < 0.3 ? colour() : c, r: rnd(1.6, 3), kind: 'spark' });
            }
        }

        function confettiFall(n) {
            for (var i = 0; i < n; i++) {
                parts.push({ x: rnd(0, W), y: rnd(-H * 0.3, -10), vx: rnd(-1.5, 1.5), vy: rnd(2, 4.5), life: 220, age: 0,
                             c: colour(), w: rnd(6, 10), h: rnd(3, 6), rot: rnd(0, 6.28), vr: rnd(-0.2, 0.2), kind: 'paper' });
            }
        }

        var timers = [];
        if (kind === 'fireworks') {
            for (var k = 0; k < 7; k++) {
                timers.push(setTimeout(function () {
                    burstAt(rnd(W * 0.15, W * 0.85), rnd(H * 0.12, H * 0.45), 46);
                }, k * 380));
            }
            confettiFall(70);
        } else {
            confettiFall(90);
        }

        var start = performance.now();
        function frame(now) {
            ctx.clearRect(0, 0, W, H);
            parts = parts.filter(function (p) { return p.age < p.life && p.y < H + 20; });
            parts.forEach(function (p) {
                p.age++;
                var fade = 1 - p.age / p.life;
                ctx.globalAlpha = Math.max(0, Math.min(1, fade * 1.4));
                ctx.fillStyle = p.c;
                if (p.kind === 'spark') {
                    p.vx *= 0.97; p.vy = p.vy * 0.97 + 0.06;
                    p.x += p.vx; p.y += p.vy;
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
                } else {
                    p.x += p.vx + Math.sin(p.age / 12); p.y += p.vy; p.rot += p.vr;
                    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
                }
            });
            if (now - start < 5000 && (parts.length || now - start < 2800)) {
                requestAnimationFrame(frame);
            } else {
                timers.forEach(clearTimeout);
                canvas.remove();
            }
        }
        requestAnimationFrame(frame);
    }

    return { message: message, run: run };
})();
