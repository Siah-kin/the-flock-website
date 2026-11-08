/* Home page scenes on the Flock runtime (js/flock-motion.js): the fee split (#flow), the two Telegram demos
   ([data-demo]) and the hero card's highlighted line. Storyboards: docs/motion, section 6, S1 and S3.
   Debug: #seek-flow=1700, #seek-hero=300 or #seek-<panel id>=2000 (e.g. #seek-x-p2=2000) holds that scene at that time. */
(function () {
    'use strict';
    var doc = document, can = !!Element.prototype.animate, dbg = {}, stops = [];
    // Without the runtime the tabs still work and every scene shows its last frame
    var F = window.Flock || { reduced: true, scene: function (el, o) { var e = function () { o.end(); }; e(); return { el: el, end: e, replay: e, seek: e }; } };
    var cs = getComputedStyle(doc.documentElement);
    function tok(n, f) { return parseFloat(cs.getPropertyValue(n)) || f; }
    function ease(n, f) { return cs.getPropertyValue(n).trim() || f; }
    var MICRO = tok('--dur-micro', 120), SHORT = tok('--dur-short', 220), MED = tok('--dur-med', 420), LONG = tok('--dur-long', 800);
    var IN = ease('--ease-enter', 'ease-out'), OUT = ease('--ease-exit', 'ease-in'), MOVE = ease('--ease-move', 'ease-in-out'), POP = ease('--ease-pop', 'ease-out');

    function arr(x) { return Array.prototype.slice.call(x); }
    function live() { return can && !F.reduced && !F.paused; }
    function anim(list, el, kf, o) {
        o.fill = o.fill || 'both'; o.easing = o.easing || IN;
        var a = el.animate(kf, o); list.push(a); return a;
    }
    // Cancel and detach: Flock's resume replays the animations it paused, so a cancelled one must have nothing to replay
    function kill(list) { list.splice(0).forEach(function (a) { a.cancel(); try { a.effect = null; } catch (e) {} }); }

    // S1: one fee goes in, three shares come out together, the planned pool stays empty
    function flow() {
        var fig = doc.getElementById('flow'), svg = fig && fig.querySelector('svg');
        if (!svg || !can) return;
        var A = [], q = function (s) { return arr(svg.querySelectorAll(s)); };
        var pipes = q('.ripple'), cin = q('.fc-in')[0], outs = q('.fc-out'), ghost = q('.fc-ghost')[0];
        var duck = q('use.duck.bob')[0], head;
        if (duck && F.rig) head = F.rig(duck, 0).querySelector('.head');
        function at(el) { var m = el.transform.baseVal.consolidate().matrix; return [m.e, m.f, m.a]; }
        function tr(x, y, s) { return 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')'; }
        function bump(els, kf, d) { els.forEach(function (el) { anim(A, el, [{ transform: 'none' }, kf, { transform: 'none' }], { duration: d || MED, easing: MOVE, fill: 'none', composite: kf.composite }); }); }
        // keyframes along a pipe, then on to where the coin rests
        function along(p, end) {
            var L = p.getTotalLength(), P = p.getPointAtLength(L), k = [], i, pt;
            var all = L + Math.sqrt(Math.pow(end[0] - P.x, 2) + Math.pow(end[1] - P.y, 2));
            for (i = 0; i <= 8; i++) { pt = p.getPointAtLength(L * i / 8); k.push({ transform: tr(pt.x, pt.y, end[2]), offset: L * i / 8 / all }); }
            k.push({ transform: tr(end[0], end[1], end[2]), offset: 1 });
            return k;
        }
        // the main pipe's ripple runs faster while the coin passes
        function rate(r) { if (pipes[0] && pipes[0].getAnimations) pipes[0].getAnimations().forEach(function (a) { a.playbackRate = r; }); }
        function cycle(o, last) {
            var b = [
                { at: o, run: function () {
                    kill(A); svg.classList.add('run');
                    if (head) bump([head], { transform: 'rotate(18deg)', offset: .4 });
                    var p = at(cin);
                    anim(A, cin, [{ opacity: 0, transform: tr(p[0], p[1], 0) }, { opacity: 1, transform: tr(p[0], p[1], 1) }], { duration: SHORT, easing: POP });
                } },
                { at: o + 300, run: function () { rate(3); anim(A, cin, along(pipes[0], [280, 330, 1]), { duration: 1200, easing: MOVE }); } },
                { at: o + 1500, run: function () {
                    rate(1);
                    anim(A, q('.lamp')[0], [{ opacity: 0 }, { opacity: .9, offset: .25 }, { opacity: 0 }], { duration: LONG, fill: 'none' });
                    bump(q('.router'), { transform: 'scale(.98)', offset: .3 }, 300);
                } },
                { at: o + 1700, run: function () {
                    outs.forEach(function (c, i) {
                        anim(A, c, along(pipes[i + 1], at(c)), { duration: 1200, easing: MOVE });
                        anim(A, c, [{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1 }], { duration: 1200, easing: 'linear' });
                    });
                } },
                { at: o + 2900, run: function () {
                    q('.ring').forEach(function (r) { anim(A, r, [{ opacity: .9, transform: 'none' }, { opacity: 0, transform: 'scale(1.14)' }], { duration: LONG, fill: 'none' }); });
                    bump(q('.duck.b1, .duck.b2'), { transform: 'translateY(-9px)', offset: .4, composite: 'add' });
                    bump(q('.pj'), { transform: 'scale(1.08)', offset: .4 });
                } },
                { at: o + 3200, run: function () {
                    var g = at(ghost), a = tr(g[0], g[1], 1), z = tr(g[0], g[1] + 26, 1);
                    anim(A, ghost, [{ opacity: 0, transform: a, easing: MOVE }, { opacity: 1, offset: .15 }, { opacity: 1, transform: z, offset: .6 }, { opacity: 1, transform: z, offset: .75 }, { opacity: 0, transform: z }], { duration: 1300, easing: 'linear', fill: 'none' });
                } }
            ];
            // between runs the three coins fade; after the last run they stay in their pools (the end frame)
            if (!last) b.push({ at: o + 8500, run: function () { outs.forEach(function (c) { anim(A, c, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: OUT }); }); } });
            return b;
        }
        dbg.flow = F.scene(fig, {
            mode: 'once', ambient: true, threshold: 0.35,
            beats: cycle(0).concat(cycle(9000), cycle(18000, true)),
            reset: function () { kill(A); rate(1); svg.classList.add('run'); },
            end: function () { kill(A); rate(1); svg.classList.remove('run'); }
        });
    }

    // S3: one panel of a demo. Bubbles grow from their tail corner; buttons follow; the draft types, then gets marked
    function split(me) {
        var out = [];
        (function walk(n) {
            arr(n.childNodes).forEach(function (c) {
                if (c.nodeType === 3) {
                    var f = doc.createDocumentFragment();
                    Array.from(c.data).forEach(function (ch) { var s = doc.createElement('span'); s.textContent = ch; f.appendChild(s); out.push(s); });
                    n.replaceChild(f, c);
                } else if (c.className !== 'who') walk(c);
            });
        })(me);
        return out;
    }
    function panel(p) {
        var A = [], tg = p.querySelector('.tg'), parts = arr(tg.children), side = p.lastElementChild;
        var me = tg.querySelector('.me'), chars = me ? split(me) : [], us = me ? arr(me.querySelectorAll('u')) : [];
        var pick = tg.querySelector('.btn.pick'), dots, ptr, ring;
        us.sort(function (a, b) { return a.dataset.k - b.dataset.k; });
        if (me) { tg.insertAdjacentHTML('beforeend', '<div class="tg-typing" aria-hidden="true"><i></i><i></i><i></i></div>'); dots = tg.lastChild; }
        if (pick) {
            tg.insertAdjacentHTML('beforeend', '<svg class="tg-ptr" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 8-6.2 1.6L9.6 19z"/></svg>');
            pick.insertAdjacentHTML('beforeend', '<svg class="tg-pick" width="0" height="0" aria-hidden="true"><rect x="1" y="1" rx="11" pathLength="1"/></svg>');
            ptr = tg.lastChild; ring = pick.lastChild;
        }
        function bub(n, d) { anim(A, n, [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: SHORT, delay: d }); }
        function type(t) {
            var step = Math.min(28, 900 / chars.length);
            chars.forEach(function (s, i) { anim(A, s, [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: t + i * step }); });
            t += step * chars.length + 250;
            // the same colours as .marked u.on, in the order of the bot's list (link, ticker, price)
            us.forEach(function (u, k) {
                anim(A, u, [{ backgroundColor: 'rgba(229,96,79,0)', boxShadow: '0 0 0 2px rgba(255,140,120,0)' },
                    { backgroundColor: 'rgba(229,96,79,.45)', boxShadow: '0 0 0 2px rgba(255,140,120,.7)' }], { duration: 300, delay: t + 350 * k });
            });
            return t + 350 * us.length;
        }
        function typing(n, t) {
            dots.style.top = n.offsetTop + 'px';
            anim(A, dots, [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none', offset: .25 }, { opacity: 1, offset: .9 }, { opacity: 0 }], { duration: 700, delay: t, fill: 'none' });
            arr(dots.children).forEach(function (d, j) { anim(A, d, [{ opacity: .45 }, { opacity: 1 }, { opacity: .45 }], { duration: 420, delay: t + 120 + j * 120, easing: MOVE, fill: 'none' }); });
        }
        // a pointer goes to Useful, presses it, and the pick outline draws round it
        function point(t) {
            // offsets add up to the card: a row that is still growing (transformed) counts as an offset parent
            var w = pick.offsetWidth, h = pick.offsetHeight, x = w / 2, y = h / 2, n;
            for (n = pick; n && n !== tg; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
            var to = 'translate(' + (x + 26) + 'px,' + (y - 1) + 'px)', from = 'translate(' + (x + 70) + 'px,' + (y + 44) + 'px)';
            anim(A, ptr, [{ opacity: 0, transform: from }, { opacity: 1, transform: from, offset: .2 }, { opacity: 1, transform: to }], { duration: 750, delay: t, easing: MOVE });
            t += 750;
            anim(A, pick, [{ transform: 'none' }, { transform: 'scale(.94)', offset: .4 }, { transform: 'none' }], { duration: MICRO, delay: t, fill: 'none' });
            anim(A, ptr, [{ transform: to }, { transform: to + ' scale(.9)', offset: .4 }, { transform: to }], { duration: MICRO, delay: t, fill: 'none' });
            t += MICRO;
            ring.setAttribute('width', w + 4); ring.setAttribute('height', h + 4);
            ring.firstChild.setAttribute('width', w + 2); ring.firstChild.setAttribute('height', h + 2);
            anim(A, ring.firstChild, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: MED, delay: t, easing: MOVE });
            anim(A, pick, [{ color: '#8EC4FA' }, { color: '#FED801' }], { duration: SHORT, delay: t });
            anim(A, ptr, [{ opacity: 1 }, { opacity: 0 }], { duration: SHORT, delay: t + MED + 200, fill: 'forwards' });
        }
        function run() {
            p.classList.remove('pre');
            anim(A, tg, [{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
            anim(A, side, [{ opacity: 0 }, { opacity: 1 }], { duration: SHORT });
            var t = 0, last = 0;
            parts.forEach(function (n, i) {
                if (n.classList.contains('btns')) return bub(n, last + 60);
                if (i) t += 300;
                if (n === me) { bub(n, t); t = type(t + 150); return; }
                if (dots && n.classList.contains('later')) { typing(n, t); t += 700; }
                bub(n, last = t);
            });
            if (pick) point(last + 500);
        }
        return F.scene(p, {
            mode: 'once', threshold: null, beats: [{ at: 0, run: run }],
            reset: function () {
                kill(A); p.classList.add('pre');
                us.forEach(function (u) { u.classList.remove('on'); });
                if (pick) pick.classList.remove('pick');
            },
            end: function () {
                kill(A); p.classList.remove('pre');
                us.forEach(function (u) { u.classList.add('on'); });
                if (pick) pick.classList.add('pick');
            }
        });
    }

    // S3: a demo. The old panel leaves, the box eases to the new height, the new panel builds itself
    function demo(d) {
        var tabs = arr(d.querySelectorAll('[role="tab"]')), box = d.querySelector('.panels');
        var panels = tabs.map(function (t) { return doc.getElementById(t.getAttribute('aria-controls')); });
        var cur = -1, seen = !window.IntersectionObserver, pend = null, hs = null;
        d.classList.add('fx');
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
            var old = panels[cur], h0 = box.offsetHeight, ex;
            if (!live() || i === cur) { put(i); play(i); return; }
            ex = [old.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 160, easing: OUT, fill: 'forwards' })];
            pend = function () {
                pend = null; kill(ex); put(i); play(i);
                var h1 = box.offsetHeight, a;
                if (h1 === h0 || !live()) return;
                box.classList.add('flip');
                a = hs = box.animate({ height: [h0 + 'px', h1 + 'px'] }, { duration: MED, easing: IN });
                a.onfinish = function () { if (hs === a) stop(); };
            };
            var mine = pend;
            ex[0].onfinish = function () { if (pend === mine) pend(); };
        }
        tabs.forEach(function (t, i) {
            t.addEventListener('click', function () { show(i, false); });
            t.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); show((i + 1) % tabs.length, true); }
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); show((i - 1 + tabs.length) % tabs.length, true); }
            });
        });
        panels.forEach(function (p, i) {
            var b = p.querySelector('.next-step');
            if (b) b.addEventListener('click', function () { show((i + 1) % tabs.length, true); });
            dbg[p.id] = { el: p, seek: function (ms) { seen = true; settle(); select(i); put(i); scenes[i].seek(ms); } };
        });
        select(0); put(0); play(0);
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
    }

    // S3: after the hero card rises, its highlighted History line fills from left to right
    function hero() {
        var m = doc.querySelector('.hero .tg mark'), A = [];
        if (!m) return;
        var h = dbg.hero = F.scene(m, {
            mode: 'once', threshold: null,
            beats: [{ at: 0, run: function () { m.classList.remove('f0'); anim(A, m, [{ backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%' }], { duration: 600, easing: MOVE }); } }],
            reset: function () { kill(A); m.classList.add('f0'); },
            end: function () { kill(A); m.classList.remove('f0'); }
        });
        stops.push(h.end);
        if (!live()) return h.end();
        m.classList.add('f0');
        var rise = m.closest('figure').getAnimations()[0];
        (rise ? rise.finished : Promise.resolve()).then(h.replay, h.end);
    }

    flow();
    arr(doc.querySelectorAll('[data-demo]')).forEach(demo);
    hero();
    // Pause: the illustration freezes (the runtime does that); the demos and the hero line jump to their last frame
    if (window.MutationObserver) new MutationObserver(function () { if (F.paused) stops.forEach(function (f) { f(); }); })
        .observe(doc.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    function seek() {
        var m = /^#seek-([\w-]+)=(\d+)$/.exec(location.hash), t = m && dbg[m[1]];
        if (!t) return;
        t.el.scrollIntoView({ block: 'center', behavior: 'instant' });
        t.seek(+m[2]);
    }
    addEventListener('hashchange', seek);
    setTimeout(seek, 1000);
})();
