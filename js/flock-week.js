/* Fade the four "week in your clubhouse" cards in as they scroll into view.
   Skipped when the visitor prefers reduced motion, when the Flock is paused, or without IntersectionObserver. */
(function () {
    var grid = document.querySelector('.wk-grid');
    if (!grid || !('IntersectionObserver' in window)) return;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || document.documentElement.dataset.motion === 'paused') return;
    var cards = Array.prototype.slice.call(grid.children);
    var io = new IntersectionObserver(function (list) {
        list.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.15 });
    grid.classList.add('wk-ready');
    cards.forEach(function (c) { io.observe(c); });
})();
