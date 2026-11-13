/* Flock motion runtime: ambient loops, one-shot scenes, a global pause, reduced motion.
   Exposes window.Flock. Classic script (defer), no dependencies. See docs/motion/README.md. */
(function () {
    'use strict';
    var doc = document, root = doc.documentElement, KEY = 'flock-motion';
    var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var F = window.Flock = { reduced: mq.matches, paused: false, scenes: [] };
    var amb = [], running = [], raf = 0, ios = {}, tpl;

    root.classList.add('js');
    try { F.paused = localStorage.getItem(KEY) === 'paused'; } catch (e) {}
    if (F.paused) root.dataset.motion = 'paused';

    function arr(x) { return Array.prototype.slice.call(x); }
    function shown(el) { return getComputedStyle(el).display !== 'none'; }

    // One IntersectionObserver per threshold, one callback per element and threshold; without support everything counts as in view
    function watch(el, th, cb) {
        if (!('IntersectionObserver' in window)) { cb(true); return; }
        var w = ios[th];
        if (!w) {
            w = ios[th] = { m: new Map() };
            w.io = new IntersectionObserver(function (list) {
                // in view = at least the threshold, in every engine (some report any overlap as intersecting)
                list.forEach(function (x) { var f = w.m.get(x.target); if (f) f(x.isIntersecting && x.intersectionRatio >= th - 0.01); });
            }, { threshold: th });
        }
        w.m.set(el, cb); w.io.observe(el);
    }
    function unwatch(el, th) { var w = ios[th]; if (w) { w.m.delete(el); w.io.unobserve(el); } }

    // One scene at a time. Ambient hosts that fill a good part of the screen (a scene, a band, the hero) compete: the one
    // with the most of itself in view, at least 60%, plays and the others hold still. Small hosts (a button) keep the plain
    // 20% rule. The election runs from IntersectionObserver callbacks only, never from a scroll listener.
    var hosts = [], sio, sdirty = false, SPOT = 0.6;
    function cover(r, vw, vh) {
        var vis = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) * Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
        var den = Math.min(r.width * r.height, vw * vh);
        return den > 0 ? vis / den : 0;
    }
    function elect() {
        sdirty = false;
        var vw = innerWidth, vh = innerHeight, best = null, cur = null;
        hosts.forEach(function (h) {
            var r = h.el.getBoundingClientRect();
            h.c = cover(r, vw, vh);
            h.mid = Math.abs((r.top + r.bottom) / 2 - vh / 2);
            h.big = r.width * r.height >= 0.15 * vw * vh;
            if (h.on && h.big) cur = h;
        });
        hosts.forEach(function (h) {
            if (!h.big || h.c < SPOT) return;
            if (!best || h.c > best.c + 0.001 || (Math.abs(h.c - best.c) <= 0.001 && h.mid < best.mid)) best = h;
        });
        // keep the current winner unless another is clearly more in view (no flicker on the way past)
        if (cur && best && cur !== best && cur.c >= SPOT && best.c - cur.c < 0.15) best = cur;
        hosts.forEach(function (h) {
            var on = h.big ? h === best : h.c >= 0.2;
            if (on !== h.on) { h.on = on; h.set(on); }
        });
    }
    function queue() { if (!sdirty) { sdirty = true; requestAnimationFrame(elect); } }
    function spot(el, set) {
        if (!('IntersectionObserver' in window)) { set(true); return; }
        if (!sio) {
            sio = new IntersectionObserver(queue, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });
            addEventListener('resize', queue);
        }
        hosts.push({ el: el, set: set, on: false, c: 0 });
        sio.observe(el); queue();
    }

    // Duck rig: an animated duck is stamped as inline parts (named as in the duck brief), because parts inside a
    // <use> cannot move per instance. Same drawing as #duck; static ducks keep using <use>. Returns the new group.
    function svg(tag, cls) { var e = doc.createElementNS('http://www.w3.org/2000/svg', tag); if (cls) e.setAttribute('class', cls); return e; }
    F.rig = function (u, i, cls) {
        var sym = doc.getElementById('duck');
        if (!sym || !u || !u.parentNode) return u;
        if (!tpl) {
            // pose: flip and tilt; act: squash. Wake, eyelid and brow exist only on rigged ducks and are invisible at rest
            tpl = svg('g', 'pose');
            tpl.innerHTML = '<ellipse class="wake" cx="100" cy="117" rx="84" ry="5" fill="#BFD9F2"/><g class="act">' + sym.innerHTML + '</g>';
            var p = tpl.querySelector('.pupil');
            if (p) p.insertAdjacentHTML('afterend', '<ellipse class="eyelid" cx="164" cy="30" rx="7.4" ry="8.2" fill="var(--duck-body,#FFCB2B)"/>' +
                '<path class="brow" d="M157,20.5 C160.5,17.5 166,17 170.5,19" fill="none" stroke="#1B2A3A" stroke-width="2.4" stroke-linecap="round"/>');
        }
        var g = svg('g', ((u.getAttribute('class') || '') + ' rig ' + (cls || '')).replace(/\s+/g, ' ').trim());
        var m = svg('g', 'move'), v = svg('svg');
        ['style', 'opacity'].forEach(function (a) { if (u.hasAttribute(a)) g.setAttribute(a, u.getAttribute(a)); });
        ['x', 'y', 'width', 'height'].forEach(function (a) { if (u.hasAttribute(a)) v.setAttribute(a, u.getAttribute(a)); });
        v.setAttribute('viewBox', sym.getAttribute('viewBox')); v.setAttribute('overflow', 'visible');
        // irregular wing shuffles and blinks, the same on every load
        i = i || 0;
        g.style.setProperty('--r1', (i * 0.618 % 1).toFixed(2));
        g.style.setProperty('--r2', ((i * 0.382 + 0.3) % 1).toFixed(2));
        v.appendChild(tpl.cloneNode(true)); m.appendChild(v); g.appendChild(m);
        u.parentNode.replaceChild(g, u);
        return g;
    };

    // Ambient: el gets .play while it is in view, the tab is visible and nothing is paused
    F.ambient = function (el, o) {
        var a = { seen: false };
        el.classList.add('amb');
        function sync() {
            var on = a.seen && !doc.hidden && !F.paused && !F.reduced;
            el.classList.toggle('play', on);
            if (o && o.onchange) o.onchange(on);
        }
        a.sync = sync; amb.push(a); sync();
        spot(el, function (v) { a.seen = v; sync(); });
        return a;
    };

    // Look at: rigged ducks in `host` turn head and pupil toward the pointer (within 25 degrees) while ok() allows it,
    // and ease back when it leaves. Pointer devices with hover only.
    F.look = function (host, ok) {
        if (!window.matchMedia || !matchMedia('(hover: hover)').matches) return;
        function each(f) { arr(host.querySelectorAll('.rig')).forEach(f); }
        function off() { each(function (r) { r.style.removeProperty('--look'); r.style.removeProperty('--look-x'); }); }
        var ev, q = 0;
        host.addEventListener('pointermove', function (e) {
            ev = e;
            if (!q) q = requestAnimationFrame(function () {
                q = 0;
                if (F.reduced || F.paused || (ok && !ok())) return off();
                // read every head first, then write, so the page lays out once per frame
                var rs = arr(host.querySelectorAll('.rig')), bs = rs.map(function (r) { var h = r.querySelector('.head'); return h && h.getBoundingClientRect(); });
                rs.forEach(function (r, i) {
                    var b = bs[i]; if (!b) return;
                    var dx = ev.clientX - b.left - b.width / 2, dy = ev.clientY - b.top - b.height / 2;
                    var a = Math.max(-25, Math.min(25, Math.atan2(dy, Math.abs(dx)) * 57.3));
                    r.style.setProperty('--look', a.toFixed(1) + 'deg');
                    r.style.setProperty('--look-x', ((dx < 0) !== r.classList.contains('flip') ? -1 : 1) + 'px');
                });
            });
        });
        host.addEventListener('pointerleave', off);
    };

    // Scenes: beats on one shared clock
    function kick() { if (!raf && !F.paused && running.some(function (s) { return !s.held; })) raf = requestAnimationFrame(tick); }
    function tick(now) {
        raf = 0;
        running.slice().forEach(function (s) {
            if (!s.held) { s.pos += Math.max(now - s.last, 0); s.step(); }
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
        // An ambient scene is also an ambient host: it has .play while live, and its clock stops with its CSS
        function live() { return s.seen && !doc.hidden && !F.paused && !F.reduced; }
        function hold() { return o.ambient ? !live() : F.paused; }
        var sa = { sync: function () {
            el.classList.toggle('play', live());
            if (s.st === 1 && s.held !== hold()) { s.held = !s.held; s.last = performance.now(); kick(); }
        } };
        if (o.ambient) { amb.push(sa); el.classList.add('amb'); }

        function ctx() {
            var all = o.variants ? arr(el.querySelectorAll(o.variants)) : [el];
            return { el: el, scene: h, pos: s.pos, all: all, t: o.variants ? all.filter(shown) : all };
        }
        function svgs() { return arr(el.querySelectorAll('svg')).concat(el.pauseAnimations ? [el] : []); }
        function drop() { var k = running.indexOf(s); if (k > -1) running.splice(k, 1); }
        s.step = function () {
            while (s.st === 1 && s.i < beats.length && beats[s.i].at <= s.pos) {
                // a beat that runs late (slow frame) starts its CSS animations as old as it is late, so ducks and gate stay together
                var lag = s.pos - beats[s.i].at, was = lag > 20 && el.getAnimations ? el.getAnimations({ subtree: true }) : 0;
                beats[s.i++].run(ctx());
                if (was) el.getAnimations({ subtree: true }).forEach(function (a) { if (was.indexOf(a) < 0 && a.currentTime !== null) a.currentTime += lag; });
            }
            if (s.st !== 1) return;
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
            if (F.reduced || F.paused) return end();
            drop(); s.armed = false;
            if (!F.paused) svgs().forEach(function (v) { if (v.unpauseAnimations) v.unpauseAnimations(); });
            if (o.reset) o.reset(ctx());
            s.pos = 0; s.i = 0; s.st = 1; s.held = hold(); s.last = performance.now();
            if (o.onplay) o.onplay(ctx());
            running.push(s); s.step(); kick();
        }
        h = {
            el: el, beats: beats, play: play, replay: play, end: end,
            pause: function () {
                s.held = true;
                // CSS animations stop through html[data-motion="paused"]; pausing them here would detach them from CSS for good
                s.anims = el.getAnimations ? el.getAnimations({ subtree: true }).filter(function (a) {
                    return a.playState === 'running' && !(window.CSSAnimation && a instanceof CSSAnimation);
                }) : [];
                s.anims.forEach(function (a) { a.pause(); });
                svgs().forEach(function (v) { if (v.pauseAnimations) v.pauseAnimations(); });
            },
            resume: function () {
                s.held = hold(); s.last = performance.now();
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
                // an animation a beat starts is set to its own age (ms - beat), the rest to ms
                var age = new Map(), list = function () { return el.getAnimations ? el.getAnimations({ subtree: true }) : []; };
                list().forEach(function (a) { age.set(a, 0); });
                while (s.i < beats.length && beats[s.i].at <= ms) {
                    var b = beats[s.i++]; b.run(ctx());
                    list().forEach(function (a) { if (!age.has(a)) age.set(a, b.at); });
                }
                list().forEach(function (a) { a.pause(); a.currentTime = ms - (age.get(a) || 0); });
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
        else {
            // an ambient scene runs its loops from 20% in view, and starts its storyboard when `th` of o.target (or el) shows
            var tg = o.target || el;
            if (o.ambient) spot(el, function (v) { s.seen = v; sa.sync(); });
            if (th !== null) watch(tg, th, function (v) {
                if (!o.ambient) s.seen = v;
                if (o.mode === 'loop') { if (v && s.st !== 1) play(); else if (!v) { drop(); s.st = 0; } return; }
                if (!v || s.st) return;
                // paused on arrival: show the last frame (nothing hidden); Play replays from the start
                if (F.paused) { s.armed = true; if (o.end) o.end(ctx()); return; }
                unwatch(tg, th); play();
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

    // The side control: a play/pause button and a sound button, fixed on the right edge of every page
    var ICON = {
        play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.4v14H7zM13.6 5H17v14h-3.4z"/></svg>',
        off: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9.5l5 5m0-5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
        on: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15 9a4 4 0 0 1 0 6M17.4 6.6a7.4 7.4 0 0 1 0 10.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    };
    function toggle() {
        if (doc.querySelector('.flock-side')) return;
        var S = window.FlockSound;
        var PT = (doc.documentElement.lang || '').indexOf('pt') === 0;
        var box = doc.createElement('div'); box.className = 'flock-side'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', PT ? 'Animação e som' : 'Animation and sound');
        function btn(cls) { var b = doc.createElement('button'); b.type = 'button'; b.className = cls; box.appendChild(b); return b; }
        var pb = btn('flock-pause'), sb = S ? btn('flock-sound') : null;
        function label() {
            pb.innerHTML = F.paused ? ICON.play : ICON.pause;
            pb.setAttribute('aria-label', PT ? 'Animações' : 'Animations');
            pb.setAttribute('aria-pressed', F.paused ? 'false' : 'true');
            if (sb) {
                sb.innerHTML = S.on ? ICON.on : ICON.off;
                sb.setAttribute('aria-label', PT ? 'Som' : 'Sound');
                sb.setAttribute('aria-pressed', S.on ? 'true' : 'false');
            }
        }
        pb.addEventListener('click', function () {
            if (F.paused) F.resumeAll(); else F.pauseAll();
            try { localStorage.setItem(KEY, F.paused ? 'paused' : 'running'); } catch (e) {}
            label();
        });
        if (sb) { sb.addEventListener('click', function () { S.set(!S.on); }); doc.addEventListener('flock:sound', label); }
        label();
        doc.body.appendChild(box);
        // on phones the buttons sit in the sticky header beside the moon, so they never cover text
        var narrow = window.matchMedia('(max-width: 1280px)');
        function place() {
            var nr = doc.querySelector('#nav-container .nav-right'), moon = nr && nr.querySelector('#theme-toggle');
            [pb, sb].forEach(function (b) {
                if (!b) return;
                if (narrow.matches && nr) { b.classList.add('in-nav'); nr.insertBefore(b, moon); }
                else { b.classList.remove('in-nav'); box.appendChild(b); }
            });
            box.hidden = narrow.matches && !!nr;
        }
        if (narrow.addEventListener) narrow.addEventListener('change', place);
        place();
        if (!doc.querySelector('#nav-container .nav-right')) doc.addEventListener('nav:loaded', place, { once: true });
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
        // a page may have one path (now/) or one per list (how/): each rail fills along its own stops
        var rd = doc.querySelector('.road'), fills = rd ? arr(rd.querySelectorAll('.rail i')) : [];
        if (rd && fills.length) {
            var pend = false, on = false;
            // each path ends on its last stop's ring (the ring's centre is --ring-y below the stop's top, 25px unless the page sets it), not in the space under it
            var endRail = function () {
                fills.forEach(function (fill) {
                    var rail = fill.parentNode, wrap = rail.offsetParent, stops = rail.parentNode.querySelectorAll('.stop');
                    if (!stops.length) stops = rd.querySelectorAll('.stop');
                    if (!stops.length || !wrap) return;
                    var last = stops[stops.length - 1], y = parseFloat(getComputedStyle(last).getPropertyValue('--ring-y')) || 25;
                    rail.style.bottom = Math.max(0, wrap.offsetHeight - (last.offsetTop + y)) + 'px';
                });
            };
            endRail();
            if (window.ResizeObserver) new ResizeObserver(endRail).observe(rd);
            addEventListener('resize', endRail);
            // the fill follows the reading line (60% down the screen) along the rail itself
            var tickRail = function () {
                pend = false;
                if (F.reduced) return;
                fills.forEach(function (fill) {
                    var r = fill.parentNode.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / (r.height || 1)));
                    fill.style.setProperty('--fill', p.toFixed(3));
                });
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
        arr(doc.querySelectorAll('.top .flock use')).forEach(function (u, i) { F.rig(u, i, 'bob'); });
        arr(doc.querySelectorAll('.pics .scene-svg')).forEach(function (s) { F.ambient(s.closest('figure')); });
    }

    // any tapped duck quacks (rigged ducks and the stamped ones); silent unless the visitor turned sound on
    doc.addEventListener('click', function (e) {
        if (window.FlockSound && e.target.closest && e.target.closest('.rig, svg .duck, use.duck')) FlockSound.play('quack');
    });

    function init() {
        if (doc.body.classList.contains('road-page')) road();
        // flock-sound.js is deferred after this file: build the control once it has run
        if (doc.readyState === 'complete') toggle(); else doc.addEventListener('DOMContentLoaded', toggle, { once: true });
    }
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
