# Intent / Form / Motion

从录屏研究重建的三个 UI/UX Skill，以及一个网页和一个 App 浏览器演示。工作流：**明确页面目标 → 提炼视觉方向 → 定义交互与动效**。

[在线演示](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/) · [研究报告](UIUX研究报告.md) · [验证记录](REVIEW.md)

展台默认显示网页，点击「App Demo」切换；支持键盘左右方向键、Home / End，并可独立打开每个演示。

## 演示

### 网页

![网页桌面截图](docs/screenshots/web-desktop.png)

### App

![App 桌面截图](docs/screenshots/app-desktop.png)

App 是可交互的浏览器原型，没有后端或真实账户服务。演示内容和数值为示例，不代表实际业务。

<details>
<summary>查看展台与手机端截图</summary>

![展台桌面截图](docs/screenshots/showcase-desktop.png)

![网页手机截图](docs/screenshots/web-mobile.png)

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

克隆此仓库后，将 `skills/` 内所需文件夹复制到你的 Codex skills 目录（通常为 `~/.codex/skills/`），保留 `SKILL.md` 与 `agents/openai.yaml`。重启或刷新 Codex 后，可分别调用 `$uiux-page-planning`、`$uiux-style-direction`、`$uiux-interaction-spec`。

示例：先用 `$uiux-page-planning` 规划互动场馆官网，再用 `$uiux-style-direction` 确定视觉语言，最后用 `$uiux-interaction-spec` 描述贴纸交互。它们可以独立使用，优先遵守用户需求和既有品牌。

## 来源与边界

方法来自用户提供、画面标注为抖音作者 **@叨叨AI** 的四段录屏观察。没有可验证的原作品链接或原 Skill 文件，因此本仓库提供的是自行整理重建的操作说明，**不保证与视频中的原版相同**。名称为描述性命名，不能证明身份或来源。原录屏未随仓库发布。

研究报告列出了相关公开工具及可访问来源，并明确区分相似功能与原版证据。演示用于检验这套流程能否产出可运行界面，不能证明其通用设计质量。

## 本地运行与验证

无需构建：在仓库根目录运行 `python -m http.server 4173`，打开 `http://localhost:4173/docs/`。浏览器验证脚本为 [scripts/verify.cjs](scripts/verify.cjs)，需要 Node.js、Playwright 和可用的 Chromium / Edge。将 `PLAYWRIGHT_MODULE` 指向已安装的 Playwright 模块路径后执行 `node scripts/verify.cjs`。

GitHub Pages 从 `main` 分支的 `docs/` 目录发布。

