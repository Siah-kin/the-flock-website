#!/usr/bin/env python3
"""Save a still of every Flock scene beat, for /, /now/ and /why/.

Setup:  pip install playwright && playwright install chromium
Run:    python3 scripts/motion_snapshots.py

For each page at 1280x800 and 390x844, scrolls each scene into view, calls
Flock.scenes[i].seek() at each beat's time and at the end, and writes
motion-snapshots/<page>-<width>-<scene>-<ms>.png. Then repeats with reduced
motion emulated and writes <page>-<width>-<scene>-reduced.png.
"""
import contextlib
import http.server
import os
import socket
import socketserver
import threading

from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'motion-snapshots')
PAGES = {'home': '/', 'now': '/now/', 'why': '/why/'}
SIZES = [(1280, 800), (390, 844)]
END_MS = 4000  # past the longest beat sequence in these pages


class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, *a):
        pass


@contextlib.contextmanager
def serve():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        port = s.getsockname()[1]
    srv = socketserver.TCPServer(('127.0.0.1', port), Quiet)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    try:
        yield port
    finally:
        srv.shutdown()


def scene_name(el_info, idx):
    return (el_info or 'scene').replace(' ', '-') + str(idx)


def main():
    os.makedirs(OUT, exist_ok=True)
    with serve() as port, sync_playwright() as pw:
        browser = pw.chromium.launch()
        for reduced in (False, True):
            for (w, h) in SIZES:
                ctx = browser.new_context(viewport={'width': w, 'height': h},
                                          reduced_motion='reduce' if reduced else 'no-preference')
                for page_name, path in PAGES.items():
                    page = ctx.new_page()
                    page.goto('http://127.0.0.1:%d%s' % (port, path))
                    page.wait_for_function('window.Flock && Flock.scenes')
                    n = page.evaluate('Flock.scenes.length')
                    for i in range(n):
                        page.evaluate('Flock.scenes[%d].el.scrollIntoView({block: "center"})' % i)
                        label = page.evaluate(
                            '(Flock.scenes[%d].el.id || Flock.scenes[%d].el.className || "scene")' % (i, i))
                        name = scene_name(label, i)
                        base = '%s-%d-%s' % (page_name, w, name)
                        if reduced:
                            page.wait_for_timeout(200)
                            page.screenshot(path=os.path.join(OUT, base + '-reduced.png'))
                            continue
                        beats = page.evaluate('Flock.scenes[%d].beats.map(function (b) { return b.at; })' % i)
                        for ms in sorted(set(beats + [END_MS])):
                            page.evaluate('Flock.scenes[%d].seek(%d)' % (i, ms))
                            page.wait_for_timeout(60)
                            page.screenshot(path=os.path.join(OUT, '%s-%d.png' % (base, ms)))
                    page.close()
                ctx.close()
        browser.close()


if __name__ == '__main__':
    main()
