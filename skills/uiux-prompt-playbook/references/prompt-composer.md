# Prompt composer

The playground includes a local, rule-based composer that turns a natural-language need into a structured UI/UX prompt. It runs entirely in the browser. It is not an LLM call and does not send the need anywhere.

## What it does

1. **Normalise** the need — lower-case Latin text, remove most punctuation, collapse whitespace.
2. **Tokenise** — split on whitespace; add every 2-character and 3-character Han substring. This catches terms such as `底部导航`, `拖拽` and `圆形扩散` without a dictionary segmenter.
3. **Infer a surface** — count app cues (`app`, `小程序`, `手机`, `移动`, `手势`, `触屏`, `底部导航`, `ios`, `安卓`) against web cues (`网页`, `网站`, `后台`, `dashboard`, `工作台`, `桌面`, `官网`, `浏览器`, `表格`). A tie stays unknown.
4. **Score** every catalogue prompt — token matches score 3 for 3+ characters and 2 for 2 characters; concept hits add a family-specific boost; the inferred surface adds 10 or subtracts 8.
5. **Build** a prompt from the top match plus a second composable match.

## Concept groups

The scoring layer has hand-curated concept groups for common UI vocabulary:

| Need cues | Concepts that get a boost |
| --- | --- |
| 底部导航 / 底栏 / tab bar | 底栏, 导航, 胶囊, 标签 |
| 主题 / 深色 / 换肤 | 主题, 深色, 扩散, 圆形 |
| 删除 / 移走 | 删除, 曲线, 撤销, 缩小 |
| 拖 / 排序 / 让位 | 拖拽, 排序, 让位, 吸附 |
| 卡片 / 堆叠 / 翻面 | 卡片, 堆叠, 翻转, 详情 |
| 弹窗 / 抽屉 / 面板 | 弹层, 面板, 抽屉, 底部 |
| 滚动 / 下滑 / 上滑 | 滚动, 吸顶, 视差, 进度 |
| 按钮 / 点击 / 长按 | 按钮, 长按, 滑动确认, 进度 |
| 搜索 / 筛选 | 搜索, 筛选, 联想, 下拉 |
| 图表 / 数据 / 占比 | 图表, 数据, 环形, 曲线, 仪表 |
| 手势 / 惯性 / 橡皮筋 | 手势, 惯性, 橡皮筋, 方向 |
| 日历 / 日期 / 时间 | 日历, 日期, 时间, 周 |
| 标签 / 分类 | 标签, 分类, 筛选, 让位 |
| 输入 / 表单 / 错误 | 输入, 表单, 错误, 浮动 |
| 照片 / 图片 / 取色 | 照片, 图片, 取色, 全屏 |
| 高级 / 精致 / 顺滑 | 高级, 质感, 缓动, 弹簧, 柔和 |

The boost is deliberately small relative to exact phrase matches. It helps a vague need, but does not override a concrete noun.

## Output

```text
请实现一个[网页 / App / 小程序]界面效果，需求原话是：「…」。

目标场景：… · …
核心效果：…
可组合的第二个效果（…）：…

手感：入场 320–560ms，使用缓动而非线性；拖动跟手，松手后吸附到可预测的位置；允许中途反向或取消，不能锁死。
边界：必须保留空状态、失败状态和 reduced-motion 替代；只改变视觉，不改变业务状态；触摸、键盘和读屏都能完成同一件事。
验收：
1. …
2. …
3. …
```

If no prompt scores above zero, the composer returns a clarification checklist rather than inventing a match.

## Limits

- It does not understand arbitrary business objects, domain rules or novel interactions.
- Chinese synonym coverage is finite; unseen wording can produce a weak or incorrect match.
- It does not read the current page, user history or brand system.
- It cannot validate the generated prompt or claim that the result is accessible or performant.
- It never calls an external model. “智能” here means deterministic matching plus structured completion.

## Extending it

Add a concept group in `docs/playground/app.js` and mirror the change in `scripts/compose.mjs`. Keep each cue set small and concrete. Add catalogue prompts by editing `assets/prompts.json`, then run:

```bash
node skills/uiux-prompt-playbook/scripts/build.mjs
```

The build validates duplicate IDs and required fields, regenerates `docs/playground/prompts.js` and the two prompt references. After adding a new `scene`, implement a renderer in `docs/playground/scenes.js` and add it to the acceptance sweep.

## CLI

```bash
node scripts/compose.mjs "我想让底部导航更精致，切换时背景块滑过去"
node scripts/compose.mjs --json "卡片删除时飞走，别太夸张"
```

The CLI uses the same catalogue and a compact version of the same scoring rules. It prints the top matches, the composed prompt and the acceptance checks.
