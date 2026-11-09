/* Weird events, part 3: crypto chaos. */
(function () {
  var F = window.FlockEvents = window.FlockEvents || [], K = window.FlockEvKit, T = K.T, seg = K.seg, n = K.n;

  F.push({ id: 'rug', name: 'Rug pull', dur: 6, need: 2,
    start: function (c, s) { s.g = c.g(false); s.g.innerHTML = '<rect data-r x="0" y="-6" width="0" height="12" rx="3" fill="#A63A2C"/><g data-p fill="none" stroke="#FED801" stroke-width="2"></g>'; s.x0 = c.W * .52; s.x1 = c.W * .96; },
    frame: function (c, k, t, dt, s) {
      var r = s.g.querySelector('[data-r]'), w = s.x1 - s.x0, y = c.WL + 6;
      if (t < 1.6) { r.setAttribute('x', n(s.x0)); r.setAttribute('width', n(w * c.E.o(seg(t, 0, 1)))); r.setAttribute('y', n(y - 6)); }
      if (t > 1 && !s.q) { s.q = 1; var f = c.floats(); if (f[0]) c.say(f[0], 'comfy rug'); }
      if (t > 2.4 && !s.y) { s.y = 1; c.text(s.x1 - 20, y - 70, 'YANK'); c.shake(); c.floats().forEach(function (f, i) { c.ko(f, -240 - i * 40); }); }
      if (t >= 2.4) { var q = c.E.i(seg(t, 2.4, 3.2)); r.setAttribute('x', n(s.x0 + q * (c.W + 40 - s.x0))); r.setAttribute('width', n(w * (1 - q * .5))); }
      if (t > 3.6 && !s.d) { s.d = 1; c.text(c.W * .5, c.WL - 120, 'DEV IS AFK'); }
    } });

  F.push({ id: 'airdrop', name: 'Airdrop confirmed', dur: 8, need: 1,
    start: function (c, s) { s.g = c.g(); s.g.innerHTML = '<g data-ch><path d="M-34,0 C-34,-30 34,-30 34,0 C24,-6 12,-6 0,0 C-12,-6 -24,-6 -34,0 Z" fill="#FED801" stroke="#12304F" stroke-width="2"/><path d="M-30,0 L-12,40 M30,0 L12,40" stroke="#12304F" stroke-width="1.2"/></g><g data-cr><rect x="-16" y="38" width="32" height="26" rx="3" fill="#B7793B" stroke="#5C3A1E" stroke-width="2"/><path d="M-16,46 h32 M-16,56 h32" stroke="#5C3A1E" stroke-width="1.5"/><text y="56" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="9" fill="#FED801">FREE</text></g><g data-in opacity="0"><text y="20" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="22"> </text><text y="-6" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="13" fill="#fff" stroke="#12304F" stroke-width="4" paint-order="stroke">1 rock. enjoy.</text></g>'; s.x = c.W * .7; },
    frame: function (c, k, t, dt, s) {
      var y = Math.min(c.WL - 64 * c.k, c.lp(c.top - 60, c.WL, t / 3.4)), landed = y >= c.WL - 64 * c.k;
      s.g.setAttribute('transform', T(s.x + Math.sin(t * 2) * (landed ? 0 : 10), y, landed ? 0 : Math.sin(t * 2) * 8, c.k));
      s.g.querySelector('[data-ch]').setAttribute('opacity', landed ? Math.max(0, 1 - (t - 3.4) * 3) : 1);
      c.floats().forEach(function (f) { f.duck.look = [[0, s.x, y + 50]]; });
      if (t > .8 && !s.q) { s.q = 1; var f = c.floats(); if (f[0]) c.say(f[0], 'AIRDROP!!'); }
      if (landed && !s.o) { s.o = 1; c.splash(s.x, c.WL, true); }
      if (t > 4.6) { s.g.querySelector('[data-cr]').setAttribute('opacity', 0); var io = s.g.querySelector('[data-in]'); io.setAttribute('opacity', 1); io.setAttribute('transform', T(0, 40, 0, c.E.back(seg(t, 4.6, 5)))); }
      if (t > 5.6 && !s.q2) { s.q2 = 1; var f2 = c.floats(); if (f2[0]) c.say(f2[0], 'where is my reward sir?'); }
    },
    end: function (c) { c.slots.forEach(function (f) { f.duck.look = null; }); } });

  F.push({ id: 'inflate', name: 'Market cap inflation', dur: 6, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.s0 = s.v.duck.s; },
    frame: function (c, k, t, dt, s) {
      var v = s.v, d = v.duck;
      if (t < 3.2) { d.s = s.s0 * (1 + 1.4 * c.E.io(seg(t, .4, 3.2))) + Math.sin(t * 30) * .008 * seg(t, 2.2, 3.2); if (t > 1 && !s.q) { s.q = 1; c.say(v, 'number go up'); } }
      else if (!s.p) { s.p = 1; d.s = s.s0; c.grab(v); d.e.g.setAttribute('opacity', 0); c.text(v.x, v.y - 60, 'POP'); c.feathers(v.x, v.y - 20); c.feathers(v.x, v.y - 20); c.shake(); }
      if (t > 4.4 && !s.q2) { s.q2 = 1; var f = c.floats(); if (f[0]) c.say(f[0], 'priced in'); }
    },
    end: function (c, s) { s.v.duck.s = s.s0; s.v.duck.e.g.removeAttribute('opacity'); } });

  F.push({ id: 'clones', name: 'Sybil attack', dur: 7.5, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.cl = []; },
    frame: function (c, k, t, dt, s) {
      var v = s.v;
      if (s.cl.length < 10 && t > .6 + s.cl.length * .28) { var d = c.duck({ k: 'g', s: c.slots[0].duck.s * c.rnd(.7, 1), d0: Math.random() < .5 ? -1 : 1, land: false }); d.px = v.x; d.py = v.y; d.tx = c.rnd(c.W * .3, c.W * .98); d.ty = v.y + c.rnd(-6, 8); d.t0 = t; s.cl.push(d); if (s.cl.length === 1) c.say(v, 'we are many'); }
      s.cl.forEach(function (d, i) { var q = c.E.o(seg(t, d.t0, d.t0 + .7)), out = seg(t, 5.6, 6.6); d.px = c.lp(v.x, d.tx, q); d.py = c.lp(v.y, d.ty, q) - Math.sin(Math.PI * q) * 30; d.e.g.setAttribute('opacity', (1 - out).toFixed(2)); c.upd(d); });
      if (t > 4.4 && !s.q) { s.q = 1; c.text(c.W * .6, c.WL - 110, '11 ACCOUNTS · 1 OPINION'); }
      if (t > 5.6 && !s.b) { s.b = 1; c.text(v.x, v.y - 60, 'BANNED'); }
    } });

  F.push({ id: 'modhand', name: 'Moderator intervention', dur: 6, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.g = c.g(); s.g.innerHTML = '<path d="M-30,-200 L-30,-30 C-30,-10 -20,0 0,0 C20,0 30,-10 30,-30 L30,-200 Z" fill="#F2C9A0" stroke="#B7793B" stroke-width="2.5"/><path d="M-30,-60 h60" stroke="#B7793B" stroke-width="1.5"/><path d="M-36,-200 h72 v40 h-72 z" fill="#0058A8"/><text x="0" y="-174" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="14" fill="#fff">MOD</text><path d="M-14,-6 C-10,2 10,2 14,-6" fill="none" stroke="#B7793B" stroke-width="2"/>'; c.say(s.v, 'click my link'); },
    frame: function (c, k, t, dt, s) {
      var v = s.v, x = v.x + 18 * c.k, yd = v.y - 46 * c.k, y;
      if (t < 1.4) y = c.lp(c.top - 40, yd, c.E.io(seg(t, .3, 1.4)));
      else if (t < 1.7) y = yd;
      else y = c.lp(yd, c.top - 60, c.E.i(seg(t, 1.8, 2.8)));
      s.g.setAttribute('transform', T(x, y, t > 1.4 && t < 1.8 ? -20 * Math.sin(Math.PI * seg(t, 1.4, 1.8)) : 0, c.k + .2));
      if (t > 1.6 && !s.f) { s.f = 1; c.ko(v, 520); c.text(v.x, v.y - 60, 'FLICK'); c.shake(); }
      if (t > 3 && !s.q) { s.q = 1; var f = c.floats(); if (f[0]) c.say(f[0], 'rules are rules'); }
    } });

  F.push({ id: 'gravity', name: 'Gravity is optional', dur: 7, need: 1,
    start: function (c, s) { s.list = c.floats().map(function (f) { c.grab(f); return { f: f, y0: f.y, x0: f.x, sp: c.rnd(-60, 60) }; }); c.text(c.W * .55, c.WL - 120, 'GRAVITY.EXE HAS STOPPED'); },
    frame: function (c, k, t, dt, s) {
      s.list.forEach(function (o, i) { var up = c.E.io(seg(t, .4 + i * .2, 3)), dn = c.E.back(seg(t, 4.6, 5.6)); o.f.y = o.y0 - up * (1 - dn) * (90 + i * 30) * c.k; o.f.x = o.x0 + Math.sin(t * 1.4 + i) * 14 * (1 - dn); o.f.rot = (t * o.sp) * (1 - dn); });
      if (t > 1.6 && !s.q) { s.q = 1; c.say(s.list[0].f, 'bullish on air'); }
      if (t > 5.4 && !s.l) { s.l = 1; s.list.forEach(function (o) { c.splash(o.f.x, c.WL, true); o.f.rot = 0; }); }
    },
    end: function (c, s) { s.list.forEach(function (o) { o.f.y = o.y0; c.release(o.f, 'float'); }); } });
})();
