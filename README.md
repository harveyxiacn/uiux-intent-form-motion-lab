# Intent / Form / Motion

八个可复用的 UI/UX Skill，以及官网、Dashboard、手机 App、组合工作台、组件动效五组浏览器演示。工作流：**明确页面目标 → 提炼视觉方向 → 定义交互与动效**。

[在线演示](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/) · [设计指南](DESIGN-GUIDE.md) · [验证记录](REVIEW.md)

展台提供「官网网页」「Dashboard Web UI」「手机 App」「组合工作台」「组件动效」五个标签，默认显示官网；支持键盘左右方向键、Home / End，并可独立打开每个演示。

## 组合实例

[组合工作台](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#studio)把页面任务规划、视觉层级、token 主题、筛选与编辑、动效与焦点策略组合为一个工作场景。[组件动效实验室](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#components)提供可单独检验的 tabs、展开、对话框、面板和表单。

![组合工作台桌面](docs/screenshots/studio-desktop.png)

![组件动效实验室](docs/screenshots/components-desktop.png)

[八项 Skill 实例验收](SKILL-VALIDATION.md)逐一列出它们在哪个界面产生作用、具体检查及限制。验证涵盖运行行为，不以格式检查代替实例测试；无障碍检查不等于 WCAG 认证。

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

![展台手机截图](docs/screenshots/showcase-mobile.png)

</details>

## 八个 Skill

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

### 安装

克隆此仓库后，将 `skills/` 内所需文件夹复制到你的 Codex skills 目录（通常为 `~/.codex/skills/`），保留 `SKILL.md`、`agents/openai.yaml` 和 `references/`。重启或刷新 Codex 后，可分别调用 `$uiux-page-planning`、`$uiux-style-direction`、`$uiux-interaction-spec`。

示例：先用 `$uiux-page-planning` 规划互动场馆官网，再用 `$uiux-style-direction` 确定视觉语言，最后用 `$uiux-interaction-spec` 描述官网 FAQ 展开，或手机 App 详情与新增面板的状态。它们可以独立使用，优先遵守用户需求和既有品牌。

## 分类与使用范围

官网、手机 App 和 Dashboard 按用户任务、内容和输入方式区分，不能仅凭有无交互或浏览器运行判断。Dashboard 属于网页 Web UI；手机 App 演示采用单列任务流、底部导航、详情返回和底部编辑面板。

三个基础 Skill 均附有 `references/surface-routing.md`，用于先判断界面类别，再选择布局和交互。

## 外部 Skills 与组合

[Skills 选型目录](SKILL-CATALOG.md)收集了 12 个相关 Skill / 项目的一手链接、许可证核对、适用范围及八个本地模块的组合方式。外部项目未自动安装，本项目提供独立工作流。

## 项目范围

本项目提供设计工作流、交互规格和可运行示例。演示用于帮助理解和实践，不代表适合所有产品的通用模板。相关公开工具见[设计指南](DESIGN-GUIDE.md)。

## 本地运行与验证

无需构建：在仓库根目录运行 `python -m http.server 4173`，打开 `http://localhost:4173/docs/`。浏览器验证脚本为 [scripts/verify.cjs](scripts/verify.cjs)，需要 Node.js、Playwright 和可用的 Chromium / Edge。将 `PLAYWRIGHT_MODULE` 指向已安装的 Playwright 模块路径后执行 `node scripts/verify.cjs`。

GitHub Pages 从 `main` 分支的 `docs/` 目录发布。

