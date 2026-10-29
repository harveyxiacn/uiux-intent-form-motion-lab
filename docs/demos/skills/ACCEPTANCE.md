# 技能地图展台验收

日期：2026-10-29。入口：[Skill Atlas](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/demos/skills/)，也可从展台第六个标签「技能地图」或 `#atlas` 区块进入。运行环境为 Windows / Edge / Playwright，桌面 1440×1000、手机仿真 390×844，并检查浅色与深色主题。

## 这页展示什么

技能地图把十五个 Skill 放进同一张可操作的地图，而不是再做一张名词卡片墙：

- **六个实时展台**：finesse-term、finesse-ui、ui-ux-pro-max、design-taste-frontend、interface-design、impeccable。每个展台都来自一个上游 Skill 的实际输出形态，在这一页里可输入、切换、检索、抽取、审查和修复。
- **十五个条目的索引**：九个本项目模块（含提示词手册）与六个上游快照各自指向一处实例。本地模块跳到官网、手机原型、工作台、组件实验室或提示词实验室；上游条目跳到对应展台。
- **八个本地模块的自我说明**：页面自身如何被规划、造型、实现与审查。

## 六个展台的实际检查

| 展台 | 可执行的操作 | 实际结果 | 边界 |
| --- | --- | --- | --- |
| finesse-term | 输入五种用户原话，或点击示例 | 「按钮被黑杠挡住了」→ 安全区；「鼠标放上去变个色」→ 悬停态；「弹窗底下还能滑」→ 滚动穿透；「图片加载完页面往下跳」→ 布局偏移；「点不准老是点错」→ 点击热区。无命中时给出更具体的提示 | 词库是 142 条中的 10 条节选；匹配是页面内的大小写归一化与最长公共子串启发式，不运行上游 Node 脚本 |
| finesse-ui | 切换 brand / product / H5，键盘左右、Home、End | 图片、替代文字、register 标签、说明、视觉强度/信息密度与三条变化说明同步更新；H5 展示 390 宽手机截图 | 只展示上游四种 register 中的三种；图片是本项目对应演示截图，不是上游渲染产物 |
| ui-ux-pro-max | 输入产品语境，切换风格/配色/字体 | 「fintech dashboard」在三种资料域分别命中 Data-Dense Dashboard、Fintech / Crypto、Modern Professional 等候选；无命中的词先展示相邻条目 | 6 种风格、6 组配色、6 组字体为上游资料的节选；检索是页面内关键词匹配，不是上游 Python 搜索脚本 |
| design-taste-frontend | 抽三张方向卡，选择并查看预览 | 六个方向中每次抽三个；选择后预览的文字、色板、字体语气与构图随方向变化；再次抽取不重复当前三张 | 方向说明为上游研究的转述，预览是本项目手写的 CSS 构图；不运行上游 Node/Chromium 检查器 |
| interface-design | 在「默认生成」与「设计后」之间切换 | 产品工作台的标题层级、间距、状态标签、按钮与焦点规则同时改变；右侧四个决定逐条点亮 | 同一条模拟工作台数据的两种呈现，不是上游 Skill 的自动输出 |
| impeccable | 运行审查 → 应用修复 → 重置 | 列出 4 条具体问题；修复后对比度、关闭按钮热区、开关焦点与错误播报同时改变；重置恢复问题态，可再次审查 | 4 条问题是按审查输出形态编排的固定示例；不下载或调用上游引擎，不代表 24 个子命令的实际执行结果 |

## 索引与自我说明

- 索引固定 15 条；按来源筛选得到 9 条本项目、6 条上游，计数同步更新。
- 每个条目都有短效果、具体实例、目标链接与源 `SKILL.md` 链接。
- 首屏四阶段栏可定位「定义 / 造型 / 行动 / 验证」；定位只做短暂高亮，不隐藏其他条目。
- 页面自述的八条分别对应八个本地模块，并与实际实现互相指认，例如双主题 token、可中断结果、键盘入口和 44px 触控目标。

## 可访问性与响应式

- 两组 tab 使用 roving tabindex、`aria-selected`、`aria-controls`；搜索结果的 `tabpanel` 会跟随所选资料域更新 `aria-labelledby`。
- 所有即时结果通过页面底部唯一的 `role=status` 播报；结果卡与预览本身不再重复 live，避免同一动作被读屏重复播报两遍。
- 主题按钮有 `aria-pressed` 与随状态变化的名称；主题同步到内嵌展台，重载后仍保留选择。
- 键盘可完成术语查询、register 切换、资料检索、方向抽取与选择、层级切换、审查/修复/重置、索引筛选。
- 手机端单列展台，输入与按钮占满可用宽度；筛选与标签可换行；390 宽无横向溢出；标题在手机仍保持两行。导航、tab、筛选、示例 chip 与主要按钮至少 44px 高；审查示例中的控件分别呈现故意的问题态与修复态。
- `prefers-reduced-motion: reduce` 关闭过渡与滚动动画，所有状态仍立即到达最终值。

## 数据、来源与许可

上游资料按 `skills/upstream/sources.json` 记录的版本节选：

- finesse-term 0.3.0（MIT），142 条词库取 10 条。
- finesse-ui 0.22.0（MIT），展示 3 种 register。
- ui-ux-pro-max 2.15.0（MIT），79 种风格、192 组配色、74 组字体各取 6 条。
- design-taste-frontend 2.1.5（MIT），20 个方向中取 6 个做预览。
- interface-design 2026.6.20（MIT）。
- impeccable 4.8.0（Apache-2.0）。

页面没有远程字体、远程图片或运行时依赖；所有示例数据在 `docs/demos/skills/data.js`。上游完整许可证与 NOTICE 在 `skills/upstream/`。

## 复现与证据

```bash
python -m http.server 4173
PLAYWRIGHT_MODULE=<playwright 模块路径> node scripts/verify.cjs
```

`verify-skills.cjs` 覆盖上述六类交互、15 条索引、来源筛选、阶段定位、双主题、390 宽溢出与标题行数。截图：

- [桌面整页](../../screenshots/skills-desktop.png)
- [桌面首屏](../../screenshots/skills-fold.png)
- [手机首屏](../../screenshots/skills-mobile.png)
- [深色首屏](../../screenshots/skills-dark.png)
- [展台内嵌第六标签](../../screenshots/showcase-atlas.png)
- [代表文本对比度](../../screenshots/atlas-contrast-results.json)

对比度检查为六组明确背景上的代表文本，浅/深主题均 ≥ 4.5；它不构成全页 WCAG 认证。没有做真机软键盘、真实读屏软件、200% 缩放全流程或性能 trace。

## 不能声称什么

这页是 **Skill 效果的展台**，不是六个上游项目的完整回归测试，也不是独立模型行为评测。展台按各 Skill 的公开输出形态手写了可操作证据，让读者看见方法能改变什么；它没有逐条执行上游脚本、没有覆盖全部 142 个术语或 79 种风格，也没有证明这些 Skill 在任何项目上都会产生同样结果。上游快照本身的源码与许可证审查见 [skills/upstream/README.md](../../../skills/upstream/README.md)。
