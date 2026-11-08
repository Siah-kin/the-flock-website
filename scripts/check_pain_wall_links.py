#!/usr/bin/env python3
"""Check every pain-wall source: does the link answer, and are the quoted words still on it?

Reads data/pain-wall.json. Standard library only. Run before every release:

    python3 scripts/check_pain_wall_links.py [other.json]

For each quote it reports two things:
  link   the HTTP status of the exact URL the page links to
  words  whether every entry in the quote's `checks` appears in the source text

Where the words are read from:
  page      the linked page itself (forums, blogs)
  x-oembed  X's public embed endpoint (publish.twitter.com/oembed). x.com serves an
            empty JavaScript shell to scripts, so its HTML never holds the post text;
            the embed endpoint returns the post as X publishes it, without a login.

Verdicts:
  PASS     the link answers and every quoted run of words is found
  FAIL     the link is gone (404, 410, other 4xx/5xx) or a quoted run is missing
  BLOCKED  the site refused an automated read (403, 429, a challenge page), so the
           words could not be checked; this is never counted as a pass

Exit status: 0 all PASS, 1 any FAIL, 2 no FAIL but something BLOCKED.
"""
import gzip
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data', 'pain-wall.json')
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/140.0 Safari/537.36 (arcflock.com source check)')
CHALLENGE = re.compile(r'just a moment\.\.\.|cf-chl|attention required|verify you are human|'
                       r'captcha|access denied|are you a robot', re.I)


def fetch(url):
    """Return (status, text). status is an int, or a short error string."""
    req = urllib.request.Request(url, headers={
        'User-Agent': UA,
        'Accept': 'text/html,application/json;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en',
        'Accept-Encoding': 'gzip',
    })
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            body = r.read()
            if r.headers.get('Content-Encoding') == 'gzip':
                body = gzip.decompress(body)
            return r.status, body.decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode('utf-8', 'replace')
        except Exception:
            body = ''
        return e.code, body
    except Exception as e:  # DNS, timeout, TLS
        return type(e).__name__, ''


def norm(s):
    """Plain text for matching: tags out, entities decoded, quotes and dashes straightened."""
    s = re.sub(r'<(script|style)\b.*?</\1>', ' ', s, flags=re.S | re.I)
    s = re.sub(r'<br\s*/?>', ' ', s, flags=re.I)
    s = re.sub(r'<[^>]+>', ' ', s)
    s = html.unescape(html.unescape(s))
    for a, b in (('‘', "'"), ('’', "'"), ('“', '"'), ('”', '"'),
                 ('…', '...'), (' ', ' '), ('–', '-'), ('—', '-')):
        s = s.replace(a, b)
    s = re.sub(r'\s+', ' ', s)
    # a link inside a sentence leaves a space before the next comma ("Alephium ,")
    s = re.sub(r' ([,.;:!?])', r'\1', s)
    return s.strip().lower()


def blocked(status, text):
    if status in (401, 403, 429, 503):
        return True
    return isinstance(status, int) and status == 200 and len(text) < 20000 and bool(CHALLENGE.search(text[:5000]))


def check(q):
    row = {'id': q['id'], 'url': q['url'], 'from': q['text_from']}
    status, text = fetch(q['url'])
    row['link'] = status
    if q['text_from'] == 'x-oembed':
        api = 'https://publish.twitter.com/oembed?omit_script=1&url=' + urllib.parse.quote(q['url'], safe='')
        s2, body = fetch(api)
        row['words_source'] = 'oEmbed %s' % s2
        try:
            text_for_words = json.loads(body).get('html', '') if s2 == 200 else ''
        except ValueError:
            text_for_words = ''
        words_status = s2
    else:
        text_for_words, words_status = text, status
        row['words_source'] = 'page %s' % status
    plain = norm(text_for_words)
    missing = [c for c in q['checks'] if norm(c) not in plain]
    row['missing'] = missing

    link_ok = isinstance(status, int) and 200 <= status < 400
    link_blocked = blocked(status, text)
    words_blocked = blocked(words_status, text_for_words)
    if isinstance(words_status, int) and 200 <= words_status < 400 and not words_blocked and not missing and (link_ok or link_blocked):
        # The words are confirmed; a link that refuses scripts (x.com often does) is reported, not hidden
        row['verdict'] = 'PASS' if link_ok else 'BLOCKED'
    elif words_blocked or (link_blocked and q['text_from'] == 'page'):
        row['verdict'] = 'BLOCKED'
    else:
        row['verdict'] = 'FAIL'
    return row


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else DATA
    with open(path, encoding='utf-8') as fh:
        quotes = json.load(fh)['quotes']
    rows = []
    for q in quotes:
        rows.append(check(q))
        time.sleep(1)
    for r in rows:
        print('%-8s %-26s link %-6s words via %-12s %s' % (
            r['verdict'], r['id'], r['link'], r['words_source'],
            'all quoted words found' if not r['missing'] else 'MISSING: ' + ' | '.join(r['missing'])))
        print('         %s' % r['url'])
    verdicts = [r['verdict'] for r in rows]
    print('\n%d PASS, %d FAIL, %d BLOCKED' % (verdicts.count('PASS'), verdicts.count('FAIL'), verdicts.count('BLOCKED')))
    if 'FAIL' in verdicts:
        return 1
    if 'BLOCKED' in verdicts:
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
