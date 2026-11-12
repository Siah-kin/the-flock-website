/* A small joke in the opening flock of how/ and privacy/. One user-triggered routine; no autoplay. */
(function () {
    'use strict';
    // Portuguese pages live under /pt/ (the same test as js/nav-loader.js)
    var pt = location.pathname === '/pt' || location.pathname.indexOf('/pt/') === 0;
    var T = pt
        ? { label: 'Cutuque os patos', said: 'Pffft! O pato do meio soltou um pum. Os outros patos olham.' }
        : { label: 'Poke the ducks', said: 'Pffft! The middle duck farted. The other ducks look over.' };
    function init() {
        var F = window.Flock, host = document.querySelector('.top'), flock = host && host.querySelector('.flock');
        if (!F || !flock || !flock.querySelector('.rig')) return;
        var birds = Array.prototype.slice.call(flock.querySelectorAll(':scope > .rig'));
        if (birds.length < 3) return;
        var button = document.createElement('button');
        button.type = 'button'; button.className = 'duck-play-control';
        button.setAttribute('aria-label', T.label);
        flock.before(button); button.appendChild(flock);
        flock.setAttribute('viewBox', '-30 -55 580 190');
        flock.insertAdjacentHTML('beforeend', '<g class="duck-gas" fill="#C8E594"><ellipse cx="180" cy="76" rx="16" ry="12"/><ellipse cx="158" cy="60" rx="21" ry="17"/><ellipse cx="137" cy="42" rx="25" ry="20"/></g><text class="duck-pffft" x="110" y="8" fill="#FFF5B8" font-size="30" font-weight="700" transform="rotate(-10 110 8)">Pffft!</text>');
        var hint = document.createElement('span'); hint.className = 'duck-play-hint'; hint.setAttribute('aria-hidden', 'true'); hint.innerHTML = '<i>i</i>' + T.label; button.appendChild(hint);
        var status = document.createElement('span'); status.className = 'duck-play-status'; status.setAttribute('role', 'status'); button.after(status);
        host.classList.add('has-duck-play');
        var animations = [], run = 0;
        function clear() {
            run++;
            animations.forEach(function (a) { a.cancel(); a.effect = null; }); animations = [];
            button.classList.remove('duck-play-still', 'duck-playing');
        }
        function motion(node, frames, duration, delay) {
            var a = node.animate(frames, { duration: duration, delay: delay || 0, easing: 'linear', fill: 'both' });
            animations.push(a); return a;
        }
        function settle() {
            run++;
            animations.forEach(function (a) { a.cancel(); a.effect = null; }); animations = [];
            button.classList.remove('duck-playing'); button.classList.add('duck-play-still');
        }
        function play() {
            clear(); status.textContent = T.said;
            if (F.paused || F.reduced) { button.classList.add('duck-play-still'); return; }
            button.classList.add('duck-playing'); var token = run;
            try { window.FlockSound && FlockSound.play('pffft'); } catch (e) {}
            motion(birds[1].querySelector('.act'), [
                { transform: 'none', offset: 0 },
                { transform: 'scale(1.08,.88) rotate(-6deg)', offset: .2 },
                { transform: 'translate(15px,-12px) rotate(-12deg)', offset: .35 },
                { transform: 'translate(6px,0) rotate(3deg)', offset: .55 },
                { transform: 'none', offset: 1 }
            ], 1500);
            flock.querySelectorAll('.duck-gas ellipse').forEach(function (p, i) {
                motion(p, [{ opacity: 0, transform: 'scale(.2)' }, { opacity: .9, transform: 'translate(-6px,-3px) scale(1)', offset: .25 }, { opacity: 0, transform: 'translate(-38px,-20px) scale(1.45)' }], 1200, 350 + i * 100);
            });
            motion(flock.querySelector('.duck-pffft'), [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)', offset: .2 }, { opacity: 1, offset: .65 }, { opacity: 0, transform: 'translateY(-12px)' }], 1500, 400);
            motion(birds[0].querySelector('.head'), [{ transform: 'none' }, { transform: 'rotate(-20deg)', offset: .25 }, { transform: 'rotate(-20deg)', offset: .7 }, { transform: 'none' }], 1500, 450);
            motion(birds[2].querySelector('.pose'), [{ transform: 'none' }, { transform: 'translateX(16px) scaleX(-1)', offset: .3 }, { transform: 'translateX(16px) scaleX(-1)', offset: .75 }, { transform: 'none' }], 1500, 450);
            Promise.all(animations.map(function (a) { return a.finished.catch(function () {}); })).then(function () { if (run === token) clear(); });
        }
        button.addEventListener('click', function (e) { e.stopPropagation(); play(); });
        F.ambient(button, { onchange: function (on) { if (!on) { if (button.classList.contains('duck-playing') && (F.paused || F.reduced)) settle(); else clear(); } } });
        document.addEventListener('visibilitychange', function () { if (document.hidden) clear(); });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
