/* The Flock: mini-game in the pond at the bottom of each page, on each page (rock throwing at bot ducks and cartoon events).
   Needs js/flock-duck.js, js/flock-lines.js and js/flock-events-1..6.js loaded first. Respects Flock.paused from js/flock-motion.js. */
(function () {
  'use strict';
  const NSS = 'http://www.w3.org/2000/svg';
  function el(tag, css, html) { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html) e.innerHTML = html; return e; }
  // Where the game lives. One map for every page; the road pages are picked by an attribute on the band, so the same code
  // works when a page's content moves (put data-flock-game="top" on a top band, "bottom" on the closing navy section).
  //   wave   : the home page's pain wall answer band ("We built The Flock for them."), on its wave strip
  //   top    : the top band of a road page (the yellow duck and three bots replace the static ducks)
  //   bottom : a separate pond after the How page’s bot section
  const MOUNTS = [
    { mode: 'wave', sel: '#pain-wall .pw-end' },
    { mode: 'top', sel: '[data-flock-game="top"]' },
    { mode: 'bottom', sel: '[data-flock-game="bottom"]' }
  ];

  const CSS = '.game-throw:focus-visible,.game-control:focus-visible{outline:3px solid #FED801;outline-offset:3px}' +
    /* the clipped game layer: nothing the game draws can reach the text above it */
    '.game-layer{position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;pointer-events:none;z-index:1}' +
    /* the call-out and the score sit in a bar BELOW the playfield, one row: call-out left, score right; they wrap on a phone */
    '.game-bar{position:relative;z-index:3;pointer-events:none;box-sizing:border-box}.game-bar .game-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;box-sizing:border-box}.game-bar .game-hud{margin-left:auto}' +
    '.game-hint.game-hint{display:flex;align-items:center;gap:8px;width:fit-content;max-width:100%;box-sizing:border-box;margin:0;padding:6px 12px 6px 6px;border-radius:22px;background:rgba(0,16,48,.45);color:#fff;font:500 14.5px/1.4 Inter,system-ui,sans-serif;letter-spacing:0;text-align:left}.game-hint>span:last-child{min-width:0}' +
    /* the end line of the fake-admin round puts one link in the call-out; the bar itself ignores the pointer, the link does not */
    /* while the end line shows, the score stays beside it on one row (the line wraps inside its pill); the row keeps room for two lines on a phone, so nothing below moves */
    '.game-bar.game-bar-end .game-row{flex-wrap:nowrap}.game-bar.game-bar-end .game-hint.game-hint{flex:0 1 auto;min-width:0}.game-bar.game-bar-end .game-hud{flex:none}.game-bar.game-bar-tight .game-hint>span:first-child{display:none!important}@media (max-width:899px){.game-bar .game-row{min-height:53px}}' +
    '.game-hint a{color:#FED801;font-weight:600;text-decoration:underline;text-underline-offset:3px;white-space:nowrap;pointer-events:auto;border-radius:3px}.game-hint a:hover{color:#fff}.game-hint a:focus-visible{outline:3px solid #fff;outline-offset:2px}' +
    '.game-hud{display:flex;gap:4px 16px;align-items:baseline;font:600 11px ui-monospace,Menlo,monospace;letter-spacing:.08em;color:#BFD9F2;z-index:3}' +
    '.game-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    /* bottom: a pond along the foot of the section */
    '.game-host{padding-bottom:0!important}.game-host>.wrap{padding-bottom:0}' +
    '.game-pond{position:relative;width:100%;height:320px;margin:0;background:#0b3969}' +
    '.game-waves{position:absolute;left:0;top:0;width:100%;height:100%;display:block}' +
    '.game-host>.game-bar{background:#1B4F9A;padding:12px 0 16px}' +
    /* top: the hero band; its text stays above the game */
    '.top.game-top{padding-bottom:214px}.game-top>.wrap{position:relative;z-index:2}.game-bar.game-bar-page{background:#fff;padding:14px 0 6px}.game-bar-page .game-hint.game-hint{background:#12304F}.game-bar-page .game-hud{color:#0058A8}body.dark-mode .game-bar.game-bar-page{background:#08142B}body.dark-mode .game-bar-page .game-hud{color:#BFD9F2}@media(max-width:900px){.top.game-top{padding-bottom:194px}}' +
    /* wave: the answer band; the answer text stays above the game, the call-out sits under the button */
    '.game-end .pw-calm{position:relative;z-index:2}.game-end .pw-ducks{visibility:hidden}' +
    '.pw-end.game-end .pw-sun{display:none}' +
    '.game-end>.game-bar{position:absolute;left:0;right:0;bottom:0;height:56px;display:flex;align-items:center;background:var(--navy,#002050);text-align:left}.game-end>.game-bar .game-row{width:100%;padding:0 max(16px,5%)}.pw-end.game-end .pw-sea{bottom:54px}.pw-end.game-end .pw-ducks{bottom:126px}.pw-view>.pw-end.game-end .pw-ducks{bottom:calc(13% + 56px)}' +
    '.pw-end.game-end{padding-bottom:306px}' +
    '.pw-view>.pw-end .game-layer,.pw-view>.pw-end .game-throw,.pw-view>.pw-end .game-bar{transition:opacity .35s}.pw-view>.pw-end:not(.pw-open) .game-layer,.pw-view>.pw-end:not(.pw-open) .game-throw,.pw-view>.pw-end:not(.pw-open) .game-bar{opacity:0;visibility:hidden}' +
    '.pw-view>.pw-end.pw-open .game-throw{pointer-events:auto}' +
    '@media (max-width:899px){.pw-end.game-end{padding-bottom:326px}}' +
    /* Phone: keep the pond and controls readable. */
    '@media (max-width:699px){.game-key{display:none}.game-pond{height:320px}}';

  function mount() {
    const FD = window.FlockDuck, M = MOUNTS.find(m => document.querySelector(m.sel));
    if (!FD || !M || !window.IntersectionObserver || !window.ResizeObserver) return;
    const mode = M.mode, host = document.querySelector(M.sel), E = FD.E, cl = FD.cl;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const css = document.createElement('style'); css.textContent = CSS; document.head.appendChild(css);
    // The instruction as a call-out: sun-yellow "i" badge, white text on a darker pill. "or press T" only where there is a keyboard pointer.
    const hint = el('p', ''); hint.className = 'game-hint';
    hint.innerHTML = '<span aria-hidden="true" style="flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#FED801;color:#002050;font:700 17px/1 Fredoka,system-ui,sans-serif">i</span><span></span>';
    hint.lastChild.textContent = 'Pull the duck back, then let go.';
    const hud = el('div', ''); hud.className = 'game-hud';
    const bar = el('div', ''); bar.className = 'game-bar'; const row = el('div', ''); row.className = 'game-row'; row.appendChild(hint); row.appendChild(hud); bar.appendChild(row);
    // one hidden live node: it announces the score, and only after a throw the visitor made
    const live = el('div', ''); live.className = 'game-sr'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite');
    const layer = el('div', ''); layer.className = 'game-layer';
    const gsvg = document.createElementNS(NSS, 'svg'); gsvg.setAttribute('aria-hidden', 'true'); gsvg.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;overflow:visible'; layer.appendChild(gsvg);
    const hit = el('div', 'position:absolute;z-index:6;touch-action:none;cursor:grab;border-radius:50%');
    const help = el('span', 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap'); help.id = 'game-throw-help'; help.textContent = 'Arrow keys aim. Enter or Space throws.';
    hit.className = 'game-throw'; hit.tabIndex = 0; hit.setAttribute('role', 'button'); hit.setAttribute('aria-label', 'Throw a rock at a bot duck'); hit.setAttribute('aria-describedby', help.id);
    // g: how this mount measures itself. measure(st) fills st.W/H/HB/WL and the stain band, and returns the drag area's top and
    // textBottom: the lowest text, button, call-out or score box. The layer is clipped to everything below it.
    const WATER_DEFS = {};
    const g = { mode, host, layer, hint, bar, info: null, root: host, scales: s => s ? [.36, .44] : [.44, .5], bots: (W, s, i) => W * (s ? .5 + i * .19 : .62 + i * .11) };
    const relBottom = (e, r) => e.getBoundingClientRect().bottom - r.top;

    if (mode === 'bottom') {
      // a wave strip along the foot of the section: the pond. The call-out and score sit in its sky.
      host.classList.add('game-host');
      const pond = el('div', '', '<svg class="game-waves" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0,196 C240,160 480,162 720,192 C960,222 1200,220 1440,176 L1440,300 L0,300 Z" fill="#2F6FC4"/><path d="M0,252 C260,222 520,232 760,250 C1000,268 1220,264 1440,236 L1440,300 L0,300 Z" fill="#1B4F9A"/></svg>');
      pond.className = 'game-pond'; host.appendChild(pond); pond.appendChild(layer);
      row.classList.add('wrap'); host.appendChild(bar);
      pond.appendChild(hit); pond.appendChild(help); pond.appendChild(live);
      g.root = pond; g.info = bar;
      g.measure = st => {
        st.W = pond.offsetWidth; st.H = pond.offsetHeight; st.HB = st.H; st.WL = st.HB - (st.W < 700 ? 92 : 100);
        st.lo = st.WL + 12; st.hi = st.HB - 28;
        return { top: Math.max(0, st.WL - 84), textBottom: 0, water: { d: 'M0,196 C240,160 480,162 720,192 C960,222 1200,220 1440,176 L1440,300 L0,300 Z', tf: 'scale(' + (st.W / 1440).toFixed(4) + ' ' + (st.H / 300).toFixed(4) + ')' } };
      };
    } else if (mode === 'top') {
      // the hero band keeps its own waves; the game draws in a clipped layer under the text, below the call-out
      host.classList.add('game-top');
      const flock = host.querySelector('.flock'); if (flock) flock.style.display = 'none';
      const sea = host.querySelector('.sea');
      const wrap = host.querySelector('.wrap') || host;
      row.classList.add('wrap'); bar.classList.add('game-bar-page'); host.insertAdjacentElement('afterend', bar);
      host.appendChild(layer); host.appendChild(hit); host.appendChild(help); host.appendChild(live);
      g.info = wrap;
      g.measure = st => {
        st.W = host.offsetWidth; st.H = host.offsetHeight; st.HB = st.H; st.WL = st.H - 62;
        st.lo = st.WL + 6; st.hi = st.WL + 22;   // the blue strip in front of the ducks; the white shore is not for stains or drops
        const hr = host.getBoundingClientRect(), tx = Math.max(st.W < 700 ? 46 : 80, st.W * .1);
        let top = st.WL - 130, tb = 0;
        wrap.querySelectorAll(':scope > *').forEach(e => { const b = e.getBoundingClientRect(); if (!b.height) return; tb = Math.max(tb, b.bottom - hr.top); if (b.left - hr.left < tx + 70 && b.right - hr.left > tx - 70) top = Math.max(top, b.bottom - hr.top + 4); });
        const sp = sea ? [...sea.querySelectorAll('path')].map(x => x.getAttribute('d')) : [];
        return { top, textBottom: Math.ceil(tb) + 8, water: sea && sp.length > 1 ? { d: sp[0] + ' ' + sp[1], tf: 'translate(0 ' + (st.H - 120) + ') scale(' + (st.W / 1440).toFixed(4) + ' 1)' } : null, shore: sea && sp.length > 1 ? { d: sp[1], tf: 'translate(0 ' + (st.H - 120) + ') scale(' + (st.W / 1440).toFixed(4) + ' 1)' } : null };
      };
    } else {
      // wave: the answer band of the home page's pain wall. Its three ducks give way to the game's bots on the same wave.
      host.classList.add('game-end');
      const ducks = host.querySelector('.pw-ducks'), sea = host.querySelector('.pw-sea'), cta = host.querySelector('.pw-cta');
      host.insertBefore(layer, host.firstChild); host.appendChild(bar); host.appendChild(hit); host.appendChild(help); host.appendChild(live);
      g.info = bar;
      g.scales = s => s ? [.4, .46] : [.5, .56];
      g.live = () => !host.parentElement || !host.parentElement.classList.contains('pw-view') || host.classList.contains('pw-open');
      g.bots = (W, s, i) => { const hr = host.getBoundingClientRect(), d = ducks.getBoundingClientRect(); return (d.left - hr.left) + d.width * [.16, .48, .78][i]; };
      g.measure = st => {
        st.W = host.offsetWidth; st.H = host.offsetHeight; st.HB = st.H;
        if (!st.W || !st.H) return null;
        const hr = host.getBoundingClientRect(), d = ducks.getBoundingClientRect(), c = cta.getBoundingClientRect(), sr = sea.getBoundingClientRect();
        st.WL = Math.min(st.H - 30, Math.max(st.H * .5, d.bottom - hr.top - 14));
        st.lo = st.WL + 10; st.hi = Math.max(st.lo + 4, sr.top - hr.top + sr.height * .74);   // the two blue waves; the white shore below is not for stains
        const sp = [...sea.querySelectorAll('path')].map(x => x.getAttribute('d')), shore = sea.querySelector('.pw-shore');
        return { top: Math.max(0, st.WL - 84), textBottom: Math.ceil(c.bottom - hr.top) + 8, water: { d: sp[0] + ' ' + (shore ? shore.getAttribute('d') : ''), tf: 'translate(0 ' + (sr.top - hr.top).toFixed(2) + ') scale(' + (sr.width / 1440).toFixed(4) + ' ' + (sr.height / 300).toFixed(4) + ')' }, shore: shore ? { d: shore.getAttribute('d'), tf: 'translate(0 ' + (sr.top - hr.top).toFixed(2) + ') scale(' + (sr.width / 1440).toFixed(4) + ' ' + (sr.height / 300).toFixed(4) + ')' } : null };
      };
    }
    const o = { g, section: host, gsvg, layer, hero: g.root, hit, hud, hint, live, reduced: !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) };
    game(FD, E, cl, g.root, o);
  }

  function game(FD, E, cl, root, o) {
    const NS = 'http://www.w3.org/2000/svg', gsvg = o.gsvg, hero = o.hero, hit = o.hit, hud = o.hud;
    const G = 980;
    let red = o.reduced, inView = false;
    // the pain wall's answer band only plays once the scene has reached its end (or in the still layout)
    const on = () => inView && (!o.g.live || o.g.live());
    // Pause and reduced motion: read live. The game's own Web Animations are tracked so Pause can hold them.
    const isPaused = () => !!(window.Flock && window.Flock.paused), calm = () => red || isPaused();
    // One list of animations and one list of timers. Timers run on the game clock, which stops with Pause, a hidden tab
    // and a page that is off screen, so nothing delayed (a sound, a bubble, a state change) fires while the game is held.
    const anims = new Set(), pending = [];
    const held = () => isPaused() || document.hidden;
    const anim = (e, kf, op) => {
      if (red) return { set onfinish(f) { f && f(); }, pause() {}, play() {}, finish() {}, cancel() {} };   // reduced motion: no animation, settle at once
      const a = e.animate(kf, op); anims.add(a); a.addEventListener('finish', () => anims.delete(a)); a.addEventListener('cancel', () => anims.delete(a)); if (held()) a.pause(); return a;
    };
    const later = (fn, ms) => { if (red) { fn(); return; } pending.push({ at: stage.R + ms, fn }); wake(); };
    const tickLater = R => { for (let i = 0; i < pending.length; i++) if (R >= pending[i].at) { const t = pending.splice(i--, 1)[0]; try { t.fn(); } catch (e) { console.warn(e); } } };
    const L = c => window.FlockLine ? window.FlockLine(c) : 'gm', pick = a => a[Math.floor(Math.random() * a.length)], rnd = (a, b) => a + Math.random() * (b - a), f1 = v => v.toFixed(1);
    const mk = (tag, at, par) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); par.appendChild(e); return e; };
    gsvg.innerHTML = '<g data-l="stains"></g><g data-l="evb"></g><g data-l="ducks"></g><g data-l="extra"></g><g data-l="evf"></g><g data-l="dm"></g><g data-l="rock"></g><g data-l="fx"></g><g data-l="aim"></g><g data-l="ui"></g>';
    // Keep stains inside the scene; top scenes include their white shoreline.
    const defs = document.createElementNS(NS, 'defs'); defs.innerHTML = '<clipPath id="game-water"><path clip-rule="evenodd" fill-rule="evenodd" d=""/></clipPath><linearGradient id="game-fade" gradientUnits="userSpaceOnUse" x1="0" y1="-10" x2="0" y2="-9"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="game-fadem" maskUnits="userSpaceOnUse" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="1" height="1" fill="url(#game-fade)"/></mask><mask id="game-noshore" maskUnits="userSpaceOnUse" x="0" y="0" width="1" height="1"><rect x="0" y="0" width="1" height="1" fill="#fff"/><path fill="#000" d=""/></mask>'; gsvg.insertBefore(defs, gsvg.firstChild);
    const waterPath = defs.querySelector('path');
    const Ly = {}; ['stains', 'evb', 'ducks', 'extra', 'evf', 'dm', 'rock', 'fx', 'aim', 'ui'].forEach(n => Ly[n] = gsvg.querySelector('[data-l="' + n + '"]'));
    Ly.stains.setAttribute('clip-path', 'url(#game-water)');
    // blood, drops and feathers never land on the white shore or past the water; sprites that enter from above fade in under the clip line, never sliced
    Ly.fx.setAttribute('mask', 'url(#game-noshore)');
    ['evb', 'ducks', 'extra', 'evf'].forEach(n => Ly[n].setAttribute('mask', 'url(#game-fadem)'));
    const fadeG = defs.querySelector('#game-fade'), fadeM = defs.querySelector('#game-fadem'), shoreM = defs.querySelector('#game-noshore');
    // one number only: bots bonked
    hud.innerHTML = '<div>BONKED <b data-s style="font:700 15px Fredoka,system-ui,sans-serif;color:#FED801;margin-left:4px">0</b></div>';
    const hudS = hud.querySelector('[data-s]'), live = o.live; let liveFlip = false;
    // The call-out can show one other line for a while (the end of a fake-admin round), then goes back. It is timed on the game clock, so Pause holds it.
    const hintSpan = o.hint.lastChild, HINT = hintSpan.textContent; let barUntil = 0;
    const barBack = () => { if (!barUntil) return; barUntil = 0; const f = o.hint.contains(document.activeElement); hintSpan.textContent = HINT; o.g.bar.classList.remove('game-bar-end', 'game-bar-tight'); if (f) hit.focus({ preventScroll: true }); };
    const barSay = (text, linkText, href, ms) => {
      if (red) return;
      hintSpan.textContent = text + (/[.!?]$/.test(text) ? ' ' : '. ');   // a stop between the line and the link
      if (linkText && href) { const a = document.createElement('a'); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = linkText; hintSpan.appendChild(a); }
      o.g.bar.classList.add('game-bar-end'); if (o.hint.offsetHeight > 54) o.g.bar.classList.add('game-bar-tight'); barUntil = stage.R + ms;   // a very narrow phone: drop the badge so the line stays on two lines
       live.textContent = text; wake();
    };
    const announce = () => { liveFlip = !liveFlip; live.textContent = 'Bonked: ' + st.score + (liveFlip ? '' : '.'); };
    const st = { W: 0, H: 0, WL: 0, HB: 0, tx: 0, ox: 0, oy: 0, sc: .44, score: 0, combo: 0, wind: 0, aiming: false, ptr: null, thrown: false, nextSay: 2500, banner: null, auto: null, attracted: false };
    const thrower = { id: 'thr', k: 'y', s: .5, d0: 1, water: '#2F6FC4', posFn: () => [st.tx, st.WL, 0] };
    const slots = [0, 1, 2].map(i => ({ i, st: 'float', x: 0, y: 0, rot: 0, bx: 0, by: 0, vx: 0, vy: 0, spin: 0, t0: 0, sayT: -1e9, landed: false, op: 1, hid: false, safe: false, dm: null }));
    slots.forEach(s => { s.duck = { id: 'b' + s.i, k: 'g', s: .44, d0: -1, water: '#2F6FC4', posFn: () => [s.x, s.y, 0], extra: (T, o) => { o.rot = s.rot; } }; });
    const all = [thrower, ...slots.map(s => s.duck)];
    Ly.ducks.innerHTML = all.map(FD.svg).join(''); all.forEach(d => FD.prep(d, Ly.ducks));
    const STAR = 'M0,-6 L1.8,-1.8 L6,-1.5 L2.8,1.2 L3.7,5.6 L0,3.2 L-3.7,5.6 L-2.8,1.2 L-6,-1.5 L-1.8,-1.8 Z';
    const FOOT = '<path d="M0,10 L0,-2" stroke="#C46A1C" stroke-width="3" stroke-linecap="round"/><path d="M0,-2 L-8,-16 L-3,-12 L0,-18 L3,-12 L8,-16 Z" fill="#F0963C" stroke="#C46A1C" stroke-width="1.5" stroke-linejoin="round"/>';
    slots.forEach(s => {
      const g = mk('g', {}, Ly.extra);
      g.innerHTML = '<g data-x="feet" opacity="0"><g data-x="f1">' + FOOT + '</g><g data-x="f2">' + FOOT + '</g></g>' +
        '<g data-x="stars" opacity="0">' + [0, 1, 2].map(() => '<path d="' + STAR + '" fill="#FED801" stroke="#C98800" stroke-width="1"/>').join('') + '</g>' +
        '<g data-x="sign" opacity="0"><rect x="-2" y="-28" width="4" height="34" fill="#8C7A55"/><rect x="-44" y="-50" width="88" height="24" rx="4" fill="#F6F1E3" stroke="#8C7A55" stroke-width="2"/><text y="-33.5" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="12" fill="#A63A2C" letter-spacing=".5">SUSPENDED</text></g>' +
        '<g data-x="chute" opacity="0"><path d="M-30,0 L0,46 M-8,-1 L0,46 M8,-1 L0,46 M30,0 L0,46" stroke="#12304F" stroke-width="1.2" fill="none"/><path d="M-36,0 C-36,-34 36,-34 36,0 C27,-7 14,-7 0,0 C-14,-7 -27,-7 -36,0 Z" fill="#F6F1E3" stroke="#12304F" stroke-width="1.5"/><path d="M-10,-2 C-11,-22 11,-22 10,-2 C6,-4 -6,-4 -10,-2 Z" fill="#E5604F"/></g>' +
        '<g data-x="bub" opacity="0"><rect data-x="br" y="-30" height="24" rx="12" fill="#fff"/><path d="M-5,-7 L1,4 L5,-7 Z" fill="#fff"/><text data-x="bt" y="-13.5" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="600" fill="#12304F"></text></g>';
      const q = n => g.querySelector('[data-x="' + n + '"]');
      s.X = { feet: q('feet'), f1: q('f1'), f2: q('f2'), stars: q('stars'), sign: q('sign'), chute: q('chute'), bub: q('bub'), br: q('br'), bt: q('bt') };
    });
    // DM bubbles: the speech bubbles of the fake-admin round. Several show at once, each wraps to two lines, and they spread sideways so
    // none overlaps another or leaves the pond (12px margin). They sit under the rock and the aim, above the ducks, in no fade mask.
    slots.forEach(s => {
      const g = mk('g', { opacity: 0 }, Ly.dm);
      g.innerHTML = '<rect rx="12" fill="#fff"/><path fill="#fff"/><text text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="600" fill="#12304F"></text>';
      s.D = { g, r: g.children[0], t: g.children[1], x: g.children[2], w: 0, h: 24 };
    });
    // wrap to the fewest lines, then even the lines out so the bubble is not wider than it must be
    const wrapDM = (t, max) => {
      const words = t.split(' '), fit = m => { const out = []; let row = ''; words.forEach(w => { if (row && (row + ' ' + w).length > m) { out.push(row); row = w; } else row = row ? row + ' ' + w : w; }); out.push(row); return out; };
      const n = fit(max).length; let m = Math.ceil(t.length / n);
      while (m < max && fit(m).length > n) m++;
      return fit(m);
    };
    const setDM = (s, text, soft) => {
      const D = s.D; D.r.setAttribute('fill', soft ? '#DDF2FD' : '#fff'); D.t.setAttribute('fill', soft ? '#DDF2FD' : '#fff');
      const lines = wrapDM(text, st.W < 700 ? 19 : 24); D.h = 8 + 16 * lines.length; D.x.textContent = '';
      lines.forEach((ln, i) => { const ts = document.createElementNS(NS, 'tspan'); ts.setAttribute('x', 0); ts.setAttribute('y', f1(-D.h - 6 + 16.5 + 16 * i)); ts.textContent = ln; D.x.appendChild(ts); });
      let tw = 0; try { tw = D.x.getBBox().width; } catch (e) {}
      sizeDM(s, tw || Math.max(...lines.map(l => l.length)) * 7.2);
      D.r.setAttribute('y', f1(-D.h - 6)); D.r.setAttribute('height', D.h);
    };
    const sizeDM = (s, tw) => { const D = s.D; D.w = Math.ceil(tw + 24); D.r.setAttribute('x', f1(-D.w / 2)); D.r.setAttribute('width', D.w); };
    const layoutDM = R => {
      const act = slots.filter(s => s.dm && s.st === 'float');
      slots.forEach(s => { if (!act.includes(s)) s.D.g.setAttribute('opacity', 0); });
      if (!act.length) return;
      act.forEach(s => { if (R - s.dm.t0 < 800) { let tw = 0; try { tw = s.D.x.getBBox().width; } catch (e) {} if (tw && Math.abs(tw + 24 - s.D.w) > 1) sizeDM(s, tw); } });
      const hi = st.W - 12, gap = st.W < 700 ? 6 : 10, k = st.sc / .44, tot = act.reduce((a, s) => a + s.D.w, 0) + gap * (act.length - 1);
      const lo = tot <= hi - (st.ox + 26) ? st.ox + 26 : 12;   // keep clear of the rock when the bubbles fit to its right
      const its = act.map(s => ({ s, ax: s.x, w: s.D.w, c: 0 })).sort((a, b) => a.ax - b.ax);
      its.forEach(i => { i.c = cl(i.ax, lo + i.w / 2, Math.max(lo + i.w / 2, hi - i.w / 2)); });
      const push = () => { for (let j = 1; j < its.length; j++) { const m = its[j - 1].c + (its[j - 1].w + its[j].w) / 2 + gap; if (its[j].c < m) its[j].c = m; } };
      push();
      const last = its[its.length - 1], over = last.c + last.w / 2 - hi;
      if (over > 0) { its.forEach(i => { i.c -= over; }); its.forEach(i => { i.c = Math.max(i.c, lo + i.w / 2); }); push(); }
      its.forEach(i => {
        const s = i.s, D = s.D, d = s.dm, y0 = Math.max((st.tb || 0) + 8 + D.h + 6, s.y - 58 * k), tx = cl(i.ax - i.c, -D.w / 2 + 14, D.w / 2 - 14), pop = E.back(Math.min(1, (R - d.t0) / 240));
        D.t.setAttribute('d', d.soft ? '' : 'M' + f1(tx - 5) + ',-7 L' + f1(tx + 1) + ',4 L' + f1(tx + 5) + ',-7 Z');   // the soft note has no tail: it is a note, not one more duck speaking
        D.g.setAttribute('transform', 'translate(' + f1(i.c) + ' ' + f1(y0) + ') translate(' + f1(tx) + ' 4) scale(' + Math.max(.001, pop).toFixed(3) + ') translate(' + f1(-tx) + ' -4)');
        D.g.setAttribute('opacity', R >= d.t0 ? 1 : 0);
      });
    };
    const rockG = mk('g', { opacity: 0 }, Ly.rock);
    rockG.innerHTML = '<path d="M-11,-3 C-10,-9 -3,-12 4,-11 C10,-9 12,-3 11,3 C9,9 2,12 -4,11 C-10,9 -12,3 -11,-3 Z" fill="#8E96A3" stroke="#5C6470" stroke-width="2" stroke-linejoin="round"/><path d="M-6,-6 C-3,-8 1,-8 4,-7" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/><path d="M2,2 L5,6 M3,4 L0,6" stroke="#5C6470" stroke-width="1.2" stroke-linecap="round"/>';
    const rock = { st: 'ready', x: 0, y: 0, vx: 0, vy: 0, rot: 0, skips: 0, t0: calm() ? -1e4 : 0 };
    const band = mk('path', { fill: 'none', stroke: '#6B4A2B', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }, Ly.aim);
    const dots = Array.from({ length: 16 }, (_, i) => mk('circle', { r: Math.max(1.5, 4 - i * .16), fill: '#fff', opacity: 0 }, Ly.aim));
    const pbar = mk('g', { opacity: 0 }, Ly.aim); pbar.innerHTML = '<rect x="-40" y="0" width="80" height="8" rx="4" fill="rgba(0,20,50,.45)"/><rect data-x="pf" x="-40" y="0" width="0" height="8" rx="4" fill="#FED801"/>';
    const pf = pbar.querySelector('[data-x="pf"]');
    const ban = mk('g', { opacity: 0 }, Ly.ui);
    ban.innerHTML = '<text data-b="1" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="700" font-size="34" fill="#FED801" stroke="#12304F" stroke-width="8" stroke-linejoin="round" paint-order="stroke"></text><text data-b="2" y="28" text-anchor="middle" font-family="Fredoka,system-ui,sans-serif" font-weight="600" font-size="16" fill="#fff" stroke="#12304F" stroke-width="5" stroke-linejoin="round" paint-order="stroke"></text>';
    const b1 = ban.querySelector('[data-b="1"]'), b2 = ban.querySelector('[data-b="2"]');
    let stains = []; const fx = [];

    const layout = () => {
      const m = o.g.measure(st); if (!m) return;
      gsvg.setAttribute('width', st.W); gsvg.setAttribute('height', st.H); gsvg.setAttribute('viewBox', '0 0 ' + st.W + ' ' + st.H);
      const small = st.W < 700, sc = o.g.scales(small); st.sc = sc[0]; thrower.s = sc[1];
      st.tx = Math.max(small ? 46 : 80, st.W * .1); st.ox = st.tx + 10 * thrower.s / .5; st.oy = st.WL - 64 * thrower.s / .5;
      slots.forEach(s => { s.duck.s = st.sc; s.bx = Math.min(o.g.bots(st.W, small, s.i), st.W - 12 - 46 * st.sc / .44 - 6); s.by = st.WL + (s.i % 2) * 4; if (s.st === 'float') { s.x = s.bx; s.y = s.by; } });
      // the drag area is the strip around the yellow duck; it never reaches the text or the button
      // everything the game draws stays below the text, the call-out and the score
      st.tb = m.textBottom; o.layer.style.clipPath = 'inset(' + st.tb + 'px 0 0 0)';
      if (m.water) { waterPath.setAttribute('d', m.water.d); waterPath.setAttribute('transform', m.water.tf); }
      [fadeM, shoreM].forEach(mk2 => { mk2.setAttribute('width', st.W); mk2.setAttribute('height', st.H); [...mk2.querySelectorAll('rect')].forEach(r => { r.setAttribute('width', st.W); r.setAttribute('height', st.H); }); });
      fadeG.setAttribute('y1', st.tb > 0 ? st.tb : -10); fadeG.setAttribute('y2', st.tb > 0 ? st.tb + 46 : -9);
      const shp = shoreM.querySelector('path'); shp.setAttribute('d', m.shore ? m.shore.d : ''); if (m.shore) shp.setAttribute('transform', m.shore.tf);
      // the drag area never goes above the text; with no room for it (large text on a narrow page) the game is hidden
      const top = Math.max(m.top, st.tb), room = top <= st.WL - 20;
      Object.assign(hit.style, { left: Math.max(0, st.tx - 70) + 'px', top: top + 'px', width: '140px', height: Math.max(44, st.WL + 24 - top) + 'px' });
      [o.layer, hit, o.g.bar].forEach(e => { e.style.display = room ? '' : 'none'; }); hit.tabIndex = room ? 0 : -1; st.room = room;
    };
    layout();
    new ResizeObserver(() => { layout(); if (!stage.raf) stage.frame(0); }).observe(o.section);
    if (o.g.info) new ResizeObserver(() => { layout(); if (!stage.raf) stage.frame(0); }).observe(o.g.info);
    if (root !== o.section) new ResizeObserver(() => { layout(); if (!stage.raf) stage.frame(0); }).observe(root);

    const step = (r, dt, tg, cb) => {
      r.vx += st.wind * dt; r.vy += G * dt; r.x += r.vx * dt; r.y += r.vy * dt; r.rot += r.vx * dt * 1.6;
      for (const t of tg) if (!t.hit) { const dx = r.x - t.x, dy = r.y - (t.y - 14 * t.k), rr = 12 + 24 * t.k; if (dx * dx + dy * dy < rr * rr) { t.hit = true; r.vx *= .9; r.vy = r.vy * .9 - 40; cb.hit(t); } }
      if (r.y >= st.WL - 4 && r.vy > 0 && !r.dead) {
        if (Math.abs(r.vy) < Math.abs(r.vx) * .8 && Math.hypot(r.vx, r.vy) > 260 && r.skips < 4) { r.vy = -Math.abs(r.vy) * .6; r.vx *= .82; r.y = st.WL - 4; r.skips++; cb.skip(r); }
        else { r.dead = 1; cb.splash(r); }
      }
      if (r.x > st.W + 40 || r.x < -40 || r.y > st.HB + 200) r.dead = 1;
    };
    const targets = () => slots.filter(s => s.st === 'float').map(s => ({ s, x: s.x, y: s.y, k: st.sc / .44, hit: false }));
    const vel = p => { const dx = st.ox - p[0], dy = st.oy - p[1], len = Math.min(180, Math.hypot(dx, dy)), a = Math.atan2(dy, dx), pw = len / 180, sp = (300 + 1150 * pw) * Math.sqrt(Math.max(.35, st.W / 1280)); return { vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, pw, len, a }; };
    const say = (s, t) => { if (red || (cur && cur.def.quiet) || stage.R < (st.hush || 0) || slots.some(o => o !== s && o.st === 'float' && stage.R - o.sayT < Math.max(2000, 900 + (o.X.bt.textContent || '').length * 45))) return false; s.X.bt.textContent = t; const w = [...t].length * 7.4 + 24; s.bw = w; s.X.br.setAttribute('x', -w / 2); s.X.br.setAttribute('width', w); s.sayT = stage.R; return true; };
    const snd = n => { try { window.FlockSound && FlockSound.play(n); } catch (e) {} };
    const throwIt = p => { const v = vel(p); if (v.pw < .08) return false; st.throws = (st.throws || 0) + 1; snd('whoosh'); Object.assign(rock, { st: 'fly', x: st.ox, y: st.oy, vx: v.vx, vy: v.vy, skips: 0, dead: 0 }); st.combo = 0; thrower.react = { type: 'dip', start: stage.R, dur: 380 }; if (red) settleThrow(); return true; };
    // Reduced motion: a throw is worked out at once and shown as its result (score, a stain), with no flight, particles or respawn
    const settleThrow = () => {
      const tg = targets(); let n = 0, g = 0;
      const cb = { hit: t => { if (t.s.safe) return; n++; snd('bonk'); snd('quack'); st.score++; hudS.textContent = st.score; stain(t.x + rnd(-24, 24), rnd(st.lo, Math.max(st.lo + 2, st.hi)), 4); }, skip() {}, splash() {} };
      while (!rock.dead && g++ < 3000) step(rock, 1 / 120, tg, cb);
      if (n === 0) { const f = slots.filter(s => s.st === 'float'); if (f.length) say(pick(f), L('miss')); }

      Object.assign(rock, { st: 'ready', t0: -1e4, dead: 0 }); st.combo = 0; announce(); wake();
    };
    const solve = () => {
      let best = null; const base = targets(); if (!base.length) return null;
      const cb = { hit: () => cb.n++, skip: () => {}, splash: () => {}, n: 0 };
      for (let a = -15; a >= -72; a -= 2.5) for (let pw = .2; pw <= 1; pw += .025) {
        const len = pw * 180, ar = a * Math.PI / 180, p = [st.ox - Math.cos(ar) * len, st.oy - Math.sin(ar) * len], v = vel(p);
        const r = { x: st.ox, y: st.oy, vx: v.vx, vy: v.vy, skips: 0, rot: 0 }, tg = base.map(t => Object.assign({}, t, { hit: false }));
        cb.n = 0; let t = 0; while (!r.dead && t < 4) { step(r, 1 / 120, tg, cb); t += 1 / 120; }
        const sc = cb.n * 10 - t; if (!best || sc > best.sc) best = { sc, p };
      }
      return best;
    };
    // test hook only (window.__road.auto): never called on load
    const auto = () => { if (rock.st !== 'ready') return; const b = solve(); if (!b) return; st.auto = { t0: stage.R, p: b.p }; st.aiming = true; st.ptr = [st.ox, st.oy]; };

    const text = (x, y, t) => { const el = mk('text', { 'text-anchor': 'middle', 'font-family': 'Fredoka,system-ui,sans-serif', 'font-weight': 700, 'font-size': 28, fill: '#FED801', stroke: '#12304F', 'stroke-width': 7, 'stroke-linejoin': 'round', 'paint-order': 'stroke' }, Ly.fx); el.textContent = t; fx.push({ kind: 'text', el, x, y, rot: rnd(-12, 12), age: 0, life: .85 }); };
    const feathers = (x, y) => { for (let i = 0; i < 7; i++) { const el = mk('ellipse', { rx: 6, ry: 2.4, fill: '#C3CBD6', stroke: '#8693A7', 'stroke-width': .8 }, Ly.fx); fx.push({ kind: 'feather', el, x, y, vx: rnd(-160, 160), vy: rnd(-260, -80), ph: rnd(0, 6), age: 0, life: rnd(1.2, 1.9) }); } };
    const splash = (x, y, big) => {
      for (let i = 0; i < (big ? 12 : 5); i++) { const el = mk('circle', { r: rnd(1.5, 3.5), fill: '#DDF2FD' }, Ly.fx); fx.push({ kind: 'drop', el, x: x + rnd(-8, 8), y, vx: rnd(-120, 120), vy: -rnd(big ? 200 : 120, big ? 420 : 240), age: 0, life: 1.2 }); }
      const el = mk('ellipse', { cx: x, cy: y + 2, fill: 'none', stroke: '#DDF2FD', 'stroke-width': 2.5 }, Ly.fx); fx.push({ kind: 'ring', el, r: big ? 22 : 12, age: 0, life: .6 });
    };
    const blood = (x, y, rvx) => { for (let i = 0; i < 12; i++) { const r = rnd(2.5, 5), el = mk('ellipse', { rx: r, ry: r, fill: '#D7263D' }, Ly.fx); fx.push({ kind: 'blood', el, x, y, vx: rvx * .2 + rnd(-260, 420), vy: -rnd(260, 760), r, land: rnd(st.lo, Math.max(st.lo + 2, st.hi)), age: 0, life: 6 }); } };
    const blob = R => {
      const n = 9, P = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283, r = R * rnd(.7, 1.25); P.push([Math.cos(a) * r, Math.sin(a) * r]); }
      const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], m0 = mid(P[n - 1], P[0]);
      let d = 'M' + f1(m0[0]) + ',' + f1(m0[1]);
      for (let i = 0; i < n; i++) { const p = P[i], m = mid(p, P[(i + 1) % n]); d += ' Q' + f1(p[0]) + ',' + f1(p[1]) + ' ' + f1(m[0]) + ',' + f1(m[1]); }
      return d + 'Z';
    };
    const stain = (x, y, r) => {
      if (stains.length > 60) return;
      // The waves curve, so the same y-coordinate can fall on dry shore at a different x.
      // Find nearby water before counting a stain; keep the existing clip for its edges.
      const tr = waterPath.transform.baseVal.consolidate();
      if (!tr || typeof waterPath.isPointInFill !== 'function') return;
      const inverse = tr.matrix.inverse(), pt = gsvg.createSVGPoint();
      const onWater = (px, py) => { pt.x = px; pt.y = py; return waterPath.isPointInFill(pt.matrixTransform(inverse)); };
      let waterY = null;
      for (let delta = 0; delta <= 100 && waterY === null; delta += 2) {
        for (const testY of delta ? [y - delta, y + delta] : [y]) {
          if (testY >= st.tb + 4 && testY <= st.H - 4 && onWater(x, testY) && onWater(x, testY - 3) && onWater(x, testY + 3)) { waterY = testY; break; }
        }
      }
      if (waterY === null) return;
      y = waterY;
      const R = r * rnd(1.4, 2.2), g = mk('g', { transform: 'translate(' + f1(x) + ' ' + f1(y) + ') rotate(' + Math.round(rnd(0, 360)) + ')' }, Ly.stains), inner = mk('g', { transform: 'scale(.2)' }, g);
      let h = '<path d="' + blob(R) + '" fill="#C81D33"/>';
      for (let i = 0, n = 2 + Math.floor(Math.random() * 4); i < n; i++) { const a = rnd(0, 6.28), dd = R * rnd(1.1, 1.6); h += '<circle cx="' + f1(Math.cos(a) * dd) + '" cy="' + f1(Math.sin(a) * dd) + '" r="' + f1(R * rnd(.12, .3)) + '" fill="#C81D33"/>'; }
      h += '<ellipse cx="' + f1(-R * .3) + '" cy="' + f1(-R * .3) + '" rx="' + f1(R * .35) + '" ry="' + f1(R * .18) + '" fill="#fff" opacity=".22"/>';
      inner.innerHTML = h;
      const spot = { g, inner, x, y, born: stage.R, done: red }; stains.push(spot);
      if (red) {
        inner.setAttribute('transform', 'scale(1)');
        const expire = () => { if (held()) { setTimeout(expire, 1000); return; } g.remove(); stains = stains.filter(s => s !== spot); };
        setTimeout(expire, 6500);
      }

    };
    const shake = () => { if (calm()) return; const k = [{ transform: 'translate(0,0)' }, { transform: 'translate(-6px,3px)' }, { transform: 'translate(5px,-3px)' }, { transform: 'translate(-2px,2px)' }, { transform: 'none' }]; anim(gsvg, k, { duration: 260 }); };
    const liveCb = {
      hit: t => { const s = t.s; if (s.safe) { snd('quack'); s.duck.react = { type: 'confused', start: stage.R, dur: 950 }; if (cur && cur.def.safe) cur.def.safe(C, cur.s, s); return; } snd('bonk'); later(() => snd('quack'), 120); Object.assign(s, { st: 'ko', vx: rock.vx * .35 + 90, vy: -480 - Math.random() * 160, spin: (Math.random() < .5 ? -1 : 1) * rnd(600, 1000), landed: false }); st.combo++; st.score++; hudS.textContent = st.score; text(s.x, s.y - 40 * st.sc / .44, L('bonk')); if (Math.random() < .5) { const w = slots.filter(o => o.st === 'float' && o !== s); if (w.length) later(() => say(pick(w), L('witness')), 700); } feathers(s.x, s.y - 16); blood(s.x, s.y - 18, rock.vx); shake(); },
      skip: r => splash(r.x, st.WL, false), splash: r => splash(r.x, st.WL, true)
    };
    const rootPt = e => { const r = root.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    hit.addEventListener('pointerdown', e => { if (rock.st !== 'ready' || isPaused()) return; st.kbd = false; st.auto = null; st.aiming = true; st.thrown = true; st.ptr = rootPt(e); hit.setPointerCapture(e.pointerId); hit.style.cursor = 'grabbing'; wake(); e.preventDefault(); });
    hit.addEventListener('pointermove', e => { if (st.aiming && !st.auto && !st.kbd) { st.ptr = rootPt(e); if (red) stage.frame(0); } });
    // Keyboard: up/down change the angle, left/right the strength, Enter or Space throws. The aim shows from the first key press.
    const kb = { a: -35, pw: .6 }, KEYS = { ArrowUp: [-2.5, 0], ArrowDown: [2.5, 0], ArrowLeft: [0, -.05], ArrowRight: [0, .05] };
    const kbPt = () => { const len = kb.pw * 180, ar = kb.a * Math.PI / 180; return [st.ox - Math.cos(ar) * len, st.oy - Math.sin(ar) * len]; };
    const kbOff = () => { if (!st.kbd) return; st.kbd = false; st.aiming = false; wake(); };
    const kbKey = (k, rep) => {
      if (KEYS[k]) { kb.a = cl(kb.a + KEYS[k][0], -80, -10); kb.pw = cl(kb.pw + KEYS[k][1], .1, 1); }
      st.auto = null; st.thrown = true; st.kbd = true; st.aiming = true; st.ptr = kbPt();
      if ((k === 'Enter' || k === ' ') && !rep && rock.st === 'ready') throwIt(st.ptr);
      wake();
    };
    hit.addEventListener('keydown', e => {
      const k = e.key;
      if (k === 'Escape') { kbOff(); return; }
      if (k !== 'Enter' && k !== ' ' && !KEYS[k]) return;
      e.preventDefault(); if (!isPaused()) kbKey(k, e.repeat);
    });
    hit.addEventListener('blur', kbOff);
    // T throws only while the duck control has focus.
    document.addEventListener('keydown', e => {
      const t = e.target;
      if ((e.key !== 't' && e.key !== 'T') || e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.defaultPrevented || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))) return;
      if (document.activeElement !== hit || !on() || isPaused()) return;
      e.preventDefault(); if (document.activeElement !== hit) hit.focus({ preventScroll: true }); kbKey('Enter', false);
    });
    hit.addEventListener('pointerup', () => { hit.style.cursor = 'grab'; if (!st.aiming || st.auto) return; st.aiming = false; if (!throwIt(st.ptr)) snd('quack'); });
    hit.addEventListener('pointercancel', () => { st.aiming = false; });
    const frame = (R, dt) => {
      // slots
      slots.forEach(s => {
        if (s.st === 'float') { s.x = s.bx + Math.sin(R / 1800 + s.i * 2) * 5; s.y = s.by + Math.sin(R / 1300 + s.i) * 1.2; s.rot = 0; }
        else if (s.st === 'ko') { s.vy += G * dt; s.x += s.vx * dt; { const hw = 46 * st.sc / .44 + 12; if (s.x > st.W - hw) { s.x = st.W - hw; s.vx = -Math.abs(s.vx) * .3; } else if (s.x < hw) { s.x = hw; s.vx = Math.abs(s.vx) * .3; } } s.y += s.vy * dt; s.rot += s.spin * dt; if (s.y >= st.WL + 6 && s.vy > 0) { s.st = 'down'; s.t0 = R; s.y = st.WL; splash(s.x, st.WL, true); } if (s.x > st.W + 60 || s.x < -60) { s.st = 'sink'; s.t0 = R - 700; } }
        else if (s.st === 'down') { if (R - s.t0 > 3000) { s.st = 'sink'; s.t0 = R; } }
        else if (s.st === 'sink') { if (R - s.t0 > 700) { s.st = 'para'; s.y = (st.tb || 0) + 230 * st.sc; s.rot = 0; } }
        else if (s.st === 'para') { s.y += 170 * dt; s.rot = Math.sin(R / 380) * 9; s.x = s.bx + Math.sin(R / 700) * 10; if (s.y >= s.by) { s.y = s.by; s.rot = 0; s.st = 'float'; s.t0 = R; s.landed = true; s.duck.react = { type: 'land', start: R, dur: 420 }; say(s, L('respawn')); } }
      });
      // auto aim
      if (st.auto) { const k = (R - st.auto.t0) / 800, u = E.io(Math.min(1, k)); st.ptr = [st.ox + (st.auto.p[0] - st.ox) * u, st.oy + (st.auto.p[1] - st.oy) * u]; if (k >= 1.15) { const p = st.auto.p; st.auto = null; st.aiming = false; throwIt(p); } }
      // rock
      if (rock.st === 'fly') {
        const tg = targets(), n = Math.max(1, Math.ceil(dt * 240));
        for (let i = 0; i < n && !rock.dead; i++) step(rock, dt / n, tg, liveCb);
        if (rock.dead) { rock.st = 'gone'; rock.t0 = R; }
      } else if (rock.st === 'gone' && R - rock.t0 > 600) {
        if (st.combo >= 2) { st.banner = { t0: R }; const cl2 = L(st.combo >= 3 ? 'combo3' : 'combo2').split('|'); b1.textContent = cl2[0]; b2.textContent = cl2[1] || ''; thrower.react = { type: 'happy', start: R, dur: 720 }; }
        else if (st.combo === 0 && st.thrown) { thrower.react = { type: 'shake', start: R, dur: 700 }; const f = slots.filter(s => s.st === 'float'); if (f.length) say(pick(f), L('miss')); }

        rock.st = 'ready'; rock.t0 = R; st.combo = 0; announce();
      }
      if (rock.st === 'ready') { const k = Math.min(1, (R - rock.t0) / 300); rockG.setAttribute('opacity', 1); rockG.setAttribute('transform', 'translate(' + f1(st.ox) + ' ' + f1(st.oy + Math.sin(R / 400) * 2) + ') scale(' + E.back(k).toFixed(3) + ')'); }
      else if (rock.st === 'fly') rockG.setAttribute('transform', 'translate(' + f1(rock.x) + ' ' + f1(rock.y) + ') rotate(' + f1(rock.rot) + ')');
      else rockG.setAttribute('opacity', 0);
      // aim visuals
      if (st.aiming && st.ptr && rock.st === 'ready') {
        const v = vel(st.ptr), px = st.ox - Math.cos(v.a) * v.len, py = st.oy - Math.sin(v.a) * v.len;
        band.setAttribute('d', 'M' + f1(st.ox) + ',' + f1(st.oy) + ' L' + f1(px) + ',' + f1(py)); band.setAttribute('opacity', .9);
        const r = { x: st.ox, y: st.oy, vx: v.vx, vy: v.vy, skips: 9, rot: 0 }, nocb = { hit() {}, skip() {}, splash() {} };
        dots.forEach((d, i) => { for (let j = 0; j < 8; j++) step(r, 1 / 120, [], nocb); d.setAttribute('cx', f1(r.x)); d.setAttribute('cy', f1(r.y)); d.setAttribute('opacity', r.dead ? 0 : (.9 - i * .045).toFixed(2)); });
        pbar.setAttribute('opacity', 1); pbar.setAttribute('transform', 'translate(' + f1(st.tx) + ' ' + f1(st.WL + 14) + ')'); pf.setAttribute('width', f1(80 * v.pw)); pf.setAttribute('fill', v.pw > .8 ? '#E5604F' : '#FED801');
      } else { band.setAttribute('opacity', 0); dots.forEach(d => d.setAttribute('opacity', 0)); pbar.setAttribute('opacity', 0); }
      // taunts
      if (!red && on() && R > st.nextSay && !convo && !(cur && cur.def.quiet)) { const f = slots.filter(s => s.st === 'float' && R - s.sayT > 2200); if (f.length > 1 && Math.random() < .3 && !cur) chat('banterIdle'); else if (f.length) say(pick(f), L('taunt')); st.nextSay = R + rnd(3500, 6500); }
      // ducks
      const watch = rock.st === 'fly' ? [rock.x, rock.y] : null;
      FD.update(thrower, 0, R, dt * 1000, st.aiming && st.ptr ? st.ptr : watch, '#2F6FC4');
      slots.forEach(s => FD.update(s.duck, 0, R, dt * 1000, watch, '#2F6FC4'));
      slots.forEach(s => {
        const X = s.X, d = s.duck, sc = st.sc / .44, showW = s.st === 'float';
        if (dt) s.op += ((s.hid ? 0 : 1) - s.op) * (1 - Math.exp(-dt / .12));
        d.e.g.setAttribute('opacity', s.st === 'down' || s.st === 'sink' ? 0 : +s.op.toFixed(2));
        if (d.e.wf) { d.e.wf.style.display = showW ? '' : 'none'; d.e.wf.nextElementSibling.style.display = showW ? '' : 'none'; d.e.ring.style.display = showW ? '' : 'none'; }
        let fo = 0, fy = 0, so = 0, sy = 0;
        if (s.st === 'down') { const k = cl((R - s.t0) / 260, 0, 1); fo = 1; fy = 18 * (1 - E.back(k)); const k2 = cl((R - s.t0 - 350) / 450, 0, 1); so = k2 > 0 ? 1 : 0; sy = 30 * (1 - E.back(k2)); }
        else if (s.st === 'sink') { const k = cl((R - s.t0) / 700, 0, 1); fo = 1 - k; fy = 24 * k; so = 1 - k; sy = 30 * k; }
        X.feet.setAttribute('opacity', fo); X.feet.setAttribute('transform', 'translate(' + f1(s.x) + ' ' + f1(st.WL - 2 + fy) + ') scale(' + sc.toFixed(3) + ')');
        X.f1.setAttribute('transform', 'translate(-7 0) rotate(' + f1(-14 + Math.sin(R / 90) * 16) + ')'); X.f2.setAttribute('transform', 'translate(7 0) rotate(' + f1(14 + Math.sin(R / 90 + 1.5) * 16) + ')');
        X.stars.setAttribute('opacity', s.st === 'down' ? 1 : 0);
        [...X.stars.children].forEach((p, i) => { const a = R / 260 + i * 2.094; p.setAttribute('transform', 'translate(' + f1(s.x + Math.cos(a) * 20 * sc) + ' ' + f1(st.WL - 34 * sc + Math.sin(a) * 6) + ') rotate(' + Math.round((R / 6) % 360) + ')'); });
        X.sign.setAttribute('opacity', so); X.sign.setAttribute('transform', 'translate(' + f1(Math.min(st.W - 62, s.x + 34 * sc)) + ' ' + f1(st.WL + sy) + ') rotate(' + f1(Math.sin(R / 500) * 4) + ') scale(' + Math.max(.75, sc).toFixed(3) + ')');
        let co = 0, cs = 1; if (s.st === 'para') co = 1; else if (s.st === 'float' && s.landed && R - s.t0 < 420) { const k = (R - s.t0) / 420; co = 1 - k; cs = 1 - k; }
        X.chute.setAttribute('opacity', co.toFixed(2)); X.chute.setAttribute('transform', 'translate(' + f1(s.x) + ' ' + f1(s.y - 72 * sc) + ') rotate(' + f1(s.rot) + ') scale(' + sc.toFixed(3) + ' ' + Math.max(.001, sc * cs).toFixed(3) + ')');
        const bk = (R - s.sayT) / Math.max(2000, 900 + ((s.X.bt.textContent || '').length * 45)), bo = s.st === 'float' && bk >= 0 && bk < 1 ? 1 : 0;
        X.bub.setAttribute('opacity', bo); if (bo) X.bub.setAttribute('transform', 'translate(' + f1(Math.min(st.W - 12 - (s.bw || 0) / 2, Math.max(12 + (s.bw || 0) / 2, s.x))) + ' ' + f1(Math.max((st.tb || 0) + 40, s.y - 58 * sc)) + ') scale(' + E.back(Math.min(1, bk * 8)).toFixed(3) + ')');
      });
      layoutDM(R);
      if (barUntil && R >= barUntil && !o.hint.matches(':hover') && !o.hint.contains(document.activeElement)) barBack();
      // fx
      for (let i = fx.length - 1; i >= 0; i--) {
        const p = fx[i]; p.age += dt; const k = p.age / p.life;
        if (p.kind === 'text') { p.el.setAttribute('transform', 'translate(' + f1(p.x) + ' ' + f1(p.y - 26 * E.o(Math.min(1, k))) + ') rotate(' + f1(p.rot) + ') scale(' + E.back(Math.min(1, p.age / .22)).toFixed(3) + ')'); p.el.setAttribute('opacity', k > .75 ? ((1 - k) / .25).toFixed(2) : 1); }
        else if (p.kind === 'feather') { p.vy = Math.min(60, p.vy + 140 * dt); p.vx *= .985; p.x += (p.vx + Math.sin(p.age * 6 + p.ph) * 40) * dt; p.y += p.vy * dt; p.el.setAttribute('transform', 'translate(' + f1(p.x) + ' ' + f1(p.y) + ') rotate(' + f1(Math.sin(p.age * 5 + p.ph) * 40) + ')'); p.el.setAttribute('opacity', (1 - k).toFixed(2)); }
        else if (p.kind === 'drop') { p.vy += G * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.el.setAttribute('cx', f1(p.x)); p.el.setAttribute('cy', f1(p.y)); if (p.y > st.WL + 6 && p.vy > 0) p.age = p.life; }
        else if (p.kind === 'ring') { p.el.setAttribute('rx', f1(p.r * (1 + k * 1.6))); p.el.setAttribute('ry', f1(p.r * .3 * (1 + k * 1.6))); p.el.setAttribute('opacity', ((1 - k) * .8).toFixed(2)); }
        else if (p.kind === 'blood') { p.vy += G * dt; p.x += p.vx * dt; p.y += p.vy * dt; const sp = Math.hypot(p.vx, p.vy); p.el.setAttribute('transform', 'translate(' + f1(p.x) + ' ' + f1(p.y) + ') rotate(' + f1(Math.atan2(p.vy, p.vx) * 57.3) + ')'); p.el.setAttribute('rx', f1(p.r * (1 + Math.min(1.4, sp / 700)))); if (p.vy > 0 && p.y >= p.land) { if (p.x > 0 && p.x < st.W) stain(p.x, p.y, p.r); p.age = p.life; } }
        if (p.age >= p.life) { p.el.remove(); fx.splice(i, 1); }
      }
      stains = stains.filter(s => {
        const age = R - s.born;
        if (!s.done) { const k = Math.min(1, age / 220); s.inner.setAttribute('transform', 'scale(' + Math.max(.2, E.back(k)).toFixed(3) + ')'); if (k >= 1) s.done = true; }
        if (!red && age >= 6500) { s.g.remove(); return false; }
        if (!red && age > 5500) s.g.setAttribute('opacity', ((6500 - age) / 1000).toFixed(2));
        return true;
      });
      // banner
      // one banner at a time, in the pond strip, at least 24px below the score and no wider than the area
      if (st.banner) { const k = (R - st.banner.t0) / 1800; if (k > 1) { st.banner = null; ban.setAttribute('opacity', 0); } else { const bw = b1.getBBox().width + 24, sc2 = Math.min(1, (st.W - 32) / bw), hw = bw * sc2 / 2, cx = Math.min(st.W - 16 - hw, Math.max(16 + hw, (slots[0].bx + slots[2].bx) / 2)), by = Math.max((st.tb || 0) + 24 + 34, st.WL - 120); ban.setAttribute('opacity', k > .85 ? ((1 - k) / .15).toFixed(2) : 1); ban.setAttribute('transform', 'translate(' + f1(cx) + ' ' + f1(by) + ') rotate(' + f1(Math.sin(R / 120) * 3) + ') scale(' + (E.back(Math.min(1, k * 6)) * sc2).toFixed(3) + ')'); } }
      // keep the loop awake a moment after anything is still moving (reduced motion and off-screen stop when idle)
      if ((st.aiming && !st.kbd) || st.auto || rock.st !== 'ready' || R - rock.t0 < 320 || fx.length || st.banner || cur || convo || pending.length || barUntil || slots.some(s => s.st !== 'float' || (s.landed && R - s.t0 < 420) || R - s.sayT < Math.max(2000, 900 + (s.X.bt.textContent || '').length * 45))) st.wakeUntil = R + 1000;
    };
    let cur = null, nextEv = 6000, eid = 0; const recent = [];
    let convo = null;
    const chat = cat => { const lines = L(cat); if (!Array.isArray(lines)) return; convo = { lines, i: 0, next: stage.R + 900, last: null }; };
    const tickChat = R => {
      if (!convo || R < convo.next) return;
      if (cur) { convo = null; return; }
      const f = slots.filter(o => o.st === 'float'); if (!f.length) { convo.next = R + 800; return; }
      let sp = f.length > 1 ? f.filter(o => o !== convo.last) : f; sp = sp[convo.i % sp.length] || f[0];
      const line = convo.lines[convo.i];
      if (!say(sp, line)) { convo.next = R + 150; return; }
      sp.duck.react = { type: convo.i % 2 ? 'quack' : 'dip', start: R, dur: 300 };
      f.forEach(o => { if (o !== sp) o.duck.look = [[0, sp.x, sp.y - 20]]; }); sp.duck.look = null;
      convo.last = sp; convo.i++; st.nextSay = R + 5000;
      convo.next = R + 1100 + line.length * 38;
      if (convo.i >= convo.lines.length) { convo = null; later(() => slots.forEach(o => o.duck.look = null), 1800); }
    };
    // The ten events that match what The Flock deals with. The other events stay in the event files, switched off.
    const EVENTS_ON = ['spotfake', 'pirate', 'banner', 'clones', 'rug', 'airdrop', 'bluecheck', 'modhand', 'gull', 'bread'];
    const evList = () => { const m = new Map(); (window.FlockEvents || []).forEach(d => { if (EVENTS_ON.includes(d.id)) m.set(d.id, d); }); return [...m.values()]; };
    const C = {
      get W() { return st.W; }, get WL() { return st.WL; }, get HB() { return st.HB; }, get top() { return 0; }, get k() { return st.sc / .44; },
      R: 0, dt: 0, slots, thrower, E, cl, lp: FD.lp, rnd, pick, mk, FD,
      floats: () => slots.filter(s => s.st === 'float'),
      grab: s => { s.st = 'event'; s.rot = 0; return s; },
      release: (s, how) => { if (how === 'float') { s.st = 'float'; s.rot = 0; } else { s.st = 'sink'; s.t0 = stage.R - 700; } },
      say, text, line: L, splash, feathers, blood, shake,
      ko: (s, vx) => { Object.assign(s, { st: 'ko', vx: vx == null ? 120 : vx, vy: -520, spin: rnd(600, 1000) * (Math.random() < .5 ? -1 : 1), landed: false }); st.score++; hudS.textContent = st.score; feathers(s.x, s.y - 16); },
      g: front => { const e = mk('g', {}, front === false ? Ly.evb : Ly.evf); if (cur) cur.gs.push(e); return e; },
      duck: o => { const d = Object.assign({ id: 'e' + (++eid), k: 'g', s: st.sc, d0: 1, land: true, px: 0, py: 0, pv: 0 }, o); const g = C.g(o.front !== false); g.innerHTML = FD.svg(d); FD.prep(d, g); d.posFn = () => [d.px, d.py, d.pv]; return d; },
      upd: (d, ptr) => FD.update(d, 0, stage.R, C.dt * 1000, ptr || null, '#2F6FC4'),
      // a focusable, named HTML button for an event's tappable thing (the SVG is hidden from assistive tech); removed when the event ends
      control: (name, fn) => { const b = el('button', 'position:absolute;z-index:6;background:none;border:0;padding:0;border-radius:50%;pointer-events:none'); b.type = 'button'; b.className = 'game-control'; b.setAttribute('aria-label', name); b.addEventListener('click', fn); root.insertBefore(b, hit.nextSibling); if (cur) cur.gs.push(b); return b; },
      // fake-admin round: a held bubble per duck, a duck that steps out of the scene and back, and the call-out line
      dm: (s, text, soft) => { s.dm = { t0: stage.R, soft: !!soft }; setDM(s, text, soft); },
      dmOff: s => { s.dm = null; },
      hide: (s, on) => { s.hid = on; if (on) { s.st = 'event'; } else { s.st = 'float'; s.rot = 0; s.duck.react = { type: 'hop', start: stage.R, dur: 520 }; } },
      bar: barSay,
      label: () => {}, onRare: () => {}
    };
    const endEv = () => {
      const c = cur; cur = null;
      try { c.def.end && c.def.end(C, c.s); } catch (e) { console.warn(e); }
      if (c.gs.includes(document.activeElement)) hit.focus({ preventScroll: true });
      c.gs.forEach(g => g.remove());
      slots.forEach(s => { if (s.st === 'event') C.release(s, 'para'); });
      nextEv = stage.R + rnd(11000, 18000);
      if (c.def.quiet) { st.nextSay = Math.max(st.nextSay, stage.R + 8000); st.hush = stage.R + 7500; }   // the ducks stay quiet while the line in the bar is read
      else if (Math.random() < .85) chat('banterAfter');
    };
    const startEv = () => {
      const L = evList().filter(d => (d.need || 0) <= C.floats().length && !recent.includes(d.id));
      if (!L.length) { recent.length = 0; return; }
      const tot = L.reduce((a, d) => a + (d.weight == null ? 1 : d.weight), 0); let r = Math.random() * tot, def = L[0]; for (const d of L) { r -= d.weight == null ? 1 : d.weight; if (r <= 0) { def = d; break; } }
      recent.push(def.id); if (recent.length > 12) recent.shift();
      cur = { def, t0: stage.R, gs: [], s: {} };

      try { def.start && def.start(C, cur.s); } catch (e) { console.warn(e); endEv(); }
    };
    const tickEv = (R, dt) => {
      C.R = R; C.dt = dt; tickChat(R);
      if (cur) {
        let t = (R - cur.t0) / 1000;
        try { cur.def.frame(C, Math.min(1, t / cur.def.dur), t, dt, cur.s); } catch (e) { console.warn(cur.def.id, e); t = 1e9; }
        if (t >= cur.def.dur || cur.s.finish) endEv();
      } else if (!calm() && R > nextEv && on() && !st.aiming) startEv();
    };
    const stage = new FD.Stage({ observe: root, threshold: .01, end: 0, frame: (T, R, dtms) => { const dt = Math.min(.05, dtms / 1000); tickLater(R); tickEv(R, dt); frame(R, dt); } });
    // Runs while the tab is shown and nothing is paused, and then only while the hero is on screen (idle animation, not under
    // reduced motion) or something is still moving.
    stage.run = () => !red && !document.hidden && !isPaused() && (stage.visible && (stage.R < st.wakeUntil || (!red && on())));
    // Reduced motion: no loop at all. Every state change paints one static frame (the clock does not move, so nothing bobs or grows).
    const wake = () => { if (red) { stage.frame(0); return; } st.wakeUntil = Math.max(st.wakeUntil || 0, stage.R + 1000); stage.kick(); };
    stage.reduced = red;
    stage.frame(0);
    const syncLive = () => { const lv = !o.g.live || o.g.live(); hit.tabIndex = lv ? 0 : -1; wake(); };
    if (o.g.live) { new MutationObserver(syncLive).observe(o.section, { attributes: true, attributeFilter: ['class'] }); syncLive(); }
    new IntersectionObserver(es => { inView = es[es.length - 1].isIntersecting; stage.kick(); }).observe(hero);
    // Pause, resume and a hidden tab hold or release every game animation; the game clock (and so every timer) stops by itself
    const syncMotion = () => { if (held() && stage.raf) { cancelAnimationFrame(stage.raf); stage.raf = 0; }
      anims.forEach(a => { if (held()) a.pause(); else if (a.playState === 'paused') a.play(); }); wake(); };
    document.addEventListener('visibilitychange', syncMotion);
    const F = window.Flock;
    if (F && F.pauseAll && F.resumeAll) { const pa = F.pauseAll, ra = F.resumeAll; F.pauseAll = function () { const r = pa.apply(this, arguments); syncMotion(); return r; }; F.resumeAll = function () { const r = ra.apply(this, arguments); syncMotion(); return r; }; }
    // Reduced motion, on at load or switched on later: everything settles where it is, at once
    const settleAll = () => {
      anims.forEach(a => { try { a.finish(); } catch (e) { a.cancel(); } }); anims.clear(); pending.length = 0;
      fx.splice(0).forEach(p => p.el.remove());
      if (cur) endEv(); convo = null; st.auto = null; st.aiming = false; st.banner = null; ban.setAttribute('opacity', 0);
      Object.assign(rock, { st: 'ready', t0: -1e4, dead: 0 }); st.combo = 0;
      slots.forEach(s => { if (s.st !== 'float') { s.st = 'float'; s.rot = 0; s.landed = false; s.x = s.bx; s.y = s.by; } });
      stains.forEach(s => s.g.remove()); stains = [];
      slots.forEach(s => { s.dm = null; s.safe = false; s.hid = false; s.op = 1; }); barBack();
      stage.frame(0); wake();
    };
    if (window.matchMedia) { const mq = matchMedia('(prefers-reduced-motion: reduce)'), onMq = () => { red = stage.reduced = mq.matches; if (red) settleAll(); else wake(); }; if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq); }
    window.__road = Object.assign(window.__road || {}, { root, game: stage, auto, st, slots, ev: C, startEv: id => { const d = evList().find(x => x.id === id); if (!d || (d.need || 0) > C.floats().length) return 'busy'; if (cur) endEv(); cur = { def: d, t0: stage.R, gs: [], s: {} }; d.start && d.start(C, cur.s); } });
    }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
