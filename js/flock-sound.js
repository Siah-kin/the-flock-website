/* Flock sound: a tiny WebAudio synth, no audio files. Off until the visitor turns it on (browsers block sound before a tap).
   FlockSound.play('quack'|'pop'|'clink'|'whoosh'|'bonk'|'tap'): does nothing unless sound is on, the tab is visible and motion is not reduced.
   Scenes call it as `window.FlockSound && FlockSound.play('pop')`. The control itself is built in js/flock-motion.js. */
(function () {
    'use strict';
    var KEY = 'flock-sound', ctx, buf, S = window.FlockSound = { on: false };
    try { S.on = localStorage.getItem(KEY) === 'on'; } catch (e) {}
    function ac() {
        if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (C) try { ctx = new C(); } catch (e) {} }
        if (ctx && ctx.state === 'suspended') ctx.resume().catch(function () {});
        return ctx;
    }
    // a tone sweeping f0 to f1 over d seconds, starting w seconds from now, peak gain g (never above .08)
    function tone(type, f0, f1, d, g, w) {
        var t = ctx.currentTime + (w || 0), o = ctx.createOscillator(), v = ctx.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
        v.gain.setValueAtTime(0.0001, t); v.gain.linearRampToValueAtTime(Math.min(g, 0.08), t + 0.008);
        v.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(v); v.connect(ctx.destination); o.start(t); o.stop(t + d + 0.02);
    }
    function noise(d, g) {
        if (!buf) { buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); for (var i = 0, a = buf.getChannelData(0); i < a.length; i++) a[i] = Math.random() * 2 - 1; }
        var t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), v = ctx.createGain();
        s.buffer = buf; f.type = 'bandpass'; f.Q.value = 1.2;
        f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(2200, t + d);
        v.gain.setValueAtTime(0.0001, t); v.gain.linearRampToValueAtTime(g, t + d * 0.4); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
        s.connect(f); f.connect(v); v.connect(ctx.destination); s.start(t); s.stop(t + d + 0.02);
    }
    var voices = {
        quack: function () { tone('triangle', 620, 900, 0.07, 0.07); tone('triangle', 900, 480, 0.12, 0.06, 0.07); },
        pop: function () { tone('sine', 280, 760, 0.09, 0.07); },
        clink: function () { tone('sine', 1760, 1700, 0.18, 0.05); tone('sine', 2637, 2600, 0.14, 0.04, 0.03); },
        whoosh: function () { noise(0.3, 0.06); },
        bonk: function () { tone('sine', 190, 55, 0.16, 0.08); },
        tap: function () { tone('sine', 900, 600, 0.05, 0.05); }
    };
    S.play = function (name) {
        if (!S.on || document.hidden || (window.Flock && Flock.reduced) || !voices[name]) return;
        if (ac()) try { voices[name](); } catch (e) {}
    };
    // the visitor's choice; turning it on inside a tap lets the browser start audio
    S.set = function (on) {
        S.on = !!on;
        try { localStorage.setItem(KEY, S.on ? 'on' : 'off'); } catch (e) {}
        if (S.on && ac()) { try { voices.tap(); } catch (e) {} }
        document.dispatchEvent(new CustomEvent('flock:sound'));
    };
    // a saved "on" needs one tap on the page before the browser lets audio start
    if (S.on) addEventListener('pointerdown', function () { if (S.on) ac(); }, { once: true, passive: true });
})();
