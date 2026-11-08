/* Flock motion runtime: ambient loops, one-shot scenes, a global pause, reduced motion.
   Exposes window.Flock. Classic script (defer), no dependencies. See docs/motion/README.md. */
(function () {
    'use strict';
    var doc = document, root = doc.documentElement, KEY = 'flock-motion';
    var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var F = window.Flock = { reduced: mq.matches, paused: false, scenes: [] };
    var amb = [], running = [], raf = 0, ios = {}, cbs = new Map();

    root.classList.add('js');
    try { F.paused = localStorage.getItem(KEY) === 'paused'; } catch (e) {}
    if (F.paused) root.dataset.motion = 'paused';

    function arr(x) { return Array.prototype.slice.call(x); }
    function shown(el) { return getComputedStyle(el).display !== 'none'; }

    // One IntersectionObserver per threshold; without support everything counts as in view
    function watch(el, th, cb) {
        if (!('IntersectionObserver' in window)) { cb(true); return; }
        var io = ios[th] || (ios[th] = new IntersectionObserver(function (list) {
            list.forEach(function (x) { var f = cbs.get(x.target); if (f) f(x.isIntersecting); });
        }, { threshold: th }));
        cbs.set(el, cb); io.observe(el);
    }
    function unwatch(el, th) { cbs.delete(el); if (ios[th]) ios[th].unobserve(el); }

    // Ambient: el gets .play while it is in view, the tab is visible and nothing is paused
    F.ambient = function (el, o) {
        var a = { seen: false };
        function sync() {
            var on = a.seen && !doc.hidden && !F.paused && !F.reduced;
            el.classList.toggle('play', on);
            if (o && o.onchange) o.onchange(on);
        }
        a.sync = sync; amb.push(a); sync();
        watch(el, 0.2, function (v) { a.seen = v; sync(); });
        return a;
    };

    // Scenes: beats on one shared clock
    function kick() { if (!raf && !F.paused && running.some(function (s) { return !s.held; })) raf = requestAnimationFrame(tick); }
    function tick(now) {
        raf = 0;
        running.slice().forEach(function (s) {
            if (!s.held) { s.pos += Math.min(Math.max(now - s.last, 0), 100); s.step(); }
            s.last = now;
        });
        kick();
    }

    F.scene = function (el, o) {
        o = o || {};
        var beats = (o.beats || []).slice().sort(function (a, b) { return a.at - b.at; });
        var len = o.duration || (beats.length ? beats[beats.length - 1].at + 800 : 0);
        var th = o.threshold === undefined ? 0.45 : o.threshold;
        var s = { pos: 0, i: 0, last: 0, st: 0, held: false, armed: false, seen: false, anims: [] }, h;

        function ctx() {
            var all = o.variants ? arr(el.querySelectorAll(o.variants)) : [el];
            return { el: el, scene: h, pos: s.pos, all: all, t: o.variants ? all.filter(shown) : all };
        }
        function svgs() { return arr(el.querySelectorAll('svg')).concat(el.pauseAnimations ? [el] : []); }
        function drop() { var k = running.indexOf(s); if (k > -1) running.splice(k, 1); }
        s.step = function () {
            while (s.i < beats.length && beats[s.i].at <= s.pos) beats[s.i++].run(ctx());
            if (s.i < beats.length) return;
            if (o.mode === 'loop') { if (s.pos >= len) { if (o.reset) o.reset(ctx()); s.pos = 0; s.i = 0; } }
            else { s.st = 2; drop(); }
        };
        function end() {
            s.st = 2; drop();
            if (o.end) o.end(ctx());
            if (F.reduced && o.onreduced) o.onreduced(ctx());
        }
        function play() {
            if (F.reduced) return end();
            drop(); s.armed = false;
            if (!F.paused) svgs().forEach(function (v) { if (v.unpauseAnimations) v.unpauseAnimations(); });
            if (o.reset) o.reset(ctx());
            s.pos = 0; s.i = 0; s.st = 1; s.held = F.paused; s.last = performance.now();
            if (o.onplay) o.onplay(ctx());
            running.push(s); s.step(); kick();
        }
        h = {
            el: el, beats: beats, play: play, replay: play, end: end,
            pause: function () {
                s.held = true;
                s.anims = el.getAnimations ? el.getAnimations({ subtree: true }).filter(function (a) { return a.playState === 'running'; }) : [];
                s.anims.forEach(function (a) { a.pause(); });
                svgs().forEach(function (v) { if (v.pauseAnimations) v.pauseAnimations(); });
            },
            resume: function () {
                s.held = false; s.last = performance.now();
                s.anims.forEach(function (a) { a.play(); }); s.anims = [];
                svgs().forEach(function (v) { if (v.unpauseAnimations) v.unpauseAnimations(); });
                if (s.armed && s.seen) play(); else kick();
            },
            // Put the scene at `ms`: reset, run every beat up to then, then hold CSS, WAAPI and SMIL there
            seek: function (ms) {
                drop(); s.armed = false;
                var v = svgs();
                v.forEach(function (x) { if (x.pauseAnimations) { x.pauseAnimations(); try { x.setCurrentTime(0); } catch (e) {} } });
                if (o.reset) o.reset(ctx());
                s.pos = ms; s.i = 0; s.st = 2; s.held = true;
                while (s.i < beats.length && beats[s.i].at <= ms) beats[s.i++].run(ctx());
                if (el.getAnimations) el.getAnimations({ subtree: true }).forEach(function (a) { a.pause(); a.currentTime = ms; });
                v.forEach(function (x) { if (x.setCurrentTime) { try { x.setCurrentTime(ms / 1000); } catch (e) {} } });
            }
        };
        F.scenes.push(h);

        // A variant (wide or tall) that appears after the scene has played goes straight to its last frame
        if (o.variants && window.ResizeObserver) {
            var prev = [];
            var ro = new ResizeObserver(function () {
                var c = ctx(), fresh = c.t.filter(function (x) { return prev.indexOf(x) < 0; });
                prev = c.t;
                if (fresh.length && s.st && o.end) { c.t = fresh; o.end(c); }
            });
            ctx().all.forEach(function (x) { ro.observe(x); });
        }

        if (F.reduced) end();
        else if (th !== null) {
            watch(el, th, function (v) {
                s.seen = v;
                if (o.mode === 'loop') { if (v && s.st !== 1) play(); else if (!v) { drop(); s.st = 0; } return; }
                if (!v || s.st) return;
                if (o.mode !== 'loop') unwatch(el, th);
                if (F.paused) s.armed = true; else play();
            });
        }
        return h;
    };

    F.pauseAll = function () {
        F.paused = true; root.dataset.motion = 'paused';
        amb.forEach(function (a) { a.sync(); });
        F.scenes.forEach(function (h) { h.pause(); });
    };
    F.resumeAll = function () {
        F.paused = false; delete root.dataset.motion;
        amb.forEach(function (a) { a.sync(); });
        F.scenes.forEach(function (h) { h.resume(); });
    };

    doc.addEventListener('visibilitychange', function () { amb.forEach(function (a) { a.sync(); }); kick(); });
    if (mq.addEventListener) mq.addEventListener('change', function (e) {
        F.reduced = e.matches;
        amb.forEach(function (a) { a.sync(); });
        if (F.reduced) F.scenes.forEach(function (h) { h.end(); });
    });

    // The pause toggle: one button in the nav, one in the mobile menu, or the footer links as a fallback
    function toggle() {
        var btns = [];
        function label() {
            btns.forEach(function (b) {
                b.textContent = F.paused ? 'Play animations' : 'Pause animations';
                b.setAttribute('aria-pressed', F.paused ? 'true' : 'false');
            });
        }
        function add(host, before) {
            if (!host || host.querySelector('.flock-pause')) return;
            var b = doc.createElement('button');
            b.type = 'button'; b.className = 'flock-pause';
            b.addEventListener('click', function () {
                if (F.paused) F.resumeAll(); else F.pauseAll();
                try { localStorage.setItem(KEY, F.paused ? 'paused' : 'running'); } catch (e) {}
                label();
            });
            host.insertBefore(b, before || null); btns.push(b); label();
        }
        function mount() {
            var nav = doc.querySelector('#nav-container .nav-right');
            if (nav) { add(nav, nav.querySelector('#theme-toggle')); add(doc.querySelector('#mobile-menu'), doc.querySelector('#mobile-menu .mobile-lang-flags')); }
            else if (!doc.getElementById('nav-container')) add(doc.querySelector('.page-footer .links'));
            return !!nav;
        }
        if (!mount()) doc.addEventListener('nav:loaded', mount, { once: true });
    }

    // Road pages (now/, why/): the tap and loop-to-X scenes, their replay buttons and the filling rail
    function finish(svg) {
        if (svg.setCurrentTime) { try { svg.setCurrentTime(0); } catch (e) {} }
        svg.classList.add('go');
        var m = svg.querySelector('animateMotion'); if (m && m.beginElement) m.beginElement();
        if (svg.setCurrentTime) { try { svg.setCurrentTime(3); } catch (e) {} }
        if (svg.getAnimations) svg.getAnimations({ subtree: true }).forEach(function (a) { try { a.finish(); } catch (e) {} });
    }
    function road() {
        var figs = [];
        arr(doc.querySelectorAll('svg.tap, svg.loopx')).forEach(function (s) {
            var f = s.closest('figure');
            if (figs.indexOf(f) < 0) figs.push(f);
        });
        var made = figs.map(function (f) {
            return F.scene(f, {
                mode: 'once', threshold: 0.45, variants: 'svg',
                reset: function (c) { c.all.forEach(function (x) { x.classList.remove('go'); }); void c.el.getBoundingClientRect(); },
                beats: [{ at: 0, run: function (c) {
                    c.t.forEach(function (x) {
                        x.classList.add('go');
                        var m = x.querySelector('animateMotion'); if (m && m.beginElement) m.beginElement();
                    });
                } }],
                end: function (c) { c.t.forEach(finish); }
            });
        });
        arr(doc.querySelectorAll('.replay')).forEach(function (b) {
            b.addEventListener('click', function () {
                var f = b.closest('figure');
                made.forEach(function (h) { if (h.el === f) h.replay(); });
            });
        });
        // the path fills as you read: one measurement per frame, and only while the road is on screen
        var rd = doc.querySelector('.road'), fill = doc.querySelector('.rail i');
        if (rd && fill) {
            var pend = false, on = false;
            var tickRail = function () {
                pend = false;
                if (F.reduced) return;
                var r = rd.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
                fill.style.setProperty('--fill', p.toFixed(3));
            };
            var onScroll = function () { if (!pend && !F.reduced) { pend = true; requestAnimationFrame(tickRail); } };
            var set = function (v) {
                if (v && !on) addEventListener('scroll', onScroll, { passive: true });
                if (!v && on) removeEventListener('scroll', onScroll);
                on = v; onScroll();
            };
            addEventListener('resize', onScroll);
            watch(rd, 0, set);
            tickRail();
        }
        // ambient loops: the opening flock, and the farm ducks on why/
        var topEl = doc.querySelector('.top'); if (topEl) F.ambient(topEl);
        arr(doc.querySelectorAll('.pics .scene-svg')).forEach(function (s) { F.ambient(s.closest('figure')); });
    }

    function init() {
        if (doc.body.classList.contains('road-page')) road();
        toggle();
    }
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
