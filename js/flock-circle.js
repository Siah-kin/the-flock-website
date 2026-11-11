/* How page: the circle (css/flock-circle.css). On wide screens the camera follows your reading: when a step's top
   passes the middle of the window, the circle zooms to that step's scene; above the first step it shows the whole
   circle. It moves an HTML layer (translate3d and scale), which stays smooth on phones and slow machines.
   Under reduced motion or Pause the circle never moves: the step you are reading is outlined instead.
   Tapping a scene, or a line in the list under it, scrolls to that step. */
(function () {
    'use strict';
    var hc = document.querySelector('.hc');
    if (!hc) return;
    var cam = hc.querySelector('.hc-cam'), stage = hc.querySelector('.hc-stage'), list = document.querySelector('.hc-list');
    var scenes = [].slice.call(hc.querySelectorAll('.hc-scene'));
    var tocLinks = [].slice.call(hc.querySelectorAll('.hc-toc a[data-n]'));
    var steps = [].slice.call(document.querySelectorAll('.hc-list .stop[data-hc]'));
    var wide = window.matchMedia('(min-width: 1100px)'), reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var VB = { x: -40, y: -25, w: 880 }, C = 400, R = 290, SCALE = 2.1, cur = -1, ticking = false;

    function still() { return reduce.matches || document.documentElement.getAttribute('data-motion') === 'paused'; }
    function pos(n) { var a = (-90 + 45 * (n - 1)) * Math.PI / 180; return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) + 14 }; }

    function show(n) {
        if (n === cur) return;
        cur = n;
        scenes.forEach(function (s) { s.classList.toggle('on', +s.dataset.n === n); });
        tocLinks.forEach(function (l) { l.classList.toggle('on', +l.dataset.n === n); });
        var zoom = n > 0 && wide.matches && !still();
        hc.classList.toggle('hc-zoomed', zoom);
        if (!zoom) { cam.style.transform = ''; return; }
        var S = stage.clientWidth, p = pos(n);
        var qx = (p.x - VB.x) / VB.w * S, qy = (p.y - VB.y) / VB.w * S;
        cam.style.transform = 'translate3d(' + (S / 2 - SCALE * qx).toFixed(1) + 'px,' + (S / 2 - SCALE * qy).toFixed(1) + 'px,0) scale(' + SCALE + ')';
    }
    function update() {
        ticking = false;
        var mid = window.innerHeight * 0.45, n = 0;
        if (list && list.getBoundingClientRect().bottom > mid) {
            steps.forEach(function (s) { if (s.getBoundingClientRect().top <= mid) n = +s.dataset.hc; });
        }
        show(n);
    }
    // Narrow screens: one floating "Back to the circle" button, shown while you read the steps below the circle
    var back = document.querySelector('.hc-back'), fab = null;
    if (back) {
        fab = document.createElement('a');
        fab.className = 'hc-fab'; fab.href = '#how-circle'; fab.textContent = back.textContent;
        fab.addEventListener('click', function (e) { e.preventDefault(); hc.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' }); });
        document.body.appendChild(fab);
    }
    function fabUpdate() {
        if (!fab) return;
        var on = !wide.matches && hc.getBoundingClientRect().bottom < 0 && list.getBoundingClientRect().bottom > window.innerHeight * 0.6;
        fab.classList.toggle('show', on);
        fab.tabIndex = on ? 0 : -1;
    }
    function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(function () { update(); fabUpdate(); }); } }
    function redo() { cur = -1; update(); }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', redo);
    if (wide.addEventListener) { wide.addEventListener('change', redo); reduce.addEventListener('change', redo); }
    new MutationObserver(redo).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });

    scenes.concat([].slice.call(hc.querySelectorAll('.hc-toc a'))).forEach(function (a) {
        a.addEventListener('click', function (e) {
            var id = (a.getAttribute('href') || '').slice(1), target = id && document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
            try { history.replaceState(null, '', '#' + id); } catch (err) { /* the jump still happened */ }
        });
    });
    update();
    fabUpdate();
})();
