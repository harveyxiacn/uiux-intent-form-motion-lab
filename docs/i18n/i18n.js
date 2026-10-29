/* Site-wide language runtime: 简体中文 (source) · 繁體中文 · English.
   Usage: <script src="RELATIVE/i18n/i18n.js" data-groups="lab"></script> in <head>, before page scripts.
   The page is authored in Simplified Chinese. For other languages the runtime loads
   dictionaries (i18n/dict/<group>.<lang>.js), translates text nodes and attributes,
   keeps translating content that scripts insert later, and translates copied text. */
(function () {
  'use strict';
  var LANGS = [['zh-CN', '简'], ['zh-TW', '繁'], ['en', 'EN']];
  var NAMES = { 'zh-CN': '简体中文', 'zh-TW': '繁體中文', en: 'English' };
  var KEY = 'uiux-lab-lang';
  var me = document.currentScript;
  var base = me.src.replace(/i18n\.js(\?.*)?$/, '');
  var groups = (me.getAttribute('data-groups') || '').split(/[\s,]+/).filter(Boolean);

  function pick() {
    var q = /[?&]lang=(en|zh-TW|zh-CN)\b/.exec(location.search);
    if (q) return q[1];
    try { var s = localStorage.getItem(KEY); if (s) return s; } catch (e) { /* storage unavailable */ }
    var n = (navigator.languages || [navigator.language || 'zh-CN']).join(',').toLowerCase();
    if (/^zh-(tw|hk|mo|hant)/.test(n)) return 'zh-TW';
    if (/^zh/.test(n)) return 'zh-CN';
    return /^en/.test(n) ? 'en' : 'zh-CN';
  }
  var lang = pick();
  var root = document.documentElement;
  if (lang !== 'zh-CN') root.classList.add('i18n-pending');
  var style = document.createElement('style');
  style.textContent = 'html.i18n-pending body{visibility:hidden}' +
    '.i18n-switch{display:inline-flex;gap:2px;padding:2px;border-radius:999px;font:600 12px/1 system-ui,sans-serif;vertical-align:middle;flex:none;white-space:nowrap}' +
    '.i18n-switch button{border:0;background:none;color:inherit;font:inherit;padding:7px 9px;border-radius:999px;cursor:pointer;min-width:32px;min-height:30px;opacity:.6}' +
    '.i18n-switch button:hover{opacity:1}.i18n-switch button[aria-pressed="true"]{opacity:1;box-shadow:inset 0 0 0 1.5px currentColor}' +
    '.i18n-switch button:focus-visible{outline:2px solid currentColor;outline-offset:2px}' +
    '@media (min-width:900px){html[lang="en"] header nav a,html[lang="en"] header nav button,html[lang="en"] header > button{white-space:nowrap}}' +
    '.i18n-opts{display:inline-flex;gap:2px}.i18n-toggle{display:none}' +
    '@media (max-width:720px){.i18n-switch{position:relative}.i18n-toggle{display:inline-block;opacity:1!important;box-shadow:inset 0 0 0 1.5px currentColor}' +
    '.i18n-opts{display:none;position:absolute;right:0;top:calc(100% + 6px);flex-direction:column;min-width:120px;background:Canvas;color:CanvasText;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.22);padding:4px;z-index:2147483000}' +
    '.i18n-opts button{text-align:left;padding:10px 12px;opacity:1}.i18n-switch.open .i18n-opts{display:flex}}' +
    '.i18n-float{position:fixed;right:12px;bottom:12px;z-index:2147483000;background:Canvas;color:CanvasText;box-shadow:0 6px 20px rgba(0,0,0,.18)}' +
    '@media (max-width:720px){.i18n-float{bottom:calc(104px + env(safe-area-inset-bottom,0px))}.i18n-float .i18n-opts{top:auto;bottom:calc(100% + 6px)}}';
  (document.head || root).appendChild(style);

  /* ---------- dictionary ---------- */
  var dict = Object.create(null), patterns = [], loaded = {}, misses = Object.create(null), charMap = null;
  var I18N = window.I18N = window.I18N || {};
  I18N.lang = lang;
  I18N.chars = function (m) { if (lang === 'zh-TW') charMap = m; };
  I18N.add = function (lng, map) {
    if (lng !== lang) return;
    for (var k in map) {
      var nk = norm(k);
      dict[nk] = map[k];
      if (/\{\d+\}/.test(nk)) {
        var re = '^' + nk.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{(\d+)\\?\}/g, '([\\s\\S]*?)') + '$';
        var order = []; nk.replace(/\{(\d+)\}/g, function (_, n) { order.push(+n); });
        patterns.push({ re: new RegExp(re), out: map[k], order: order, len: nk.replace(/\{\d+\}/g, '').length });
      }
    }
    patterns.sort(function (a, b) { return b.len - a.len; });
  };
  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  var HAN = /[㐀-鿿]/;
  // [separator, joiner used in English]
  var SEPS = [[' · ', ' · '], [' / ', ' / '], [' | ', ' | '], [' + ', ' + '], [' → ', ' → '], [' — ', ' — '], ['｜', ' | '], ['；', '; '], ['、', ', ']];
  function t(s, quiet) {
    if (lang === 'zh-CN' || s == null) return s;
    var raw = String(s);
    if (!HAN.test(raw)) return raw;
    var k = norm(raw);
    var lead = raw.match(/^\s*/)[0], tail = raw.match(/\s*$/)[0];
    if (k in dict) return lead + dict[k] + tail;
    for (var i = 0; i < patterns.length; i++) {
      var p = patterns[i], m = p.re.exec(k);
      if (m) {
        var caps = m.slice(1);
        return lead + p.out.replace(/\{(\d+)\}/g, function (_, n) { var c = caps[p.order.indexOf(+n)]; return c == null ? '' : t(c); }) + tail;
      }
    }
    // Fallbacks only for short single-line labels; long or multi-line text is handled by block().
    if (raw.indexOf('\n') >= 0 || k.length > 120) return quiet ? raw : last(raw, k, quiet);
    // fallback 1: peel decorative symbols (arrows, checks, bullets) and retry the core text
    var pm = /^([^\u3400-\u9fffA-Za-z0-9「“《(（]*)([\s\S]*?)([^\u3400-\u9fffA-Za-z0-9」”》)）。！？]*)$/.exec(k);
    if (pm && (pm[1] || pm[3]) && pm[2] && HAN.test(pm[2])) {
      var core = t(pm[2], true);
      if (core !== pm[2]) return lead + pm[1] + core + pm[3] + tail;
    }
    // fallback 2: composite labels such as "本项目 · 定义" or "看板 / 网页"
    // fallback 2: composite labels such as "本项目 · 定义"; every Chinese part must translate
    for (var j = 0; j < SEPS.length; j++) {
      if (k.indexOf(SEPS[j][0]) < 0) continue;
      var all = true;
      var parts = k.split(SEPS[j][0]).map(function (x) { x = x.trim(); if (!HAN.test(x)) return x; var y = t(x, true); if (y === x) all = false; return y; });
      if (all) return lead + parts.join(lang === 'en' ? SEPS[j][1] : SEPS[j][0]) + tail;
    }
    return last(raw, k, quiet);
  }
  /* zh-TW: anything without an entry is still converted character by character */
  function last(raw, k, quiet) {
    if (!quiet) misses[k] = (misses[k] || 0) + 1;
    if (charMap) return raw.replace(/[\u3400-\u9fff]/g, function (c) { return charMap[c] || c; });
    return raw;
  }
  /* Translate a multi-line block: whole, then per line, then per clause. */
  function block(s) {
    if (lang === 'zh-CN' || s == null || !HAN.test(s)) return s;
    var w = t(s, true); if (w !== s) return w;
    return String(s).split('\n').map(function (line) {
      var x = t(line, true); if (x !== line || !HAN.test(line)) return x;
      var m = /^(\s*(?:[-•·]|\d+[.、)]|【[^】]*】)?\s*)([\s\S]*)$/.exec(line);
      if (m && m[2]) { var y = t(m[2], true); if (y !== m[2]) return m[1].replace(/【([^】]*)】/, function (_, a) { return '[' + t(a) + ']'; }) + y; }
      return last(line, norm(line), true);
    }).join('\n');
  }
  var started = false, readyQ = [];
  I18N.ready = function (fn) { if (started) fn(); else readyQ.push(fn); };
  I18N.t = t;
  I18N.misses = misses;
  I18N.block = block;
  I18N.raw = function (s) { return s; };

  /* ---------- DOM ---------- */
  var ATTRS = ['title', 'placeholder', 'aria-label', 'aria-valuetext', 'alt', 'aria-description', 'data-tip'];
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 0 };
  var applying = false;
  function inSkip(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentNode) {
      if (SKIP[n.nodeName] || n.hasAttribute('data-i18n-skip') || n.isContentEditable) return true;
    }
    return false;
  }
  function doText(node) {
    var v = node.nodeValue;
    if (!v || !HAN.test(v) || !node.parentNode || inSkip(node.parentNode)) return;
    var x = v.indexOf('\n') >= 0 ? block(v) : t(v);
    if (x !== v) node.nodeValue = x;
  }
  function doEl(el) {
    if (inSkip(el.nodeName === 'TEXTAREA' ? el.parentNode : el)) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = el.getAttribute && el.getAttribute(ATTRS[i]);
      if (a && HAN.test(a)) { var x = t(a); if (x !== a) el.setAttribute(ATTRS[i], x); }
    }
    if (el.nodeName === 'INPUT' && (el.type === 'button' || el.type === 'submit') && HAN.test(el.value)) el.value = t(el.value);
    if (el.nodeName === 'META' && /description|og:/.test(el.getAttribute('name') || el.getAttribute('property') || '')) {
      var c = el.getAttribute('content'); if (c && HAN.test(c)) el.setAttribute('content', t(c));
    }
  }
  /* Rich sentences: a block whose content is text + inline tags is translated as one unit.
     Inline elements become numbered markers (<0>…</0>, <br>) so the translation can reorder them;
     the original inline elements are cloned back around the translated text.
     Mirrors richKeys() in scripts/i18n-extract.cjs. */
  var RICH = /^(P|LI|H[1-6]|DD|DT|FIGCAPTION|TD|TH|SUMMARY|LABEL|BLOCKQUOTE|BUTTON|A|CAPTION|LEGEND)$/;
  var INLINE = /^(B|STRONG|EM|I|CODE|KBD|MARK|SMALL|SPAN|A|BR|SUP|SUB|ABBR|TIME|U|S|Q|CITE)$/;
  function richKey(el) {
    if (!RICH.test(el.nodeName)) return null;
    var els = [], ok = true, hasEl = false;
    function ser(node) {
      var out = '';
      for (var c = node.firstChild; c && ok; c = c.nextSibling) {
        if (c.nodeType === 3) out += c.nodeValue;
        else if (c.nodeType === 1) {
          if (!INLINE.test(c.nodeName) || c.id) { ok = false; return ''; }
          if (c.nodeName === 'BR') { out += '<br>'; continue; }
          hasEl = true;
          var i = els.length; els.push(c);
          out += '<' + i + '>' + ser(c) + '</' + i + '>';
        }
      }
      return out;
    }
    var s = ser(el);
    if (!ok || !hasEl || !HAN.test(s)) return null;
    return { key: norm(s), els: els };
  }
  function rebuild(el, value, els) {
    var re = /<(\d+)>|<\/(\d+)>|<br\s*\/?>/g, stack = [document.createDocumentFragment()], last = 0, m;
    function text(s) { if (s) stack[stack.length - 1].appendChild(document.createTextNode(s)); }
    while ((m = re.exec(value))) {
      text(value.slice(last, m.index)); last = re.lastIndex;
      if (m[1] != null) { var src = els[+m[1]]; if (!src) return false; var c = src.cloneNode(false); stack[stack.length - 1].appendChild(c); stack.push(c); }
      else if (m[2] != null) { if (stack.length < 2) return false; stack.pop(); }
      else stack[stack.length - 1].appendChild(document.createElement('br'));
    }
    text(value.slice(last));
    if (stack.length !== 1) return false;
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(stack[0]);
    return true;
  }
  function doRich(el) {
    if (inSkip(el)) return false;
    var r = richKey(el); if (!r) return false;
    var x = t(r.key, true);
    if (x === r.key) return false;
    return rebuild(el, x, r.els);
  }

  function walk(rootNode) {
    if (!rootNode) return;
    if (rootNode.nodeType === 3) { doText(rootNode); return; }
    if (rootNode.nodeType !== 1 && rootNode.nodeType !== 9 && rootNode.nodeType !== 11) return;
    if (rootNode.nodeType === 1) doEl(rootNode);
    var tw = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    var n, texts = [], els = [];
    while ((n = tw.nextNode())) (n.nodeType === 3 ? texts : els).push(n);
    els.forEach(doEl);
    if (rootNode.nodeType === 1) doRich(rootNode);
    els.forEach(doRich);
    texts.forEach(doText);
  }
  function apply() {
    if (lang === 'zh-CN') return;
    applying = true;
    document.title = t(document.title);
    walk(document.documentElement);
    applying = false;
  }
  var mo = new MutationObserver(function (list) {
    if (applying || lang === 'zh-CN') return;
    applying = true;
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (r.type === 'characterData') doText(r.target);
      else if (r.type === 'attributes') doEl(r.target);
      else for (var j = 0; j < r.addedNodes.length; j++) walk(r.addedNodes[j]);
    }
    applying = false;
  });

  /* ---------- clipboard ---------- */
  if (lang !== 'zh-CN') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      var wt = navigator.clipboard.writeText.bind(navigator.clipboard);
      try { navigator.clipboard.writeText = function (s) { return wt(block(s)); }; } catch (e) { /* read-only in some browsers */ }
    }
    document.addEventListener('copy', function (e) {
      var sel = String(getSelection());
      if (!sel || !HAN.test(sel) || !e.clipboardData) return;
      var x = block(sel);
      if (x !== sel) { e.clipboardData.setData('text/plain', x); e.preventDefault(); }
    });
  }

  /* ---------- switcher ---------- */
  function setLang(l) {
    if (l === lang) return;
    var stored = false;
    try { localStorage.setItem(KEY, l); stored = localStorage.getItem(KEY) === l; } catch (e) { /* storage unavailable */ }
    var u = new URL(location.href);
    // Navigating to the same URL with a #hash only scrolls, so reload explicitly;
    // without storage the choice has to travel in ?lang=.
    if (stored && !u.searchParams.has('lang')) { location.reload(); return; }
    u.searchParams.set('lang', l);
    location.replace(u.toString());
  }
  I18N.setLang = setLang;
  function switcher() {
    if (window.top !== window.self) return;
    if (document.querySelector('.i18n-switch')) return;
    var box = document.createElement('div');
    box.className = 'i18n-switch';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', { 'zh-CN': '语言', 'zh-TW': '語言', en: 'Language' }[lang]);
    box.setAttribute('data-i18n-skip', '');
    // narrow screens: one button showing the current language opens the full list
    var toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'i18n-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', box.getAttribute('aria-label') + '：' + NAMES[lang]);
    toggle.innerHTML = '<span>' + LANGS.filter(function (L) { return L[0] === lang; })[0][1] + '</span>';
    var opts = document.createElement('div');
    opts.className = 'i18n-opts';
    function close() { box.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    toggle.addEventListener('click', function () { var o = !box.classList.contains('open'); box.classList.toggle('open', o); toggle.setAttribute('aria-expanded', String(o)); if (o) opts.querySelector('[aria-pressed="true"]').focus(); });
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('open')) { close(); toggle.focus(); } });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
    LANGS.forEach(function (L) {
      var b = document.createElement('button');
      b.type = 'button'; b.lang = L[0];
      b.innerHTML = '<span>' + (matchMedia('(max-width:720px)').matches ? NAMES[L[0]] : L[1]) + '</span>';
      b.setAttribute('aria-label', NAMES[L[0]]); b.title = NAMES[L[0]];
      b.setAttribute('aria-pressed', String(L[0] === lang));
      b.addEventListener('click', function () { close(); setLang(L[0]); });
      opts.appendChild(b);
    });
    box.appendChild(toggle);
    box.appendChild(opts);
    var host = document.querySelector('[data-i18n-host]') || document.querySelector('body > header nav, header nav');
    if (host && host.parentNode) {
      var anchor = host.parentNode.querySelector('[data-i18n-before]') || host.nextSibling;
      host.parentNode.insertBefore(box, anchor);
    } else { box.classList.add('i18n-float'); document.body.appendChild(box); }
  }
  /* Iframes follow the parent page. */
  addEventListener('storage', function (e) { if (e.key === KEY && e.newValue && e.newValue !== lang) location.reload(); });

  function start() {
    root.lang = lang === 'en' ? 'en' : lang;
    switcher();
    if (lang !== 'zh-CN') {
      apply();
      mo.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat(['content', 'value']) });
      root.classList.remove('i18n-pending');
    }
    started = true;
    readyQ.splice(0).forEach(function (fn) { try { fn(); } catch (e) { setTimeout(function () { throw e; }); } });
  }
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  if (lang === 'zh-CN') { ready(start); return; }
  if (lang === 'zh-TW') groups.push('chars');
  var pending = groups.length, failsafe = setTimeout(function () { root.classList.remove('i18n-pending'); }, 2500);
  groups.forEach(function (g) {
    var s = document.createElement('script');
    s.src = base + 'dict/' + g + '.' + lang + '.js';
    s.onload = s.onerror = function () { loaded[g] = true; if (--pending === 0) { clearTimeout(failsafe); ready(start); } };
    (document.head || root).appendChild(s);
  });
})();
