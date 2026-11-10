/* Weird events, part 5: weather, officials and time. */
(function () {
  var F = window.FlockEvents = window.FlockEvents || [], K = window.FlockEvKit, T = K.T, seg = K.seg, n = K.n;
  var L = function (c, a) { return a[Math.floor(Math.random() * a.length)]; };

  F.push({ id: 'snow', name: 'Crypto winter', dur: 8,
    start: function (c, s) { s.g = c.g(); s.f = []; for (var i = 0; i < 40; i++) s.f.push({ e: c.mk('circle', { r: c.rnd(1.5, 3.5), fill: '#fff' }, s.g), x: c.rnd(0, c.W), y: c.rnd(-200, 0), sp: c.rnd(40, 90), ph: c.rnd(0, 6) }); s.caps = c.floats().map(function (f) { var e = c.mk('ellipse', { rx: 0, ry: 0, fill: '#fff' }, s.g); return { f: f, e: e }; }); },
    frame: function (c, k, t, dt, s) {
      var o = seg(t, 0, .8) * (1 - seg(t, 7, 8));
      s.f.forEach(function (p) { p.y += p.sp * dt; if (p.y > c.WL) p.y = c.top - 10; p.e.setAttribute('cx', n(p.x + Math.sin(t + p.ph) * 14)); p.e.setAttribute('cy', n(Math.max(c.top, p.y + c.top))); p.e.setAttribute('opacity', o.toFixed(2)); });
      s.caps.forEach(function (o2) { var q = seg(t, 1, 5) * (1 - seg(t, 7, 8)); o2.e.setAttribute('cx', n(o2.f.x + 6 * c.k)); o2.e.setAttribute('cy', n(o2.f.y - 62 * c.k)); o2.e.setAttribute('rx', n(14 * c.k * q)); o2.e.setAttribute('ry', n(6 * c.k * q)); });
      if (t > 2 && !s.q) { s.q = 1; var f = c.floats(); if (f[0]) c.say(f[0], L(c, ['winter is here', 'down bad', 'my portfolio is frozen too', 'build in the bear, they said'])); }
      if (t > 4.4 && !s.q2) { s.q2 = 1; var f2 = c.floats(); if (f2[1]) c.say(f2[1], L(c, ['ser it\'s cold', 'need a heater (bullish)', 'hodl for warmth'])); }
    } });

  F.push({ id: 'rain', name: 'Red candles', dur: 7,
    start: function (c, s) { s.g = c.g(); s.d = []; for (var i = 0; i < 26; i++) s.d.push({ e: c.mk('rect', { width: 6, height: c.rnd(20, 50), rx: 1.5, fill: '#E5604F' }, s.g), w: c.mk('line', { stroke: '#E5604F', 'stroke-width': 1.5 }, s.g), x: c.rnd(0, c.W), y: c.rnd(-400, 0), sp: c.rnd(260, 420) }); },
    frame: function (c, k, t, dt, s) {
      var o = seg(t, 0, .6) * (1 - seg(t, 6, 7));
      s.d.forEach(function (p) { p.y += p.sp * dt; if (p.y > c.WL - c.top) { p.y = -50; if (Math.random() < .3) c.splash(p.x, c.WL, false); } var y = p.y + c.top; p.e.setAttribute('x', n(p.x - 3)); p.e.setAttribute('y', n(y)); p.e.setAttribute('opacity', o.toFixed(2)); p.w.setAttribute('x1', n(p.x)); p.w.setAttribute('x2', n(p.x)); p.w.setAttribute('y1', n(y - 8)); p.w.setAttribute('y2', n(y + 60)); p.w.setAttribute('opacity', (o * .7).toFixed(2)); });
      if (t > 1.6 && !s.q) { s.q = 1; var f = c.floats(); if (f[0]) c.say(f[0], L(c, ['healthy correction', 'buy the dip!', 'it\'s just a retest', 'weak hands out'])); }
      if (t > 3.6 && !s.q2) { s.q2 = 1; var f2 = c.floats(); if (f2[1]) c.say(f2[1], L(c, ['which dip', 'all the dips', 'i\'m out of dips', 'mom come pick me up'])); }
    } });

  F.push({ id: 'taxman', name: 'Tax season', dur: 8, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.d = c.duck({ k: 'g', s: .4 * c.k, d0: -1, land: false, front: false }); s.x = c.W + 60; s.hat = c.g(false); s.hat.innerHTML = '<rect x="-12" y="-26" width="24" height="22" fill="#12304F"/><rect x="-18" y="-6" width="36" height="5" rx="2" fill="#12304F"/><rect x="-12" y="-10" width="24" height="4" fill="#A63A2C"/>'; s.cl = c.g(false); s.cl.innerHTML = '<rect x="-12" y="-16" width="24" height="30" rx="2" fill="#F6F1E3" stroke="#5C3A1E" stroke-width="2"/><path d="M-7,-8 h14 M-7,-2 h14 M-7,4 h10" stroke="#5C3A1E" stroke-width="1.5"/>'; },
    frame: function (c, k, t, dt, s) {
      var v = s.v, tx = v.x + 64 * c.k;
      s.x = t < 2 ? c.lp(c.W + 60, tx, c.E.o(seg(t, 0, 2))) : t < 6 ? tx : c.lp(tx, c.W + 80, c.E.i(seg(t, 6, 8)));
      s.d.px = s.x; s.d.py = v.y; s.d.turns = null; s.d.d0 = t > 6 ? 1 : -1; c.upd(s.d, [v.x, v.y - 30]);
      s.hat.setAttribute('transform', T(s.x + 6 * c.k * (t > 6 ? 1 : -1), v.y - 60 * c.k, 0, c.k));
      s.cl.setAttribute('transform', T(s.x - 30 * c.k * (t > 6 ? -1 : 1), v.y - 30 * c.k, -8, c.k));
      if (t > 2.2 && !s.q) { s.q = 1; c.text(s.x, v.y - 90, L(c, ['UNREPORTED GAINS?', 'FORM 8949, PLEASE', 'WE NEED TO TALK'])); }
      if (t > 3.6 && !s.q2) { s.q2 = 1; c.say(v, L(c, ['what gains', 'i only had losses', 'it was a gift', 'i am a duck, sir'])); v.duck.react = { type: 'confused', start: c.R, dur: 950 }; }
      if (t > 5.2 && !s.q3) { s.q3 = 1; v.duck.react = { type: 'shake', start: c.R, dur: 700 }; c.text(tx, v.y - 90, '-30% FEATHERS'); c.feathers(v.x, v.y - 20); }
    } });

  F.push({ id: 'fakeadmin', name: 'Fake admin', dur: 8, need: 1,
    start: function (c, s) {
      s.v = c.pick(c.floats()); s.d = c.duck({ k: 'g', s: c.slots[0].duck.s, d0: -1, land: false });
      s.tag = c.g(); s.tag.innerHTML = '<rect x="-30" y="-10" width="60" height="18" rx="9" fill="#A63A2C"/><text y="3" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="11" fill="#fff">ADMlN</text>';
      s.chk = c.g(); s.chk.innerHTML = '<rect x="-58" y="-16" width="116" height="30" rx="8" fill="#0E1621" stroke="#8EC4FA" stroke-width="1.5"/><text y="4" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-weight="700" font-size="12" fill="#FED801">Not on the team</text>'; s.chk.setAttribute('opacity', 0);
    },
    frame: function (c, k, t, dt, s) {
      var v = s.v, x = t < 1.6 ? c.lp(c.W + 60, v.x + 70 * c.k, c.E.o(seg(t, 0, 1.6))) : t < 5.6 ? v.x + 70 * c.k : c.lp(v.x + 70 * c.k, c.W + 80, c.E.i(seg(t, 5.6, 7.6)));
      s.d.px = x; s.d.py = v.y; s.d.d0 = t > 5.6 ? 1 : -1; c.upd(s.d, [v.x, v.y]);
      s.tag.setAttribute('transform', T(x, v.y - 66 * c.k, 0, c.k + .1));
      if (t > 1.8 && !s.q) { s.q = 1; var b = c.g(); b.innerHTML = '<rect x="-90" y="-40" width="180" height="26" rx="13" fill="#fff"/><text y="-22" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="12" font-weight="600" fill="#12304F">' + L(c, ['hi, i\'m admin. dm me your seed', 'support here. verify your wallet', 'you won! connect to claim']) + '</text>'; s.b = b; }
      if (s.b) { s.b.setAttribute('transform', T(x - 40, v.y - 96 * c.k, 0, 1)); s.b.setAttribute('opacity', t < 3.6 ? 1 : 0); }
      if (t > 3.6) { s.chk.setAttribute('opacity', t < 5.8 ? 1 : 0); s.chk.setAttribute('transform', T(v.x, v.y - 90 * c.k, 0, c.E.back(Math.min(1, seg(t, 3.6, 4))))); }
      if (t > 4.2 && !s.q2) { s.q2 = 1; c.say(v, L(c, ['forwarded it to the bot', 'the l is an i, nice try', 'not today, scammer', 'checked: fake'])); }
      if (t > 5.6 && !s.q3) { s.q3 = 1; c.text(x, v.y - 90, L(c, ['EXPOSED', 'SCAM DENIED'])); }
    } });

  /* Spot the fake admin. The bots go quiet for a round and two or three ducks each hold a team DM. One is the real team, the rest are
     fakes. Bonking a fake counts as usual; the real team takes the rock without harm and answers softly. When the round ends, the
     bar under the pond names the tell. Every word is in js/flock-lines.js (fakeRound, fakeSoft, fakeLink). The older passive
     event above ('fakeadmin') stays in this file, switched off, because this round tells the same story. */
  var lastPairs = [];
  F.push({ id: 'spotfake', name: 'Spot the fake admin', dur: 14, need: 2, quiet: true,
    start: function (c, s) {
      var LN = window.FlockLines || {}, P = LN.fakeRound || [], fl = c.floats().slice().sort(function (a, b) { return a.bx - b.bx; });
      if (P.length < 2 || fl.length < 2) { s.finish = true; return; }
      var n = Math.min(fl.length, c.W < 700 ? 2 : 3), use = fl.length > n ? [fl[0], fl[fl.length - 1]] : fl.slice(0, n), ix = [];
      P.forEach(function (x, i) { if (lastPairs.indexOf(i) < 0) ix.push(i); });
      var a = ix[Math.floor(Math.random() * ix.length)], rest = []; P.forEach(function (x, i) { if (i !== a) rest.push(i); });
      var b = rest[Math.floor(Math.random() * rest.length)];
      lastPairs.push(a); if (lastPairs.length > 3) lastPairs.shift();
      var fakes = [P[a].fake, P[b].fake]; if (use.length > 2 && Math.random() < .5) fakes.reverse();   // with two ducks the one fake is always the pair whose tell the bar shows
      var r = Math.floor(Math.random() * use.length), k = 0;
      s.pair = P[a]; s.soft = LN.fakeSoft || 'That was the real team';
      s.p = use.map(function (v, i) { var real = i === r; v.sayT = -1e9; return { v: v, real: real, text: real ? P[a].real : fakes[k++], at: .4 + i * .45, up: 0, gone: 0 }; });
      s.rest = fl.filter(function (v) { return use.indexOf(v) < 0; });
      s.rest.forEach(function (v) { c.hide(v, true); });
      c.slots.forEach(function (v) { v.sayT = -1e9; });
      s.p.forEach(function (p) { if (p.real) p.v.safe = true; });
    },
    frame: function (c, k, t, dt, s) {
      if (!s.p) return;
      s.now = t;
      var left = 0;
      s.p.forEach(function (p) {
        if (!p.up && t > p.at) { p.up = 1; p.v.duck.react = { type: 'hop', start: c.R, dur: 520 }; c.dm(p.v, p.text); }
        if (p.up && !p.real && !p.gone && ['ko', 'down', 'sink', 'para'].indexOf(p.v.st) >= 0) { p.gone = 1; c.dmOff(p.v); }
        if (p.back && t > p.back) { p.back = 0; c.dm(p.v, p.text); }
        if (!p.real && !p.gone) left++;
      });
      if (t > 1.5 && !left && !s.fin) s.fin = t + 1.6;
      if (s.fin && t > s.fin) s.finish = true;
    },
    safe: function (c, s, v) {
      s.p.forEach(function (p) { if (p.v === v) { c.dm(v, s.soft, true); p.back = (s.now || 0) + 2.6; } });
    },
    end: function (c, s) {
      if (!s.p) return;
      s.p.forEach(function (p) { c.dmOff(p.v); p.v.safe = false; });
      s.rest.forEach(function (v) { c.hide(v, false); });
      var LN = window.FlockLines || {}, a = document.querySelector('a.cta[href^="https://t.me/"], a.pw-cta[href^="https://t.me/"]');
      if (s.pair) c.bar(s.pair.tell, LN.fakeLink, a ? a.href : LN.botUrl, 8000);
    } });

  F.push({ id: 'bribe', name: 'An offer you can refuse', dur: 7.5,
    start: function (c, s) { s.g = c.g(); s.g.innerHTML = '<rect x="-30" y="-20" width="60" height="40" rx="5" fill="#2E1C0B" stroke="#12304F" stroke-width="2"/><rect x="-8" y="-26" width="16" height="8" rx="2" fill="none" stroke="#12304F" stroke-width="3"/><g data-o opacity="0"><rect x="-26" y="-34" width="52" height="16" rx="2" fill="#7FD1AE" stroke="#3E8E6C" stroke-width="1.5"/><text y="-22" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="10" fill="#12304F">$$ 5 USDC $$</text></g>'; },
    frame: function (c, k, t, dt, s) {
      var tx = c.tx || c.thrower.x, x = c.lp(c.W * .7, tx + 80, c.E.o(seg(t, 0, 2))), y = c.WL - 20;
      s.g.setAttribute('transform', T(t < 6 ? x : c.lp(tx + 80, c.W + 100, c.E.i(seg(t, 6, 7.5))), y, Math.sin(t * 3) * 3, c.k + .2));
      s.g.querySelector('[data-o]').setAttribute('opacity', t > 2 && t < 6 ? 1 : 0);
      if (t > 2.2 && !s.q) { s.q = 1; c.text(tx + 80, y - 70, L(c, ['5 USDC PER RETWEET?', 'PAID TO POST?', 'RAID FOR CASH?'])); }
      if (t > 3.6 && !s.q2) { s.q2 = 1; c.thrower.react = { type: 'shake', start: c.R, dur: 700 }; c.text(tx, y - 110, L(c, ['NO THANKS.', 'NOT HOW WE DO IT.', 'X SAYS NO. SO DO WE.'])); }
      if (t > 5 && !s.q3) { s.q3 = 1; var f = c.floats(); if (f[0]) c.say(f[0], L(c, ['i\'ll take it!', 'sir i\'ll raid for 2', 'where do i sign'])); }
    } });

  F.push({ id: 'timetravel', name: 'Back to 2017', dur: 7, need: 1,
    start: function (c, s) { s.v = c.pick(c.floats()); s.g = c.g(); s.r = []; for (var i = 0; i < 3; i++) s.r.push(c.mk('circle', { r: 0, fill: 'none', stroke: '#9EE7FF', 'stroke-width': 3 }, s.g)); },
    frame: function (c, k, t, dt, s) {
      var v = s.v, cx = v.x, cy = v.y - 20 * c.k;
      s.r.forEach(function (r, i) { var q = (t * 1.2 + i * .33) % 1, on = t > .3 && t < 2.4 || t > 4.4 && t < 6.4; r.setAttribute('cx', n(cx)); r.setAttribute('cy', n(cy)); r.setAttribute('r', n(10 + q * 60 * c.k)); r.setAttribute('opacity', on ? ((1 - q) * .9).toFixed(2) : 0); });
      if (t > 2.2 && !s.g1) { s.g1 = 1; c.grab(v); v.duck.e.g.setAttribute('opacity', 0); c.text(cx, cy - 50, 'ZWOOP'); }
      if (t > 4.6 && !s.g2) { s.g2 = 1; v.duck.e.g.setAttribute('opacity', 1); c.release(v, 'float'); v.duck.react = { type: 'confused', start: c.R, dur: 950 }; c.say(v, L(c, ['i bought at 2017 prices', 'i have seen the future. it\'s mostly memes', 'bitcoin pizza was a mistake', 'i warned myself. i did not listen'])); }
    },
    end: function (c, s) { s.v.duck.e.g.removeAttribute('opacity'); } });
})();
