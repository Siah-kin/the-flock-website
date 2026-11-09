/* Flock sound: a tiny WebAudio synth, no audio files. Off until the visitor turns it on (browsers block sound before a tap).
   FlockSound.play('quack'|'whoosh'|'bonk'|'pffft'): does nothing unless sound is on, the tab is visible and motion is not reduced.
   Ducks quack when tapped; the minigame calls whoosh (a throw), bonk and quack (a hit). Call it as `window.FlockSound && FlockSound.play('pop')`. The control itself is built in js/flock-motion.js. */
(function () {
    'use strict';
    var KEY = 'flock-sound', ctx, M, buf, act = false, S = window.FlockSound = { on: false };
    function noop() {}
    try { S.on = localStorage.getItem(KEY) === 'on'; } catch (e) {}
    function allowed() { return S.on && !document.hidden && !(window.Flock && Flock.reduced); }
    // every sound goes through one master gain, so stop() can cut what is still sounding
    function out() { if (!M) { M = ctx.createGain(); M.connect(ctx.destination); } return M; }
    function stop() {
        if (M) { try { M.disconnect(); } catch (e) {} M = null; }
        if (ctx && ctx.state === 'running') ctx.suspend().catch(noop);
    }
    // only called inside a visitor gesture: make or resume the context
    function wake() {
        if (!act || !allowed()) return null;
        if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (C) try { ctx = new C(); } catch (e) {} }
        if (ctx && ctx.state !== 'running') ctx.resume().catch(noop);
        return ctx;
    }
    // a real gesture unlocks sound for this page view; later gestures retry the resume (iPhone)
    function gesture(e) { if (e.isTrusted === false) return; act = true; if (S.on && !(ctx && ctx.state === 'running')) wake(); }
    ['pointerdown', 'keydown', 'touchend', 'click'].forEach(function (t) { addEventListener(t, gesture, { capture: true, passive: true }); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else wake(); });
    var mq = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)');
    if (mq && mq.addEventListener) mq.addEventListener('change', function (e) { if (e.matches) stop(); else wake(); });
    // a tone sweeping f0 to f1 over d seconds, starting w seconds from now, peak gain g (never above .08)
    function tone(type, f0, f1, d, g, w) {
        var t = ctx.currentTime + (w || 0), o = ctx.createOscillator(), v = ctx.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
        v.gain.setValueAtTime(0.0001, t); v.gain.linearRampToValueAtTime(Math.min(g, 0.08), t + 0.008);
        v.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(v); v.connect(out()); o.start(t); o.stop(t + d + 0.02);
    }
    function noise(d, g) {
        if (!buf) { buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); for (var i = 0, a = buf.getChannelData(0); i < a.length; i++) a[i] = Math.random() * 2 - 1; }
        var t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), v = ctx.createGain();
        s.buffer = buf; f.type = 'bandpass'; f.Q.value = 1.2;
        f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(2200, t + d);
        v.gain.setValueAtTime(0.0001, t); v.gain.linearRampToValueAtTime(g, t + d * 0.4); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
        s.connect(f); f.connect(v); v.connect(out()); s.start(t); s.stop(t + d + 0.02);
    }
    // a short, soft, low breath of noise: lowpassed, falling in pitch, peak gain .05, 0.3 s
    function puff() {
        if (!buf) { buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); for (var i = 0, a = buf.getChannelData(0); i < a.length; i++) a[i] = Math.random() * 2 - 1; }
        var d = 0.3, t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), v = ctx.createGain();
        s.buffer = buf; f.type = 'lowpass'; f.Q.value = 0.7;
        f.frequency.setValueAtTime(520, t); f.frequency.exponentialRampToValueAtTime(140, t + d);
        v.gain.setValueAtTime(0.0001, t); v.gain.linearRampToValueAtTime(0.05, t + 0.03); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
        s.connect(f); f.connect(v); v.connect(out()); s.start(t); s.stop(t + d + 0.02);
    }
    var voices = {
        quack: function () { tone('triangle', 620, 900, 0.07, 0.07); tone('triangle', 900, 480, 0.12, 0.06, 0.07); },
        whoosh: function () { noise(0.3, 0.06); },
        bonk: function () { tone('sine', 190, 55, 0.16, 0.08); },
        pffft: puff
    };
    // sounds are dropped, never queued, unless the visitor has acted and the context is running
    S.play = function (name) {
        if (!allowed() || !act || !ctx || ctx.state !== 'running' || !voices[name]) return;
        try { voices[name](); } catch (e) {}
    };
    // the visitor's choice (called from the button's tap)
    S.set = function (on) {
        S.on = !!on; act = true;
        try { localStorage.setItem(KEY, S.on ? 'on' : 'off'); } catch (e) {}
        if (!S.on) stop();
        else { var c = wake(); if (c) c.resume().then(function () { S.play('quack'); }, noop); }
        document.dispatchEvent(new CustomEvent('flock:sound'));
    };
})();
