#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..", "..");
const dataPath = resolve(here, "..", "assets", "prompts.json");
const data = JSON.parse(readFileSync(dataPath, "utf8"));

const ids = new Set();
for (const prompt of data.prompts) {
  if (!prompt.id || ids.has(prompt.id)) throw new Error("Duplicate or missing id: " + prompt.id);
  ids.add(prompt.id);
  for (const key of ["category", "family", "title", "summary", "prompt", "scene", "variant"]) {
    if (!prompt[key]) throw new Error(prompt.id + " is missing " + key);
  }
}

const js = "/* Generated from skills/uiux-prompt-playbook/assets/prompts.json. Do not edit by hand. */\n"
  + "window.LAB_DATA = " + JSON.stringify(data, null, 2) + ";\n";
writeFileSync(resolve(root, "docs", "playground", "prompts.js"), js);

function markdown(category) {
  const prompts = data.prompts.filter((prompt) => prompt.category === category);
  const families = [...new Set(prompts.map((prompt) => prompt.family))];
  const lines = [
    "# " + (category === "web" ? "Web prompts" : "App / 小程序 prompts"),
    "",
    "Generated from `assets/prompts.json`. " + prompts.length + " prompts in " + families.length + " families. Each prompt names its live scene, related skills and acceptance checks.",
    "",
    "| Family | Prompts |",
    "| --- | --- |",
    ...families.map((family) => "| " + family + " | " + prompts.filter((prompt) => prompt.family === family).length + " |"),
    "",
  ];
  let number = 0;
  for (const family of families) {
    lines.push("## " + family, "");
    for (const prompt of prompts.filter((item) => item.family === family)) {
      number += 1;
      lines.push(
        "### " + String(number).padStart(3, "0") + " · " + prompt.title,
        "",
        "`" + prompt.id + "` · scene `" + prompt.scene + "` / `" + prompt.variant + "`",
        "",
        prompt.summary,
        "",
        "**Prompt**",
        "",
        "> " + prompt.prompt,
        "",
        "**Skills** " + prompt.skills.map((skill) => "`" + skill + "`").join(" · "),
        "",
        "**Tags** " + prompt.tags.join(" · "),
        "",
        "**Acceptance**",
        "",
        ...prompt.acceptance.map((item) => "- " + item),
        ""
      );
    }
  }
  return lines.join("\n");
}

writeFileSync(resolve(here, "..", "references", "web-prompts.md"), markdown("web"));
writeFileSync(resolve(here, "..", "references", "app-prompts.md"), markdown("app"));

const counts = data.prompts.reduce((acc, prompt) => {
  acc[prompt.category] = (acc[prompt.category] || 0) + 1;
  return acc;
}, {});
console.log("Built " + data.prompts.length + " prompts (" + counts.web + " web / " + counts.app + " app), "
  + new Set(data.prompts.map((prompt) => prompt.scene)).size + " scenes.");
