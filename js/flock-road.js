/* S4 on now/ and why/: the road duck and stop pulses, the one tap, the loop to X.
   Classic script (defer), runs after js/flock-motion.js and uses window.Flock.
   Each figure is one Flock.scene. Every animation is created at beat 0 and placed on the scene's own clock
   (keyframe offsets are storyboard times), so the scene has one playhead and seek() lands on any beat.
   The later beats are named marks for seek() and the snapshot script. */
(function () {
    'use strict';
    var F = window.Flock, doc = document, NS = 'http://www.w3.org/2000/svg';
    if (!F || !F.scene || !doc.body.classList.contains('road-page')) return;

    function arr(x) { return Array.prototype.slice.call(x); }
    function tok(n, fb) { var v = getComputedStyle(doc.documentElement).getPropertyValue(n).trim(); return v || fb; }
    function dur(n, fb) { var v = tok(n, ''); return v ? (/ms$/.test(v) ? parseFloat(v) : parseFloat(v) * 1000) : fb; }
    function ease() {
        return { enter: tok('--ease-enter', 'ease-out'), exit: tok('--ease-exit', 'ease-in'),
            move: tok('--ease-move', 'ease-in-out'), pop: tok('--ease-pop', 'ease-out') };
    }
    function make(tag, attrs, parent) {
        var e = doc.createElementNS(NS, tag);
        Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
        if (parent) parent.appendChild(e);
        return e;
    }
    // scale an element about a point of the drawing (SVG user units)
    function pivot(el, x, y) { el.style.transformBox = 'view-box'; el.style.transformOrigin = x + 'px ' + y + 'px'; }
    function centre(el) { var b = el.getBBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, b: b }; }

    // One property over the whole scene. pts: [time ms, value, easing to the next point]
    function track(el, prop, pts, T, list) {
        var kf = [];
        if (pts[0][0] > 0) pts = [[0, pts[0][1]]].concat(pts);
        pts.forEach(function (p) {
            var k = { offset: Math.min(1, Math.max(0, p[0] / T)) };
            k[prop] = p[1]; if (p[2]) k.easing = p[2];
            kf.push(k);
        });
        var last = pts[pts.length - 1];
        if (last[0] < T) { var k = { offset: 1 }; k[prop] = last[1]; kf.push(k); }
        var a = el.animate(kf, { duration: T, fill: 'both' });
        list.push(a);
        return a;
    }

    // js/flock-motion.js has already registered its own scene on this figure (play, replay, resize).
    // Swap the figure for a clean copy, which drops that scene's observers and listeners, and free its slot.
    function adopt(fig) {
        var at = -1;
        F.scenes.forEach(function (h, k) { if (h.el === fig) at = k; });
        var fresh = fig.cloneNode(true);
        arr(fresh.querySelectorAll('.go')).forEach(function (x) { x.classList.remove('go'); });
        fig.parentNode.replaceChild(fresh, fig);
        if (at > -1) F.scenes.splice(at, 1);
        return { el: fresh, at: at };
    }

    var mine = [];
    // A storyboard: setup(svg) once per variant, build(svg, list) creates every animation, marks name the beats
    function story(fig, o) {
        var a = adopt(fig), el = a.el;
        arr(el.querySelectorAll('svg')).forEach(o.setup);
        function clear(svg) { (svg._road || []).forEach(function (x) { x.cancel(); }); svg._road = []; }
        function build(svg) { clear(svg); o.build(svg, svg._road); }
        var beats = o.marks.map(function (m) {
            return { at: m[0], name: m[1], run: m[0] === 0 ? function (c) { c.t.forEach(build); } : function () {} };
        });
        var h = F.scene(el, {
            mode: 'once', threshold: 0.45, variants: 'svg', duration: o.T, beats: beats,
            reset: function (c) { c.all.forEach(clear); },
            // the last frame, at once: reduced motion, paused, a variant that appears after the scene has played
            end: function (c) { c.t.forEach(function (svg) { build(svg); svg._road.forEach(function (x) { x.finish(); }); }); }
        });
        // keep the snapshot order the page had
        if (a.at > -1) { F.scenes.splice(F.scenes.indexOf(h), 1); F.scenes.splice(a.at, 0, h); }
        var btn = el.querySelector('.replay');
        if (btn) btn.addEventListener('click', function () { h.replay(); });
        mine.push(h);
        return h;
    }

    /* One tap: a pointer presses Useful (400ms), the ring (600), the star (1050), the new History line (1700),
       then its highlight fades to the card colour (2600-3800), as the line looks in the bot. */
    function tap(fig) {
        var T = 3800;
        return story(fig, {
            T: T,
            marks: [[0, 'pointer'], [400, 'press'], [600, 'ring'], [1050, 'useful'], [1700, 'new line'], [2600, 'highlight fades'], [T, 'end']],
            setup: function (svg) {
                if (svg.querySelector('.road-pointer')) return;
                var g = make('g', { 'class': 'road-pointer', 'aria-hidden': 'true' }, svg);
                make('path', { d: 'M0,0 L0,21 L5.5,16 L9.5,25 L13.5,23.2 L9.6,14.6 L17,14.6 Z', fill: '#fff', stroke: '#0E1B33',
                    'stroke-width': '1.6', 'stroke-linejoin': 'round' }, g);
            },
            build: function (svg, L) {
                var E = ease(), micro = dur('--dur-micro', 120), short = dur('--dur-short', 220);
                var on = svg.querySelector('.useful-on'), txt = on.previousElementSibling, btn = txt.previousElementSibling;
                var c = centre(btn), k = c.b.height / 40, ptr = svg.querySelector('.road-pointer');
                var tx = c.x + 6 * k, ty = c.y + 4 * k, sx = tx + 46 * k, sy = ty + 46 * k;
                var at = function (x, y, s) { return 'translate(' + x + 'px,' + y + 'px) scale(' + (k * s) + ')'; };
                track(ptr, 'transform', [[0, at(sx, sy, 1), E.move], [400, at(tx, ty, 1), E.exit], [400 + micro, at(tx, ty, .88), E.pop],
                    [400 + micro + short, at(tx, ty, 1)]], T, L);
                track(ptr, 'opacity', [[0, 0], [150, 1], [1300, 1], [1300 + short, 0]], T, L);
                [btn, txt].forEach(function (x) {
                    pivot(x, c.x, c.y);
                    track(x, 'transform', [[400, 'scale(1)', E.exit], [400 + micro, 'scale(.94)', E.pop], [400 + micro + short, 'scale(1)']], T, L);
                });
                // the three beats that were CSS (ring, star, new line), same times and curves
                var ring = svg.querySelector('.ring'), line = svg.querySelector('.newline');
                track(ring, 'opacity', [[600, 0], [600, .9, 'ease-out'], [1600, 0]], T, L);
                track(ring, 'transform', [[600, 'scale(.4)', 'ease-out'], [1600, 'scale(1.8)']], T, L);
                track(on, 'opacity', [[1050, 0, 'ease-out'], [1350, 1]], T, L);
                track(line, 'opacity', [[1700, 0, E.enter], [2300, 1]], T, L);
                track(line, 'transform', [[1700, 'translateY(-10px)', E.enter], [2300, 'none']], T, L);
                var mark = line.querySelector('rect'), card = svg.querySelector('rect[fill="#F6F1E3"]');
                track(mark, 'fill', [[2600, mark.getAttribute('fill'), E.move], [3800, card ? card.getAttribute('fill') : '#F6F1E3']], T, L);
            }
        });
    }

    /* Loop to X: the trail draws under the duck on one playhead. The duck hops to X (300-1300ms), X presses as it
       lands, a reply appears at X (1500), the duck hops back to the bot (2200-3200), the grade appears (3300).
       On the tall variant the path runs down, so the duck turns to face down while it travels. */
    var OFFSET = window.CSS && CSS.supports && CSS.supports('offset-path', 'path("M0 0")');
    function loopx(fig) {
        var T = 3720, A0 = 300, A1 = 1300, B = 1500, C0 = 2200, C1 = 3200, G = 3300;
        return story(fig, {
            T: T,
            marks: [[0, 'start'], [A0, 'to X'], [A1, 'lands on X'], [B, 'reply'], [C0, 'back'], [C1, 'in the bot'], [G, 'grade'], [T, 'end']],
            setup: function (svg) {
                var trail = svg.querySelector('.trail'), u = svg.querySelector('use[href="#duck"]');
                var tile = svg.querySelector('rect[fill="#000"]');
                if (!trail || !u || !tile) return;
                svg._duck = u; u.classList.add('road-duck');
                if (OFFSET) u.style.offsetPath = 'path("' + trail.getAttribute('d') + '")';
                if (svg.querySelector('.road-reply')) return;
                // a wordless reply bubble, pinned at its tail; tall puts it beside X, wide above it
                var tall = svg.classList.contains('tall');
                var b = { x: +tile.getAttribute('x'), y: +tile.getAttribute('y'), w: +tile.getAttribute('width') };
                var tipX = b.x + b.w - (tall ? 2 : 14), tipY = b.y + (tall ? 2 : 6);
                var g = make('g', { 'class': 'road-reply-at', transform: 'translate(' + tipX + ' ' + tipY + ')', 'aria-hidden': 'true' }, svg);
                var r = make('g', { 'class': 'road-reply' }, g);
                var box = tall ? { x: 10, y: -14, w: 60 } : { x: 2, y: -30, w: 62 };
                make('rect', { x: box.x, y: box.y, width: box.w, height: 24, rx: 12, fill: '#fff' }, r);
                make('path', { d: tall ? 'M0,0 L12,-8 L12,4 Z' : 'M0,0 L4,-8 L14,-8 Z', fill: '#fff' }, r);
                make('rect', { x: box.x + 11, y: box.y + 6, width: 38, height: 4.5, rx: 2.25, fill: '#B7C3D3' }, r);
                make('rect', { x: box.x + 11, y: box.y + 14, width: 24, height: 4.5, rx: 2.25, fill: '#B7C3D3' }, r);
            },
            build: function (svg, L) {
                var E = ease(), micro = dur('--dur-micro', 120), short = dur('--dur-short', 220), med = dur('--dur-med', 420);
                var trail = svg.querySelector('.trail'), u = svg._duck, tile = svg.querySelector('rect[fill="#000"]');
                var tall = svg.classList.contains('tall'), len = trail.getTotalLength(), tb = tile.getBBox();
                // the duck lands where the path first comes inside the X tile
                var land = 0.5;
                for (var i = 0; i <= 400; i++) {
                    var p = trail.getPointAtLength(len * i / 400);
                    if (p.x >= tb.x + 8 && p.x <= tb.x + tb.width - 8 && p.y >= tb.y + 8 && p.y <= tb.y + tb.height - 8) { land = i / 400; break; }
                }
                var pc = (land * 100).toFixed(2) + '%';
                if (OFFSET) {
                    track(u, 'offsetDistance', [[A0, '0%', E.move], [A1, pc], [C0, pc, E.move], [C1, '100%']], T, L);
                } else {
                    var e = trail.getPointAtLength(len);
                    u.setAttribute('transform', 'translate(' + e.x + ' ' + e.y + ')');
                }
                track(trail, 'strokeDashoffset', [[A0, '1', E.move], [A1, String(1 - land)], [C0, String(1 - land), E.move], [C1, '0']], T, L);
                // small hops: up is screen-up on the wide path, and the duck's back (screen-right) on the tall one
                var up = tall ? '4px 0px' : '0px -7px', hop = [[0, '0px 0px']];
                [[A0, A1, land], [C0, C1, 1 - land]].forEach(function (leg) {
                    var n = Math.max(2, Math.round(leg[2] * len / 36)), st = (leg[1] - leg[0]) / n;
                    for (var j = 0; j < n; j++) { hop.push([leg[0] + j * st, '0px 0px', E.enter]); hop.push([leg[0] + (j + .5) * st, up, E.exit]); }
                    hop.push([leg[1], '0px 0px']);
                });
                track(u, 'translate', hop, T, L);
                // arrive: a short squash, then settle
                var sq = 'scale(1.06,.9)';
                track(u, 'transform', [[A1, 'none'], [A1 + 60, sq, E.pop], [A1 + 60 + short, 'none'],
                    [C1, 'none'], [C1 + 60, sq, E.pop], [C1 + 60 + short, 'none']], T, L);
                if (tall) {
                    var turn = 180;
                    track(u, 'offsetRotate', [[A0, '0deg', E.move], [A0 + turn, '90deg'], [A1 - turn, '90deg', E.move], [A1, '0deg'],
                        [C0, '0deg', E.move], [C0 + turn, '90deg'], [C1 - turn, '90deg', E.move], [C1, '0deg']], T, L);
                }
                // X presses as the duck lands
                var tc = centre(tile);
                [tile, tile.nextElementSibling].forEach(function (x) {
                    pivot(x, tc.x, tc.y);
                    track(x, 'transform', [[A1, 'scale(1)', E.exit], [A1 + micro, 'scale(.92)', E.pop], [A1 + micro + short, 'scale(1)']], T, L);
                });
                var r = svg.querySelector('.road-reply');
                track(r, 'opacity', [[B, 0], [B + short * .5, 1]], T, L);
                track(r, 'transform', [[B, 'scale(.6)', E.pop], [B + short, 'scale(1)']], T, L);
                var gr = svg.querySelector('.grade'), gc = centre(gr);
                pivot(gr, gc.x, gc.y);
                track(gr, 'opacity', [[G, 0], [G + med * .5, 1]], T, L);
                track(gr, 'transform', [[G, 'scale(.85)', E.pop], [G + med, 'scale(1)']], T, L);
            }
        });
    }

    /* Road: the "here" duck rides the rail at the fill, and each stop's ring pulses once when the fill reaches it.
       Same measure as the rail in js/flock-motion.js. Scroll-linked, so it follows the reader even when paused;
       pulses are skipped while paused, hidden or reduced. */
    function road() {
        var rd = doc.querySelector('.road'), rail = rd && rd.querySelector('.rail');
        if (!rd || !rail) return;
        var stops = arr(rd.querySelectorAll('.stop')).map(function (el) { return { el: el, done: false }; });
        var H = 1, first = true, pend = false;
        function measure() {
            H = rail.offsetHeight || 1;
            rd.style.setProperty('--rail-h', H + 'px');
            // a stop's dot sits on the rail's top line: dot top 6px + radius 13px, the rail starts 19px down
            stops.forEach(function (s) { s.p = (s.el.offsetTop + 19 - rail.offsetTop) / H; });
        }
        function tick() {
            pend = false;
            if (F.reduced) return;
            var r = rd.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
            rd.style.setProperty('--ride', (p * H).toFixed(1) + 'px');
            rd.classList.toggle('road-riding', p * H > 2);
            stops.forEach(function (s) {
                if (s.done || p <= s.p) return;
                s.done = true;
                if (first || F.paused || doc.hidden) return;
                s.el.classList.add('road-hit');
            });
            first = false;
        }
        function later() { if (!pend) { pend = true; requestAnimationFrame(tick); } }
        measure(); tick();
        addEventListener('scroll', later, { passive: true });
        addEventListener('resize', function () { measure(); later(); });
        if (window.ResizeObserver) new ResizeObserver(function () { measure(); later(); }).observe(rd);
    }

    // A one-shot scene keeps time with the tab: stop when it is hidden, go on when it is back (unless paused)
    var held = [];
    doc.addEventListener('visibilitychange', function () {
        if (doc.hidden) { if (!F.paused) { held = mine.slice(); held.forEach(function (h) { h.pause(); }); } }
        else { if (!F.paused) held.forEach(function (h) { h.resume(); }); held = []; }
    });

    var figs = [];
    arr(doc.querySelectorAll('svg.tap, svg.loopx')).forEach(function (s) {
        var f = s.closest('figure');
        if (figs.indexOf(f) < 0) figs.push(f);
    });
    figs.forEach(function (f) { if (f.querySelector('svg.tap')) tap(f); else loopx(f); });
    road();

    F.road = { adopt: adopt, track: track, scenes: mine };
})();
