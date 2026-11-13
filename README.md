# The Flock website

The Flock is a Telegram bot for communities. Members ask the community's team for help in private, and they can check an admin message that was forwarded to them. You can [open the bot](https://t.me/Arctide_TheFlock_Bot) in Telegram. This repository holds arcflock.com, the static site that explains the bot to visitors.

The bot itself lives in a separate repository.

## What is in the repository

The site has no build step. Every page is plain HTML, CSS and JavaScript, and the committed files are what visitors get.

```
index.html     home page
how/           how to use the bot
now/           what works today, what is being tested, what is planned
about/         why the bot was built and who is behind it
privacy/       your data
pt/            the Portuguese version of each page above, with the same paths
css/, js/      styles and scripts shared by the pages
assets/        bot screenshots, images, fonts and link-preview pictures
includes/      the shared menu, with a second copy for Portuguese under includes/pt/
data/          the quotes shown on the home page
scripts/       small checks and helpers, each described at the top of its file
i18n/          old translation files, not used by any page
```

Old addresses such as faq/, manual/, why/ and page_1/ hold a short redirect page, so links people saved still land on the right page. 404.html is the page for addresses that do not exist. CNAME sets the domain, and sitemap.xml lists the five pages in both languages. robots.txt lets link previews in Telegram and other apps read the site and keeps search engines out for now.

## Preview it on your computer

From the repository root, run:

```
python3 -m http.server
```

Then open http://localhost:8000 in a browser. The pages load their styles, pictures and menu from paths that start at the site root, so a file opened directly shows none of them.

## Languages

The site is in English and in Brazilian Portuguese. English sits at the root and Portuguese under /pt/, so /how/ and /pt/how/ are the same page in two languages. Each of the five pages exists in both, and the menu has a language switch that remembers the visitor's choice in their browser.

## How changes reach the site

GitHub Pages serves the main branch. Changes go in on a branch through a pull request, and the site updates within a few minutes of a merge into main. Anyone who changes the site reads [AGENTS.md](AGENTS.md) first; it lists the rules every change follows.

## Licence

The repository has no licence file. Ask the maintainers before reusing the code or images.

## Contact

Reach the maintainers through the bot: open it, tap Help, then Ask the team.
