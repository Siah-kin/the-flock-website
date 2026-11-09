/* Pain wall, on the home page after the first screen: a scroll scene in four beats on the shared Flock motion system.
   1 pain: the quotes arrive one by one and pile up, tilted and overlapping (desktop: scattered over the view; phone: a cascade)
   2 agony: the line lands while the wall stays
   3 poof: the quotes blur away, the sky turns blue, sun, sea and ducks come in
   4 solution: the answer and Open the bot
   Reduced motion, the Pause toggle, no JavaScript or a screen with no room give the still layout: the same quote
   cards in a tilted, overlapping pile, each with its source link, then the answer.
   The scene follows the approved mock (site_rebrand_notes/pain_wall/mock.html): same spots, same timeline.
   The cards are written into the page from data/pain-wall.json by scripts/build_pain_wall.py.
   Load after js/flock-motion.js (both defer). Markup and styles: index.html, css/flock-painwall.css. */
(function () {
    'use strict';
    var doc = document, root = doc.getElementById('pain-wall');
    if (!root) return;
    var F = window.Flock || null;
    var stage = root.querySelector('.pw-stage'), view = root.querySelector('.pw-view'), wall = root.querySelector('.pw-wall');
    var end = root.querySelector('.pw-end');
    var cards = Array.prototype.slice.call(wall.querySelectorAll('.pw-q'));
    var links = Array.prototype.slice.call(wall.querySelectorAll('.pw-q a'));
    var agony = end.querySelector('.pw-agony'), calm = end.querySelector('.pw-calm'), cta = end.querySelector('.pw-cta');
    var sun = end.querySelector('.pw-sun'), sea = end.querySelector('.pw-sea'), ducks = end.querySelector('.pw-ducks');
    var deco = [agony, calm, sun, sea, ducks];
    var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var NAV = 56, mode = null, phone = false, W = 0, H = 0, pos = [], T = {}, raf = 0, lastS = -1, broken = false;

    function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function span(s, a, b) { return clamp((s - a) / (b - a)); }

    function wantLive() {
        var reduced = F ? F.reduced : mq.matches, paused = false;
        if (F) paused = F.paused; else { try { paused = localStorage.getItem('flock-motion') === 'paused'; } catch (e) {} }
        return !reduced && !paused && !!window.requestAnimationFrame;
    }

    // Timeline, in heights of the view scrolled after the scene pins. It is the mock's: over a 4.2-view travel, card i
    // starts at 4% + 5.8% * i and takes 6%, the line comes in at 60-66% and goes at 70-76%, the pile clears at 68-78%,
    // the sea, sun and ducks come in at 76-86%
    var TRAVEL = 4.2;
    function timeline() {
        var f = TRAVEL;
        T = { a0: 0.04 * f, step: 0.058 * f, dur: 0.06 * f, ag0: 0.6 * f, ag1: 0.66 * f, ago0: 0.7 * f, ago1: 0.76 * f, cl0: 0.68 * f, cl1: 0.78 * f, ca0: 0.76 * f, ca1: 0.86 * f, end: f };
    }

    // The mock's landing spots, in percent of the view: scattered, overlapping, denser as more arrive
    var SPOTS = [[6, 8], [52, 12], [18, 34], [58, 40], [4, 58], [44, 62], [26, 16], [60, 54], [34, 46], [68, 24]];

    // Desktop: the mock's scatter, squeezed to fit above the strip kept for the line. Cards overlap on purpose; the
    // newest is on top and takes the clicks
    function layoutWall() {
        // the strip under the pile holds the line at its real size (large text makes it taller)
        var strip = Math.max(90, agony.offsetHeight + Math.round(H * 0.05) + 12);
        var cw = Math.min(420, Math.round(W * 0.82)), top = 16, limit = H - strip, scales = [1, 0.94, 0.88, 0.83];
        // a reader who enlarged their text keeps it: no shrinking, the still layout takes over if it does not fit
        if (parseFloat(getComputedStyle(doc.documentElement).fontSize) > 17) scales = [1];
        var k = 0;
        wall.style.setProperty('--pw-cw', cw + 'px');
        for (var m = 0; m < scales.length; m++) {
            wall.style.setProperty('--pw-fs', scales[m]);
            // squeeze the spots upward together until the lowest card clears the strip
            k = 1;
            cards.forEach(function (q, i) {
                var y = SPOTS[i][1] / 100 * H, h = q.offsetHeight;
                if (y + h > limit) k = Math.min(k, (limit - h - top) / Math.max(1, y - top));
            });
            if (k >= 0.8) break;
        }
        pos = cards.map(function (q, i) {
            var x = Math.min(SPOTS[i][0] / 100 * W, W - cw - 12), y = top + (SPOTS[i][1] / 100 * H - top) * Math.min(1, k);
            return { x: Math.round(Math.max(8, x)), y: Math.round(Math.max(top, y)) };
        });
        return k >= 0.8;
    }

    // Phone: the mock's cascade (each card a little to the side and lower than the one before, on top of it), fitted so
    // the last card ends above the line
    function layoutStack() {
        var cw = Math.min(420, Math.round(W * 0.82)), top = 12, strip = agony.offsetHeight + Math.round(H * 0.07) + 12, limit = H - strip;
        wall.style.setProperty('--pw-cw', cw + 'px');
        wall.style.setProperty('--pw-fs', 1);
        var step = H * 0.1;
        cards.forEach(function (q, i) { if (i) step = Math.min(step, (limit - q.offsetHeight - top) / i); });
        pos = cards.map(function (q, i) { return { x: Math.round(W * (0.04 + (i % 2) * 0.06)), y: Math.round(top + i * step) }; });
        // the cascade needs a real step, or the cards read as one block
        return step >= 24 && cards[0].offsetHeight + top <= limit;
    }

    // Still layout on a wide screen: the mock's pile, placed once from the measured card heights, with no motion.
    // Three columns that overlap by a few pixels; each card goes under the shortest column, the earlier card on top.
    function pile() {
        var wide = innerWidth >= 1240;
        wall.classList.toggle('pw-pile', wide);
        cards.forEach(function (q) { ['left', 'top'].forEach(function (k) { q.style.removeProperty(k); }); });
        if (!wide) { wall.style.removeProperty('height'); return; }
        var cw = 400, x0 = Math.round((wall.clientWidth - (3 * cw - 12)) / 2), start = [20, 72, 34], ys = start.slice(), jx = [0, 4, -2, 6, -4, 2, 0, 3, -3, 5];
        cards.forEach(function (q, i) {
            var c = ys.indexOf(Math.min.apply(null, ys));
            q.style.left = (x0 + c * (cw - 6) + jx[i % jx.length]) + 'px';
            q.style.top = ys[c] + 'px';
            ys[c] += q.offsetHeight + 2;
        });
        wall.style.height = (Math.max.apply(null, ys) + 24) + 'px';
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

    // Cards only fade and move on their own; the wall blurs as one layer
    var topIdx = -1;
    function setCard(q, i, op, tf, live, tab) {
        q.style.opacity = op.toFixed(3);
        // the first card stays focusable even while unseen: its link is where Tab enters the scene, and focus brings the card in
        q.style.visibility = op < 0.02 && i > 0 ? 'hidden' : 'visible';
        q.style.transform = tf;
        q.style.zIndex = i + 1;
        // a card that is fully there takes clicks (the newest is on top, so it wins where cards overlap)
        q.style.pointerEvents = live ? 'auto' : 'none';
        // the source link is in the tab order only on the card that is on top
        var a = q.querySelector('a');
        if (a) a.setAttribute('tabindex', tab || i === 0 ? '0' : '-1');
    }

    function render() {
        raf = 0;
        if (mode !== 'live') return;
        var s = progress();
        if (Math.abs(s - lastS) < 0.0005) return;
        lastS = s;
        var ag = span(s, T.ag0, T.ag1) * (1 - span(s, T.ago0, T.ago1)), cl = span(s, T.cl0, T.cl1), ca = span(s, T.ca0, T.ca1);
        // as in the mock: cards rise 40px as they arrive, then lift, shrink and blur out together
        var arr = cards.map(function (q, i) { return span(s, T.a0 + i * T.step, T.a0 + i * T.step + T.dur); });
        // the top card: the newest one that has fully arrived (cards land one on another, so a later one is still arriving)
        topIdx = -1;
        arr.forEach(function (a, i) { if (a > 0.95) topIdx = i; });
        cards.forEach(function (q, i) {
            var a = arr[i], p = pos[i];
            var tf = 'translate(' + p.x + 'px,' + (p.y + (1 - a) * 40 - cl * 120).toFixed(1) + 'px) rotate(var(--r, 0deg)) scale(' + (1 - cl * 0.15).toFixed(4) + ')';
            // on a phone the cards are close together, so an arriving card turns opaque early and the words never show through
            setCard(q, i, (phone ? clamp(a * 3) : a) * (1 - cl), tf, a > 0.95 && cl < 0.05, i === topIdx && cl < 0.05);
        });
        // desktop: the pile blurs away as one layer. A phone only fades and slides: a screen-sized blur over ten
        // shadowed cards is slow on cheap phones
        var blur = !phone && cl > 0 ? 'blur(' + (cl * 6).toFixed(1) + 'px)' : '';
        if (wall.style.filter !== blur) wall.style.filter = blur;
        agony.style.opacity = ag.toFixed(3);
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
        else pile();
    }

    // The element to keep in place when the layout switches, so the reader does not lose their spot
    function anchor() {
        if (mode === null) return null;
        var r = stage.getBoundingClientRect();
        if (mode === 'live' && r.top < NAV && r.bottom > NAV + 10) return { el: stage, off: 72 };
        // the block the reader is in: the last one that starts in the top quarter of the screen or above it.
        // In the lead nothing above them changes, so their place needs no help.
        var list = [root.querySelector('.pw-lead'), stage, end, root.nextElementSibling], pick = null;
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
        wall.classList.remove('pw-pile');
        cards.forEach(function (q) { ['left', 'top'].forEach(function (k) { q.style.removeProperty(k); }); });
        // in the scene the cards come and go on their own; render() puts a link in the tab order only while its card is fully shown
        links.forEach(function (a) { a.setAttribute('tabindex', '-1'); });
        view.appendChild(end);
        return layout();
    }
    // The plain layout, with every inline style the scene set taken off
    function enterStill() {
        removeEventListener('scroll', onScroll);
        root.classList.remove('pw-go', 'pw-phone');
        end.classList.remove('pw-open');
        links.forEach(function (a) { a.removeAttribute('tabindex'); });
        // take off only what the scene set: a card keeps its --r tilt, which the still layout and a later Play need
        cards.forEach(function (el) {
            ['opacity', 'visibility', 'transform', 'z-index', 'pointer-events', 'filter'].forEach(function (k) { el.style.removeProperty(k); });
        });
        deco.forEach(function (el) { ['opacity', 'transform', 'filter'].forEach(function (k) { el.style.removeProperty(k); }); if (!el.getAttribute('style')) el.removeAttribute('style'); });
        wall.removeAttribute('style'); view.removeAttribute('style'); stage.removeAttribute('style');
        if (end.parentNode !== root) root.appendChild(end);
        pile();
    }

    // Scrolls the stage to the beat where card i has arrived and sits on top, and draws it at once
    function showCard(i) {
        var top = stage.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
        // the moment card i has landed (97%), when card i + 1 has barely started
        scrollTo({ top: top - NAV + (T.a0 + i * T.step + T.dur * 0.97) * H, behavior: 'instant' });
        lastS = -1; render();
    }
    function linkIndex(a) { return links.indexOf(a); }

    var sync = guard(function () { setMode(wantLive() ? 'live' : 'still'); });

    try {
        // A keyboard user who tabs to the hidden button is taken to the answer, so focus never lands on something unseen
        cta.addEventListener('focus', guard(function () {
            if (mode !== 'live' || end.classList.contains('pw-open')) return;
            var top = stage.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
            scrollTo(0, top - NAV + (T.ca1 + 0.2) * H);
        }));
        // Tab walks the sources in order: before focus moves on, the next (or previous) card is brought into view
        links.forEach(function (a, i) {
            a.addEventListener('focus', guard(function () {
                if (mode !== 'live') return;
                lastS = -1; render();  // the page may not have drawn the latest scroll yet
                if (topIdx !== i) showCard(i);
            }));
            a.addEventListener('keydown', guard(function (e) {
                if (e.key !== 'Tab' || mode !== 'live' || e.altKey || e.ctrlKey || e.metaKey) return;
                var j = i + (e.shiftKey ? -1 : 1);
                if (j >= 0 && j < links.length) showCard(j);
            }));
        });
        cta.addEventListener('keydown', guard(function (e) {
            if (e.key === 'Tab' && e.shiftKey && mode === 'live' && links.length) showCard(links.length - 1);
        }));
        addEventListener('resize', guard(onResize));
        if (F && F.ambient) {
            // The shared system tells us about Pause and reduced motion; the view also gets .play while on screen (duck bob)
            F.ambient(view, { onchange: sync });
        } else if (mq.addEventListener) mq.addEventListener('change', sync);
        sync();
        if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(guard(function () {
            if (mode === 'live') { if (layout()) render(); else setMode('still'); } else pile();
        }));
        // only now does the inline starter in the page know the scene runs; without it the starter undoes .pw-go
        if (!broken) root.classList.add('pw-live');
    } catch (e) { fail(e); }
})();
