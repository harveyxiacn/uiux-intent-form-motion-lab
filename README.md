# Intent / Form / Motion

本项目提供十五个 UI/UX Skill（九个本项目模块、六个上游快照）、141 条可执行提示词与 21 个可操作场景，以及官网、Dashboard、手机 App、组合工作台、组件动效、技能地图六组完整界面演示。工作流：**明确页面目标 → 提炼视觉方向 → 定义交互与动效 → 现场验收**。

[在线提示词实验室](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/) · [作品展台](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/showcase.html) · [设计指南](DESIGN-GUIDE.md) · [验证记录](REVIEW.md)

## 提示词实验室

首页不是提示词清单，而是一个可以当场操作的放映室：按「网页」和「App / 小程序」分成两大类，选择任意提示词，中间舞台立即呈现对应的真实界面效果。每条提示词都带场景、动作、手感、边界、验收点和关联 Skill；右侧可一键复制，左侧可按家族筛选或搜索。

141 条提示词来自对常用交互的逐条去重与整理，覆盖按钮、布局、选择器、菜单、弹层、卡片、手势、滚动、输入、图表、工作台与编辑式页面。21 个场景家族全部在浏览器里实现，使用 Pointer Events、CSS 过渡、Web Animations API、SVG 与原生焦点管理；拖动、吸附、橡皮筋、共享元素、3D 翻面等效果都可以直接试。演示不调用后端，不持久化数据。

完整文本合集见 [UIUX-PROMPTS.md](UIUX-PROMPTS.md)：按网页 / App 分章，每条都带可复制提示词、关联 Skill、验收清单与在线预览入口。

![提示词实验室桌面首屏](docs/screenshots/lab-desktop.png)

![App 底栏胶囊场景](docs/screenshots/lab-scene-app.png) ![网页曲线图表场景](docs/screenshots/lab-scene-web.png)

### 自然语言生成

页面下半部分提供一个本地规则式生成器：写下自然语言需求（例如「底部导航精致一点，切换时背景块滑过去；卡片删除时飞走，别太夸张」），系统会从 141 条提示词中匹配最接近的效果，补全成「场景 / 动作 / 手感 / 边界 / 验收」结构，并提供复制与一键预览。它不调用云端模型，不理解任意新业务；匹配依据与边界写在 [prompt-composer.md](skills/uiux-prompt-playbook/references/prompt-composer.md)。

![自然语言生成与预览](docs/screenshots/lab-composer.png)

## 作品展台

![作品展台桌面首屏](docs/screenshots/showcase-desktop.png)

[桌面整页](docs/screenshots/showcase-desktop-full.png) · [手机整页](docs/screenshots/showcase-mobile-full.png) · [揭角中间帧](docs/screenshots/showcase-peel-mid.png) · [贴纸移位帧](docs/screenshots/showcase-peel-travel.png)

[展台设计决策](docs/SHOWCASE-DESIGN.md)记录页面目标、构图、视觉语言与交互契约。预览卡可以切换对应实例；贴纸支持键盘、反向与减少动态效果。实际验收范围见[验证记录](REVIEW.md)。

## 组合实例

[组合工作台](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/showcase.html#studio)把页面任务规划、视觉层级、token 主题、筛选与编辑、动效与焦点策略组合为一个工作场景。[组件动效实验室](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/showcase.html#components)提供可单独检验的 tabs、展开、对话框、面板和表单。

![组合工作台桌面](docs/screenshots/studio-desktop.png)

![组件动效实验室](docs/screenshots/components-desktop.png)

[十五项 Skill 的实例与展台验收](SKILL-VALIDATION.md)逐一列出它们在哪个界面产生作用、具体检查及限制。验证涵盖运行行为，不以格式检查代替实例测试；无障碍检查不等于 WCAG 认证。

## 技能地图

[技能地图](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/demos/skills/)是第六组实例，也是十五个 Skill 的可操作索引。六个上游 Skill 各有一个实时展台：

- **finesse-term**：把「按钮被黑杠挡住了」翻译成安全区、视口设置与吸底操作栏。
- **finesse-ui**：同一任务在 brand / product / H5 三种 register 下改变构图、密度与文案。
- **ui-ux-pro-max**：按产品语境检索风格、配色与字体候选，并显示风险。
- **design-taste-frontend**：从六个方向中抽三张结构不同的牌，选择后改变预览。
- **interface-design**：同一条产品工作台，在默认生成与设计后之间切换层级、间距、状态和焦点。
- **impeccable**：运行审查、逐条修复对比度/热区/焦点/错误播报，再重置。

下方还有 15 条技能索引（9 个本项目模块 + 6 个上游快照）、来源筛选和九个本项目模块的自我说明。

![技能地图首屏](docs/screenshots/skills-fold.png)

![技能地图手机首屏](docs/screenshots/skills-mobile.png)

完整契约、数据边界与逐项验收见 [ACCEPTANCE.md](docs/demos/skills/ACCEPTANCE.md)。这六个展台是 Skill 效果的展示，不执行上游脚本，也不等于完整 Skill 回归或模型行为评测。

## 演示

### 官网

![网页桌面截图](docs/screenshots/web-desktop.png)

### Dashboard Web UI

![Dashboard 桌面截图](docs/screenshots/dashboard-desktop.png)

### 手机 App

![手机 App 在桌面浏览器中的预览](docs/screenshots/app-desktop.png)

App 是可交互的浏览器原型，没有后端或真实账户服务。演示内容和数值为示例，不代表实际业务。

<details>
<summary>查看展台与手机端截图</summary>

![展台桌面截图](docs/screenshots/showcase-desktop.png)

![网页手机截图](docs/screenshots/web-mobile.png)

![Dashboard 手机适配截图](docs/screenshots/dashboard-mobile.png)

![App 手机截图](docs/screenshots/app-mobile.png)

![组合工作台手机适配](docs/screenshots/studio-mobile.png)

![组件动效手机适配](docs/screenshots/components-mobile.png)

![组合工作台深色](docs/screenshots/studio-dark.png)

![组件动效深色](docs/screenshots/components-dark.png)

![技能地图桌面整页](docs/screenshots/skills-desktop.png)

![技能地图深色首屏](docs/screenshots/skills-dark.png)

![展台内嵌技能地图](docs/screenshots/showcase-atlas.png)

![展台手机截图](docs/screenshots/showcase-mobile.png)

</details>

## Skills

### 本项目九个模块

| Skill | 职责 |
| --- | --- |
| [uiux-page-planning](skills/uiux-page-planning/SKILL.md) | 受众、目标、首屏、信息层级与页面结构 |
| [uiux-style-direction](skills/uiux-style-direction/SKILL.md) | 从参考提取构图、排版、配色和图像方向 |
| [uiux-interaction-spec](skills/uiux-interaction-spec/SKILL.md) | 明确触发、状态、运动、结果与无障碍要求 |
| [uiux-design-system](skills/uiux-design-system/SKILL.md) | 设计 token、主题、组件状态与一致性 |
| [uiux-component-engineering](skills/uiux-component-engineering/SKILL.md) | 可复用组件 API、状态、语义和组合 |
| [uiux-motion-engineering](skills/uiux-motion-engineering/SKILL.md) | 动效实现、中断恢复、降级和性能 |
| [uiux-accessibility-review](skills/uiux-accessibility-review/SKILL.md) | 键盘、焦点、表单和无障碍证据审查 |
| [uiux-mobile-patterns](skills/uiux-mobile-patterns/SKILL.md) | 手机导航、触摸、键盘与编辑面板 |
| [uiux-prompt-playbook](skills/uiux-prompt-playbook/SKILL.md) | 141 条可执行提示词、21 个现场场景与自然语言生成 |

### 六个上游快照

[`skills/upstream/`](skills/upstream/README.md) 收录了六个开源 Skill 的可运行快照，保留原 `SKILL.md`、参考资料、脚本和许可证：

| Skill | 用途 |
| --- | --- |
| finesse-term | 把大白话描述翻译成准确术语 |
| finesse-ui | 主力 UI 构建，覆盖品牌页、产品界面与 H5 |
| ui-ux-pro-max | 风格、配色、字体、UX 规则与技术栈资料库 |
| design-taste-frontend | 艺术方向、反模板化与真实浏览器检查 |
| interface-design | 纯产品 UI 的层级、token 与审查 |
| impeccable | 审查、批评、打磨与修复 |

### 安装

```bash
node scripts/install-skills.cjs --list          # 列出十五份 Skill
node scripts/install-skills.cjs                 # 安装到本项目的 .claude/skills
node scripts/install-skills.cjs --global        # 安装到 ~/.claude/skills
node scripts/install-skills.cjs --target codex --global
```

安装脚本只复制或链接目录，不执行上游脚本；已有同名 Skill 默认跳过，加 `--force` 覆盖。也可以手动把 `skills/` 内所需文件夹复制到 Codex 的 `~/.codex/skills/`，保留 `SKILL.md`、`agents/openai.yaml` 和 `references/`。重启或刷新后，可分别调用 `$uiux-page-planning`、`$finesse-ui` 等。

示例：先用 `$uiux-page-planning` 规划互动场馆官网，再用 `$uiux-style-direction` 确定视觉语言，最后用 `$uiux-interaction-spec` 描述官网 FAQ 展开，或手机 App 详情与新增面板的状态。需要更强构建能力时，用 `$finesse-ui` 作为主导，`$impeccable` 放在交付前审查。它们可以独立使用，优先遵守用户需求和既有品牌。

## 分类与使用范围

官网、手机 App 和 Dashboard 按用户任务、内容和输入方式区分，不能仅凭有无交互或浏览器运行判断。Dashboard 属于网页 Web UI；手机 App 演示采用单列任务流、底部导航、详情返回和底部编辑面板。

三个基础 Skill 均附有 `references/surface-routing.md`，用于先判断界面类别，再选择布局和交互。

## 外部 Skills 与组合

[Skills 选型目录](SKILL-CATALOG.md)收集了相关上游项目的一手链接、许可证核对、适用范围及九个本项目模块的组合方式。其中六个已收录为快照并可通过安装脚本部署，其余只记录链接；收录不等于逐项验证，实际使用前应阅读各 Skill 的边界与限制。[上游收录说明](skills/upstream/README.md)给出主导 Skill 的选择、可安全叠加的组合与运行时依赖。

## 项目范围

本项目提供设计工作流、交互规格和可运行示例。演示用于帮助理解和实践，不代表适合所有产品的通用模板。相关公开工具见[设计指南](DESIGN-GUIDE.md)。

## 本地运行与验证

无需构建：在仓库根目录运行 `python -m http.server 4173`，打开 `http://localhost:4173/docs/`。浏览器验证脚本为 [scripts/verify-lab.cjs](scripts/verify-lab.cjs) 与 [scripts/verify.cjs](scripts/verify.cjs)：前者遍历 141 条提示词、分类切换、复制、主题与自然语言生成，后者回归作品展台、技能地图和对比度检查；需要 Node.js、Playwright 和可用的 Chromium / Edge。将 `PLAYWRIGHT_MODULE` 指向已安装的 Playwright 模块路径后执行 `node scripts/verify.cjs`。

GitHub Pages 从 `main` 分支的 `docs/` 目录发布。

