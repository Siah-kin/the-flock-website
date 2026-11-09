/* Home scenes on js/flock-motion.js: fee split (#flow), Telegram demos ([data-demo]), hero History line.
   Storyboards S1 and S3. Debug: #seek-flow=1700, #seek-hero=300, #seek-x-p2=2000 hold a scene at that time. */
(function () {
    'use strict';
    var doc = document, flowGate = function () {}, can = !!Element.prototype.animate, dbg = Object.create(null), stops = [], N = { transform: 'none' };
    // without the runtime the tabs still work and every scene shows its last frame
    var F = window.Flock || { reduced: true, scene: function (el, o) { var e = function () { o.end(); }; e(); return { el: el, end: e, replay: e, seek: e }; } };
    var cs = getComputedStyle(doc.documentElement);
    function tok(n, f) { return parseFloat(cs.getPropertyValue(n)) || f; }
    function ease(n, f) { return cs.getPropertyValue(n).trim() || f; }
    var MICRO = tok('--dur-micro', 120), SHORT = tok('--dur-short', 220), MED = tok('--dur-med', 420), LONG = tok('--dur-long', 800);
    var IN = ease('--ease-enter', 'ease-out'), OUT = ease('--ease-exit', 'ease-in'), MOVE = ease('--ease-move', 'ease-in-out');

    function arr(x) { return Array.prototype.slice.call(x); }
    function live() { return can && !F.reduced && !F.paused; }
    function anim(A, el, kf, d, o) {
        o = o || {}; o.duration = d; o.fill = o.fill || 'both'; o.easing = o.easing || IN;
        var a = el.animate(kf, o); A.push(a); return a;
    }
    // there and back (press, dip, hop, tick)
    function bump(A, el, kf, d, o) { o = o || {}; o.fill = 'none'; kf.offset = .4; return anim(A, el, [N, kf, N], d || MED, o); }
    function fade(a, b) { return [{ opacity: a }, { opacity: b }]; }
    function tr(x, y, s) { return 'translate(' + x + 'px,' + y + 'px)' + (s == null ? '' : ' scale(' + s + ')'); }
    // Flock's resume replays what it paused, so a cancelled animation is also emptied
    function kill(A) { A.splice(0).forEach(function (a) { a.cancel(); try { a.effect = null; } catch (e) {} }); }

    // S1: one fee in, three shares out together, the planned pool stays empty
    function flow() {
        var fig = doc.getElementById('flow'), svg = fig && fig.querySelector('svg');
        if (!svg || !can) return;
        var A = [], q = function (s) { return arr(svg.querySelectorAll(s)); };
        var pipes = q('.ripple'), cin = q('.fc-in')[0], outs = q('.fc-out'), ghost = q('.fc-ghost')[0], head = q('use.duck.bob')[0];
        if (head && F.rig) head = F.rig(head, 0).querySelector('.head');
        function at(el) { var m = el.transform.baseVal.consolidate().matrix; return [m.e, m.f, m.a]; }
        // along a pipe, then on to where the coin rests
        function along(p, e) {
            var L = p.getTotalLength(), P = p.getPointAtLength(L), k = [], i, t;
            var all = L + Math.sqrt(Math.pow(e[0] - P.x, 2) + Math.pow(e[1] - P.y, 2));
            for (i = 0; i <= 8; i++) { t = p.getPointAtLength(L * i / 8); k.push({ transform: tr(t.x, t.y, e[2]), offset: L * i / 8 / all }); }
            k.push({ transform: tr(e[0], e[1], e[2]) });
            return k;
        }
        // the main pipe's ripple runs faster while the coin passes
        function rate(r) { (pipes[0].getAnimations ? pipes[0].getAnimations() : []).forEach(function (a) { a.playbackRate = r; }); }
        function cycle(o, last) {
            var b = [
                { at: o, run: function () {
                    kill(A); svg.classList.add('run');
                    if (head) bump(A, head, { transform: 'rotate(18deg)' }, 0, { easing: MOVE });
                    // the resting coins fade away; later runs find them already gone
                    outs.forEach(function (c) { anim(A, c, o ? fade(0, 0) : fade(1, 0), o ? 1 : 200, { easing: OUT }); });
                    var p = at(cin);
                    anim(A, cin, [{ opacity: 0, transform: tr(p[0], p[1], 0) }, { opacity: 1, transform: tr(p[0], p[1], 1.4) }], SHORT, { easing: ease('--ease-pop', 'ease-out') });
                } },
                { at: o + 300, run: function () { rate(3); anim(A, cin, along(pipes[0], [280, 330, 1.4]), 1200, { easing: MOVE }); } },
                { at: o + 1500, run: function () {
                    rate(1);
                    anim(A, q('.lamp')[0], [{ opacity: 0 }, { opacity: .9, offset: .25 }, { opacity: 0 }], LONG, { fill: 'none' });
                    bump(A, q('.router')[0], { transform: 'scale(.98)' }, 300);
                } },
                { at: o + 1700, run: function () {
                    outs.forEach(function (c, i) {
                        anim(A, c, along(pipes[i + 1], at(c)), 1200, { easing: MOVE });
                        anim(A, c, [{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1 }], 1200, { easing: 'linear' });
                    });
                } },
                { at: o + 2900, run: function () {
                    q('.ring').forEach(function (r) { anim(A, r, [{ opacity: .9, transform: 'none' }, { opacity: 0, transform: 'scale(1.14)' }], LONG, { fill: 'none' }); });
                    q('.duck.b1, .duck.b2').forEach(function (d) { bump(A, d, { transform: 'translateY(-9px)' }, 0, { easing: MOVE, composite: 'add' }); });
                    bump(A, q('.pj')[0], { transform: 'scale(1.08)' }, 0, { easing: MOVE });
                } },
                { at: o + 3200, run: function () {
                    var g = at(ghost), a = tr(g[0], g[1]), z = tr(g[0], g[1] + 26);
                    anim(A, ghost, [{ opacity: 0, transform: a, easing: MOVE }, { opacity: 1, offset: .15 }, { opacity: 1, transform: z, offset: .6 }, { opacity: 1, offset: .75 }, { opacity: last ? .5 : 0, transform: z }], 1300, { easing: 'linear', fill: last ? 'forwards' : 'none' });
                    // the last run settles on the end frame: the ghost stays at its halfway stop, half faded
                } }
            ];
            // between runs the coins fade; after the third they stay in their pools (the end frame)
            if (!last) b.push({ at: o + 8500, run: function () { outs.forEach(function (c) { anim(A, c, fade(1, 0), 400, { easing: OUT }); }); } });
            return b;
        }
        // the end frame keeps the ghost coin at its halfway stop, half faded, so "planned" shows
        function rest(on) {
            return function () {
                kill(A); rate(1); svg.classList.toggle('run', on);
                var g = at(ghost);
                ghost.style.transform = on ? '' : tr(g[0], g[1] + 26);
                ghost.style.opacity = on ? '' : '.5';
            };
        }
        // off screen the runtime holds the beat clock (and drops .play); hold this scene's animations with it
        var held = [];
        function gate() {
            if (fig.classList.contains('play')) held.splice(0).forEach(function (a) { a.play(); });
            else A.forEach(function (a) { if (a.playState === 'running') { a.pause(); held.push(a); } });
        }
        // Play resumes the saved animations even when the figure is off screen: hold them again
        flowGate = gate;
        if (window.MutationObserver) new MutationObserver(gate).observe(fig, { attributes: true, attributeFilter: ['class'] });
        dbg.flow = F.scene(fig, { mode: 'once', ambient: true, threshold: 0.7, beats: cycle(0).concat(cycle(9000), cycle(18000, 1)), reset: rest(true), end: rest(false) });
    }

        // S3, one panel: bubbles grow from their tail corner, buttons follow; the pasted draft gets marked, the bot answers
    function panel(p) {
        var A = [], tg = p.querySelector('.tg'), parts = arr(tg.children), me = tg.querySelector('.me'), pick = tg.querySelector('.btn.pick');
        var us = me ? arr(me.querySelectorAll('u')) : [], ptr, dot, ring;
        us.sort(function (a, b) { return a.dataset.k - b.dataset.k; });
        function add(host, html) { host.insertAdjacentHTML('beforeend', html); return host.lastChild; }
        if (pick) {
            ptr = add(tg, '<svg class="tg-ptr" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 8-6.2 1.6L9.6 19z"/></svg>');
            dot = add(tg, '<i class="tg-dot" aria-hidden="true"></i>');
            ring = add(pick, '<svg class="tg-pick" width="0" height="0" aria-hidden="true"><rect x="1" y="1" rx="11" pathLength="1"/></svg>');
        }
        function bub(n, d) { anim(A, n, [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], SHORT, { delay: d }); }
        // the draft is pasted, so it is there whole; the three marks come one after another
        function mark(t) {
            // as .marked u.on, in the order of the bot's list (link, ticker, price)
            us.forEach(function (u, k) {
                anim(A, u, [{ backgroundColor: 'rgba(229,96,79,0)', boxShadow: '0 0 0 2px rgba(255,140,120,0)' },
                    { backgroundColor: 'rgba(229,96,79,.45)', boxShadow: '0 0 0 2px rgba(255,140,120,.7)' }], 300, { delay: t + 350 * k });
            });
            return t + 350 * us.length;
        }
        // a pointer goes to Useful and presses it, then the pick outline draws round it
        function point(t) {
            // add offsets up to the card: a row that is still growing (transformed) is an offset parent too
            var w = pick.offsetWidth, h = pick.offsetHeight, x = w / 2, y = h / 2, n, r = ring.firstChild;
            for (n = pick; n && n !== tg; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
            var ex = x + w / 2 - 18, ey = y + 4, to = tr(ex, ey), from = tr(ex + 44, ey + 45), dt = tr(ex - 14, ey - 14);
            anim(A, ptr, [{ opacity: 0, transform: from }, { opacity: 1, transform: from, offset: .2 }, { opacity: 1, transform: to }], 750, { delay: t, easing: MOVE });
            t += 750;
            bump(A, pick, { transform: 'scale(.94)' }, MICRO, { delay: t });
            // on a phone the pointer is a fingertip: it appears on the button and presses in
            anim(A, dot, [{ opacity: 0, transform: dt + ' scale(.6)' }, { opacity: 1, transform: dt + ' scale(1)' }], SHORT, { delay: t, easing: OUT });
            anim(A, ptr, [{ transform: to }, { transform: to + ' scale(.9)', offset: .4 }, { transform: to }], MICRO, { delay: t, fill: 'none' });
            t += MICRO;
            ring.setAttribute('width', w + 4); ring.setAttribute('height', h + 4); r.setAttribute('width', w + 2); r.setAttribute('height', h + 2);
            anim(A, r, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], MED, { delay: t, easing: MOVE });
            anim(A, pick, [{ color: '#8EC4FA' }, { color: '#FED801' }], SHORT, { delay: t });
            anim(A, ptr, fade(1, 0), SHORT, { delay: t + MED + 200, fill: 'forwards' });
            anim(A, dot, [{ opacity: 1, transform: dt }, { opacity: 0, transform: dt }], SHORT, { delay: t + MED + 200, fill: 'forwards' });
        }
        function run() {
            var t = 0, last = 0;
            p.classList.remove('pre');
            anim(A, tg, fade(0, 1), 160);
            anim(A, p.lastElementChild, fade(0, 1), SHORT);
            parts.forEach(function (n, i) {
                if (n.classList.contains('btns')) return bub(n, last + 60);
                if (i) t += 300;
                if (n === me) { bub(n, t); t = mark(t + SHORT + 300); return; }
                if (me && n.classList.contains('later')) t += 700;
                bub(n, last = t);
            });
            if (pick) point(last + 500);
        }
        function state(on) {
            return function () {
                kill(A); p.classList.toggle('pre', !on);
                us.forEach(function (u) { u.classList.toggle('on', on); });
                if (pick) pick.classList.toggle('pick', on);
            };
        }
        return F.scene(p, { mode: 'once', threshold: null, beats: [{ at: 0, run: run }], reset: state(false), end: state(true) });
    }

    // S3, a demo: the old panel leaves, the box eases to the new height, the new panel builds itself
    function demo(d) {
        var tabs = arr(d.querySelectorAll('[role="tab"]')), box = d.querySelector('.panels'), n = tabs.length;
        var panels = tabs.map(function (t) { return doc.getElementById(t.getAttribute('aria-controls')); });
        var cur = -1, seen = !window.IntersectionObserver, pend = null, hs = null;
        var scenes = panels.map(panel);
        function put(i) { panels.forEach(function (p, j) { p.hidden = i !== j; p.classList.toggle('show', i === j); }); cur = i; }
        function select(i) { tabs.forEach(function (t, j) { t.setAttribute('aria-selected', i === j ? 'true' : 'false'); t.tabIndex = i === j ? 0 : -1; }); }
        function play(i) { if (!live()) scenes[i].end(); else if (seen) scenes[i].replay(); else panels[i].classList.add('pre'); }
        function stop() { if (hs) { hs.cancel(); hs = null; } box.classList.remove('flip'); }
        function settle() { if (pend) pend(); stop(); }
        function show(i, focus) {
            select(i);
            if (focus) tabs[i].focus();
            settle(); seen = true;
            var h0 = box.offsetHeight, ex = [], mine;
            if (!live() || i === cur) { put(i); play(i); return; }
            anim(ex, panels[cur], [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }], 160, { easing: OUT, fill: 'forwards' });
            mine = pend = function () {
                pend = null; kill(ex); put(i); play(i);
                var h1 = box.offsetHeight, a;
                if (h1 === h0 || !live()) return;
                box.classList.add('flip');
                a = hs = box.animate({ height: [h0 + 'px', h1 + 'px'] }, { duration: MED, easing: MOVE });
                a.onfinish = function () { if (hs === a) stop(); };
            };
            ex[0].onfinish = function () { if (pend === mine) pend(); };
        }
        tabs.forEach(function (t, i) {
            t.addEventListener('click', function () { show(i, false); });
            t.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); show((i + 1) % n, true); }
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); show((i - 1 + n) % n, true); }
            });
        });
        panels.forEach(function (p, i) {
            var b = p.querySelector('.next-step');
            if (b) b.addEventListener('click', function () { show((i + 1) % n, true); });
            dbg[p.id] = { el: p, seek: function (ms) { seen = true; settle(); select(i); put(i); scenes[i].seek(ms); } };
        });
        // .fx turns on the tabbed layout (index.html, css/flock-demos.css): without this script every panel stays readable
        select(0); put(0); d.classList.add('fx'); play(0);
        // the first panel builds itself when the demo comes into view
        if (!seen) {
            var io = new IntersectionObserver(function (e) {
                if (!e[0].isIntersecting) return;
                io.disconnect();
                if (!seen) { seen = true; play(cur); }
            }, { threshold: 0.3 });
            io.observe(box);
        }
        stops.push(function () { seen = true; settle(); scenes[cur].end(); });
        // reduced motion switched on during a swap: finish it now, no exit or height animation left running
        if (window.matchMedia) {
            var rm = matchMedia('(prefers-reduced-motion: reduce)');
            var onrm = function (e) { if (e.matches) { seen = true; settle(); box.style.height = ''; scenes[cur].end(); } };
            if (rm.addEventListener) rm.addEventListener('change', onrm);
        }
    }

    // S3, hero: after the card rises, its highlighted History line fills from the left
    function hero() {
        var m = doc.querySelector('.hero .tg mark'), A = [];
        if (!m) return;
        function fill(on) { return function () { kill(A); m.classList.toggle('f0', !on); }; }
        var h = dbg.hero = F.scene(m, { mode: 'once', threshold: null, reset: fill(false), end: fill(true), beats: [{ at: 0, run: function () {
            m.classList.remove('f0');
            anim(A, m, [{ backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%' }], 600, { easing: MOVE });
        } }] });
        stops.push(h.end);
        if (!live()) return h.end();
        m.classList.add('f0');
        // starts when the History card is in view (60%) and its rise is over, not at page load
        var card = m.closest('figure'), rise = card.getAnimations()[0], seen = !window.IntersectionObserver, risen = false, done = false;
        function go() { if (done || !seen || !risen) return; done = true; if (F.paused || F.reduced) h.end(); else h.replay(); }
        (rise ? rise.finished : Promise.resolve()).then(function () { risen = true; go(); }, function () { risen = true; done = true; h.end(); });
        if (!seen) {
            var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting && e[0].intersectionRatio >= 0.6) { io.disconnect(); seen = true; go(); } }, { threshold: 0.6 });
            io.observe(card);
        } else go();
    }

    flow();
    arr(doc.querySelectorAll('[data-demo]')).forEach(demo);
    hero();
    // Pause: the fee scene freezes (the runtime does that); demos and the hero line jump to their last frame
    if (window.MutationObserver) new MutationObserver(function () { if (F.paused) stops.forEach(function (f) { f(); }); else flowGate(); })
        .observe(doc.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    function seek() {
        var m = /^#seek-([\w-]+)=(\d+)$/.exec(location.hash), t = m && dbg[m[1]];
        if (!t) return;
        t.seek(+m[2]);
        t.el.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    addEventListener('hashchange', seek);
    setTimeout(seek, 1000);
})();
