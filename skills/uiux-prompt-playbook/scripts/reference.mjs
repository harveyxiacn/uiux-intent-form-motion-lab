/* Bundle the working demo code into the skill so an agent with only the installed skill
   (Claude Code, Codex) can read the implementation behind every prompt and pipeline effect.

   - Copies the scene sources from docs/ into assets/reference/ (never edit the copies;
     build.mjs regenerates them from docs/ every run).
   - Locates each prompt's scene function and variant branch, and each pipeline effect's scene,
     and writes assets/reference/index.json (machine lookup) and assets/reference/INDEX.md. */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import vm from "node:vm";

const FILES = {
  // prompt lab: scene JS and the CSS that styles it
  "playground/scenes.js": "docs/playground/scenes.js",
  "playground/motion.js": "docs/playground/motion.js",
  "playground/states.js": "docs/playground/states.js",
  "playground/neu.js": "docs/playground/neu.js",
  "playground/menu.js": "docs/playground/menu.js",
  "playground/lab.css": "docs/playground/lab.css",
  "playground/motion.css": "docs/playground/motion.css",
  "playground/states.css": "docs/playground/states.css",
  "playground/neu.css": "docs/playground/neu.css",
  "playground/menu.css": "docs/playground/menu.css",
  // pipeline playground: effect contracts and its own scenes
  "pipeline/effects.js": "docs/pipeline/effects.js",
  "pipeline/scenes.js": "docs/pipeline/scenes.js",
  "pipeline/photo-scenes.js": "docs/pipeline/photo-scenes.js",
  "pipeline/bridge-scenes.js": "docs/pipeline/bridge-scenes.js",
  "pipeline/lab.css": "docs/pipeline/lab.css",
  "pipeline/photo.css": "docs/pipeline/photo.css"
};
const CSS_OF = {
  "playground/scenes.js": "playground/lab.css",
  "playground/motion.js": "playground/motion.css",
  "playground/states.js": "playground/states.css",
  "playground/neu.js": "playground/neu.css",
  "playground/menu.js": "playground/menu.css",
  "pipeline/scenes.js": "pipeline/lab.css",
  "pipeline/photo-scenes.js": "pipeline/photo.css"
};
const PLAYGROUND_JS = Object.keys(CSS_OF).filter((f) => f.startsWith("playground/"));

export function buildReference(root, skillDir, data) {
  const out = resolve(skillDir, "assets", "reference");
  if (existsSync(out)) rmSync(out, { recursive: true, force: true });
  const text = {};
  for (const [to, from] of Object.entries(FILES)) {
    const dest = resolve(out, to);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(resolve(root, from), dest);
    text[to] = readFileSync(dest, "utf8").split(/\r?\n/);
  }

  // Where is `S.<scene> =` defined, and where does that function end (the next S.x = or EOF)?
  const defs = {};
  for (const file of Object.keys(text)) {
    if (!file.endsWith(".js")) continue;
    text[file].forEach((line, i) => {
      const m = line.match(/^\s*S\.([A-Za-z]\w*)\s*=/);
      if (m) defs[m[1]] = { file, start: i + 1 };
    });
  }
  for (const def of Object.values(defs)) {
    const next = Object.values(defs).filter((d) => d.file === def.file && d.start > def.start).map((d) => d.start);
    def.end = next.length ? Math.min(...next) - 1 : text[def.file].length;
  }
  const variantLine = (def, variant) => {
    const lines = text[def.file];
    const hit = (i, re) => re.test(lines[i]);
    const branch = new RegExp(`^\\s*(?:\\} else )?if \\((?:variant === ["'][\\w-]+["']\\s*\\|\\|\\s*)*variant === ["']${variant}["']`);
    // the branch that builds the variant; scenes that share one body across variants
    // (e.g. const isSnap = variant === "snap") return null and point at the scene start
    for (let i = def.start - 1; i < def.end; i += 1) if (hit(i, branch)) return i + 1;
    return null;
  };

  const prompts = {};
  for (const p of data.prompts) {
    const def = defs[p.scene];
    if (!def || !PLAYGROUND_JS.includes(def.file)) throw new Error(`reference: scene ${p.scene} (${p.id}) not found in playground sources`);
    prompts[p.id] = { js: def.file, css: CSS_OF[def.file], symbol: "S." + p.scene, variant: p.variant, sceneLines: [def.start, def.end], variantLine: variantLine(def, p.variant) };
  }

  // Pipeline effects: evaluate effects.js and read the bridge map, without a browser.
  const sandbox = { window: {} };
  vm.runInNewContext(text["pipeline/effects.js"].join("\n"), sandbox);
  const bridgeSrc = text["pipeline/bridge-scenes.js"].join("\n");
  const bridge = {};
  for (const m of bridgeSrc.matchAll(/(\w+):\s*\['(\w+)',\s*'(\w+)'\]/g)) bridge[m[1]] = [m[2], m[3]];
  const effects = {};
  for (const e of sandbox.window.PIPE.EFFECTS) {
    if (bridge[e.scene]) {
      const [mod, variant] = bridge[e.scene];
      const def = defs[mod];
      effects[e.id] = { js: def.file, css: CSS_OF[def.file], symbol: "S." + mod, variant, sceneLines: [def.start, def.end], variantLine: variantLine(def, variant), contract: "pipeline/effects.js" };
    } else {
      const def = defs[e.scene];
      if (!def) throw new Error(`reference: pipeline scene ${e.scene} (${e.id}) not found`);
      effects[e.id] = { js: def.file, css: CSS_OF[def.file], symbol: "S." + e.scene, variant: null, sceneLines: [def.start, def.end], variantLine: null, contract: "pipeline/effects.js" };
    }
    effects[e.id].title = e.title;
  }

  writeFileSync(resolve(out, "index.json"), JSON.stringify({
    note: "Generated by scripts/build.mjs from docs/. Paths are relative to this folder. Lines are 1-based.",
    prompts, pipeline: effects
  }, null, 1) + "\n");

  const row = (id, r, title) => `| \`${id}\` | ${title} | \`${r.js}\` | \`${r.symbol}\`${r.variant ? ` / \`${r.variant}\`` : ""} | ${r.variantLine || r.sceneLines[0]} | \`${r.css}\` |`;
  const md = [
    "# Reference implementations",
    "",
    "Working browser code behind every prompt in `../prompts.json` and every effect of the pipeline playground. Generated by `scripts/build.mjs` from the repository's `docs/`; do not edit these copies.",
    "",
    "How to use one (see SKILL.md → Reference implementations):",
    "",
    "1. Look up the prompt id (or pipeline effect id) below, or in `index.json`.",
    "2. Open the JS file at the listed line: that is the variant branch (or the scene function) to read.",
    "3. Grep the class names used in that branch in the listed CSS file.",
    "4. Port the behaviour — state machine, timings, interruption, keyboard and reduced-motion paths — into the project's own stack. Do not copy the demo data, the scene shell or the photos.",
    "",
    "Scenes share a contract: `S.<scene>(root, variant, ctx)` renders into `root` and returns a teardown. The pipeline variant is `(root, ctx)`, where `ctx.d(ms)` scales durations by feel, `ctx.reduced()` reports reduced motion and `ctx.log()` writes the event feed.",
    "",
    "## Prompts (" + data.prompts.length + ")",
    "",
    "| Prompt | Title | JS | Scene / variant | Line | CSS |",
    "| --- | --- | --- | --- | ---: | --- |",
    ...data.prompts.map((p) => row(p.id, prompts[p.id], p.title)),
    "",
    "## Pipeline effects (" + Object.keys(effects).length + ")",
    "",
    "Contracts (object, trigger, sequence, result, accessibility, states, interruption, timings, acceptance) are the `EFFECTS` entries in `pipeline/effects.js`.",
    "",
    "| Effect | Title | JS | Scene / variant | Line | CSS |",
    "| --- | --- | --- | --- | ---: | --- |",
    ...Object.entries(effects).map(([id, r]) => row(id, r, r.title)),
    ""
  ];
  writeFileSync(resolve(out, "INDEX.md"), md.join("\n"));
  return { prompts, effects };
}
