/* Weird events, part 1: the sky. Each event: { id, name, dur (s), need (free bot ducks), start(c,s), frame(c,k,t,dt,s), end(c,s) } */
(function () {
  var F = window.FlockEvents = window.FlockEvents || [];
  var n = function (v) { return v.toFixed(1); };
  var T = function (x, y, r, sx, sy) { return 'translate(' + n(x) + ' ' + n(y) + ')' + (r ? ' rotate(' + n(r) + ')' : '') + (sx != null ? ' scale(' + sx.toFixed(3) + ' ' + (sy == null ? sx : sy).toFixed(3) + ')' : ''); };
  var quad = function (a, b, cx, cy, u) { var v = 1 - u; return [v * v * a[0] + 2 * v * u * cx + u * u * b[0], v * v * a[1] + 2 * v * u * cy + u * u * b[1]]; };
  var seg = function (t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); };
  var EAGLE = '<g data-w="1"><path d="M-6,-4 C-30,-40 -70,-36 -84,-20 C-62,-22 -40,-14 -18,2 Z" fill="#4A2F17" stroke="#2E1C0B" stroke-width="2"/></g>' +
    '<path d="M-28,-2 L-52,-12 L-48,8 Z" fill="#F6F1E3" stroke="#2E1C0B" stroke-width="1.5"/><ellipse rx="31" ry="13" fill="#6B4423" stroke="#2E1C0B" stroke-width="2"/>' +
    '<circle cx="30" cy="-8" r="12" fill="#fff" stroke="#2E1C0B" stroke-width="2"/><path d="M40,-12 C51,-12 55,-5 50,1 L42,-4 Z" fill="#FED801" stroke="#C98800" stroke-width="1.5"/>' +
    '<circle cx="33" cy="-11" r="2.4" fill="#1B2A3A"/><path d="M26,-18 L39,-14" stroke="#2E1C0B" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M4,11 L2,22 M14,11 L15,22" stroke="#FED801" stroke-width="3.5" stroke-linecap="round"/>' +
    '<g data-w="2"><path d="M-4,-4 C-10,-52 30,-62 46,-52 C24,-46 14,-26 8,-2 Z" fill="#6B4423" stroke="#2E1C0B" stroke-width="2"/></g>';
  var GULL = '<g data-w="1"><path d="M-2,-2 C-14,-22 -30,-22 -40,-14 C-26,-12 -14,-6 -6,2 Z" fill="#AEB8C6" stroke="#5C6878" stroke-width="1.5"/></g><ellipse rx="18" ry="8" fill="#fff" stroke="#5C6878" stroke-width="1.5"/><circle cx="17" cy="-5" r="7" fill="#fff" stroke="#5C6878" stroke-width="1.5"/><path d="M23,-6 L32,-4 L23,-2 Z" fill="#F0963C"/><circle cx="19" cy="-7" r="1.6" fill="#1B2A3A"/><g data-w="2"><path d="M0,-2 C4,-24 22,-28 32,-22 C18,-18 10,-10 6,2 Z" fill="#C3CBD6" stroke="#5C6878" stroke-width="1.5"/></g>';
  function bird(c, html, front) { var g = c.g(front); g.innerHTML = html; return { g: g, w1: g.querySelector('[data-w="1"]'), w2: g.querySelector('[data-w="2"]') }; }
  function flap(b, t, sp, amp) { var a = Math.sin(t * sp) * amp; b.w1.setAttribute('transform', 'rotate(' + n(-a * .6) + ' 0 -2)'); b.w2.setAttribute('transform', 'rotate(' + n(a) + ' 4 -2)'); }
  window.FlockEvKit = { T: T, quad: quad, seg: seg, bird: bird, flap: flap, EAGLE: EAGLE, GULL: GULL, n: n };

  F.push({ id: 'eagle', name: 'The eagle has landed', dur: 6, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.b = bird(c, EAGLE); s.a = [c.W + 90, c.top + 30]; s.o = [-140, c.top - 20]; },
    frame: function (c, k, t, dt, s) {
      var v = s.v, E = c.E, p, k1 = seg(t, 0, 1.7), k2 = seg(t, 1.9, 4.6);
      if (t < 1.7) p = quad(s.a, [v.x - 6, v.y - 44 * c.k], v.x + 160, v.y - 30, E.io(k1));
      else if (t < 1.9) { p = [v.x - 6, v.y - 44 * c.k]; if (!s.got) { s.got = 1; c.grab(v); c.feathers(v.x, v.y - 10); c.text(v.x, v.y - 70, 'SNATCHED!'); c.shake(); } }
      else p = quad([v.x - 6, s.lastY || v.y - 44 * c.k], s.o, c.W * .4, c.top - 60, E.i(k2));
      if (t >= 1.7 && t < 1.9) s.lastY = p[1];
      if (s.got) { v.x = p[0] + 6; v.y = p[1] + 44 * c.k + (t < 1.9 ? 0 : Math.sin(t * 9) * 3); v.rot = Math.sin(t * 7) * 14; if (t > 2.4 && !s.h) { s.h = 1; c.text(v.x, v.y + 30, 'help sir'); } }
      flap(s.b, t, t > 1.9 ? 16 : 9, t > 1.9 ? 34 : 22);
      s.b.g.setAttribute('transform', T(p[0], p[1], t < 1.7 ? 12 * (1 - k1) : -10, -1.1 * c.k, 1.1 * c.k));
      if (t > 3 && !s.r) { s.r = 1; var f = c.floats(); if (f[0]) c.say(f[0], 'we lost one'); }
    } });

  F.push({ id: 'ufo', name: 'Close encounter', dur: 7.5, need: 1,
    start: function (c, s) {
      s.v = c.pick(c.floats());
      s.beam = c.g(false); s.beam.innerHTML = '<path d="M-26,0 L26,0 L70,0 L-70,0 Z" fill="#B9FFD8" opacity=".35"/>';
      s.u = c.g(); s.u.innerHTML = '<ellipse cy="6" rx="58" ry="14" fill="#8E96A3" stroke="#4A5260" stroke-width="2"/><path d="M-28,2 C-26,-26 26,-26 28,2 Z" fill="#9EE7FF" stroke="#4A5260" stroke-width="2" opacity=".9"/><ellipse cy="10" rx="40" ry="5" fill="#5C6470"/>' +
        [-40, -20, 0, 20, 40].map(function (x, i) { return '<circle data-l="' + i + '" cx="' + x + '" cy="8" r="3.5" fill="#FED801"/>'; }).join('');
    },
    frame: function (c, k, t, dt, s) {
      var v = s.v, E = c.E, hx = v.bx || v.x, top = c.top + 70, ux, uy;
      if (t < 1.4) { ux = c.lp(c.W + 100, hx, E.o(seg(t, 0, 1.4))); uy = top; }
      else if (t < 5.6) { ux = hx + Math.sin(t * 2) * 3; uy = top; }
      else { ux = hx + E.i(seg(t, 5.6, 6.6)) * (c.W + 200); uy = top - 80 * E.i(seg(t, 5.6, 6.6)); }
      s.u.setAttribute('transform', T(ux, uy, Math.sin(t * 3) * 3, c.k + .2));
      [].forEach.call(s.u.querySelectorAll('[data-l]'), function (l, i) { l.setAttribute('fill', Math.floor(t * 6 + i) % 2 ? '#FED801' : '#7CF5B0'); });
      var bo = t > 1.5 && t < 5.4 ? Math.min(1, seg(t, 1.5, 1.9)) * (1 - seg(t, 5, 5.4)) : 0;
      s.beam.setAttribute('opacity', bo.toFixed(2));
      s.beam.querySelector('path').setAttribute('d', 'M' + n(ux - 22) + ',' + n(uy + 14) + ' L' + n(ux + 22) + ',' + n(uy + 14) + ' L' + n(ux + 60) + ',' + n(c.WL + 8) + ' L' + n(ux - 60) + ',' + n(c.WL + 8) + ' Z');
      if (t > 2 && !s.g) { s.g = 1; c.grab(v); s.y0 = v.y; c.text(v.x, v.y - 60, 'wen moon?'); }
      if (s.g && t < 5.2) { var u = E.io(seg(t, 2, 5)); v.x = c.lp(hx, ux, u); v.y = c.lp(s.y0, uy + 10, u); v.rot = u * 360 * 1.5; v.duck.e.g.setAttribute('opacity', (1 - seg(t, 4.6, 5)).toFixed(2)); }
      if (t > 5.2) v.duck.e.g.setAttribute('opacity', 0);
    },
    end: function (c, s) { s.v.duck.e.g.removeAttribute('opacity'); } });

  F.push({ id: 'gull', name: 'Gull', dur: 6, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.b = bird(c, GULL); s.d = c.g(); s.d.innerHTML = '<path d="M0,-6 C4,-2 6,2 4,5 C2,8 -2,8 -4,5 C-6,2 -4,-2 0,-6 Z" fill="#fff" stroke="#C9D3E0" stroke-width="1"/>'; s.d.setAttribute('opacity', 0); },
    frame: function (c, k, t, dt, s) {
      var v = s.v, x = c.lp(-60, c.W + 60, t / 4.2), y = c.top + 50 + Math.sin(t * 2) * 10, hx = v.x + 4 * c.k, hy = v.y - 50 * c.k;
      flap(s.b, t, 11, 26); s.b.g.setAttribute('transform', T(x, y, 0, c.k));
      if (!s.drop && x > hx - (hy - y) * .3) { s.drop = { t: t, x: x, y: y }; }
      if (s.drop && !s.hit) { var dt2 = t - s.drop.t, yy = s.drop.y + 520 * dt2 * dt2, xx = c.lp(s.drop.x, hx, Math.min(1, dt2 * 1.4)); s.d.setAttribute('opacity', 1); s.d.setAttribute('transform', T(xx, yy, 0, 1.2)); if (yy >= hy) { s.hit = t; v.duck.react = { type: 'confused', start: c.R, dur: 950 }; c.text(hx, hy - 30, 'SPLAT'); } }
      if (s.hit) { s.d.setAttribute('transform', T(v.x + 4 * c.k, v.y - 50 * c.k, 0, 1.8, 1.1)); if (t - s.hit > 1.1 && !s.q) { s.q = 1; c.say(v, 'not the face'); } }
    } });

  F.push({ id: 'balloon', name: 'WAGMI airlines', dur: 10,
    start: function (c, s) {
      s.g = c.g(false);
      s.g.innerHTML = '<path d="M-40,-10 C-40,-70 40,-70 40,-10 C40,14 14,30 8,40 L-8,40 C-14,30 -40,14 -40,-10 Z" fill="#E5604F" stroke="#7A2A20" stroke-width="2"/><path d="M-14,-62 C-24,-30 -20,10 -8,40 M14,-62 C24,-30 20,10 8,40" fill="none" stroke="#FED801" stroke-width="7"/><path d="M-8,40 L-10,56 M8,40 L10,56" stroke="#5C3A1E" stroke-width="1.5"/><rect x="-14" y="56" width="28" height="18" rx="3" fill="#B7793B" stroke="#5C3A1E" stroke-width="2"/>' +
        '<path d="M14,64 C40,62 52,70 70,66" fill="none" stroke="#5C3A1E" stroke-width="1.5"/><g transform="translate(70 56)"><rect width="78" height="22" rx="3" fill="#F6F1E3" stroke="#5C3A1E" stroke-width="1.5"/><text x="39" y="16" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="14" fill="#0058A8">WAGMI</text></g>';
      s.d = c.duck({ k: 'g', s: .16 * c.k, d0: 1, front: false });
    },
    frame: function (c, k, t, dt, s) {
      var x = c.lp(-120, c.W + 160, k), y = c.top + 90 + Math.sin(t * 1.3) * 8;
      s.g.setAttribute('transform', T(x, y, Math.sin(t * 1.1) * 3, c.k * .9 + .1));
      s.d.px = x - 2; s.d.py = y + 58 * (c.k * .9 + .1); c.upd(s.d);
      if (t > 3 && !s.w) { s.w = 1; var f = c.floats(); if (f[0]) c.say(f[0], 'wagmi brother'); }
    } });

  F.push({ id: 'banner', name: 'Paid promotion', dur: 8,
    start: function (c, s) {
      s.p = c.g(); s.p.innerHTML = '<path d="M-26,0 C-26,-9 10,-11 26,-4 L30,2 C10,8 -26,8 -26,0 Z" fill="#fff" stroke="#12304F" stroke-width="2"/><path d="M-4,-2 L-16,-18 L-8,-18 L6,-2 Z" fill="#E5604F" stroke="#12304F" stroke-width="1.5"/><path d="M-24,-2 L-32,-12 L-26,-12 L-18,-2 Z" fill="#E5604F" stroke="#12304F" stroke-width="1.5"/><circle cx="16" cy="-3" r="3" fill="#9EE7FF" stroke="#12304F" stroke-width="1.5"/><rect data-pr x="29" y="-9" width="3" height="18" fill="#12304F"/>';
      s.b = c.g(); s.b.innerHTML = '<path data-r d="" fill="none" stroke="#12304F" stroke-width="1.5"/><g data-bn><rect width="150" height="30" rx="3" fill="#FED801" stroke="#12304F" stroke-width="2"/><text x="75" y="21" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="16" fill="#12304F">BUY $DUCK NOW!!</text></g>';
    },
    frame: function (c, k, t, dt, s) {
      var x = c.lp(c.W + 60, -400, t / 7), y = c.top + 60 + Math.sin(t * 2) * 5, sc = .8 + .2 * c.k;
      s.p.setAttribute('transform', T(x, y, 0, -sc, sc));
      s.p.querySelector('[data-pr]').setAttribute('height', Math.floor(t * 30) % 2 ? 18 : 4);
      var bn = s.b.querySelector('[data-bn]'), r = s.b.querySelector('[data-r]');
      if (t < 3.2) { var bx = x + 60, by = y - 12 + Math.sin(t * 6) * 3; bn.setAttribute('transform', T(bx, by, Math.sin(t * 7) * 2, sc)); r.setAttribute('d', 'M' + n(x + 26) + ',' + n(y) + ' L' + n(bx) + ',' + n(by + 14)); s.bx = bx; s.by = by; }
      else { if (!s.rip) { s.rip = 1; c.text(s.bx + 70, s.by - 10, 'RRRIP'); r.setAttribute('d', ''); s.vy = 0; } s.vy += 380 * dt; s.by = Math.min(c.WL - 20, s.by + s.vy * dt); s.bx -= 30 * dt; bn.setAttribute('transform', T(s.bx, s.by, s.by >= c.WL - 20 ? 4 : Math.sin(t * 5) * 18, sc)); if (s.by >= c.WL - 20 && !s.sp) { s.sp = 1; c.splash(s.bx + 70, c.WL, true); var f = c.floats(); if (f[0]) c.say(f[0], 'i have a proposal'); } }
    } });

  F.push({ id: 'zap', name: 'Act of god', dur: 5.5, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.cl = c.g(); s.cl.innerHTML = '<g fill="#5C6878"><circle cx="-26" r="20"/><circle cx="0" cy="-10" r="26"/><circle cx="26" r="20"/><rect x="-44" y="0" width="88" height="18" rx="9"/></g>'; s.bolt = c.g(); s.bolt.innerHTML = '<path d="M0,0 L-14,40 L2,40 L-10,86 L22,30 L6,30 L16,0 Z" fill="#FFF6A8" stroke="#FED801" stroke-width="2"/>'; s.bolt.setAttribute('opacity', 0); },
    frame: function (c, k, t, dt, s) {
      var v = s.v, x = v.x, cy = c.top + 40, o = c.E.o(seg(t, 0, .8)) * (1 - seg(t, 4.6, 5.4));
      s.cl.setAttribute('transform', T(x, cy - 30 * (1 - c.E.o(seg(t, 0, .8))), 0, c.k)); s.cl.setAttribute('opacity', o.toFixed(2));
      var on = (t > 1.3 && t < 1.42) || (t > 1.6 && t < 1.78);
      s.bolt.setAttribute('opacity', on ? 1 : 0);
      if (on) { var h = (v.y - 40 * c.k) - (cy + 14); s.bolt.setAttribute('transform', 'translate(' + n(x - 4) + ' ' + n(cy + 14) + ') scale(' + c.k.toFixed(2) + ' ' + (h / 86).toFixed(3) + ')'); }
      if (t > 1.6 && !s.hit) { s.hit = 1; c.shake(); c.text(x, v.y - 60, 'ZAP'); v.duck.e.g.style.filter = 'brightness(.25) saturate(0)'; v.duck.react = { type: 'confused', start: c.R, dur: 950 }; }
      if (t > 3 && !s.f) { s.f = 1; c.say(v, 'this is fine'); }
      if (t > 4.4) v.duck.e.g.style.filter = 'brightness(' + (0.25 + 0.75 * seg(t, 4.4, 5.4)).toFixed(2) + ')';
    },
    end: function (c, s) { s.v.duck.e.g.style.filter = ''; } });
})();
