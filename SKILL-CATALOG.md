# UI/UX Skills 选型目录

核对日期：2026-10-29。本目录收集上游项目链接与用途。其中六个 Skill 已作为带许可证的快照收录在 [`skills/upstream/`](skills/upstream/README.md)，可通过 `scripts/install-skills.cjs` 安装；其余项目只记录链接，未打包。收录快照均完成源码与依赖审查，但尚未在本项目的演示页面中逐项运行验证。许可证记录仅用于说明核对结果，复用时仍应阅读具体文件及随附条款。

## 已收录快照

| Skill | 本地目录 | 版本 / commit | 许可证 | 运行时 | 职责 |
| --- | --- | --- | --- | --- | --- |
| finesse-term | [skills/upstream/finesse-term](skills/upstream/finesse-term/SKILL.md) | 0.3.0 · `e5abc56` | MIT | Node 20+（可选） | 把用户的大白话翻译成准确术语 |
| finesse-ui | [skills/upstream/finesse-ui](skills/upstream/finesse-ui/SKILL.md) | 0.22.0 · `c7a9144` | MIT | Node 可选 | 主力 UI 构建，覆盖 brand / product / commerce / h5 |
| ui-ux-pro-max | [skills/upstream/ui-ux-pro-max](skills/upstream/ui-ux-pro-max/SKILL.md) | 2.15.0 · `28b3b8d` | MIT | Python 3 | 风格、配色、字体、UX 规则与技术栈资料库 |
| design-taste-frontend | [skills/upstream/design-taste-frontend](skills/upstream/design-taste-frontend/SKILL.md) | 2.1.5 · `12af471` | MIT | Node 22+ 与 Chromium | 艺术方向、反模板化与真实浏览器检查 |
| interface-design | [skills/upstream/interface-design](skills/upstream/interface-design/SKILL.md) | 2026.6.20 · `2f9be32` | MIT | 无 | 纯产品 UI：Dashboard、后台、SaaS、设置页 |
| impeccable | [skills/upstream/impeccable](skills/upstream/impeccable/SKILL.md) | 4.8.0 · `8409a56` | Apache-2.0 | 自带启动器（首次运行下载引擎） | 审查、批评、打磨与修复 |

安装与职责分工见 [skills/upstream/README.md](skills/upstream/README.md)。加上本项目九个模块（含提示词手册），安装脚本当前共管理十五份 Skill。关键约束：同一任务只选一个主导构建者（`finesse-ui` 或 `interface-design`），艺术方向最多一个，`impeccable` 放在构建之后。`ui-ux-pro-max` 是资料库，`finesse-term` 是词汇层，这两者可以安全叠加。

## 上游 Skills

| Skill / 项目 | 一手来源 | 适用范围与选择依据 | 许可证核对 |
| --- | --- | --- | --- |
| frontend-design | [Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | 视觉方向与页面设计；与已有视觉 Skill 重叠，选择一个主导即可 | 目录 LICENSE.txt：Apache-2.0 |
| webapp-testing | [Anthropic](https://github.com/anthropics/skills/tree/main/skills/webapp-testing) | 本地浏览器交互验证、截图和日志 | 目录 LICENSE.txt：Apache-2.0 |
| animate | [Emil Kowalski](https://github.com/emilkowalski/skills/tree/main/skills/animate) | 实现网页动效，区别于只给动效命名 | 仓库 MIT |
| animation-performance | [Emil Kowalski](https://github.com/emilkowalski/skills/tree/main/skills/animation-performance) | 动效掉帧与渲染性能诊断 | 仓库 MIT |
| animation-vocabulary | [Emil Kowalski](https://github.com/emilkowalski/skills/tree/main/skills/animation-vocabulary) | 将模糊动效描述映射为名称，不负责实现 | 仓库 MIT |
| mobile-native | [Emil Kowalski](https://github.com/emilkowalski/skills/tree/main/skills/mobile-native) | 手机网页的触摸、视口和平台体验；不是原生应用开发替代品 | 仓库 MIT |
| vercel-composition-patterns | [Vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns) | React 组件组合、状态归属和 API；注意 React 版本 | Skill frontmatter：MIT |
| vercel-react-native-skills | [Vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-native-skills) | React Native / Expo 平台实现，不能直接套入网页 | Skill frontmatter：MIT |
| web-design-guidelines | [Vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | 按上游最新规则审查 Web UI | 当前读取的 Skill 未声明许可证，仓库 API 也未给出许可证；复用前核对 |
| finesse-term | [mouse-lin](https://github.com/mouse-lin/finesse-term) | 术语对齐与需求翻译；已收录 | 仓库 MIT |
| finesse-ui | [mouse-lin](https://github.com/mouse-lin/finesse-skill) | 全场景 UI 构建；已收录，作为主导构建者之一 | 仓库 MIT |
| interface-design | [Dammyjay93](https://github.com/Dammyjay93/interface-design) | 纯产品 UI 的层级、token 与审查；已收录 | 仓库 MIT |
| impeccable | [官方仓库](https://github.com/pbakaus/impeccable) | 界面规划、视觉调整、审查与打磨；已收录 | 仓库 Apache-2.0 |
| UI UX Pro Max | [官方仓库](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 风格、配色、字体和 UX 资料检索；已收录核心 Skill | 仓库 MIT |
| Taste Skill | [官方仓库](https://github.com/Leonxlnx/taste-skill) | 艺术方向和渲染检查；已收录为 `design-taste-frontend` | 仓库 MIT |

Vercel 的[官方 Skills 目录](https://vercel.com/docs/agent-resources/skills)可作为继续发现组件和框架工具的入口。聚合站的安装量或星标不能代替源文件审查。

## 本项目扩展：九个模块

| 阶段 | 本地 Skill | 核心产出与边界 |
| --- | --- | --- |
| 定义任务 | uiux-page-planning | 界面类别、用户目标和内容结构 |
| 视觉方向 | uiux-style-direction | 构图、字体、配色、图像方向 |
| 交互规格 | uiux-interaction-spec | 术语、触发、状态与结果；只问名称时不实现 |
| 设计系统 | uiux-design-system | 语义 token、主题、组件状态矩阵和迁移范围 |
| 组件实现 | uiux-component-engineering | 组件契约、状态归属、语义与可组合 API |
| 动效实现 | uiux-motion-engineering | 可中断动效、降级、清理和性能验证 |
| 无障碍审查 | uiux-accessibility-review | 可复现问题、证据、修复及复测范围 |
| 手机模式 | uiux-mobile-patterns | 手持任务流、导航、输入键盘、安全区与返回 |
| 提示词与验收 | uiux-prompt-playbook | 141 条可执行提示词、21 个现场场景、自然语言生成器；不替代实现与运行验证 |

新增模块是本项目的独立工作流说明，不是上述开源项目的镜像或改名版本。外部资料用作选型与参考，不是强制依赖。九份 Skill 无需每次全部加载。

## 组合建议

- 官网：规划 → 视觉方向；有重复组件时增加设计系统和组件工程；仅对有意义的反馈添加动效。
- Dashboard Web UI：规划 → 设计系统 → 组件工程；优先数据状态、筛选、表单、焦点和性能。
- 手机 App：规划 → 手机模式 → 组件工程；明确浏览器原型、原生或小程序平台，再处理导航、输入和动效。
- 只问动效名称：交互规格。要求实现：动效工程。出现掉帧：先测量再诊断，不能用截图宣称性能良好。
- 交付审查：对实际任务做无障碍审查与浏览器验证；原生设备和辅助技术未测试时明确说明。

## 安装与叠加

```bash
node scripts/install-skills.cjs --list          # 查看十五份 Skill
node scripts/install-skills.cjs                 # 全部安装到 ./.claude/skills
node scripts/install-skills.cjs --set upstream  # 只安装六个上游快照
node scripts/install-skills.cjs --global        # 安装到 ~/.claude/skills
```

上游 Skill 与本地九个模块可以按阶段组合，但同一任务不要同时启用两个“主导构建者”。具体路由、运行时依赖和已知限制见 [skills/upstream/README.md](skills/upstream/README.md)。

## 设计判断

本项目优先把“外观”“行为”“代码结构”“验证证据”拆开。漂亮的组件可能缺少键盘行为；动画播放正确也可能在中断时破坏状态；手机尺寸的 Dashboard 仍不等于手机 App。通过明确职责和交接产物，避免把这些问题混成一个笼统的“优化 UI”。

外部 Skills 中的固定时长、指定框架、禁止某种视觉风格等规则应结合用户需求评估，不作为所有项目的通用真理。组件语义可参考 [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)；它是技术参考，不是 Skill 包。
