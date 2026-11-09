/* Flock duck rig + scene clock. Shared by the v2 prototypes. */
(function () {
  var BODY = 'M28,66 C40,62 56,64 74,64 C94,64 108,58 122,60 C148,64 160,82 152,98 C144,112 118,116 86,116 C54,116 30,108 24,92 C20,82 20,72 28,66 Z';
  var BELLY = 'M26,94 C40,106 64,111 90,111 C118,111 140,105 152,96 C144,110 118,116 86,116 C54,116 32,108 26,94 Z';
  var WING = 'M60,82 C72,72 98,71 116,79 C110,93 88,101 68,98 C57,96 54,88 60,82 Z';
  var BT = 'M148,37 C160,32 176,35 183,42 C177,47 161,48 148,47 Z';
  var BB = 'M149,47 C159,49 172,49 179,46 C173,53 159,56 149,52 Z';
  var PAL = {
    y: { body: '#FFCB2B', shade: '#F2B705', line: '#C98800', wing: '#F7BE1A', beak: '#3A8CE0', bl: '#1E5FAF', cheek: '#F0963C' },
    g: { body: '#A3AFBF', shade: '#8693A7', line: '#66748A', wing: '#95A2B5', beak: '#7FA6CF', bl: '#5F86B0', cheek: '#8C97A8' }
  };
  var cl = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lp = function (a, b, k) { return a + (b - a) * k; };
  var E = {
    io: function (k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; },
    o: function (k) { return 1 - Math.pow(1 - k, 3); },
    i: function (k) { return k * k * k; },
    back: function (k) { return 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2); },
    ss: function (a, b, x) { var t = cl((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  };
  function st(tr, T) {
    if (T <= tr[0][0]) return [tr[0][1], tr[0][2]];
    for (var i = 0; i < tr.length - 1; i++) {
      var a = tr[i], b = tr[i + 1];
      if (T < b[0]) { var k = (T - a[0]) / (b[0] - a[0]), e = b[3] === 'out' ? E.o(k) : b[3] === 'in' ? E.i(k) : E.io(k); return [lp(a[1], b[1], e), lp(a[2], b[2], e)]; }
    }
    var l = tr[tr.length - 1]; return [l[1], l[2]];
  }
  function sd(d, T) { var v = d.d0; d.turns.forEach(function (t) { if (T >= t[0]) v += (t[1] - v) * E.io(cl((T - t[0]) / 440, 0, 1)); }); return v; }
  function sl(tr, T) { var r = null; tr.forEach(function (t) { if (T >= t[0]) r = t[1] == null ? null : [t[1], t[2]]; }); return r; }
  function ap(t, k, o) {
    var s = Math.sin(Math.PI * k);
    if (t === 'quack') { o.head += 10 * s; o.hx += 3 * s; }
    else if (t === 'dip') { o.head += 16 * s; o.hx += 4 * s; o.hy += 3 * s; }
    else if (t === 'bump' || t === 'land') { o.sq += .11 * Math.exp(-k * 3) * Math.cos(k * 10); if (t === 'bump') o.bobOff -= 2.5 * s; }
    else if (t === 'confused') { var e = E.ss(0, .18, k) * (1 - E.ss(.82, 1, k)); o.head += -15 * e + Math.sin(k * 20) * 2.2 * e; o.brow = e; o.q = e; o.qy = -6 * e; if (Math.abs(k - .55) < .07) o.lid = 1; }
    else if (t === 'shake') { o.head += Math.sin(k * Math.PI * 5) * 9 * (1 - k); }
    else if (t === 'happy' || t === 'hop') { o.bobOff -= (t === 'hop' ? 22 : 16) * s; o.sq += k < .2 ? -.08 * (1 - k / .2) : (k > .8 ? .1 * Math.sin(Math.PI * (k - .8) / .2) : 0); if (t === 'happy' && (Math.abs(k - .35) < .06 || Math.abs(k - .62) < .06)) o.lid = 1; }
  }
  function svg(d) {
    var p = PAL[d.k], ln = 'stroke="' + p.line + '" stroke-width="2.4" stroke-linejoin="round"';
    var under = d.land ? '<ellipse cx="88" cy="117" rx="60" ry="6" fill="#06172C" opacity=".28"/>'
      : '<ellipse data-p="ring" cx="88" cy="109" rx="78" ry="9" fill="none" stroke="#CFE6FF" stroke-width="3" opacity="0"/><g data-p="wake" fill="none" stroke="#DDEEFF" stroke-width="4" stroke-linecap="round" opacity="0"><path d="M28,104 C12,102 0,106 -18,111"/><path d="M36,111 C20,113 6,118 -10,124"/></g>';
    var front = d.land ? '' : '<ellipse data-p="wf" cx="88" cy="113" rx="86" ry="9"/><path d="M6,110 C40,104 136,104 170,110" fill="none" stroke="#CFE6FF" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>';
    return '<g data-duck="' + d.id + '" style="cursor:pointer"' + (d.opacity ? ' opacity="' + d.opacity + '"' : '') + '><g data-p="root">' + under + '<g data-p="bob">' +
      '<g data-p="tail"><path d="M38,74 C26,64 14,52 12,36 C24,42 36,50 48,62 Z" fill="' + p.body + '" ' + ln + '/></g>' +
      '<path d="' + BODY + '" fill="' + p.body + '" ' + ln + '/><path d="' + BELLY + '" fill="' + p.shade + '" opacity=".6"/>' +
      '<path d="M50,69 C70,71 96,69 112,63" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3.5" stroke-linecap="round"/>' +
      '<g data-p="wing"><path d="' + WING + '" fill="' + p.wing + '" stroke="' + p.line + '" stroke-width="2.2" stroke-linejoin="round"/><path d="M74,91 C84,88 94,87 104,84 M80,97 C88,95 96,93 102,91" fill="none" stroke="' + p.line + '" stroke-opacity=".45" stroke-width="1.8" stroke-linecap="round"/></g>' +
      '<g data-p="head"><circle cx="126" cy="42" r="26" fill="' + p.body + '" stroke="' + p.line + '" stroke-width="2.4"/><ellipse cx="120" cy="66" rx="19" ry="6" fill="' + p.body + '"/>' +
      '<path d="M108,30 C111,24 117,20 124,19" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/><circle cx="141" cy="51" r="5" fill="' + p.cheek + '" opacity=".3"/>' +
      '<path d="' + BB + '" fill="' + p.beak + '" stroke="' + p.bl + '" stroke-width="2" stroke-linejoin="round"/><path d="' + BT + '" fill="' + p.beak + '" stroke="' + p.bl + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<g data-p="pupil"><circle cx="134" cy="34" r="4.4" fill="#1B2A3A"/><circle cx="135.6" cy="32.4" r="1.5" fill="#fff"/></g>' +
      '<ellipse data-p="lid" cx="134" cy="34" rx="6.2" ry="5.8" fill="' + p.body + '"/>' +
      '<path data-p="brow" d="M127,25 C131,22 136,22 140,24" fill="none" stroke="' + p.line + '" stroke-width="2.2" stroke-linecap="round" opacity="0"/></g>' +
      '</g>' + front + '</g><text data-p="q" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="20" fill="#FED801" text-anchor="middle" opacity="0">?</text></g>';
  }
  function prep(d, root) {
    var g = root.querySelector('[data-duck="' + d.id + '"]'), p = function (n) { return g.querySelector('[data-p="' + n + '"]'); };
    d.e = { g: g, root: p('root'), bob: p('bob'), head: p('head'), wing: p('wing'), tail: p('tail'), pupil: p('pupil'), lid: p('lid'), brow: p('brow'), q: p('q'), wf: p('wf'), wake: p('wake'), ring: p('ring') };
    d.ay = d.land ? 116 : 106; d.lid0 = d.k === 'g' ? .3 : 0;
    d.ph = Math.random() * 6.28; d.per = 2600 + Math.random() * 900; d.nb = Math.random() * 3000; d.bs = -1e9;
    d.nw = 1000 + Math.random() * 5000; d.ws = -1e9; d.lh = 0; d.lpx = 0; d.lpy = 0; d.ro = Math.random() * 2600;
    d.ev = d.ev || []; d.x = 0; d.y = 0; d.sg = 1;
  }
  function n(v) { return v.toFixed(3); }
  function update(d, T, R, dt, ptr, water) {
    var x, y, vx = 0, dir = d.d0 == null ? 1 : d.d0, r;
    if (d.posFn) { r = d.posFn(T); x = r[0]; y = r[1]; if (r[2] != null) vx = r[2]; }
    else if (d.track) { r = st(d.track, T); x = r[0]; y = r[1]; vx = (st(d.track, T + 25)[0] - st(d.track, T - 25)[0]) * 20; }
    else { x = d.fixed[0]; y = d.fixed[1]; }
    if (d.turns) dir = sd(d, T);
    if (d.drift) {
      var a = R / d.drift[4] * 6.2832 + d.drift[3], c = Math.cos(a);
      x += Math.sin(a) * d.drift[2]; y += Math.sin(a * .77 + 1) * 1.6;
      vx = Math.max(0, d.drift[2] * c * dir) * 6.2832 / d.drift[4] * 1000;
    }
    if (Math.abs(dir) < .06) dir = dir < 0 ? -.06 : .06;
    var sg = dir < 0 ? -1 : 1, s = d.s, ay = d.ay, sp = cl(Math.abs(vx) / 70, 0, 1);
    d.x = x; d.y = y; d.sg = sg;
    d.ph += dt / lp(d.per, 700, sp) * 6.2832;
    var bob = Math.sin(d.ph) * lp(2.6, 1.6, sp), tilt = sp * 5 + Math.sin(d.ph - .8) * 1.1;
    if (d.land) { bob *= .35; tilt = Math.sin(d.ph - .8) * .6; }
    var o = { head: -tilt * .6 + Math.sin(d.ph - 1.4) * 2.2, hx: 0, hy: Math.sin(d.ph - 1.1) * .8, bobOff: 0, sq: 0, brow: 0, q: 0, qy: 0, lid: d.lid0, rot: 0 };
    var tgt = ptr || (d.look ? sl(d.look, T) : null), th = 0, tpx = 0, tpy = 0;
    if (tgt) {
      var lx = (tgt[0] - x) / (s * sg) + 88 - 134, ly = (tgt[1] - y) / s + ay - 34;
      th = cl(Math.atan2(ly, Math.abs(lx) + 30) * 57.3 * .45, -16, 16); tpx = cl(lx / 90, -1, 1) * 1.7; tpy = cl(ly / 90, -1, 1) * 1.5;
    }
    var f = dt === 0 ? 1 : 1 - Math.exp(-dt / 140);
    d.lh += (th - d.lh) * f; d.lpx += (tpx - d.lpx) * f; d.lpy += (tpy - d.lpy) * f;
    o.head += d.lh;
    if (R > d.nb) { d.bs = R; d.nb = R + 2200 + Math.random() * 4200; }
    var bk = (R - d.bs) / 170; if (bk >= 0 && bk < 1) o.lid = Math.max(o.lid, Math.sin(Math.PI * bk));
    if (R > d.nw) { d.ws = R; d.nw = R + 3200 + Math.random() * 5200; }
    var wk = (R - d.ws) / 560, wing = (wk >= 0 && wk < 1 ? -15 * Math.sin(Math.PI * wk) : 0) - sp * 5;
    var tail = Math.sin(d.ph + .6) * 3 + sp * Math.sin(R / 120) * 5;
    d.ev.forEach(function (e) { var k = (T - e.t) / e.dur; if (k >= 0 && k <= 1) ap(e.type, k, o); });
    if (d.react) { var k = (R - d.react.start) / d.react.dur; if (k > 1) d.react = null; else ap(d.react.type, k, o); }
    if (d.extra) d.extra(T, o);
    var e = d.e;
    e.root.setAttribute('transform', 'translate(' + n(x) + ' ' + n(y) + ') rotate(' + n(o.rot) + ') scale(' + (s * dir).toFixed(4) + ' ' + s + ') translate(-88 ' + (-ay) + ')');
    e.bob.setAttribute('transform', 'translate(0 ' + n(bob + o.bobOff) + ') rotate(' + n(tilt) + ' 88 ' + ay + ') translate(88 ' + ay + ') scale(' + n(1 + o.sq) + ' ' + n(1 - o.sq) + ') translate(-88 ' + (-ay) + ')');
    e.head.setAttribute('transform', 'translate(' + n(o.hx) + ' ' + n(o.hy) + ') rotate(' + n(o.head) + ' 120 64)');
    e.wing.setAttribute('transform', 'rotate(' + n(wing) + ' 108 80)');
    e.tail.setAttribute('transform', 'rotate(' + n(tail) + ' 40 70)');
    e.pupil.setAttribute('transform', 'translate(' + n(d.lpx) + ' ' + n(d.lpy) + ')');
    e.lid.setAttribute('transform', 'translate(134 28.2) scale(1 ' + n(Math.max(.001, Math.min(1, o.lid))) + ') translate(-134 -28.2)');
    e.brow.setAttribute('opacity', n(o.brow)); e.brow.setAttribute('transform', 'translate(0 ' + n(-3 * o.brow) + ')');
    e.q.setAttribute('opacity', n(o.q));
    e.q.setAttribute('transform', 'translate(' + n(x + 50 * s * sg) + ' ' + n(y + (4 - ay) * s + o.qy) + ')');
    if (e.wf) {
      e.wf.setAttribute('fill', typeof water === 'function' ? water(y + 3) : (d.water || water || '#1A4C84'));
      e.wake.setAttribute('opacity', n(sp * .8));
      var rp = ((R + d.ro) % 2600) / 2600;
      e.ring.setAttribute('transform', 'translate(88 109) scale(' + n(.75 + rp * .5) + ') translate(-88 -109)');
      e.ring.setAttribute('opacity', n((1 - rp) * .28 * (1 - sp * .6)));
    }
  }
  function svgPoint(svgEl, e) {
    var m = svgEl.getScreenCTM(); if (!m) return null;
    var p = svgEl.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    var r = p.matrixTransform(m.inverse()); return [r.x, r.y];
  }
  /* Scene clock: plays once when `observe` reaches `threshold`, pauses offscreen / hidden tab, honours reduced motion. */
  function Stage(o) {
    var self = this;
    this.o = o; this.R = 0; this.T = 0; this.started = false; this.visible = false; this.raf = 0;
    this.reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.speed = 1; this.ptrs = new Map(); this.lookOn = true;
    if (this.reduced) { this.started = true; this.T = o.end; }
    this.loop = function (now) {
      self.raf = 0; if (!self.run()) return;   // a frame queued before Pause or a hidden tab must not advance the clock
      var dt = Math.min(50, now - self.last); self.last = now; self.frame(dt);
      if (self.run()) self.raf = requestAnimationFrame(self.loop);
    };
    this.io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { self.visible = e.isIntersecting; if (e.intersectionRatio >= (o.threshold || .35) && !self.started) { self.started = true; } });
      self.kick();
    }, { threshold: [0, o.threshold || .35] });
    this.io.observe(o.observe);
    this.onVis = function () { self.kick(); };
    document.addEventListener('visibilitychange', this.onVis);
  }
  Stage.prototype.run = function () { return this.visible && !document.hidden && !this.reduced; };
  Stage.prototype.kick = function () { if (this.raf || !this.run()) return; this.last = performance.now(); this.raf = requestAnimationFrame(this.loop); };
  Stage.prototype.frame = function (dt) {
    this.R += dt;
    if (this.started && !this.reduced) this.T += dt * this.speed;
    if (this.o.cycle && this.T > this.o.cycle * (this.o.cycles || 1) + (this.o.hold || 0)) this.T = this.o.cycle * (this.o.cycles || 1) + (this.o.hold || 0);
    this.o.frame(this.T, this.R, dt);
  };
  Stage.prototype.replay = function () { this.started = true; this.T = this.reduced ? this.o.end : 0; if (this.o.reset) this.o.reset(); if (this.reduced) this.frame(0); else this.kick(); };
  Stage.prototype.seek = function (ms) { this.started = true; this.T = 0; if (this.o.reset) this.o.reset(); for (var t = 0; t < ms; t += 16) this.frame(16); };
  Stage.prototype.pointer = function (svgEl, ducks) {
    var self = this;
    svgEl.addEventListener('pointermove', function (e) { self.ptrs.set(svgEl, svgPoint(svgEl, e)); self.kick(); });
    svgEl.addEventListener('pointerleave', function () { self.ptrs.delete(svgEl); });
    svgEl.addEventListener('click', function (e) {
      if (self.reduced) return;
      var el = e.target.closest('[data-duck]'); if (!el) return;
      var d = ducks.find(function (x) { return x.id === el.getAttribute('data-duck'); }); if (!d) return;
      d.react = d.k === 'g' ? { type: 'confused', start: self.R, dur: 950 } : { type: 'happy', start: self.R, dur: 720 };
      self.kick();
    });
  };
  Stage.prototype.ptr = function (svgEl) { return this.lookOn && !this.reduced ? this.ptrs.get(svgEl) || null : null; };
  Stage.prototype.destroy = function () { cancelAnimationFrame(this.raf); this.io.disconnect(); document.removeEventListener('visibilitychange', this.onVis); };
  /* Point along an SVG path element, k in 0..1 */
  function along(path, k) { var L = path.getTotalLength(), p = path.getPointAtLength(cl(k, 0, 1) * L); return [p.x, p.y]; }
  window.FlockDuck = { svg: svg, prep: prep, update: update, Stage: Stage, E: E, cl: cl, lp: lp, st: st, along: along, svgPoint: svgPoint };
})();
