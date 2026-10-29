#!/usr/bin/env node
/* Extract translatable Simplified-Chinese strings from the site into i18n/source/<group>.json.
   Usage: node scripts/i18n-extract.cjs [repoRoot]
   Keys are the exact source text (trimmed); `${…}` in templates becomes {0}, {1}… in order.
   HTML inside JS strings is split into text segments and translatable attribute values. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const GROUPS = {
  lab: ['docs/index.html', 'docs/playground/app.js', 'docs/playground/prompts.js', 'docs/playground/scenes.js', 'docs/playground/motion.js'],
  showcase: ['docs/showcase.html', 'docs/showcase.js'],
  skills: ['docs/demos/skills/index.html', 'docs/demos/skills/app.js', 'docs/demos/skills/data.js'],
  demos: ['docs/demos/web/index.html', 'docs/demos/web/script.js', 'docs/demos/app/index.html', 'docs/demos/app/app.js', 'docs/demos/dashboard/index.html', 'docs/demos/dashboard/app.js', 'docs/demos/studio/index.html', 'docs/demos/studio/app.js', 'docs/demos/components/index.html', 'docs/demos/components/app.js'],
  pipeline: ['docs/pipeline/index.html', 'docs/pipeline/walkthrough.html', 'docs/pipeline/app.js', 'docs/pipeline/lab.js', 'docs/pipeline/effects.js', 'docs/pipeline/scenes.js']
};
const HAN = /[㐀-鿿]/;
const ATTR_RE = /\b(?:title|alt|aria-label|placeholder|aria-valuetext|aria-description|data-tip|content|value)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–', middot: '·', rarr: '→', larr: '←', times: '×' };
const decode = s => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e.toLowerCase()] ?? m));

function addKey(set, s) {
  if (!s) return;
  let k = s.replace(/^\s+|\s+$/g, '');
  if (!HAN.test(k)) return;
  // renumber placeholders in order of appearance
  let i = 0; const seen = {};
  k = k.replace(/\{(\d+)\}/g, (_, n) => `{${n in seen ? seen[n] : (seen[n] = i++)}}`);
  set.add(k);
}

/* Rich keys: a block element whose content is text plus inline tags becomes one key, with
   inline elements written as numbered markers (<0>…</0>, <br>) so translators can reorder.
   Must mirror richKey() in docs/i18n/i18n.js. */
const RICH = new Set('p li h1 h2 h3 h4 h5 h6 dd dt figcaption td th summary label blockquote button a caption legend'.split(' '));
const INLINE = new Set('b strong em i code kbd mark small span a br sup sub abbr time u s q cite'.split(' '));
function richKeys(set, text) {
  const toks = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g; let m;
  while ((m = re.exec(text))) toks.push(m[4] != null ? { t: decode(m[4]) } : { close: !!m[1], name: m[2].toLowerCase(), attrs: m[3] });
  for (let i = 0; i < toks.length; i++) {
    const o = toks[i];
    if (!o.name || o.close || !RICH.has(o.name)) continue;
    let depth = 0, j = i + 1, ok = true, hasEl = false, out = '', n = 0; const stack = [];
    for (; j < toks.length; j++) {
      const x = toks[j];
      if (x.t != null) { out += x.t; continue; }
      if (x.name === o.name && !x.close) depth++;
      if (x.name === o.name && x.close) { if (depth === 0) break; depth--; }
      if (!INLINE.has(x.name)) { ok = false; break; }
      if (/\bid\s*=/.test(x.attrs || '')) { ok = false; break; }
      if (x.name === 'br') { out += '<br>'; continue; }
      hasEl = true;
      if (!x.close) { stack.push(n); out += `<${n++}>`; } else out += `</${stack.pop()}>`;
    }
    if (ok && hasEl && j < toks.length && HAN.test(out) && !stack.length) addKey(set, out.replace(/\s+/g, ' '));
  }
}

/* Split markup into text segments + attribute values. */
function fromMarkup(set, text) {
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  richKeys(set, text);
  let m; ATTR_RE.lastIndex = 0;
  const tags = text.match(/<[^>]*>/g) || [];
  tags.forEach(tag => { ATTR_RE.lastIndex = 0; while ((m = ATTR_RE.exec(tag))) addKey(set, decode(m[1] ?? m[2])); });
  text.split(/<[^>]*>/).forEach(seg => addKey(set, decode(seg)));
}

/* ---------- JS tokenizer: yields string / template literal values ---------- */
function jsLiterals(src) {
  const out = [];
  let i = 0, lastSig = '';
  const n = src.length;
  const regexOk = () => !lastSig || /[(,=:[!&|?{};+\-*%<>~^]$/.test(lastSig) || /\b(return|typeof|case|do|else|in|of|new|delete|void|throw|yield|await)$/.test(lastSig);
  function readQuoted(q) {
    let s = ''; i++;
    while (i < n && src[i] !== q) {
      if (src[i] === '\\') { const c = src[i + 1]; s += c === 'n' ? '\n' : c === 't' ? '\t' : c === 'u' ? String.fromCharCode(parseInt(src.substr(i + 2, 4), 16)) : c; i += c === 'u' ? 6 : 2; continue; }
      s += src[i++];
    }
    i++; return s;
  }
  function readTemplate() {
    // returns template text with ${...} replaced by {k}; inner literals are pushed to out
    let s = '', k = 0; i++;
    while (i < n && src[i] !== '`') {
      if (src[i] === '\\') { const c = src[i + 1]; s += c === 'n' ? '\n' : c; i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') { i += 2; readCode(true); s += `{${k++}}`; continue; }
      s += src[i++];
    }
    i++; return s;
  }
  function readCode(inExpr) {
    let depth = 0;
    while (i < n) {
      const c = src[i];
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2); i = i < 0 ? n : i + 2; continue; }
      if (c === '"' || c === "'") { out.push(readQuoted(c)); lastSig = 'x'; continue; }
      if (c === '`') { out.push(readTemplate()); lastSig = 'x'; continue; }
      if (c === '/' && regexOk()) { i++; let cls = false; while (i < n && (src[i] !== '/' || cls)) { if (src[i] === '\\') i++; else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false; i++; } i++; while (/[a-z]/i.test(src[i] || '')) i++; lastSig = 'x'; continue; }
      if (inExpr) { if (c === '{') depth++; if (c === '}') { if (depth === 0) { i++; return; } depth--; } }
      if (!/\s/.test(c)) { if (/[\w$]/.test(c)) { let w = ''; while (i < n && /[\w$]/.test(src[i])) w += src[i++]; lastSig = w; continue; } lastSig = c; }
      i++;
    }
  }
  readCode(false);
  return out;
}

function fromJs(set, src) {
  jsLiterals(src).forEach(lit => {
    if (!HAN.test(lit)) return;
    if (/<\/?[a-z][^>]*>/i.test(lit)) { fromMarkup(set, lit); return; }
    ATTR_RE.lastIndex = 0;
    if (/^\s*[a-z-]+=["']/i.test(lit) && ATTR_RE.test(lit)) { fromMarkup(set, '<x ' + lit + '>'); return; }
    addKey(set, lit);
  });
}

function fromHtml(set, src) {
  src.replace(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi, (_, body) => { fromJs(set, body); return ''; });
  const t = /<title>([\s\S]*?)<\/title>/i.exec(src); if (t) addKey(set, decode(t[1]));
  fromMarkup(set, src.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '').replace(/<title>[\s\S]*?<\/title>/i, ''));
}

const outDir = path.join(ROOT, 'i18n', 'source');
fs.mkdirSync(outDir, { recursive: true });
const all = new Map();
for (const [g, files] of Object.entries(GROUPS)) {
  const set = new Set();
  for (const f of files) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) { console.warn('missing', f); continue; }
    const src = fs.readFileSync(p, 'utf8');
    (f.endsWith('.html') ? fromHtml : fromJs)(set, src);
  }
  const extraFile = path.join(ROOT, 'i18n', 'extra-keys.json');
  if (fs.existsSync(extraFile)) (JSON.parse(fs.readFileSync(extraFile, 'utf8'))[g] || []).forEach(k => set.add(k));
  const keys = [...set].sort();
  keys.filter(k => /\}\{/.test(k)).forEach(k => console.warn(`  adjacent placeholders (${g}): ${k.slice(0, 70)}`));
  fs.writeFileSync(path.join(outDir, g + '.json'), JSON.stringify(keys, null, 1) + '\n');
  all.set(g, keys);
  console.log(`${g.padEnd(9)} ${String(keys.length).padStart(5)} keys ${String(keys.join('').replace(/[^㐀-鿿]/g, '').length).padStart(7)} han`);
}
