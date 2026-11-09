/* Weird events, part 2: under the water. */
(function () {
  var F = window.FlockEvents = window.FlockEvents || [], K = window.FlockEvKit, T = K.T, seg = K.seg, n = K.n;

  F.push({ id: 'shark', name: 'Shark week', dur: 7, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.f = c.g(); s.f.innerHTML = '<path d="M-22,0 C-14,-6 -4,-40 6,-44 C8,-30 14,-10 24,0 Z" fill="#5C6878" stroke="#2F3946" stroke-width="2"/><path d="M-30,1 C-10,-3 10,-3 32,1" fill="none" stroke="#DDF2FD" stroke-width="2.5" stroke-linecap="round"/>'; },
    frame: function (c, k, t, dt, s) {
      var v = s.v, cx = v.bx || v.x, r = 70 * c.k, a, x, y = c.WL + 2;
      if (t < 2.6) { a = t * 2.6; x = cx + Math.cos(a) * r * (1.6 - t / 2.6 * .6); }
      else if (t < 3) x = c.lp(s.lx || cx, cx, c.E.io(seg(t, 2.6, 3)));
      else x = cx + (t - 3) * 160;
      if (t < 2.6) s.lx = x;
      var dir = t < 2.6 ? (Math.sin(t * 2.6) > 0 ? -1 : 1) : 1;
      s.f.setAttribute('transform', T(x, y, 0, dir * c.k, c.k * (t > 5.6 ? 1 - seg(t, 5.6, 6.4) : 1)));
      if (t > .6 && !s.w) { s.w = 1; v.duck.react = { type: 'confused', start: c.R, dur: 950 }; }
      if (t > 3 && !s.g) { s.g = 1; c.grab(v); c.splash(v.x, c.WL, true); c.text(v.x, v.y - 50, 'CHOMP'); c.shake(); v.duck.e.g.setAttribute('opacity', 0); }
      if (t > 4 && !s.q) { s.q = 1; var f = c.floats(); if (f[0]) c.say(f[0], 'he was a good bot'); }
    },
    end: function (c, s) { s.v.duck.e.g.removeAttribute('opacity'); } });

  F.push({ id: 'kraken', name: 'Release the kraken', dur: 6.5, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.g = c.g(); s.g.innerHTML = '<path data-t d="" fill="#8E4FA8" stroke="#4F2163" stroke-width="3" stroke-linejoin="round"/>' + [0, 1, 2, 3].map(function (i) { return '<circle data-s="' + i + '" r="4" fill="#D9B4EA"/>'; }).join(''); },
    frame: function (c, k, t, dt, s) {
      var v = s.v, x0 = (v.bx || v.x) - 40 * c.k, h = 120 * c.k * (t < 1.4 ? c.E.back(seg(t, 0, 1.4)) : t < 3.6 ? 1 : 1 - c.E.i(seg(t, 3.6, 4.8)));
      var tip = [x0 + 40 * c.k + Math.sin(t * 3) * 6, c.WL - h], mid = [x0 - 18 * c.k + Math.sin(t * 2) * 10, c.WL - h * .5], w = 16 * c.k;
      var d = 'M' + n(x0 - w) + ',' + n(c.WL + 10) + ' Q' + n(mid[0] - w) + ',' + n(mid[1]) + ' ' + n(tip[0]) + ',' + n(tip[1]) + ' Q' + n(mid[0] + w * .6) + ',' + n(mid[1] + 8) + ' ' + n(x0 + w) + ',' + n(c.WL + 10) + ' Z';
      s.g.querySelector('[data-t]').setAttribute('d', d);
      [0, 1, 2, 3].forEach(function (i) { var u = .25 + i * .17, px = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mid[0] + u * u * tip[0], py = (1 - u) * (1 - u) * (c.WL + 10) + 2 * (1 - u) * u * mid[1] + u * u * tip[1]; s.g.querySelector('[data-s="' + i + '"]').setAttribute('transform', T(px + 3, py, 0, c.k * (1 - i * .15))); });
      if (t > 1.4 && !s.gr) { s.gr = 1; c.grab(v); c.text(v.x, v.y - 60, 'NOPE'); }
      if (s.gr) { v.x = tip[0] + 6; v.y = tip[1] + 20 * c.k; v.rot = Math.sin(t * 8) * 18; v.duck.e.g.setAttribute('opacity', v.y > c.WL + 4 ? 0 : 1); if (t > 3.6 && !s.sp && v.y > c.WL - 4) { s.sp = 1; c.splash(v.x, c.WL, true); } }
    },
    end: function (c, s) { s.v.duck.e.g.removeAttribute('opacity'); } });

  F.push({ id: 'periscope', name: 'We are being watched', dur: 7,
    start: function (c, s) { s.g = c.g(false); s.g.innerHTML = '<rect x="-4" y="0" width="8" height="70" fill="#5C6470"/><g data-h><rect x="-6" y="-12" width="26" height="14" rx="3" fill="#6E7682" stroke="#3E444E" stroke-width="2"/><circle cx="18" cy="-5" r="4.5" fill="#9EE7FF" stroke="#3E444E" stroke-width="1.5"/></g>'; s.x = c.W * .45; },
    frame: function (c, k, t, dt, s) {
      var up = t < 1 ? c.E.back(seg(t, 0, 1)) : t < 5.8 ? 1 : 1 - seg(t, 5.8, 6.6), h = 60 * c.k * up;
      s.g.setAttribute('transform', T(s.x + (t > 1 && t < 5.8 ? (t - 1) * 30 : t >= 5.8 ? 144 : 0), c.WL + 8 - h, 0, c.k));
      var look = t < 2.4 ? 1 : t < 3.4 ? -1 : t < 4.4 ? 1 : -1;
      s.g.querySelector('[data-h]').setAttribute('transform', 'scale(' + look + ' 1)');
      c.floats().forEach(function (f) { f.duck.look = [[0, s.x, c.WL - h]]; });
      if (t > 2.2 && !s.q) { s.q = 1; var f = c.floats(); if (f[0]) c.say(f[0], 'is that the SEC?'); }
    },
    end: function (c) { c.slots.forEach(function (f) { f.duck.look = null; }); } });

  F.push({ id: 'bottle', name: 'Message in a bottle', dur: 9,
    start: function (c, s) { s.g = c.g(); s.g.innerHTML = '<g data-b><path d="M-14,-6 C-14,-10 8,-10 10,-6 L16,-4 L16,4 L10,6 C8,10 -14,10 -14,6 Z" fill="#7FD1AE" opacity=".85" stroke="#3E8E6C" stroke-width="1.5"/><rect x="16" y="-3" width="6" height="6" fill="#B7793B"/><rect x="-10" y="-4" width="16" height="8" rx="2" fill="#F6F1E3"/></g><g data-n opacity="0"><rect x="-80" y="-74" width="160" height="44" rx="4" fill="#F6F1E3" stroke="#B7793B" stroke-width="2"/><text y="-56" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="12" fill="#5C3A1E">DEV WALLET MOVED</text><text y="-40" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="11" fill="#5C3A1E">rug at 3pm. act normal.</text></g>'; },
    frame: function (c, k, t, dt, s) {
      var x = c.lp(-40, c.W * .5, c.E.o(seg(t, 0, 3))) + (t > 3 ? (t - 3) * 14 : 0), y = c.WL + Math.sin(t * 2.4) * 2;
      s.g.querySelector('[data-b]').setAttribute('transform', T(x, y, Math.sin(t * 2) * 10, c.k + .2));
      var no = seg(t, 3.2, 3.6) * (1 - seg(t, 7.6, 8.2));
      var nn = s.g.querySelector('[data-n]'); nn.setAttribute('opacity', no.toFixed(2)); nn.setAttribute('transform', T(x, y, 0, c.E.back(Math.min(1, seg(t, 3.2, 3.6)))));
      if (t > 4.6 && !s.q) { s.q = 1; c.floats().forEach(function (f) { f.duck.react = { type: 'confused', start: c.R, dur: 950 }; }); var f = c.floats(); if (f[0]) c.say(f[0], 'ser...'); }
      if (t > 6 && !s.q2) { s.q2 = 1; var f2 = c.floats(); if (f2[1]) c.say(f2[1], 'act normal'); }
    } });

  F.push({ id: 'whale', name: 'Thar she blows', dur: 6, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.g = c.g(false); s.g.innerHTML = '<path d="M-90,30 C-90,-10 -40,-26 10,-26 C60,-26 90,-6 96,20 L-90,30 Z" fill="#3E6E9E" stroke="#1F3E60" stroke-width="3"/><circle cx="56" cy="-8" r="4" fill="#12304F"/><path d="M40,4 C52,10 70,10 80,4" fill="none" stroke="#1F3E60" stroke-width="3" stroke-linecap="round"/>'; s.sp = c.g(false); },
    frame: function (c, k, t, dt, s) {
      var v = s.v, x = v.bx || v.x, up = t < 1.4 ? c.E.o(seg(t, .3, 1.4)) : 1 - seg(t, 4.2, 5.4);
      s.g.setAttribute('transform', T(x, c.WL + 40 * c.k - 34 * c.k * up, 0, c.k));
      if (t > 1.4 && !s.go) { s.go = 1; c.ko(v, 40); c.text(x, c.WL - 90, 'WHOOSH'); c.shake(); }
      var so = t > 1.3 && t < 3.6 ? 1 - seg(t, 2.6, 3.6) : 0;
      if (!s.drops) { s.drops = []; for (var i = 0; i < 14; i++) { var e = c.mk('circle', { r: c.rnd(2, 5), fill: '#DDF2FD' }, s.sp); s.drops.push({ e: e, a: c.rnd(-1.2, 1.2), sp: c.rnd(.6, 1) }); } }
      s.drops.forEach(function (d) { var q = seg(t, 1.3, 3), h = 160 * c.k * d.sp * Math.sin(Math.PI * Math.min(1, q * 1.2)); d.e.setAttribute('cx', n(x + 30 * c.k + d.a * 50 * q)); d.e.setAttribute('cy', n(c.WL - 20 * c.k - h)); d.e.setAttribute('opacity', so.toFixed(2)); });
    } });

  F.push({ id: 'hook', name: 'Gone fishing', dur: 8, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.g = c.g(); s.g.innerHTML = '<path data-l d="" stroke="#E8EEF7" stroke-width="1.5"/><g data-h><path d="M0,0 L0,14 C0,22 10,22 10,14" fill="none" stroke="#C3CBD6" stroke-width="3" stroke-linecap="round"/><circle r="3" fill="#E5604F"/><rect data-w x="-9" y="8" width="18" height="10" rx="5" fill="#F0963C"/></g>'; },
    frame: function (c, k, t, dt, s) {
      var v = s.v, x = (v.bx || v.x) + 26 * c.k, top = c.top - 10, hy;
      if (t < 2.2) hy = c.lp(top, v.y - 70 * c.k, c.E.o(seg(t, 0, 2.2)));
      else if (t < 4.2) hy = v.y - 70 * c.k + Math.sin(t * 3) * 6;
      else hy = s.hy0 - c.E.i(seg(t, 4.6, 7)) * (s.hy0 - top + 120);
      if (t < 4.2) s.hy0 = hy;
      s.g.querySelector('[data-l]').setAttribute('d', 'M' + n(x) + ',' + n(top) + ' L' + n(x) + ',' + n(hy));
      s.g.querySelector('[data-h]').setAttribute('transform', T(x, hy, Math.sin(t * 2) * 6, c.k + .3));
      s.g.querySelector('[data-w]').setAttribute('opacity', s.gr ? 0 : 1);
      if (t > 2.2 && t < 4.2) v.duck.look = [[0, x, hy]];
      if (t > 3 && !s.q) { s.q = 1; c.say(v, 'free worm?'); }
      if (t > 4.2 && !s.gr) { s.gr = 1; v.duck.look = null; c.grab(v); c.text(v.x, v.y - 60, 'HOOKED'); s.vy0 = v.y; }
      if (s.gr) { v.x = x - 4; v.y = hy + 22 * c.k + 30 * c.k * seg(t, 4.2, 4.6); v.rot = Math.sin(t * 10) * 22; }
    },
    end: function (c, s) { s.v.duck.look = null; } });
})();
