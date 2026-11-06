# Translation Inventory — bonzivista.org

_Updated 2026-07-03. Grounded in key-diff and gate output._

## Translation system (single, active)

**System B** - `js/nav-loader.js` reads central `i18n/{lang}.json`, applies to
`[data-i18n]` elements via `innerHTML`. Storage key `bonzi_lang`.

All 8 public flag pages declare `BONZI_LANGS=["en","pt","zh","fr","ru","tr"]`.

Legacy systems retired this sprint:
- **System A** (`js/i18n-loader.js`) script tag removed from about.html,
  research/index.html, research/program.html, and stake.html. File retained for
  enclosed/manual pages that still use it.
- **System B inline dicts** (`window.BONZI_I18N`) removed from page_2 and page_4.
  The 71 `when.*` keys from page_4 migrated to central pt.json and zh.json.

## Key counts (2026-07-03)

| File | Keys | Notes |
|------|------|-------|
| en.json | 489 | Source of truth; element text is EN fallback |
| pt.json | 833 | Higher count: carries legacy staker/alpha keys pre-dating expansion |
| zh.json | 627 | Higher count: same legacy carry + 71 when.* migrated from page_4 |
| fr.json | 582 | Full manifest coverage from 13 base keys |
| ru.json | 582 | Full manifest coverage from 13 base keys |
| tr.json | 582 | Full manifest coverage from 13 base keys |

FR/RU/TR hit 582 = the manifest key count (complete coverage).
PT/ZH exceed 582 because they carry older keys outside the manifest scope.

## Coverage gate

`python3 scripts/validate_public_content_guard.py` - deterministic gate.
Checks: every `data-i18n` key used on the 8 flag pages resolves in all 5
non-EN JSON files; BONZI_LANGS equality on all 8 pages; no disallowed HTML
tags in translated values.

Gate result as of 2026-07-03: PASS (0 missing keys across all 5 languages).

## Flag pages (all 6-lang, all gate-clean)

- about.html
- page_1/index.html
- page_2/index.html
- page_3/index.html
- page_4/index.html
- research/index.html
- research/program.html
- stake.html

## Out of scope (follow-up lane)

- index.html (slot/home page): uses a self-contained inline I18N object
  (System C). FR/RU/TR support on that page is a separate change - requires
  extending the inline dict in the game-critical file carefully.
