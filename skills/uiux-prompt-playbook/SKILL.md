---
name: uiux-prompt-playbook
description: A testable library of 141 Chinese UI/UX prompts for web and App / 小程序 surfaces, each mapped to a live interaction scene and explicit acceptance checks. Use when someone wants a concrete prompt for a UI effect, asks to turn a vague description such as “高级一点 / 顺一点 / 卡片飞走” into an implementable interaction, wants to compare interaction recipes, or needs a structured scene / action / feel / boundary / acceptance spec before building.
---

# UI/UX Prompt Playbook

This is a working prompt library, not a list of adjectives. Every prompt names a surface, an interaction, a feel, boundaries and observable acceptance. The same catalogue powers the live playground in `docs/`; a prompt can be copied as text or inspected as a running scene.

## What this skill is for

Use it when the task is to:

- choose an interaction recipe for a specific surface (web page, dashboard, mobile app, mini program);
- translate a vague request (“让它更精致”“删除时飞走”“滚动有点拖影”) into an implementable spec;
- compare two approaches before writing code;
- add state, interruption, keyboard, reduced-motion and empty/error boundaries to an effect;
- generate a first-pass prompt from a natural-language need with the rule-based composer.

Do not use it as proof that an implementation is accessible, performant or complete. A prompt is an input to design and engineering, not evidence.

## Surfaces

Choose one primary surface before choosing effects:

| Surface | Typical concerns | Catalogue |
| --- | --- | --- |
| Web | Pointer, hover, keyboard, dense layouts, dashboards, data, editorial pages | 58 prompts |
| App / 小程序 | Touch, gestures, safe areas, bottom sheets, one-handed reach, platform back | 83 prompts |

The split is about the user's task and input model, not the browser. A dashboard is web even when viewed on a phone. A mini program is app even when it runs in a webview.

## Workflow

### 1. Start from the task, not the effect

State the surface, the user's goal, the content that changes, and the input that starts it. If the user only names a feeling, use the composer reference to map it to a small number of candidate effects.

### 2. Pick a family

Families are navigation aids, not folders of interchangeable tricks:

- 按钮 · 版式与布局 · 表单与选择 · 菜单与导航
- 场景组件 · 工作台布局 · 面板与弹层 · 数据可视化
- 网站与组件 · 按钮与确认 · 标签与选择 · 导航与悬浮
- 滚动与动效 · 卡片 · 控件 · 排序与拖拽
- 手势 · 输入与反馈 · 页面场景 · 移动组件 · 主题与状态

Search `assets/prompts.json` by `title`, `tags`, `summary`, `scene` or `variant`. Read the full prompt, skills and acceptance rather than only the title.

### 3. Copy the prompt, then adapt it

A usable adaptation keeps these fields:

1. **Scene** — where this happens and what is already on screen.
2. **Action** — the input, the thing that moves, and the state change.
3. **Feel** — duration band, easing character, distance, interruption policy.
4. **Boundary** — empty, error, loading, reduced motion, keyboard / touch alternative, reversal.
5. **Acceptance** — observable checks that another person can run.

Keep the user's product language. Replace example copy and numbers. Do not add unrelated animation just because the catalogue contains it.

### 4. Compose from natural language

When the user gives a need rather than a recipe, use the local rule-based composer:

- On the web: the “自然语言生成” section of the playground.
- In a terminal: `node scripts/compose.mjs "我想让底部导航更精致，切换时背景块滑过去"`.

The composer tokenises the need, scores catalogue entries by concept groups and fills a structured prompt. It understands common UI vocabulary, not arbitrary business logic. Always show the matched effects and let the user confirm copy, state and acceptance.

### 5. Verify before claiming success

For every adapted prompt, check:

- normal playback and rapid repeat;
- reversal / cancellation / unmount;
- keyboard and touch alternatives for gesture-only interactions;
- reduced motion;
- empty, error and loading states where applicable;
- focus restoration and accessible naming;
- no invisible interactive elements, stuck overlays or blocked scroll.

Performance and accessibility claims need runtime evidence. A screenshot alone proves neither.

## Prompt anatomy

```text
请实现一个[网页 / App]界面效果，需求原话是：「…」。
目标场景：…
核心效果：…（可组合的第二个效果）
手感：入场 …ms；拖动跟手；可取消…
边界：空状态、失败、reduced-motion…；不改变业务状态…
验收：1. … 2. … 3. …
```

The prompt should preserve the user's intent while making the interaction falsifiable. “高级” becomes a decision about spacing, hierarchy, timing and restraint; “顺” becomes a duration/easing/interruption policy.

## Live playground

- Homepage: `docs/index.html` — library, scene stage, prompt detail, composer.
- Archive showcase: `docs/showcase.html` — the six full interface demos.
- Atlas: `docs/demos/skills/` — all 15 skills.

The playground renders 21 scene families with real pointer, keyboard and reduced-motion behavior. It is a prototype, not production code: no backend, accounts or persistence.

## Files

- `assets/prompts.json` — canonical catalogue (141 prompts, 21 families).
- `references/web-prompts.md` — generated web prompt reference.
- `references/app-prompts.md` — generated App / 小程序 prompt reference.
- `references/gesture-recipes.md` — gesture state machines and invariants.
- `references/prompt-composer.md` — how the natural-language composer works and where it stops.
- `scripts/build.mjs` — regenerate `docs/playground/prompts.js` and both markdown references.
- `scripts/compose.mjs` — local command-line composer.

## Quality gate

Before delivering:

1. The prompt names a surface and a real user action.
2. The state change is explicit and reversible where the interaction implies reversal.
3. Timing and easing are proposed as choices, not universal laws.
4. Gestures have a keyboard or visible-button alternative.
5. Reduced motion preserves state and feedback.
6. Acceptance checks are observable without reading the implementation.
7. No claim of accessibility certification or performance measurement is made without evidence.

Related skills: `uiux-interaction-spec`, `uiux-motion-engineering`, `uiux-mobile-patterns`, `uiux-accessibility-review`, `uiux-design-system`.
