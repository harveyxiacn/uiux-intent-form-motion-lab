#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(resolve(here, "..", "assets", "prompts.json"), "utf8"));
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const text = args.filter((arg) => arg !== "--json").join(" ").trim();

const CONCEPTS = [
  { keys: ["底部导航", "底栏", "tabbar", "tab bar", "标签栏"], words: ["底栏", "导航", "胶囊", "标签"], boost: 7 },
  { keys: ["主题", "深色", "暗色", "换肤"], words: ["主题", "深色", "扩散", "圆形"], boost: 7 },
  { keys: ["删除", "移走", "扔掉"], words: ["删除", "曲线", "撤销", "缩小"], boost: 6 },
  { keys: ["拖", "排序", "拖动", "挪动", "让位"], words: ["拖拽", "排序", "让位", "吸附"], boost: 6 },
  { keys: ["卡片", "堆叠", "翻面", "翻转"], words: ["卡片", "堆叠", "翻转", "详情"], boost: 4 },
  { keys: ["弹窗", "抽屉", "面板", "弹出", "底部"], words: ["弹层", "面板", "抽屉", "底部"], boost: 4 },
  { keys: ["滚动", "下滑", "上滑", "滚"], words: ["滚动", "吸顶", "视差", "进度"], boost: 5 },
  { keys: ["按钮", "按一下", "点击"], words: ["按钮", "长按", "滑动确认", "进度"], boost: 4 },
  { keys: ["开关", "切换"], words: ["开关", "切换", "状态", "弹性"], boost: 4 },
  { keys: ["搜索", "筛选", "查找"], words: ["搜索", "筛选", "联想", "下拉"], boost: 5 },
  { keys: ["图表", "数据", "仪表", "占比", "曲线"], words: ["图表", "数据", "环形", "曲线", "仪表"], boost: 6 },
  { keys: ["手势", "滑动返回", "惯性", "橡皮筋"], words: ["手势", "惯性", "橡皮筋", "方向"], boost: 6 },
  { keys: ["日历", "日期", "时间"], words: ["日历", "日期", "时间", "周"], boost: 4 },
  { keys: ["标签", "分类"], words: ["标签", "分类", "筛选", "让位"], boost: 4 },
  { keys: ["输入框", "表单", "输入"], words: ["输入", "表单", "错误", "浮动"], boost: 4 },
  { keys: ["照片", "图片", "取色"], words: ["照片", "图片", "取色", "全屏"], boost: 3 },
  { keys: ["高级", "精致", "质感", "顺滑", "自然"], words: ["高级", "质感", "缓动", "弹簧", "柔和"], boost: 1 }
];

function normalize(value) {
  return String(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function tokensOf(value) {
  const clean = normalize(value).replace(/[，。！？、；：,.!?;:"'“”‘’()（）\[\]【】]/g, " ");
  const parts = clean.split(/\s+/).filter(Boolean);
  const tokens = new Set(parts);
  for (const part of parts) {
    const han = part.replace(/[^一-龥]/g, "");
    for (let i = 0; i < han.length - 1; i += 1) tokens.add(han.slice(i, i + 2));
    for (let i = 0; i < han.length - 2; i += 1) tokens.add(han.slice(i, i + 3));
  }
  return [...tokens].filter((token) => token.length > 1 || /[a-z]/i.test(token));
}

function inferCategory(value) {
  const input = normalize(value);
  const appHits = ["app", "小程序", "手机", "移动", "手势", "触屏", "底部导航", "ios", "安卓"].filter((key) => input.includes(key)).length;
  const webHits = ["网页", "网站", "后台", "dashboard", "工作台", "桌面", "官网", "浏览器", "表格"].filter((key) => input.includes(key)).length;
  if (appHits > webHits) return "app";
  if (webHits > appHits) return "web";
  return null;
}

const category = inferCategory(text);
const tokens = tokensOf(text);
const matches = data.prompts.map((prompt) => {
  const haystack = normalize([prompt.title, prompt.summary, prompt.prompt, prompt.family, prompt.tags.join(" "), prompt.scene].join(" "));
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += token.length >= 3 ? 3 : 2;
  }
  for (const concept of CONCEPTS) {
    if (concept.keys.some((key) => normalize(text).includes(key))) {
      for (const word of concept.words) if (haystack.includes(word)) score += concept.boost;
    }
  }
  if (category && prompt.category === category) score += 10;
  if (category && prompt.category !== category) score -= 8;
  return { ...prompt, score };
}).filter((prompt) => prompt.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);

function composed(top, second) {
  if (!top) {
    return "请设计一个界面效果，并先补齐以下信息：\n\n1. 场景：这是网页、App 还是小程序？用户在什么情境下使用？\n2. 动作：用户做什么，界面如何回应？\n3. 手感：入场时长、缓动、是否可中断，手指松开后落在哪里？\n4. 边界：空状态、失败、快速重复、反向操作、键盘或读屏如何完成？\n5. 验收：给出 3 条可以在浏览器里复现的检查。\n\n原始需求：" + text;
  }
  const surface = top.category === "web" ? "网页" : "App / 小程序";
  return [
    "请实现一个" + surface + "界面效果，需求原话是：「" + text + "」。",
    "",
    "目标场景：" + surface + " · " + top.family,
    "核心效果：" + top.prompt,
    second ? "可组合的第二个效果（" + second.title + "）：" + second.prompt : "",
    "",
    "手感：入场 320–560ms，使用缓动而非线性；拖动跟手，松手后吸附到可预测的位置；允许中途反向或取消，不能锁死。",
    "边界：必须保留空状态、失败状态和 reduced-motion 替代；只改变视觉，不改变业务状态；触摸、键盘和读屏都能完成同一件事。",
    "验收：",
    ...top.acceptance.map((item, index) => (index + 1) + ". " + item)
  ].filter(Boolean).join("\n");
}

const top = matches[0];
const output = {
  need: text,
  category: category || "unknown",
  matches: matches.map(({ score, id, title, category: surface, family, scene, variant }) => ({ id, title, category: surface, family, scene, variant, score })),
  prompt: composed(top, matches[1]),
  acceptance: top ? top.acceptance : []
};

if (!text) {
  console.log("Usage: node scripts/compose.mjs [--json] \"你的界面需求\"");
  process.exit(0);
}

if (asJson) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log("匹配效果");
  for (const [index, match] of output.matches.slice(0, 3).entries()) {
    console.log("  " + (index + 1) + ". " + match.title + "  [" + match.category + " / " + match.family + "]");
  }
  console.log("\n" + output.prompt);
}
