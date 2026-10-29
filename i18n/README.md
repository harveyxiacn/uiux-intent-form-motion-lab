# Site languages: 简体中文 · 繁體中文 · English

Every page under `docs/` is authored in Simplified Chinese. `docs/i18n/i18n.js` adds a language switcher (简 / 繁 / EN; a single button with a menu on phones), remembers the choice (`localStorage`, or `?lang=en|zh-TW|zh-CN`), and translates the page at runtime from generated dictionaries. Browsers set to English open in English; zh-TW/HK browsers open in Traditional.

How the runtime translates:

- **Text nodes and attributes** (`title`, `placeholder`, `aria-label`, `alt`, …) are looked up in the dictionary, including content that scripts insert later (MutationObserver).
- **Patterns**: keys with `{0}`, `{1}` come from template literals (`显示 ${n} 项` → `显示 {0} 项`). Captured values are translated recursively.
- **Rich sentences**: a paragraph, list item, heading or button whose content is text plus inline tags is translated as one unit, with inline elements written as numbered markers (`<0>…</0>`, `<br>`). Elements containing an `id` are skipped so script references stay valid.
- **Fallbacks** for short labels: decorative symbols (↗, ✓) are peeled off, and composite labels (`本项目 · 定义`, `A、B`) are split when every part has a translation.
- **Copy**: `navigator.clipboard.writeText` and the copy event translate the copied text, so copying a prompt in English gives English.

Scripts can call `I18N.t(text)` directly and should wait for dictionaries with `I18N.ready(fn)` before their first render (see `docs/pipeline/lab.js`).

## Updating translations

```bash
node scripts/i18n-extract.cjs          # 1. collect source strings  -> i18n/source/<group>.json
python3 scripts/i18n-tw.py             # 2. Traditional (OpenCC s2twp, needs: pip install opencc-python-reimplemented)
# 3. translate new English keys: add them to i18n/en/<group>.json or i18n/en-overrides.json
node scripts/i18n-build.cjs            # 4. write docs/i18n/dict/<group>.<lang>.js and report missing keys
```

`i18n-build.cjs` prints `(n missing)` for any source string without English. `scripts/i18n-validate.py` checks a translated batch (placeholders, markers, line breaks, no Chinese left).

Files:

| Path | Purpose |
| --- | --- |
| `i18n/source/*.json` | Extracted source strings per page group (lab, showcase, skills, demos, pipeline) |
| `i18n/en/*.json` | English translations |
| `i18n/zh-TW/*.json` | Traditional Chinese (generated) |
| `i18n/en-overrides.json` | Hand fixes and translations for keys added after the batch translation |
| `i18n/extra-keys.json` | Pattern keys for strings that scripts build by concatenation |
| `i18n/GLOSSARY.md` | Names, terms and format rules for English |

## Writing translatable code

- Prefer template literals over `'…' + x + '…'`; keep a Chinese word next to each placeholder (`${a} · ${b}` cannot become a key).
- Never read visible text back as data (`button.textContent === '全部'`); use `data-*` attributes.
- Avoid adjacent placeholders (`${a}${b}`) and CSS `content:` text.
- Dates: format with `(window.I18N && I18N.lang) || 'zh-CN'` as the locale.
