# Handoff: Flock motion foundations (Phase 0 + Phase 1)

## 1. Overview

arcflock.com (The Flock) explains the product with inline SVG scenes and HTML recreations of Telegram bot screens. Their animation is spread over four mechanisms (CSS keyframes, SVG SMIL, `setTimeout` chains, a raw scroll listener), with no shared timing values, no pause control and several bugs.

**Repo:** the site moved from `Siah-kin/community-bot` to `Siah-kin/the-flock-website`. The old paths in community-bot are redirect stubs. `page_4/` is now `now/`, and `why/` is a new page that copies the opening flock, the road rail and the "One tap" scene from `now/`, plus the pond CSS from the home page. All paths below are in the-flock-website.

This handoff covers the first two phases of the motion upgrade:

- **Phase 0:** fix nine defects without changing anything visible beyond the fix.
- **Phase 1:** add a shared motion system (tokens, a small scene runtime, a global pause toggle, lint rules, a snapshot script) and move the existing animations onto it with no visual change.

Later phases (illustrated duck in Rive, re-choreographed scenes) are out of scope here. Section 6 describes the hook the runtime must leave for them.

## 2. About the design files

The two `.dc.html` files in this folder are reference documents created in HTML (an audit/plan and an illustrator brief). They are not site code. Do not copy them into the site. This README is the implementation spec and is meant to be complete on its own.

Fidelity: the site already exists. Nothing in this handoff should change copy, layout, colours or artwork. The only visible changes are the bug fixes and the new pause toggle.

## 3. Phase 0: defects

Fix in this order, one commit each.

### 3.1 Ambient loops never pause (index.html, now/index.html, why/index.html)
In `index.html` the rules
```css
.scene-svg *, .hero-ducks * { animation-play-state: paused; }
.play .scene-svg *, .hero-ducks * { animation-play-state: running; }
```
are selector lists, so `.hero-ducks *` is always `running`. The Why duck (`.why .ducks-swim`) and the opening flock on now/ and why/ (`.top .flock use`) have no pause either.

Fix: everything with an infinite animation is paused by default and runs only while its section is in view and the tab is visible.
- Pause rule: `.hero-ducks *`, `.ducks-swim`, `.scene-svg *`, `.top .flock use` → `animation-play-state: paused`.
- Running rule: only when an ancestor has `.play`: `.hero.play .hero-ducks *`, `.why.play .ducks-swim` (or the `.band.navy` section), `#lanes.play .scene-svg *`, `#flow.play .scene-svg *`, `.top.play .flock use`.
- Observe those sections with one IntersectionObserver (threshold 0.2) and toggle `.play`. On `visibilitychange` with `document.hidden`, remove `.play` from all of them; restore on visible for those still intersecting.
- In Phase 1 this moves into `flock-motion.js` (section 4.3). In Phase 0, put it in the page's existing inline script.

### 3.2 Fee scene reduced-motion frame (index.html, `#flow`)
With reduced motion the script calls `setCurrentTime(1.4)`, which freezes a USDC coin halfway down the first pipe.
Fix: in reduced motion, call `pauseAnimations()` and hide every `.coin` group in `#fee-svg` (`style.display = 'none'`). The static coins already drawn in the "Your project" box carry the meaning.

### 3.3 Shared timer array (index.html)
`var timers = []` is declared once and used by `playMarks()` for every `[data-demo]` block, so changing a tab in the support demo cancels the highlight sequence in the X demo.
Fix: create the timer array inside the `document.querySelectorAll('[data-demo]').forEach(function (demo) { ... })` closure and pass it to `playMarks(panel, timers)`.

### 3.4 Rail scroll handler (now/index.html, why/index.html)
`tick()` calls `getBoundingClientRect()` on every scroll event.
Fix: on scroll, schedule one `requestAnimationFrame(tick)` if none is pending. Also stop measuring when `.road` is fully out of view (use an IntersectionObserver on `.road` to attach and detach the scroll listener).

### 3.5 Hidden SVG variants also play (now/index.html, why/index.html)
Each figure has a `.wide` and a `.tall` SVG; one is `display:none` per breakpoint (600px). Both are played, including `beginElement()` on the hidden one's `animateMotion`.
Fix: `play()` only acts on an SVG whose `getComputedStyle(svg).display !== 'none'`. On `matchMedia('(max-width: 600px)')` change, if the figure has already played, put the newly visible variant straight into its end state (add `.go`; for SMIL call `beginElement()` then `setCurrentTime(3)`).

### 3.6 Hero card hides LCP (index.html)
`.hero figure { animation: rise ... both }` starts at `opacity: 0`. The figure contains `history.jpg`, which is the likely LCP element, and Chrome does not report invisible elements.
Fix: change the keyframe to `from { opacity: .01; transform: translateY(24px); }`. Leave the timing alone.

### 3.7 Farm ducks never swim (why/index.html, `svg.scene-svg.farm`)
Eight grey ducks carry `class="duck sw sN"`, but nothing on why/ adds `.play`, so `.scene-svg *` keeps them paused.
Fix: add the farm's `figure` to the ambient observer from 3.1 so the ducks swim while it is in view, as in the home page's left pond. Add `.scene-svg .sw { animation: none; }` to the page's reduced-motion block. If the owner decides the drawing should stay still, remove the `sw sN` classes instead (open question in the audit).

### 3.8 Active-section scroll handler (how/index.html)
The sidebar highlight runs on every scroll event and reads every section's offset.
Fix: replace it with one IntersectionObserver on the sections (`rootMargin: '-100px 0px -60% 0px'`) that sets the active sidebar link. Keep the current class names.

### 3.9 Smooth scroll ignores reduced motion (how/index.html)
Anchor clicks call `scrollIntoView({ behavior: 'smooth', block: 'start' })`. The CSS reduced-motion rule does not affect this.
Fix: use `behavior: reduce ? 'auto' : 'smooth'`, with `reduce` read from `matchMedia('(prefers-reduced-motion: reduce)')` at click time.

Not in Phase 0 (needs re-choreography, later phase): fee coin causality, the gate scene's hard pop, panel-swap height jump, tall "Loop to X" duck orientation.

## 4. Phase 1: foundations

### 4.1 `css/motion.css`
Link it in the `<head>` of `index.html`, `now/index.html` and `why/index.html`, before the inline `<style>`, with a `?v=` query string.

```css
:root {
    --dur-micro: 120ms;
    --dur-short: 220ms;
    --dur-med: 420ms;
    --dur-long: 800ms;
    --ease-enter: cubic-bezier(.16, 1, .3, 1);
    --ease-exit: cubic-bezier(.4, 0, 1, 1);
    --ease-move: cubic-bezier(.45, 0, .55, 1);
    --ease-pop: cubic-bezier(.34, 1.56, .64, 1);
    --ease-hover: cubic-bezier(.2, .8, .2, 1);
    --amb-bob: 4s;
    --amb-bob-slow: 5s;
    --amb-swim: 7s;
    --amb-ripple: 1.6s;
}
@media (prefers-reduced-motion: reduce) {
    :root { --dur-micro: 0ms; --dur-short: 0ms; --dur-med: 0ms; --dur-long: 0ms; }
}
html[data-motion="paused"] *,
html[data-motion="paused"] *::before,
html[data-motion="paused"] *::after { animation-play-state: paused !important; }
```

Then replace the literals in the two pages' inline styles with tokens where the value matches. Mapping of current values:

| Current | Token |
|---|---|
| `.18s cubic-bezier(.2,.8,.2,1)` (CTA hover) | `var(--dur-short) var(--ease-hover)` (180→220ms is accepted) |
| `.2s` thumbnail transitions | `var(--dur-short)` |
| `.45s cubic-bezier(.16,1,.3,1)` (`swap`) | `var(--dur-med) var(--ease-enter)` |
| `.8s cubic-bezier(.16,1,.3,1)` (`rise`) | `var(--dur-long) var(--ease-enter)` |
| `.6s cubic-bezier(.16,1,.3,1)` (now/ and why/ `slide`) | keep literal, add comment `/* scene beat */` |
| `4s` bob loops | `var(--amb-bob)` |
| `5s` Why duck bob | `var(--amb-bob-slow)` |
| `7s` swim | `var(--amb-swim)` |
| `1.6s` ripple | `var(--amb-ripple)` |

Scene-specific beat timings (delays inside the now/ and why/ scenes, the 6s `through` loop) stay as literals for now; they get rewritten in a later phase.

### 4.2 Global pause toggle
- A button with text "Pause animations", which changes to "Play animations" when paused, with `aria-pressed` reflecting state.
- Placement: read `js/nav-loader.js` and `includes/nav.html` and add it in the nav next to the existing theme control if there is one. Check that the nav still renders on every page (index, now/, why/, how/, faq/, about.html, 404.html, privacy.html, legal/privacy.html). If it does not fit, put it in the page footer `.links` instead and tell me.
- Behaviour: sets `document.documentElement.dataset.motion = 'paused'` or removes it, stores `'paused'` or `'running'` in `localStorage['flock-motion']`, and calls `Flock.pauseAll()` or `Flock.resumeAll()`. Restored on load before scenes start.
- Hidden when `prefers-reduced-motion: reduce` (there is nothing to pause).
- Style: match nav text links. Focus ring `outline: 3px solid var(--blue); outline-offset: 3px`.

### 4.3 `js/flock-motion.js`
Classic script, `defer`, IIFE, exposes `window.Flock`. Under 6 KB gzipped. No dependencies.

```js
Flock.reduced            // boolean, live (listens to the media query)
Flock.paused             // boolean, from the toggle
Flock.ambient(el)        // el gets .play while in view, tab visible, not paused
Flock.scene(el, {
    mode: 'once',        // 'once' | 'loop'
    threshold: 0.45,
    variants: 'svg',     // optional selector; only the displayed match is driven (see 3.5)
    beats: [ { at: 0, run: function (ctx) {} }, ... ],
    reset: function (ctx) {},   // put the scene back to its first frame
    end: function (ctx) {}      // put the scene in its final frame instantly
})                       // returns { play(), replay(), seek(ms), pause(), resume(), el }
Flock.pauseAll() / Flock.resumeAll()
Flock.scenes             // array of all scene handles (used by the snapshot script)
```

Behaviour:
- `ambient`: one shared IntersectionObserver (threshold 0.2) plus `visibilitychange`. Replaces the Phase 0 inline code.
- `scene`: when the element first reaches `threshold`, call `reset` then schedule beats from a single clock (`performance.now()` plus one `requestAnimationFrame` loop, not one `setTimeout` per beat). `mode: 'once'` unobserves after playing.
- `seek(ms)`: cancel pending beats, call `reset`, run every beat with `at <= ms` synchronously, and set any WAAPI or CSS animations inside the element to the matching `currentTime` (`el.getAnimations({ subtree: true })`). For SMIL children call `setCurrentTime(ms / 1000)`.
- Reduced motion: never schedule beats; call `end` once when the scene is first registered.
- Paused: scenes that would start wait until resumed; running scenes pause their clock, their WAAPI animations and SMIL (`pauseAnimations()`).
- `replay()`: `reset` and play from 0. Wire the existing "Play again" buttons (`.replay[data-for]`) to it.

### 4.4 Lint script `scripts/motion_lint.py`
The repo has no scripts folder or validators yet. Create this one: Python 3, standard library only, reports file and line, exits 1 on any error.
- `transition: all` anywhere in `*.html` and `css/*.css`: warning for now, because `css/bonzi-design.css` and how/ still use it.
- New `<animate`, `<animateMotion`, `<animateTransform` tags in files other than `index.html` and `now/index.html`: error.
- Any page with an `@keyframes` rule but no `prefers-reduced-motion` block: error.
- After 4.7: `@keyframes` named `rise`, `bob`, `bob2`, `swim`, `through`, `ripple`, `swap`, `ring`, `on`, `slide` or `draw` defined anywhere except `css/flock-scenes.css`: error.

### 4.5 Snapshot script `scripts/motion_snapshots.py`
Python with Playwright (`pip install playwright && playwright install chromium`), matching the repo's other Python scripts.
- Starts `python3 -m http.server` on a free port.
- For `/`, `/now/` and `/why/` at 1280×800 and 390×844: scroll each scene into view, then for each `Flock.scenes` handle call `seek()` at each beat's `at` and at the end, and save `motion-snapshots/<page>-<width>-<scene>-<ms>.png`.
- Repeat with `emulate_media(reduced_motion='reduce')` and save `-reduced.png`.
- Add `motion-snapshots/` to `.gitignore`. No CI workflow yet.

### 4.6 Move existing animations onto the runtime (no visual change)
`index.html`
- Hero ducks, Why duck, both ponds (`#lanes`), fee scene (`#flow`): `Flock.ambient(section)`. For `#flow`, SMIL is paused and resumed through the same hook (move the current `smil()` logic into `ambient` via an `onchange(isPlaying)` option).
- Check my reply highlights: replace `playMarks`' `setTimeout` chain with a `Flock.scene` on the `.marked` panel with `mode: 'once'` and no observer (`threshold: null`), started with `replay()` from `show()`. Beats: `u[data-k="0"]` gets `.on` at 500ms, `k=1` at 950ms, `k=2` at 1400ms, and `wait` is removed from the panel at 1550ms (same timings as today: `500 + 450·k`, then `+200` after the last). `reset` removes `.on` and adds `wait`; `end` adds all `.on` and removes `wait`.

`now/index.html` and `why/index.html`
- Opening flock: `Flock.ambient(.top)`.
- why/ farm scene: `Flock.ambient(figure)` (replaces the Phase 0 code from 3.7).
- "One tap" and "Loop to X": `Flock.scene(figure, { variants: 'svg', mode: 'once', threshold: 0.45 })`. `reset` removes `.go` and forces reflow; beat at 0ms adds `.go` and calls `beginElement()` on the visible variant's `animateMotion`; `end` adds `.go` and seeks SMIL to 3s.
- Road rail: keep the Phase 0 rAF version, wrapped so it does nothing when `Flock.reduced` is true. Optionally add the CSS scroll-driven version under `@supports (animation-timeline: view())` and skip the JS when it is supported.

### 4.7 Shared scene files
index, now/ and why/ each carry their own copy of the scene CSS and road-page script.
- Create `css/flock-scenes.css` and move into it, once: every scene `@keyframes`, the animation rules for `.top .flock`, `.hero-ducks`, `.why .ducks-swim`, `.scene-svg` (ripple, bob, sw, pass), `.tap`, `.loopx`, `.rail i`, the `.pic .wide/.tall` switch, and the matching reduced-motion rules. Use the motion tokens from 4.1.
- Link it on the three pages after `motion.css`, with a `?v=` query string. Delete the moved rules from each page's inline `<style>`, including the rules why/ has for elements it does not contain (loopx, ripple, bob2, through, hero-ducks).
- The road-page script (play, replay, rail) exists only in `js/flock-motion.js` after 4.6. Delete the inline copies.
- Keep the inline `<symbol id="duck">` on each page; no build step means no includes.
- Grep for `token-gate.css`. If nothing links it, delete the file.

Done when index, now/ and why/ look and behave as before at both widths, the why/ farm ducks swim, the toggle pauses everything and persists across reloads, reduced motion shows final frames, and `scripts/motion_lint.py` passes with warnings only.

## 5. Design tokens (existing site values, for reference)
Colours: `--navy #002050`, `--blue #0058A8`, `--sky #5AA0E6`, `--sun #FED801`, `--ink #0E1B33`, `--soft #F2F7FC`, `--line #D6E4F3`. Display font: Fredoka (`/assets/fonts/fredoka-latin.woff2`). Motion tokens: section 4.1.

## 6. Later: Rive hook (do not build yet)
An illustrator-drawn duck animated in Rive will replace the two-ponds SVGs (see the brief in this folder, sections 4–7). Leave room for it in the runtime:
- `Flock.scene` handles must accept an optional `onplay` and `onreduced` callback, so a later `Flock.rive(el, { src, stateMachine })` wrapper can fire the `.riv` file's `play` trigger and set its `reduced` boolean.
- Do not add the Rive runtime now.

## 7. Files in this folder
- `PROMPT.md`: the prompt to paste into Claude Code
- `README.md`: this spec
- `Flock Animation Audit & Plan.dc.html`: full audit of 20 animated elements, findings, target standard, roadmap (open in a browser)
- `Duck Character & Rive Brief.dc.html`: brief for the illustrator and animator
- `doc-page.js`, `support.js`: needed only to open the two reference documents
