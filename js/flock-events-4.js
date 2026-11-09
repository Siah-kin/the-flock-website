/* Weird events, part 4: social media nonsense. */
(function () {
  var F = window.FlockEvents = window.FlockEvents || [], K = window.FlockEvKit, T = K.T, seg = K.seg, n = K.n;
  var L = function (c, a) { return a[Math.floor(Math.random() * a.length)]; };

  F.push({ id: 'bluecheck', name: 'Verification revoked', dur: 6, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.g = c.g(); s.g.innerHTML = '<circle r="11" fill="#1D9BF0" stroke="#fff" stroke-width="2.5"/><path d="M-5,0 L-1,4 L6,-4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'; s.y = 0; s.vy = 0; c.say(s.v, L(c, ['i am verified', 'official account btw', 'trust me, blue check'])); },
    frame: function (c, k, t, dt, s) {
      var v = s.v, hx = v.x + 6 * c.k, hy = v.y - 74 * c.k;
      if (t < 2) { s.g.setAttribute('transform', T(hx, hy + Math.sin(t * 4) * 2, 0, c.k + .1)); s.x = hx; s.yy = hy; }
      else { if (!s.f) { s.f = 1; c.text(hx, hy - 20, L(c, ['$8 EXPIRED', 'CHECK BOUNCED', 'UNVERIFIED'])); s.vy = -120; } s.vy += 900 * dt; s.yy = Math.min(c.WL, s.yy + s.vy * dt); s.x += 40 * dt; s.g.setAttribute('transform', T(s.x, s.yy, (t - 2) * 400, c.k + .1)); if (s.yy >= c.WL && !s.sp) { s.sp = 1; c.splash(s.x, c.WL, false); v.duck.react = { type: 'confused', start: c.R, dur: 950 }; } }
      if (t > 3.6 && !s.q) { s.q = 1; c.say(v, L(c, ['identity crisis', 'who am i now', 'pls verify me admin'])); }
    } });

  F.push({ id: 'bread', name: 'Free bread', dur: 7.5,
    start: function (c, s) { s.g = c.g(); s.p = []; for (var i = 0; i < 14; i++) { var e = c.mk('g', {}, s.g); e.innerHTML = '<path d="M-9,-6 C-9,-11 9,-11 9,-6 L8,6 L-8,6 Z" fill="#E8B26A" stroke="#9A6A2E" stroke-width="1.5"/><path d="M-7,-5 h14" stroke="#F6D9A8" stroke-width="2" stroke-linecap="round"/>'; s.p.push({ e: e, x: c.rnd(c.W * .45, c.W * .98), t0: c.rnd(0, 3.2), sp: c.rnd(-200, 200), eat: false }); } c.label('Free bread'); },
    frame: function (c, k, t, dt, s) {
      var f = c.floats();
      s.p.forEach(function (p) {
        var q = t - p.t0, y = c.lp(c.top - 20, c.WL - 4, Math.min(1, q / 1.8)), on = q > 0 && !p.eat;
        if (q > 1.8 && !p.eat) { var near = f.filter(function (d) { return Math.abs(d.x - p.x) < 60; })[0]; if (near && q > 2.2) { p.eat = true; near.duck.react = { type: 'quack', start: c.R, dur: 280 }; if (Math.random() < .5) c.say(near, L(c, ['nom', 'more pls', 'is this bread from the team?'])); } }
        p.e.setAttribute('opacity', on ? 1 : 0); if (on) p.e.setAttribute('transform', T(p.x + Math.sin(q * 3) * 8, y, q < 1.8 ? q * p.sp : 0, c.k + .2));
      });
      f.forEach(function (d) { var tg = s.p.filter(function (p) { return !p.eat && t - p.t0 > 1.8; })[0]; d.duck.look = tg ? [[0, tg.x, c.WL]] : null; });
    },
    end: function (c) { c.slots.forEach(function (f) { f.duck.look = null; }); } });

  F.push({ id: 'rocket', name: 'To the moon', dur: 6.5, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.g = c.g(false); s.g.innerHTML = '<g data-fl><path d="M-8,0 C-10,16 0,30 0,30 C0,30 10,16 8,0 Z" fill="#FED801"/><path d="M-4,0 C-5,10 0,18 0,18 C0,18 5,10 4,0 Z" fill="#E5604F"/></g><rect x="-11" y="-46" width="22" height="46" rx="4" fill="#F6F1E3" stroke="#12304F" stroke-width="2"/><path d="M-11,-46 C-11,-62 11,-62 11,-46 Z" fill="#E5604F" stroke="#12304F" stroke-width="2"/><path d="M-11,-12 L-20,2 L-11,0 Z M11,-12 L20,2 L11,0 Z" fill="#E5604F" stroke="#12304F" stroke-width="1.5"/><circle cy="-30" r="5" fill="#9EE7FF" stroke="#12304F" stroke-width="1.5"/>'; c.say(s.v, L(c, ['brb moon', 'see u on the moon', 'strapping in', 'ser, this is the way'])); },
    frame: function (c, k, t, dt, s) {
      var v = s.v, x = v.bx || v.x, y;
      if (t < 1.4) y = c.WL + 60 - c.E.o(seg(t, 0, 1.4)) * 60;
      else if (t < 2.2) y = c.WL + Math.sin(t * 60) * 2;
      else y = c.WL - c.E.i(seg(t, 2.2, 4.2)) * (c.WL - c.top + 200);
      s.g.setAttribute('transform', T(x - 20 * c.k, y, t > 2.2 ? Math.sin(t * 20) * 3 : 0, c.k + .2));
      s.g.querySelector('[data-fl]').setAttribute('transform', 'scale(1 ' + (t > 1.4 ? (1 + Math.sin(t * 40) * .3) : 0).toFixed(2) + ')');
      if (t > 2.2 && !s.g2) { s.g2 = 1; c.grab(v); c.splash(x, c.WL, true); c.text(x, c.WL - 80, L(c, ['LIFTOFF', '3… 2… 1… PUMP', 'NUMBER GO UP'])); c.shake(); }
      if (s.g2) { v.x = x - 20 * c.k + 16 * c.k; v.y = y - 50 * c.k; v.rot = -8; }
      if (t > 4.6 && !s.q) { s.q = 1; c.text(c.W * .6, c.top + 40, L(c, ['DID NOT REACH MOON', 'MOON MISSION: DELAYED', 'ROADMAP SAYS Q5'])); }
    } });

  F.push({ id: 'fog', name: 'Fog of FUD', dur: 7,
    start: function (c, s) { s.g = c.g(); s.b = []; for (var i = 0; i < 9; i++) { var e = c.mk('ellipse', { rx: c.rnd(90, 150), ry: c.rnd(24, 40), fill: '#E8EEF7' }, s.g); s.b.push({ e: e, x: c.rnd(-100, c.W), y: c.WL - c.rnd(10, 80), sp: c.rnd(20, 50) }); } s.lab = c.g(); s.lab.innerHTML = '<text text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="20" fill="#5C6878" letter-spacing="2">F · U · D</text>'; },
    frame: function (c, k, t, dt, s) {
      var o = Math.min(.85, seg(t, 0, 1.4) * .85) * (1 - seg(t, 5.6, 7));
      s.b.forEach(function (b) { b.x += b.sp * dt; b.e.setAttribute('cx', n(b.x)); b.e.setAttribute('cy', n(b.y + Math.sin(t + b.x) * 4)); b.e.setAttribute('opacity', o.toFixed(2)); });
      s.lab.setAttribute('opacity', (o * (Math.sin(t * 2) * .3 + .7)).toFixed(2)); s.lab.setAttribute('transform', T(c.W * .7, c.WL - 60, 0, 1));
      if (t > 2 && !s.q) { s.q = 1; var f = c.floats(); if (f[0]) c.say(f[0], L(c, ['can\'t see the chart', 'is it a dip?', 'hold the line, can\'t find the line', 'who turned off the hopium'])); }
      if (t > 4 && !s.q2) { s.q2 = 1; var f2 = c.floats(); if (f2[1]) c.say(f2[1], L(c, ['i heard a rumour', 'source: trust me', 'fud detected'])); }
    } });

  F.push({ id: 'disco', name: 'Bull market party', dur: 8,
    start: function (c, s) { s.g = c.g(false); s.g.innerHTML = '<line data-st x1="0" y1="0" x2="0" y2="0" stroke="#C3CBD6" stroke-width="1.5"/><g data-ball><circle r="22" fill="#C3CBD6" stroke="#5C6878" stroke-width="2"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<rect x="' + (-18 + i * 6) + '" y="-18" width="5" height="36" fill="#fff" opacity=".35"/>'; }).join('') + '</g>'; s.sp = c.g(false); s.dots = []; for (var i = 0; i < 18; i++) s.dots.push(c.mk('circle', { r: c.rnd(3, 7), fill: ['#FED801', '#E5604F', '#7CF5B0', '#9EE7FF', '#D9B4EA'][i % 5] }, s.sp)); },
    frame: function (c, k, t, dt, s) {
      var x = c.W * .66, y = c.top + 70 * seg(t, 0, 1) * (1 - seg(t, 7, 8));
      s.g.querySelector('[data-st]').setAttribute('x1', x); s.g.querySelector('[data-st]').setAttribute('x2', x); s.g.querySelector('[data-st]').setAttribute('y1', c.top - 10); s.g.querySelector('[data-st]').setAttribute('y2', y);
      s.g.querySelector('[data-ball]').setAttribute('transform', T(x, y + 22, t * 60, c.k + .3));
      var on = t > 1 && t < 7;
      s.dots.forEach(function (d, i) { var a = t * 1.4 + i * .9, r = 120 + (i % 4) * 60; d.setAttribute('cx', n(x + Math.cos(a) * r)); d.setAttribute('cy', n(c.WL - 30 + Math.sin(a * 1.3) * 80)); d.setAttribute('opacity', on ? (.5 + Math.sin(t * 8 + i) * .3).toFixed(2) : 0); });
      if (on) c.floats().forEach(function (f, i) { if (!f.dj || c.R - f.dj > 520) { f.dj = c.R; f.duck.react = { type: 'hop', start: c.R, dur: 520 }; } });
      if (t > 1.4 && !s.q) { s.q = 1; var f = c.floats(); if (f[0]) c.say(f[0], L(c, ['up only', 'party till the top', 'never selling', 'this time is different'])); }
      if (t > 6.6 && !s.q2) { s.q2 = 1; c.text(c.W * .6, c.WL - 120, L(c, ['…AND THE MUSIC STOPS', 'BEAR SEASON', 'LIQUIDITY HAS LEFT THE PARTY'])); }
    } });

  F.push({ id: 'pirate', name: 'Seed phrase pirates', dur: 9,
    start: function (c, s) { s.g = c.g(false); s.g.innerHTML = '<path d="M-60,0 L60,0 L44,22 L-46,22 Z" fill="#6B4423" stroke="#2E1C0B" stroke-width="2"/><rect x="-2" y="-80" width="4" height="80" fill="#2E1C0B"/><path d="M2,-76 C34,-66 34,-26 2,-14 Z" fill="#F6F1E3" stroke="#2E1C0B" stroke-width="1.5"/><rect x="-2" y="-96" width="30" height="18" fill="#12304F"/><circle cx="13" cy="-88" r="4" fill="#fff"/><path d="M8,-82 L18,-82" stroke="#fff" stroke-width="2"/>'; s.p = c.duck({ k: 'g', s: .3 * c.k, d0: -1, front: false }); s.hat = c.g(false); s.hat.innerHTML = '<path d="M-20,0 C-14,-16 14,-16 20,0 Z" fill="#12304F"/><circle cy="-7" r="3" fill="#fff"/>'; },
    frame: function (c, k, t, dt, s) {
      var x = c.lp(c.W + 120, c.W * .78, c.E.o(seg(t, 0, 2.5))) + (t > 6.5 ? c.E.i(seg(t, 6.5, 9)) * 400 : 0), y = c.WL - 8 + Math.sin(t * 1.6) * 3, sc = c.k + .1;
      s.g.setAttribute('transform', T(x, y, Math.sin(t * 1.4) * 3, sc));
      s.p.px = x - 30 * sc; s.p.py = y; c.upd(s.p);
      s.hat.setAttribute('transform', T(s.p.px - 10 * sc, y - 40 * c.k, -10, c.k * .9));
      if (t > 2.6 && !s.q) { s.q = 1; c.text(x - 30, y - 100, L(c, ['ARR. YOUR SEED PHRASE', 'ARR. CONNECT WALLET', 'ARR. CLAIM YOUR PRIZE'])); }
      if (t > 4 && !s.q2) { s.q2 = 1; var f = c.floats(); if (f[0]) c.say(f[0], L(c, ['never share it', 'nice try matey', 'mods, pirate', 'reported to the bot'])); }
      if (t > 5.4 && !s.q3) { s.q3 = 1; c.thrower.react = { type: 'shake', start: c.R, dur: 700 }; }
    } });
})();
