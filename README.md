# Intent / Form / Motion

三个可复用的 UI/UX Skill，以及官网网页、Dashboard Web UI 和手机 App 三类浏览器演示。工作流：**明确页面目标 → 提炼视觉方向 → 定义交互与动效**。

[在线演示](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/) · [设计指南](DESIGN-GUIDE.md) · [验证记录](REVIEW.md)

展台提供「官网网页」「Dashboard Web UI」「手机 App」三个标签，默认显示官网；支持键盘左右方向键、Home / End，并可独立打开每个演示。

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

![展台手机截图](docs/screenshots/showcase-mobile.png)

</details>

## 三个 Skill

| Skill | 职责 |
| --- | --- |
| [uiux-page-planning](skills/uiux-page-planning/SKILL.md) | 受众、目标、首屏、信息层级与页面结构 |
| [uiux-style-direction](skills/uiux-style-direction/SKILL.md) | 从参考提取构图、排版、配色和图像方向 |
| [uiux-interaction-spec](skills/uiux-interaction-spec/SKILL.md) | 明确触发、状态、运动、结果与无障碍要求 |

### 安装

克隆此仓库后，将 `skills/` 内所需文件夹复制到你的 Codex skills 目录（通常为 `~/.codex/skills/`），保留 `SKILL.md`、`agents/openai.yaml` 和 `references/`。重启或刷新 Codex 后，可分别调用 `$uiux-page-planning`、`$uiux-style-direction`、`$uiux-interaction-spec`。

示例：先用 `$uiux-page-planning` 规划互动场馆官网，再用 `$uiux-style-direction` 确定视觉语言，最后用 `$uiux-interaction-spec` 描述官网 FAQ 展开，或手机 App 详情与新增面板的状态。它们可以独立使用，优先遵守用户需求和既有品牌。

## 分类与使用范围

官网、手机 App 和 Dashboard 按用户任务、内容和输入方式区分，不能仅凭有无交互或浏览器运行判断。Dashboard 属于网页 Web UI；手机 App 演示采用单列任务流、底部导航、详情返回和底部编辑面板。

三个 Skill 均附有 `references/surface-routing.md`，用于先判断界面类别，再选择布局和交互。

## 项目范围

本项目提供设计工作流、交互规格和可运行示例。演示用于帮助理解和实践，不代表适合所有产品的通用模板。相关公开工具见[设计指南](DESIGN-GUIDE.md)。

## 本地运行与验证

无需构建：在仓库根目录运行 `python -m http.server 4173`，打开 `http://localhost:4173/docs/`。浏览器验证脚本为 [scripts/verify.cjs](scripts/verify.cjs)，需要 Node.js、Playwright 和可用的 Chromium / Edge。将 `PLAYWRIGHT_MODULE` 指向已安装的 Playwright 模块路径后执行 `node scripts/verify.cjs`。

GitHub Pages 从 `main` 分支的 `docs/` 目录发布。

