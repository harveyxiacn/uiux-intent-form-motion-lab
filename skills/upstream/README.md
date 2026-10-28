# 上游 Skills 收录

核对与收录日期：2026-10-28。这里保存六个开源 Skill 的**可运行快照**，每个目录都附带上游 `LICENSE`（`impeccable` 另附 `NOTICE.md`）。快照保留上游 `SKILL.md`、`references/`、`scripts/` 与示例素材，未改写正文；只增加了许可证文件，并把 `taste-skill` 的目录名改为与其 frontmatter 一致的 `design-taste-frontend`。

精确来源、commit 和运行时见 [sources.json](sources.json)。这些 Skill 已完成源码与依赖审查，并可通过本仓库的安装脚本部署；**尚未在本项目的五个演示页面中逐项运行验证**，不能把“已收录”当作“已验证”。

## 六个 Skill

| Skill | 版本 | 许可证 | 运行时 | 负责什么 | 什么时候选它 |
| --- | --- | --- | --- | --- | --- |
| [finesse-term](finesse-term/SKILL.md) | 0.3.0 | MIT | Node 20+（可选，可回退读 JSON） | 把「按钮被黑杠挡住」这类症状翻译成准确术语，并给出常见坑 | 每一轮涉及网页/H5 的对话；只做词汇层，不接管实现 |
| [finesse-ui](finesse-ui/SKILL.md) | 0.22.0 | MIT | Node 可选（`scripts/detect.mjs`） | 主力 UI 构建：brand / product / commerce / h5 四种 register，含 Apple 风格与可运行示例 | 从零构建页面或组件；需要明确视觉方向并落到代码 |
| [ui-ux-pro-max](ui-ux-pro-max/SKILL.md) | 2.15.0 | MIT | Python 3 标准库 | 本地可检索的风格、配色、字体、UX 规则、图表与 22 种技术栈资料库 | 需要查资料、做选型或补规则；不负责完整工作流 |
| [design-taste-frontend](design-taste-frontend/SKILL.md) | 2.1.5 | MIT | Node 22+、Chrome/Edge/Chromium；配图时联网 | 从 247 个画廊站点提炼的艺术方向库 + 真实浏览器检查 + 反 AI 味修正循环 | 公开页面显得模板化、需要“被设计过”的方向；或要求截图级审查 |
| [interface-design](interface-design/SKILL.md) | 2026.6.20 | MIT | 无 | 只聚焦产品界面：Dashboard、后台、SaaS、设置页的层级、token、状态与打磨 | 任务纯属产品 UI 时，代替 finesse-ui 的 product register |
| [impeccable](impeccable/SKILL.md) | 4.8.0 | Apache-2.0 | 自带启动器；首次运行下载校验过的引擎二进制 | 审查、批评、打磨与修复：24 个子命令，覆盖 a11y、性能、响应式与原生平台 | 已有页面需要 audit / critique / polish / harden，而非重新构建 |

## 怎么选，避免互相打架

六个 Skill 中有五个都能“做 UI”，同时加载会得到互相矛盾的审美与流程指令。按职责分工使用：

1. **一个主导构建者**：`finesse-ui`（全场景，含 brand / commerce / h5）或 `interface-design`（纯产品 UI）二选一。不要把两者都当作页面的主流程。
2. **艺术方向最多一个**：`design-taste-frontend` 适合“看起来像 AI 模板”的公开页面；如果已经由 `finesse-ui` 定了视觉方向，就不要再让 taste 重新抽方向。可以只用它的浏览器检查与反模式清单。
3. **`impeccable` 放在构建之后**：它是审查与打磨层，适合 `audit`、`critique`、`polish`、`harden`、`animate`。不要用它取代构建流程。
4. **`ui-ux-pro-max` 是资料库**：随时可查，但不产出页面，也不决定工作流。
5. **`finesse-term` 是词汇层**：任何任务都可以叠加；先交付任务结果，再补 1–3 条术语。

推荐组合：

| 任务 | 主导 | 辅助 |
| --- | --- | --- |
| 品牌官网 / 作品集 | finesse-ui（brand） | design-taste-frontend（方向）、impeccable（audit）、finesse-term |
| Dashboard / 后台 | interface-design 或 finesse-ui（product） | ui-ux-pro-max（配色/图表）、impeccable（audit） |
| 手机 H5 / App 原型 | finesse-ui（h5） | finesse-term（H5 术语与成对坑）、impeccable（adapt） |
| 已有页面显得模板化 | design-taste-frontend | finesse-ui（diverge / bolder）、impeccable（critique） |
| 交付前审查 | impeccable | 本项目的 `uiux-accessibility-review` |

## 与本项目八个模块的关系

本项目的八个 `uiux-*` Skill 是**阶段化工作流**，上游 Skill 是**能力包**。可以按阶段引用，不需要整包接管：

| 本地阶段 | 可借用的上游能力 |
| --- | --- |
| uiux-page-planning | finesse-ui 的 Brief / Brand Read；impeccable 的 `shape` |
| uiux-style-direction | design-taste-frontend 的方向库；finesse-ui 的 soul / palette；ui-ux-pro-max 的风格与字体检索 |
| uiux-interaction-spec | finesse-term 的术语与状态词；impeccable 的 `clarify` |
| uiux-design-system | ui-ux-pro-max 的数据检索；interface-design 的 token 与层级规则 |
| uiux-component-engineering | finesse-ui 的 component scope；ui-ux-pro-max 的 stack 指南 |
| uiux-motion-engineering | finesse-ui 的 `animate`；ui-ux-pro-max 的 motion/GSAP 数据；impeccable 的 `animate` |
| uiux-accessibility-review | impeccable 的 `audit`；本项目自己的审查清单与证据要求 |
| uiux-mobile-patterns | finesse-ui 的 h5 register；finesse-term 的 H5 词条 |

## 安装

安装脚本只复制或链接 Skill 目录，不执行上游脚本：

```bash
# 查看会发现哪些 Skill
node scripts/install-skills.cjs --list

# 安装到本项目的 .claude/skills（默认，仅本项目可用）
node scripts/install-skills.cjs

# 只安装六个上游 Skill
node scripts/install-skills.cjs --set upstream

# 安装到全局 ~/.claude/skills（所有项目可用）
node scripts/install-skills.cjs --global

# Codex
node scripts/install-skills.cjs --target codex --global

# 用符号链接/目录联接代替复制，便于随仓库更新
node scripts/install-skills.cjs --link
```

已有同名 Skill 时默认跳过；确认要覆盖再加 `--force`。安装后重启或重新加载 Agent。`.claude/skills/` 与 `.codex/skills/` 是派生产物，已加入 `.gitignore`，源仍以 `skills/` 为准。

## 审查记录与限制

- **来源与许可证**：逐个读取仓库根 `LICENSE` 与 `NOTICE.md`，记录在 `sources.json`。六个仓库分别为 MIT ×5、Apache-2.0 ×1。
- **脚本审查**：检查了 `child_process`、`eval`、网络请求与文件写入。未发现凭据读取或远程命令执行。需要联网的行为是显式的：`design-taste-frontend` 在找图时访问 Openverse、Wikimedia Commons、Art Institute of Chicago、The Met、Internet Archive；`impeccable` 首次运行从项目发布源下载引擎二进制并用 `engine-checksums.txt` 校验。
- **没有收录的内容**：各仓库的 `.claude-plugin/`、hooks、agents、其他附带 Skill（例如 `ui-ux-pro-max` 仓库还有 banner-design、brand、design、design-system、slides、ui-styling）以及测试与站点源码。需要插件级 hooks/agents 时，请按上游 README 使用 `/plugin marketplace add`，不要混用本目录的精简安装。
- **验证边界**：只做了安装与静态检查，未逐条执行 24 个 impeccable 子命令、taste 的浏览器检查器或 finesse 的全部 register。真实项目使用前，先在一个小页面上跑一次并阅读输出。
- **版本漂移**：这是 2026-10-28 的快照。上游更新后，重新拉取并用 `sources.json` 记录新 commit，不要静默覆盖。

## 更新快照

```bash
# 例：更新 finesse-ui
git clone --depth 1 https://github.com/mouse-lin/finesse-skill.git /tmp/finesse-skill
rm -rf skills/upstream/finesse-ui
cp -a /tmp/finesse-skill/skills/finesse-ui skills/upstream/finesse-ui
cp /tmp/finesse-skill/LICENSE skills/upstream/finesse-ui/LICENSE
git -C /tmp/finesse-skill rev-parse HEAD   # 更新 sources.json
```

更新后运行 `node scripts/install-skills.cjs --force` 同步已安装副本，并重新跑一次最小验证。
