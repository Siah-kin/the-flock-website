#!/usr/bin/env python3
"""Write the pain wall's quote cards into index.html from data/pain-wall.json.

The site has no build step, so the generated HTML is committed. The cards are the only copy of the quotes in
the page: the scroll scene moves them, and the still layout (reduced motion, Pause, no JavaScript) shows them
as they are. Each card carries its own source link.

    python3 scripts/build_pain_wall.py          rewrite the marked cards block in index.html
    python3 scripts/build_pain_wall.py --check  exit 1 if index.html differs from the JSON

Standard library only.
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data', 'pain-wall.json')
PAGE = os.path.join(ROOT, 'index.html')
TILT = [-2, 1.5, -1, 2, -2.5, 1, -1.5, 2.5, -2, 1.5]
IND = '                '  # indentation inside the page


def esc(s):
    return html.escape(s, quote=True)


def cards(quotes):
    out = []
    for i, q in enumerate(quotes):
        out.append(
            '%s<figure class="pw-q" style="--r:%sdeg"><blockquote>“%s”</blockquote>'
            '<figcaption><span>%s · %s</span><a href="%s" target="_blank" rel="noopener noreferrer"">source</a>'
            '</figcaption></figure>' % (
                IND + '    ', TILT[i % len(TILT)], esc(q['quote']),
                esc(q['role']), esc(q['month']), esc(q['url'])))
    return '\n'.join(out)


def fill(page, name, body):
    pat = re.compile(r'(<!-- pain-wall:%s -->)(.*?)(<!-- /pain-wall:%s -->)' % (name, name), re.S)
    if not pat.search(page):
        sys.exit('index.html has no <!-- pain-wall:%s --> block' % name)
    return pat.sub(lambda m: m.group(1) + '\n' + body + '\n' + IND + m.group(3), page, count=1)


def build():
    with open(DATA, encoding='utf-8') as fh:
        quotes = json.load(fh)['quotes']
    with open(PAGE, encoding='utf-8') as fh:
        page = fh.read()
    new = fill(page, 'cards', cards(quotes))
    return page, new


def main():
    page, new = build()
    if '--check' in sys.argv:
        if page != new:
            print('index.html is out of date with data/pain-wall.json: run python3 scripts/build_pain_wall.py')
            return 1
        print('index.html matches data/pain-wall.json')
        return 0
    if page != new:
        with open(PAGE, 'w', encoding='utf-8') as fh:
            fh.write(new)
        print('index.html updated')
    else:
        print('index.html already up to date')
    return 0


if __name__ == '__main__':
    sys.exit(main())
