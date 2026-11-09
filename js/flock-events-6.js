/* Weird events, part 6: odd moments, plus two rare ones. rare events use `weight` (default 1). */
(function () {
  var F = window.FlockEvents = window.FlockEvents || [], K = window.FlockEvKit, T = K.T, seg = K.seg, n = K.n;
  var L = function (c, a) { return a[Math.floor(Math.random() * a.length)]; };

  F.push({ id: 'whistle', name: 'Referee', dur: 7, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.g = c.g(); s.g.innerHTML = '<g data-b><rect x="-14" y="-40" width="28" height="36" rx="6" fill="#fff" stroke="#12304F" stroke-width="2"/><path d="M-14,-34 h28 M-14,-24 h28 M-14,-14 h28" stroke="#12304F" stroke-width="5"/><circle cy="-52" r="12" fill="#F2C9A0" stroke="#B7793B" stroke-width="2"/><circle cx="4" cy="-54" r="1.8" fill="#12304F"/></g><g data-c opacity="0"><rect x="16" y="-82" width="20" height="28" rx="2" fill="#E5604F" stroke="#7A2A20" stroke-width="2"/></g>'; },
    frame: function (c, k, t, dt, s) {
      var v = s.v, x = t < 1.6 ? c.lp(c.W + 40, v.x + 80 * c.k, c.E.o(seg(t, 0, 1.6))) : t < 5.4 ? v.x + 80 * c.k : c.lp(v.x + 80 * c.k, c.W + 60, c.E.i(seg(t, 5.4, 7)));
      s.g.setAttribute('transform', T(x, c.WL + Math.sin(t * 8) * (t < 1.6 || t > 5.4 ? 3 : 0), 0, c.k + .2));
      s.g.querySelector('[data-c]').setAttribute('opacity', t > 2 && t < 5.2 ? 1 : 0);
      if (t > 2 && !s.q) { s.q = 1; c.text(x, c.WL - 120, L(c, ['FWEEEET! RED CARD', 'FOUL: SPAM', 'OFFSIDE: SHILLING'])); v.duck.react = { type: 'confused', start: c.R, dur: 950 }; }
      if (t > 3.2 && !s.q2) { s.q2 = 1; c.say(v, L(c, ['i barely touched him', 'VAR pls', 'ref is paid by bears', 'i\'m appealing to the DAO'])); }
      if (t > 4.6 && !s.k) { s.k = 1; c.ko(v, 300); }
    } });

  F.push({ id: 'mirror', name: 'Self reflection', dur: 7, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); c.grab(s.v); s.d = c.duck({ k: 'g', s: c.slots[0].duck.s, d0: 1, land: false }); s.m = c.g(false); s.m.innerHTML = '<rect x="-3" y="-80" width="6" height="90" fill="#B7793B"/><rect x="-26" y="-130" width="52" height="64" rx="26" fill="#9EE7FF" stroke="#B7793B" stroke-width="4" opacity=".7"/>'; },
    frame: function (c, k, t, dt, s) {
      var v = s.v, mx = (v.bx || v.x) - 60 * c.k;
      s.m.setAttribute('transform', T(mx, c.WL + 4 + 90 * (1 - c.E.back(seg(t, 0, .8))) + 90 * c.E.i(seg(t, 6.2, 7)), 0, c.k + .2));
      v.x = v.bx || v.x; v.y = v.by || v.y; v.duck.d0 = -1;
      s.d.px = mx - (v.x - mx); s.d.py = v.y; s.d.e.g.setAttribute('opacity', (seg(t, .6, 1) * (1 - seg(t, 6, 6.4)) * .8).toFixed(2)); c.upd(s.d, [v.x, v.y - 20]);
      if (t > 1.4 && !s.q) { s.q = 1; c.say(v, L(c, ['wait. am i a bot?', 'who is that handsome devil', 'ser, is that me?'])); }
      if (t > 3.2 && !s.q2) { s.q2 = 1; v.duck.react = { type: 'confused', start: c.R, dur: 950 }; s.d.react = { type: 'confused', start: c.R, dur: 950 }; }
      if (t > 4.6 && !s.q3) { s.q3 = 1; c.say(v, L(c, ['i need to log off', 'touch grass protocol initiated', 'anyway gm'])); }
    },
    end: function (c, s) { s.v.duck.d0 = -1; c.release(s.v, 'float'); } });

  F.push({ id: 'sleep', name: 'Nap time', dur: 8,
    start: function (c, s) { s.g = c.g(); s.z = []; c.floats().forEach(function (f, i) { for (var j = 0; j < 3; j++) { var e = c.mk('text', { 'font-family': 'Fredoka,system-ui,sans-serif', 'font-weight': 700, 'font-size': 14 + j * 4, fill: '#fff' }, s.g); e.textContent = 'z'; s.z.push({ e: e, f: f, o: j * .7 + i * .3 }); } }); s.moon = c.g(false); s.moon.innerHTML = '<circle r="28" fill="#FFF6C8"/><circle cx="12" cy="-6" r="24" fill="#0058A8"/>'; },
    frame: function (c, k, t, dt, s) {
      var on = t > .6 && t < 6.8, dim = seg(t, 0, .8) * (1 - seg(t, 6.6, 7.6));
      s.moon.setAttribute('transform', T(c.W * .88, c.top + 60 + 40 * (1 - dim), 0, 1)); s.moon.setAttribute('opacity', dim.toFixed(2));
      c.floats().forEach(function (f) { f.duck.lid0 = on ? 1 : .3; });
      s.z.forEach(function (z) { var q = ((t + z.o) % 2.1) / 2.1; z.e.setAttribute('x', n(z.f.x + 20 * c.k + q * 20)); z.e.setAttribute('y', n(z.f.y - 50 * c.k - q * 40)); z.e.setAttribute('opacity', on ? (Math.sin(Math.PI * q)).toFixed(2) : 0); });
      if (t > 2 && !s.q) { s.q = 1; c.text(c.W * .6, c.WL - 120, L(c, ['BOT FARM OFFLINE', 'SERVER MAINTENANCE', 'GAS TOO HIGH, NAPPING'])); }
      if (t > 6.9 && !s.w) { s.w = 1; c.floats().forEach(function (f) { f.duck.lid0 = .3; f.duck.react = { type: 'hop', start: c.R, dur: 520 }; }); var f = c.floats(); if (f[0]) c.say(f[0], L(c, ['gm!!', 'did i miss anything', 'what year is it'])); }
    },
    end: function (c) { c.slots.forEach(function (f) { f.duck.lid0 = .3; }); } });

  F.push({ id: 'meteor', name: 'Extinction event', dur: 6.5, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.g = c.g(); s.g.innerHTML = '<path data-tr d="" stroke="#FED801" stroke-width="10" stroke-linecap="round" opacity=".5"/><g data-m><circle r="14" fill="#8E5A3A" stroke="#4A2F17" stroke-width="2.5"/><circle cx="-4" cy="-3" r="3" fill="#6B4423"/><circle cx="5" cy="4" r="2" fill="#6B4423"/></g>'; s.sh = c.g(false); s.sh.innerHTML = '<ellipse rx="40" ry="6" fill="#000" opacity=".25"/>'; },
    frame: function (c, k, t, dt, s) {
      var v = s.v, tx = v.x, ty = v.y - 10, sx = c.W + 120, sy = c.top - 80, u = c.E.i(seg(t, .6, 2.4)), x = c.lp(sx, tx, u), y = c.lp(sy, ty, u);
      s.sh.setAttribute('transform', T(tx, c.WL + 4, 0, .3 + u)); s.sh.setAttribute('opacity', t < 2.4 ? 1 : 0);
      if (t < .9 && !s.q) { s.q = 1; c.say(v, L(c, ['is that a new token?', 'ooh shiny', 'wen meteor'])); }
      if (t < 2.4) { s.g.querySelector('[data-m]').setAttribute('transform', T(x, y, t * 300, c.k + .3)); s.g.querySelector('[data-tr]').setAttribute('d', 'M' + n(x) + ',' + n(y) + ' L' + n(x + 60) + ',' + n(y - 40)); }
      else if (!s.b) { s.b = 1; s.g.innerHTML = ''; c.ko(v, -100); c.blood(tx, ty, 0); c.splash(tx, c.WL, true); c.text(tx, ty - 60, L(c, ['KABOOM', 'DINO MODE', 'EXTINCT'])); c.shake(); c.shake(); }
      if (t > 3.6 && !s.q2) { s.q2 = 1; var f = c.floats(); if (f[0]) c.say(f[0], L(c, ['bearish', 'that\'s a lot of FUD', 'the dinosaurs said the same'])); }
    } });

  F.push({ id: 'golden', name: 'The golden duck', dur: 10, weight: .08, rare: true,
    start: function (c, s) { s.d = c.duck({ k: 'y', s: c.slots[0].duck.s * 1.1, d0: -1, land: false }); s.d.e.g.style.filter = 'sepia(1) saturate(4) hue-rotate(-12deg) brightness(1.15) drop-shadow(0 0 8px #FED801)'; s.d.e.g.style.pointerEvents = 'auto'; s.d.e.g.style.cursor = 'pointer'; s.sp = c.g(); s.st = []; for (var i = 0; i < 6; i++) s.st.push(c.mk('path', { d: 'M0,-6 L1.5,-1.5 L6,0 L1.5,1.5 L0,6 L-1.5,1.5 L-6,0 L-1.5,-1.5 Z', fill: '#FFF6A8' }, s.sp)); var got = function () { if (s.got) return; s.got = c.R; c.text(s.d.px, s.d.py - 70, 'GOLDEN DUCK FOUND!'); c.text(s.d.px, s.d.py - 40, '1 in 100 visitors'); s.d.react = { type: 'happy', start: c.R, dur: 720 }; if (c.onRare) c.onRare('golden'); };
      s.d.e.g.addEventListener('click', got); if (c.control) { s.b = c.control('Catch the golden duck', got); s.b.style.width = n(96 * c.k) + 'px'; s.b.style.height = n(70 * c.k) + 'px'; } c.label('EVENT · ✨ THE GOLDEN DUCK ✨ · TAP IT'); },
    frame: function (c, k, t, dt, s) {
      var x = c.lp(c.W + 60, -80, t / 10), y = c.WL + Math.sin(t * 2) * 2;
      if (s.got) { var q = (c.R - s.got) / 1400; y -= c.E.o(Math.min(1, q)) * 120; x = s.gx = s.gx || x; s.d.e.g.setAttribute('opacity', Math.max(0, 1 - q).toFixed(2)); }
      s.d.px = x; s.d.py = y; c.upd(s.d);
      if (s.b) { s.b.style.left = n(x - 48 * c.k) + 'px'; s.b.style.top = n(y - 64 * c.k) + 'px'; }
      s.st.forEach(function (p, i) { var a = t * 2 + i, r = 30 + Math.sin(t * 3 + i) * 8; p.setAttribute('transform', T(x + Math.cos(a) * r * c.k, y - 24 * c.k + Math.sin(a) * r * .5 * c.k, t * 90, .6 + .4 * Math.sin(t * 6 + i))); });
      if (t > 1.5 && !s.q) { s.q = 1; var f = c.floats(); if (f[0]) c.say(f[0], L(c, ['is that… a real one?', 'the legends were true', 'quick, screenshot it'])); }
    } });

  F.push({ id: 'revenge', name: 'The bots strike back', dur: 6.5, need: 1, weight: .25, rare: true,
    start: function (c, s) { s.v = c.pick(c.floats()); s.r = c.g(); s.r.innerHTML = '<path d="M-11,-3 C-10,-9 -3,-12 4,-11 C10,-9 12,-3 11,3 C9,9 2,12 -4,11 C-10,9 -12,3 -11,-3 Z" fill="#8E96A3" stroke="#5C6470" stroke-width="2"/>'; s.r.setAttribute('opacity', 0); c.say(s.v, L(c, ['my turn', 'u know what, no', 'ok boomer, catch'])); },
    frame: function (c, k, t, dt, s) {
      var v = s.v, a = [v.x - 20 * c.k, v.y - 40 * c.k], th = c.thrower, b = [th.x || 80, (th.y || c.WL) - 30 * c.k];
      if (t > 1.2 && t < 2.6) { var u = seg(t, 1.2, 2.6), p = K.quad(a, b, (a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 160, u); s.r.setAttribute('opacity', 1); s.r.setAttribute('transform', T(p[0], p[1], t * 500, 1)); v.duck.react = v.duck.react || { type: 'dip', start: c.R, dur: 380 }; }
      if (t >= 2.6 && !s.h) { s.h = 1; s.r.setAttribute('opacity', 0); c.text(b[0], b[1] - 40, L(c, ['OUCH', 'BONKED BACK', 'KARMA'])); th.react = { type: 'confused', start: c.R, dur: 950 }; c.feathers(b[0], b[1]); c.shake(); }
      if (t > 3.6 && !s.q) { s.q = 1; c.say(v, L(c, ['gg', 'ez', 'now we\'re even', 'touché, duck'])); }
    } });
})();
