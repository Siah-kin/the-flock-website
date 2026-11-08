#!/usr/bin/env python3
"""Motion lint for the Flock site. Standard library only.

Checks *.html and css/*.css (docs/ and motion-snapshots/ are skipped):
  warning  `transition: all`
  error    new SMIL tags (<animate, <animateMotion, <animateTransform) outside index.html and now/index.html
  error    a file with @keyframes but no prefers-reduced-motion block
  error    scene keyframes (rise, bob, bob2, swim, through, ripple, swap, ring, on, slide, draw)
           defined anywhere except css/flock-scenes.css

Exit status is 1 when there is any error, 0 otherwise.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'.git', 'docs', 'motion-snapshots', 'node_modules'}
SMIL_OK = {'index.html', 'now/index.html'}
SCENE_KEYFRAMES = {'rise', 'bob', 'bob2', 'swim', 'through', 'ripple', 'swap', 'ring', 'on', 'slide', 'draw'}
SCENES_CSS = 'css/flock-scenes.css'


def files():
    for d, dirs, names in os.walk(ROOT):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
        for n in names:
            rel = os.path.relpath(os.path.join(d, n), ROOT).replace(os.sep, '/')
            if n.endswith('.html') or (rel.startswith('css/') and n.endswith('.css')):
                yield rel


def main():
    errors, warnings = [], []
    for rel in sorted(files()):
        with open(os.path.join(ROOT, rel), encoding='utf-8', errors='replace') as fh:
            lines = fh.read().split('\n')
        text = '\n'.join(lines)
        has_reduced = 'prefers-reduced-motion' in text
        first_kf = None
        for i, line in enumerate(lines, 1):
            if re.search(r'transition\s*:\s*all\b', line):
                warnings.append('%s:%d: transition: all' % (rel, i))
            if rel not in SMIL_OK and re.search(r'<animate(Motion|Transform)?\b', line):
                errors.append('%s:%d: SMIL tag outside index.html and now/index.html' % (rel, i))
            m = re.search(r'@keyframes\s+([\w-]+)', line)
            if m:
                first_kf = first_kf or i
                if m.group(1) in SCENE_KEYFRAMES and rel != SCENES_CSS:
                    errors.append('%s:%d: @keyframes %s must live in %s' % (rel, i, m.group(1), SCENES_CSS))
        if first_kf and not has_reduced:
            errors.append('%s:%d: @keyframes but no prefers-reduced-motion block' % (rel, first_kf))
    for w in warnings:
        print('warning: ' + w)
    for e in errors:
        print('error:   ' + e)
    print('%d error(s), %d warning(s)' % (len(errors), len(warnings)))
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
