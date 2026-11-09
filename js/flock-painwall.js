/* Pain wall, the opening of /why/: a scroll scene in four beats on the shared Flock motion system.
   1 pain: the quotes arrive one by one (desktop: a wall; phone: one at a time, on a stack)
   2 agony: the line lands while the wall stays
   3 poof: the quotes blur away, the sky turns blue, sun, sea and ducks come in
   4 solution: the answer and Open the bot
   Reduced motion, the Pause toggle or no JavaScript give the still layout: the quotes as a list, then the answer.
   The cards and the list are written into the page from data/pain-wall.json by scripts/build_pain_wall.py.
   Load after js/flock-motion.js (both defer). Markup and styles: why/index.html, css/flock-painwall.css. */
(function () {
    'use strict';
    var doc = document, root = doc.getElementById('pain-wall');
    if (!root) return;
    var F = window.Flock || null;
    var stage = root.querySelector('.pw-stage'), view = root.querySelector('.pw-view'), wall = root.querySelector('.pw-wall');
    var sources = root.querySelector('.pw-sources'), end = root.querySelector('.pw-end');
    var cards = Array.prototype.slice.call(wall.querySelectorAll('.pw-q'));
    var agony = end.querySelector('.pw-agony'), calm = end.querySelector('.pw-calm'), cta = end.querySelector('.pw-cta');
    var sun = end.querySelector('.pw-sun'), sea = end.querySelector('.pw-sea'), ducks = end.querySelector('.pw-ducks');
    var deco = [agony, calm, sun, sea, ducks];
    var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var NAV = 56, mode = null, phone = false, W = 0, H = 0, pos = [], T = {}, raf = 0, lastS = -1, broken = false;

    function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function ease(x) { return 1 - Math.pow(1 - x, 3); }
    function span(s, a, b) { return clamp((s - a) / (b - a)); }

    function wantLive() {
        var reduced = F ? F.reduced : mq.matches, paused = false;
        if (F) paused = F.paused; else { try { paused = localStorage.getItem('flock-motion') === 'paused'; } catch (e) {} }
        return !reduced && !paused && !!window.requestAnimationFrame;
    }

    // Timeline, in heights of the view scrolled: each card's arrival, then the line, the clearing and the answer
    function timeline() {
        // the first card starts while the stage is still scrolling in (progress is negative until it pins)
        var n = cards.length, step = phone ? 0.45 : 0.3, dur = phone ? 0.25 : 0.22, a0 = -0.6;
        var tail = a0 + (n - 1) * step + dur;
        T = { a0: a0, step: step, dur: dur, ag0: tail + 0.25, ag1: tail + 0.5, cl0: tail + 0.85, cl1: tail + 1.35 };
        T.ca0 = T.cl1 - 0.1; T.ca1 = T.ca0 + 0.5; T.end = T.ca1 + 0.75;
    }

    // Desktop: a jittered masonry that fits the view above the strip kept for the line; no card covers another
    function layoutWall() {
        // the strip under the wall holds the line at its real size (large text makes it taller)
        var strip = Math.max(120, agony.offsetHeight + Math.round(H * 0.05) + 16);
        var area = Math.min(1180, W - 48), n = area >= 1000 ? 3 : 2, gap = 26, top = 24, availH = H - top - strip;
        var cw = Math.floor((area - gap * (n - 1)) / n), x0 = Math.round((W - area) / 2), scales = [1, 0.94, 0.88, 0.83, 0.78];
        // a reader who enlarged their text keeps it: no shrinking, the still layout takes over if it does not fit
        if (parseFloat(getComputedStyle(doc.documentElement).fontSize) > 17) scales = [1];
        var cols, best, k;
        wall.style.setProperty('--pw-cw', cw + 'px');
        for (k = 0; k < scales.length; k++) {
            wall.style.setProperty('--pw-fs', scales[k]);
            cols = []; for (var c = 0; c < n; c++) cols.push(0);
            best = cards.map(function (q) {
                var col = cols.indexOf(Math.min.apply(null, cols)), y = cols[col];
                cols[col] += q.offsetHeight + 22;
                return { col: col, y: y };
            });
            if (Math.max.apply(null, cols) - 22 <= availH) break;
        }
        var h = Math.max.apply(null, cols) - 22, y0 = top + Math.max(0, (availH - h) / 2);
        pos = best.map(function (b, i) {
            var jx = ((i * 37) % 21) - 10;
            return { x: x0 + b.col * (cw + gap) + jx, y: Math.round(y0 + b.y) };
        });
        return h <= availH;
    }

    // Phone: one column; each card's bottom sits on the same line, so the stack beneath only shows its top edge
    function layoutStack() {
        var cw = W - 32, base = Math.round(H * 0.64);
        wall.style.setProperty('--pw-cw', cw + 'px');
        wall.style.setProperty('--pw-fs', 1);
        var lowest = 0;
        pos = cards.map(function (q) {
            var y = Math.max(64, base - q.offsetHeight);
            lowest = Math.max(lowest, y + q.offsetHeight);
            return { x: 16, y: y };
        });
        // every card, at the bottom of the stack, must end above the line
        return lowest <= H - (agony.offsetHeight + Math.round(H * 0.07) + 12);
    }

    // Lays the scene out and says whether it fits: short screens (a phone on its side) or large text
    // can leave no room for the cards or the answer, and then the page keeps the still layout
    function layout() {
        W = view.clientWidth; H = view.clientHeight;
        phone = W < 700 || H < 480;
        root.classList.toggle('pw-phone', phone);
        var fits = phone ? layoutStack() : layoutWall();
        fits = fits && calm.offsetHeight <= H;
        timeline();
        stage.style.setProperty('--pw-h', Math.round((T.end + 1) * H) + 'px');
        lastS = -1;
        return fits;
    }

    function progress() { return Math.max(-1, Math.min(T.end, (NAV - stage.getBoundingClientRect().top) / H)); }

    // Cards only fade and move: filters on many cards are slow on cheap phones
    function setCard(q, op, tf, live, z) {
        q.style.opacity = op.toFixed(3);
        q.style.visibility = op < 0.02 ? 'hidden' : 'visible';
        q.style.transform = tf;
        q.style.zIndex = z;
        // only a card that is fully there takes clicks, so nothing half-faded sits over a link
        q.style.pointerEvents = live ? 'auto' : 'none';
    }

    function render() {
        raf = 0;
        if (mode !== 'live') return;
        var s = progress();
        if (Math.abs(s - lastS) < 0.0005) return;
        lastS = s;
        var ag = ease(span(s, T.ag0, T.ag1)), cl = ease(span(s, T.cl0, T.cl1)), ca = ease(span(s, T.ca0, T.ca1));
        var arr = cards.map(function (q, i) { return ease(span(s, T.a0 + i * T.step, T.a0 + i * T.step + T.dur)); });
        cards.forEach(function (q, i) {
            var a = arr[i], p = pos[i], r = 'rotate(var(--r))', op, tf, live;
            if (phone) {
                var depth = 0;
                for (var j = i + 1; j < arr.length; j++) depth += arr[j];
                var d = Math.min(depth, 4);
                // an arriving card turns opaque early and slides up, so two quotes never show through each other
                // while the stack clears, covered cards go first so they never show through the top card
                op = clamp(a * 3) * (depth > 0.5 ? 1 - clamp(cl * 2) : 1 - cl) * (depth > 4.5 ? 0 : 1);
                tf = 'translate(' + p.x + 'px,' + (p.y - d * 10 + (1 - a) * 90 - cl * 60) + 'px) scale(' + (1 - d * 0.035 - cl * 0.08).toFixed(4) + ')';
                live = a > 0.95 && depth < 0.3 && cl < 0.05;
                // a covered card turns a darker paper with its words faded, so only its edge shows
                q.classList.toggle('pw-under', depth > 0.5);
                setCard(q, op, tf, live, i + 1);
            } else {
                op = a * (1 - cl) * (1 - ag * 0.45);
                tf = 'translate(' + p.x + 'px,' + (p.y + (1 - a) * 40 - cl * 90) + 'px) ' + r + ' scale(' + (1 - cl * 0.12).toFixed(4) + ')';
                live = a > 0.95 && cl < 0.05;
                q.classList.remove('pw-under');
                setCard(q, op, tf, live, i + 1);
            }
        });
        // desktop: the wall blurs away as one layer; the phone stack only fades and slides
        var blur = !phone && cl > 0 ? 'blur(' + (cl * 6).toFixed(1) + 'px)' : '';
        if (wall.style.filter !== blur) wall.style.filter = blur;
        var agOut = span(s, T.cl0 + 0.1, T.cl0 + 0.4);
        agony.style.opacity = (ag * (1 - agOut)).toFixed(3);
        agony.style.transform = 'translateY(' + ((1 - ag) * 18) + 'px)';
        calm.style.opacity = ca.toFixed(3);
        calm.style.transform = 'translateY(' + ((1 - ca) * 24) + 'px)';
        end.classList.toggle('pw-open', ca > 0.6);
        sun.style.opacity = ca.toFixed(3);
        ducks.style.opacity = ca.toFixed(3);
        sea.style.opacity = ca.toFixed(3);
        sea.style.transform = 'translateY(' + ((1 - ca) * 40) + 'px)';
        var from = [20, 26, 40], to = [0, 74, 148];
        view.style.setProperty('--pw-bg', 'rgb(' + from.map(function (v, k) { return Math.round(v + (to[k] - v) * ca); }).join(',') + ')');
    }

    // Any error puts the plain layout back, so the page never stays half built
    function fail(e) {
        broken = true;
        removeEventListener('scroll', onScroll);
        try { enterStill(); } catch (e2) {}
        mode = 'still';
        root.classList.remove('pw-go');
        if (window.console && console.error) console.error('[pain wall] fell back to the still layout:', e);
    }
    function guard(fn) {
        return function () { if (broken) return; try { return fn.apply(this, arguments); } catch (e) { fail(e); } };
    }

    var renderSafe = guard(render);
    function onScroll() { if (!raf) raf = requestAnimationFrame(renderSafe); }
    var lastW = 0, lastH = 0;
    function onResize() {
        // phone toolbars change the height a little while scrolling; only a real change lays the scene out again
        if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 80) return;
        lastW = innerWidth; lastH = innerHeight;
        if (mode === 'live') { if (layout()) render(); else setMode('still'); }
        else if (wantLive()) setMode('live');  // a screen that grew may now have room for the scene
    }

    // The element to keep in place when the layout switches, so the reader does not lose their spot
    function anchor() {
        if (mode === null) return null;
        var r = stage.getBoundingClientRect();
        if (mode === 'live' && r.top < NAV && r.bottom > NAV + 10) return { el: sources, off: 72 };
        // the block the reader is in: the last one that starts in the top quarter of the screen or above it.
        // In the lead nothing above them changes, so their place needs no help.
        var list = [root.querySelector('.pw-lead'), sources, end, root.nextElementSibling], pick = null;
        if (mode === 'live') list.splice(2, 1);  // in the scene the answer lives inside the stage
        list.forEach(function (el) { if (el && el.getBoundingClientRect().top <= innerHeight * 0.25) pick = el; });
        // a reader on the answer band goes to the scene's answer beat when the scene comes back
        if (pick === end) return { answer: true };
        return pick && pick !== list[0] ? { el: pick, off: pick.getBoundingClientRect().top } : null;
    }

    function setMode(m) {
        if (m === mode) return;
        var a = anchor(), de = doc.documentElement, oa = de.style.overflowAnchor;
        de.style.overflowAnchor = 'none';
        lastW = innerWidth; lastH = innerHeight;
        if (m === 'live' && !enterLive()) {
            // no room for the scene: undo it in the same task, before anything is painted
            enterStill();
            m = 'still';
            if (mode === 'still') { de.style.overflowAnchor = oa; return; }
        } else if (m === 'still') enterStill();
        mode = m;
        if (m === 'live') { addEventListener('scroll', onScroll, { passive: true }); render(); }
        if (a && a.answer) scrollTo(0, stage.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - NAV + (T.ca1 + 0.2) * H);
        else if (a) scrollTo(0, (window.scrollY || window.pageYOffset) + a.el.getBoundingClientRect().top - a.off);
        requestAnimationFrame(function () { de.style.overflowAnchor = oa; });
    }

    function enterLive() {
        root.classList.add('pw-go');
        view.appendChild(end);
        return layout();
    }
    // The plain layout, with every inline style the scene set taken off
    function enterStill() {
        removeEventListener('scroll', onScroll);
        root.classList.remove('pw-go', 'pw-phone');
        end.classList.remove('pw-open');
        deco.concat(cards).forEach(function (el) { el.removeAttribute('style'); el.classList.remove('pw-under'); });
        wall.removeAttribute('style'); view.removeAttribute('style'); stage.removeAttribute('style');
        if (end.parentNode !== root) root.appendChild(end);
    }

    var sync = guard(function () { setMode(wantLive() ? 'live' : 'still'); });

    try {
        // A keyboard user who tabs to the hidden button is taken to the answer, so focus never lands on something unseen
        cta.addEventListener('focus', guard(function () {
            if (mode !== 'live' || end.classList.contains('pw-open')) return;
            var top = stage.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
            scrollTo(0, top - NAV + (T.ca1 + 0.2) * H);
        }));
        addEventListener('resize', guard(onResize));
        if (F && F.ambient) {
            // The shared system tells us about Pause and reduced motion; the view also gets .play while on screen (duck bob)
            F.ambient(view, { onchange: sync });
        } else if (mq.addEventListener) mq.addEventListener('change', sync);
        sync();
        if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(guard(function () {
            if (mode === 'live') { if (layout()) render(); else setMode('still'); }
        }));
        // only now does the inline starter in the page know the scene runs; without it the starter undoes .pw-go
        if (!broken) root.classList.add('pw-live');
    } catch (e) { fail(e); }
})();
