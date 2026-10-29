#!/usr/bin/env python3
"""Generate Traditional Chinese (Taiwan phrasing) dictionaries from i18n/source/*.json.
Requires: pip install opencc-python-reimplemented
Usage: python3 scripts/i18n-tw.py [repoRoot]"""
import json, pathlib, sys
import opencc
root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent)
cc = opencc.OpenCC('s2twp')
# Taiwan usage that s2twp leaves in mainland form
REPL = [('點贊', '按讚'), ('點讚', '按讚'), ('贊過', '按過讚')]
out = root / 'i18n' / 'zh-TW'
out.mkdir(parents=True, exist_ok=True)
override = {}
ov = root / 'i18n' / 'zh-TW-overrides.json'
if ov.exists():
    override = json.loads(ov.read_text(encoding='utf-8'))
for src in sorted((root / 'i18n' / 'source').glob('*.json')):
    keys = json.loads(src.read_text(encoding='utf-8'))
    m = {}
    for k in keys:
        v = override.get(k) or cc.convert(k)
        for a, b in REPL:
            v = v.replace(a, b)
        m[k] = v  # identical entries too, so the runtime can tell real misses apart
    (out / src.name).write_text(json.dumps(m, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{src.stem:9} {sum(1 for k in m if m[k] != k):5} of {len(keys)} keys differ')

# Character table: the runtime's last-resort conversion for text that has no dictionary entry
# (e.g. strings scripts assemble at runtime). Limited to characters that occur in the site.
cs = opencc.OpenCC('s2t')
chars = sorted({ch for src in (root / 'i18n' / 'source').glob('*.json') for k in json.loads(src.read_text(encoding='utf-8')) for ch in k if '\u3400' <= ch <= '\u9fff'})
table = {ch: cs.convert(ch) for ch in chars if cs.convert(ch) != ch}
(root / 'i18n' / 'zh-TW-chars.json').write_text(json.dumps(table, ensure_ascii=False, sort_keys=True) + '\n', encoding='utf-8')
print(f'chars     {len(table)} of {len(chars)} characters differ')
