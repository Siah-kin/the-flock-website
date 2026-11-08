Paste everything below the line into Claude Code, opened in the root of the `Siah-kin/the-flock-website` repo, with this folder copied to `docs/motion/`.

---

You are working in the `the-flock-website` repo, the static site for arcflock.com (The Flock). There is no build step: plain HTML, CSS and JS served as-is. The site used to live in `Siah-kin/community-bot`; ignore that repo.

Read `docs/motion/README.md` in full before you change anything. It is the spec. The two HTML files in that folder (`Flock Animation Audit & Plan.dc.html`, `Duck Character & Rive Brief.dc.html`) are background reading; open them in a browser if you need context. Do not copy them into the site.

Your job is Phase 0 and Phase 1 from the README:

0. **Setup.** Create the branch `motion-foundations` from `main`. Commit `docs/motion/` on its own first (message: `docs: add motion handoff (audit, spec, Rive brief)`).
1. **Phase 0, fixes.** Fix the nine defects listed in README section 3, one commit per defect. Do not change copy, layout, colours or illustrations.
2. **Phase 1, foundations.** Add `css/motion.css`, `js/flock-motion.js`, the global pause toggle, `scripts/motion_lint.py` and the snapshot script exactly as specified in README section 4. Move the existing animations on `index.html`, `now/index.html` and `why/index.html` onto the new runtime (section 4.6), then move the copied scene CSS into `css/flock-scenes.css` (section 4.7), so the pages look the same as before.

Rules:
- Work on a branch called `motion-foundations`. Small commits, each with a clear message.
- Before you edit a file, read it fully. Follow the existing code style: IIFE scripts, `var`, 4-space indent, `?v=` cache-busting query strings on changed CSS/JS links (use `?v=YYYYMMDDmotion1` with today's date).
- No new runtime dependencies, no CDN scripts, no bundler. `js/flock-motion.js` must stay under 6 KB gzipped.
- Keep every animation's current reduced-motion behaviour working or better. Test with `prefers-reduced-motion: reduce` emulated.
- The repo has no validator scripts. Once `scripts/motion_lint.py` exists, run it before each commit and keep it free of errors.
- Serve locally with `python3 -m http.server 8000` and check each page in a browser after each phase: home page tab demos, both ponds, fee scene; now/ road, "One tap" and "Loop to X"; why/ road, farm scene and "One tap"; how/ sidebar and anchor links; the nav on every page. Check at desktop width and at 390px wide.
- If something in the spec conflicts with what you find in the code, stop and tell me instead of guessing.

When you finish, push the branch (`git push -u origin motion-foundations`) and, if the `gh` CLI is installed and logged in, open a pull request into `main` with the PR description below. Do not merge it. Then give me: the list of commits, what you checked by hand, anything you could not do, and a short PR description I can paste.
