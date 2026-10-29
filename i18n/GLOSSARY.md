# English glossary for the UI/UX lab

Use these renderings everywhere so batches stay consistent. Sentence case for UI labels and headings ("Copy prompt", not "Copy Prompt"). Concise, natural product English; no literal word-by-word phrasing.

## Names
| 中文 | English |
|---|---|
| 界面有意思 | Interesting Interfaces |
| UI/UX 实验室 | UI/UX Lab |
| 提示词放映室 / 放映室 | Prompt Screening Room / Screening Room |
| 提示词实验室 | Prompt Lab |
| 作品展台 / 展台 | Showcase |
| 技能地图 | Skill Atlas |
| 工序版 | Pipeline Edition |
| 九道工序 | Nine Stages |
| 九道工序讲解 | Nine-stage walkthrough |
| 组合工作台 | Composite Studio |
| 组件动效实验室 | Component Motion Lab |
| 慢半拍（展览官网） | Offbeat (exhibition website) |
| 一刻（手机日程 App） | Moment (mobile planner app) |
| 光谱（创意工作台） | Spectrum (creative studio) |
| 专注工作台 | Focus Workspace |
| 细微之处 | The Small Things |
| 意图 / 形态 / 交互（项目三支柱） | Intent / Form / Motion |
| 定义 / 造型 / 行动 / 验证（技能阶段） | Define / Shape / Act / Verify |
| Person names (林小雨, 阿澈 …) | Pinyin: Lin Xiaoyu, A Che; 妈妈 → Mom |

## Terms
| 中文 | English |
|---|---|
| 提示词 | prompt |
| Skill / skill | skill (keep skill IDs like `uiux-workflow` exactly as written) |
| 本项目模块 / 本地模块 | in-house module |
| 上游 / 上游快照 | upstream / upstream snapshot |
| 场景 / 场景家族 / 效果家族 | scene / scene family / effect family |
| 舞台 | stage |
| 自然语言生成 | natural-language composer (heading: "Natural-language composer") |
| 交接单 / 交接物 | handoff sheet / handoff |
| 工序 | stage |
| 交互契约 | interaction contract |
| 对象 / 触发 / 过程 / 结果与反向 / 无障碍与降级 | Object / Trigger / Sequence / Result & reversal / Access & fallback |
| 组件状态 | component states |
| 动效 | motion |
| 手持检查 | handheld check |
| 验收 / 验收点 | acceptance / acceptance checks |
| 手感 | feel |
| 克制 / 标准 / 活泼 | Subtle / Standard / Lively |
| 减少动态效果 / 减少动态 | reduced motion |
| 已验证 / 未验证 | Verified / Not verified |
| 事实 / 假设 / 提议 | fact / assumption / proposed |
| 网页 | Web |
| App / 小程序 | App / mini program |
| 官网 | website |
| 工作台 | workspace |
| Dashboard / 看板 | dashboard |
| 安全区 | safe area |
| 底部导航 / 底栏 | bottom tab bar |
| 底部弹层 / 底部面板 | bottom sheet |
| 撤销 | Undo |
| 读屏 | screen reader |
| 焦点 | focus |
| 播报 | announce / announcement |
| 吸附 | snap |
| 橡皮筋 / 阻尼 | rubber-band / resistance |
| 共享元素 | shared element |
| 令牌 / 设计令牌 | token / design token |
| 对比度 | contrast ratio |
| 技术栈 | stack |
| 需求原话 | Original request |
| 界面（作为提示词字段） | Surface |
| 复制提示词 / 已复制 | Copy prompt / Copied |

## Format rules
- Keep every placeholder `{0}`, `{1}` … exactly once each; you may reorder them to fit English.
- Keep line breaks (`\n`) and list numbering; keep leading markers such as `- `, `1. `.
- `【标题 · x】` → `[Title · x]`. 「」/“” → “ ”. 《书名》 → *Title* is not available in plain text, so use “Title”.
- Convert full-width punctuation to English punctuation (，→ , ；→ ; ：→ : （）→ ( ) 、→ , ……/… → …). Keep arrows, ×, ≈, ≥, emoji.
- Keep code, CSS, ARIA and HTML tokens verbatim: `aria-pressed`, `role="slider"`, `transform`, `ms`, `px`, `Ctrl K`, `$uiux-workflow`.
- Very short fragments (a single character or word that is part of a larger UI string, e.g. "项", "第", "条") should still get a sensible English rendering, often a short word or an empty-ish fit like "items". Never return an empty string.
- Sample product data (task names, places, messages) should be translated naturally, as if the product were localised.

## Rich sentences (keys with <0>…</0> markers)
- Some keys are whole sentences whose inline formatting is written as numbered markers: `<0>bold part</0>`, `<1>code</1>`, `<br>`.
- Keep every marker pair exactly once, correctly nested; you may move them so the English reads naturally. Keep `<br>` count the same.
- Translate the text inside markers too. Markers often wrap numbers or labels (`<0>01</0>定义` → `<0>01</0>Define`).
- If a marker wraps a fragment that only makes sense in Chinese word order, move the marker to the English word that carries the same meaning.
