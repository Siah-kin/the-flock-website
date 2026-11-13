# Working on this repository

This file is for anyone who changes the site, whether a person or a coding agent. The site speaks for a live product and main is public, so what it says has to stay true. CLAUDE.md loads this file, and new rules go in this file only.

## The site shows what the bot does today

Describe what the bot does now. When something is not live yet, mark it once, in plain words, with a label the now page already uses: "In development" or "Planned" in English, "Em desenvolvimento" or "Planejado" in Portuguese. Never promise safety, reach, price or returns, and leave out hype words.

If the site and the bot disagree, the bot is right and the site changes. Fix the page in both languages, then replace any screenshot in assets/flock/screens/ that no longer matches the bot.

## English and Portuguese change together

Each of the five pages (home, how, now, about, privacy) exists in English and in Brazilian Portuguese. The pairs to keep in step are:

- each page and its copy under pt/;
- includes/ and includes/pt/, which hold the menu;
- js/flock-lines.js and js/flock-lines-pt.js, which hold the lines the duck game shows.

A change to one goes into the same pull request as the change to the other. Write the Portuguese from the meaning, never word by word, and ask a native speaker to read it before it goes up.

Leave i18n/ alone: no page loads it.

## Words people read

A caption never describes its own picture; it tells the visitor what the picture cannot. Describe each feature once, in one sentence about what it does for the member.

Say "track record", never a bare "record". Use the bot's own words exactly as the bot shows them today, for buttons, screen titles and commands. [Open the bot](https://t.me/Arctide_TheFlock_Bot) to check them. The screenshots in assets/flock/screens/ show them too, but where a screenshot and the bot differ, the bot is right.

After any edit, read the whole page in order, in both languages. A change in one place often leaves a repeat or a gap in another. Read it aloud as a visitor would.

## Layout

Open the page at 390 px and at 1280 px wide, in English and in Portuguese, before a change goes up. The first screen asks the visitor for one clear action and nothing more.

Run `python3 scripts/motion_lint.py` after any change to animation. It requires a reduced-motion block in every file that animates, and it keeps the scene animations in css/flock-scenes.css.

The home page quotes come from data/pain-wall.json. After editing the file, run `python3 scripts/build_pain_wall.py`. It rewrites index.html only, so bring the cards in pt/index.html in line by hand. Because the site has no build step, commit the generated output.

Pages link every stylesheet and script with a version value, such as /css/nav.css?v=20261110pt2. When you change one of those files, change its value in every page that links it, so visitors do not keep the old file. The menu files in includes/ use the version value in js/nav-loader.js.

## Adding or moving a page

A new page exists in English and in Portuguese. Each has one h1, a title, a description, a canonical link, the two language links and an image in assets/og/. Add both addresses to sitemap.xml and link the page from includes/nav.html and includes/mobile-menu.html, and from the two copies under includes/pt/. When you move a page, leave a redirect page at the old address, like the ones in faq/ and manual/.

## Before a change merges

- Work on a branch and open a pull request. Merging into main publishes the site within minutes.
- Someone who did not write a change reads the rendered pages in both languages before it merges.
- Run `python3 scripts/check_pain_wall_links.py` before each release. It checks that every quote's source link still answers and still carries the quoted words. BLOCKED means the source refused the check, so open that link and read the quote yourself.
- Main is public. Never commit private notes, strategy, anyone's personal details, passwords or other secrets, or file paths from your own computer. Private working notes live outside this repository.
