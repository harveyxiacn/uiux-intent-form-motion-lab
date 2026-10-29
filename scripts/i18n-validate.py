#!/usr/bin/env python3
"""Validate an English translation batch against its source keys.
Usage: python3 scripts/i18n-validate.py i18n/batches/en-03.json i18n/batches/en-03.out.json
Exit code 0 only when every key is translated and placeholders/line breaks match."""
import json, re, sys

src = json.load(open(sys.argv[1], encoding='utf-8'))
out = json.load(open(sys.argv[2], encoding='utf-8'))
HAN = re.compile(r'[㐀-鿿]')
PH = re.compile(r'\{\d+\}')
errs = []
missing = [k for k in src if k not in out]
extra = [k for k in out if k not in set(src)]
for k in missing[:20]:
    errs.append(f'missing: {k[:60]!r}')
if len(missing) > 20:
    errs.append(f'... and {len(missing) - 20} more missing')
for k in extra[:10]:
    errs.append(f'unknown key (not in source): {k[:60]!r}')
for k in src:
    v = out.get(k)
    if v is None:
        continue
    if not isinstance(v, str) or not v.strip():
        errs.append(f'empty: {k[:60]!r}')
        continue
    if HAN.search(v):
        errs.append(f'Chinese left in value: {k[:40]!r} -> {v[:60]!r}')
    if sorted(PH.findall(k)) != sorted(PH.findall(v)):
        errs.append(f'placeholders differ: {k[:50]!r} -> {v[:50]!r}')
    mk = lambda x: sorted(re.findall(r'</?\d+>|<br>', x))
    if mk(k) != mk(v):
        errs.append(f'markers differ: {k[:50]!r} -> {v[:50]!r}')
    if k.count('\n') != v.count('\n'):
        errs.append(f'line breaks differ ({k.count(chr(10))} vs {v.count(chr(10))}): {k[:40]!r}')
print(f'{len(src)} keys, {len(out)} translated, {len(errs)} problems')
for e in errs[:80]:
    print(' -', e)
sys.exit(1 if errs else 0)
