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

function combinedMarkdown() {
  const categories = data.categories;
  const counts = data.prompts.reduce((acc, prompt) => {
    acc[prompt.category] = (acc[prompt.category] || 0) + 1;
    return acc;
  }, {});
  const lines = [
    "# UI/UX 提示词全集",
    "",
    "> " + data.prompts.length + " 条可执行的界面提示词，按「网页」与「App / 小程序」分为两大类。每条都包含效果摘要、可直接复制的提示词、相关 Skill 与可观察的验收点。",
    "",
    "- **网页** " + counts.web + " 条 · **App / 小程序** " + counts.app + " 条",
    "- **版本** " + data.version + " · **整理日期** " + data.updated,
    "- **在线预览** [提示词实验室](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/)：选择任意条目即可操作对应效果。",
    "- **规范来源** `skills/uiux-prompt-playbook/assets/prompts.json`；本文件由 `scripts/build.mjs` 生成，请勿手工编辑。",
    "",
    "## 怎么用",
    "",
    "1. 先确定界面类型：网页、Dashboard 或桌面组件归入网页；App、小程序、H5 与触摸手势归入 App / 小程序。",
    "2. 找到接近需求的条目，复制「提示词」，替换示例文案、数字与品牌语言。",
    "3. 不要删掉场景、动作、手感、边界与验收；这些字段决定效果能否被实现和检查。",
    "4. 用「验收」逐项检查正常播放、快速重复、反向取消、键盘路径、减少动态与空 / 错误状态。",
    "5. 「高级」「顺滑」不是参数。把它们落成时长、缓动、位移、打断策略与可取消的路径。",
    "",
    "> 提示词是设计与工程的输入，不是实现证据。没有运行验证，不要声称效果已经可访问、流畅或完成。",
    "",
    "## 目录",
    "",
  ];
  for (const category of categories) {
    const prompts = data.prompts.filter((prompt) => prompt.category === category.id);
    const families = [...new Set(prompts.map((prompt) => prompt.family))];
    lines.push("### " + category.label + " · " + prompts.length + " 条", "");
    lines.push("| 家族 | 条数 | 跳转 |");
    lines.push("| --- | --- | --- |");
    families.forEach((family, familyIndex) => {
      lines.push("| " + family + " | " + prompts.filter((prompt) => prompt.family === family).length + " | [查看](#family-" + category.id + "-" + familyIndex + ") |");
    });
    lines.push("");
  }

  let number = 0;
  for (const category of categories) {
    const prompts = data.prompts.filter((prompt) => prompt.category === category.id);
    const families = [...new Set(prompts.map((prompt) => prompt.family))];
    lines.push("## " + (category.id === "web" ? "一、网页" : "二、App / 小程序"), "");
    for (const [familyIndex, family] of families.entries()) {
      lines.push('<a id="family-' + category.id + '-' + familyIndex + '"></a>', "", "### " + family, "");
      for (const prompt of prompts.filter((item) => item.family === family)) {
        number += 1;
        const body = prompt.prompt.split("\n").map((line) => "> " + line).join("\n");
        lines.push(
          "#### " + String(number).padStart(3, "0") + " · " + prompt.title,
          "",
          prompt.summary,
          "",
          "**提示词**",
          "",
          body,
          "",
          "**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/" + prompt.id + ") · `" + prompt.id + "`",
          "",
          "**关联 Skill** " + prompt.skills.map((skill) => "`" + skill + "`").join(" · "),
          "",
          "**标签** " + prompt.tags.join(" · "),
          "",
          "**验收**",
          "",
          ...prompt.acceptance.map((item) => "- [ ] " + item),
          ""
        );
      }
    }
  }
  return lines.join("\n");
}

writeFileSync(resolve(root, "UIUX-PROMPTS.md"), combinedMarkdown());

writeFileSync(resolve(here, "..", "references", "web-prompts.md"), markdown("web"));
writeFileSync(resolve(here, "..", "references", "app-prompts.md"), markdown("app"));

const counts = data.prompts.reduce((acc, prompt) => {
  acc[prompt.category] = (acc[prompt.category] || 0) + 1;
  return acc;
}, {});
console.log("Built " + data.prompts.length + " prompts (" + counts.web + " web / " + counts.app + " app), "
  + new Set(data.prompts.map((prompt) => prompt.scene)).size + " scenes.");
