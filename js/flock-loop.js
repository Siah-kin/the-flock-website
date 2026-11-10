/* The loop section on the home page: five beds and five arrows come in once, in order, when the section is in view.
   Runs on the Flock runtime (js/flock-motion.js): Pause shows the finished drawing, reduced motion never hides it. */
(function () {
    'use strict';
    var F = window.Flock, el = document.querySelector('.lp-svg');
    if (!F || !el) return;
    var order = ['.lp-n1', '.lp-a1', '.lp-n2', '.lp-a2', '.lp-n3', '.lp-a3', '.lp-n4', '.lp-a4', '.lp-n5', '.lp-a5'];
    function parts() { return order.map(function (q) { return el.querySelector(q); }); }
    function clear() { parts().forEach(function (p) { if (p) p.classList.remove('on'); }); }
    if (!F.reduced && !F.paused) el.classList.add('lp-arm');
    F.scene(el, {
        threshold: 0.6,
        beats: order.map(function (q, i) { return { at: i * 440, run: function () { var p = el.querySelector(q); if (p) p.classList.add('on'); } }; }),
        reset: function () { clear(); el.classList.add('lp-arm'); },
        end: function () { el.classList.remove('lp-arm'); clear(); }
    });
})();
