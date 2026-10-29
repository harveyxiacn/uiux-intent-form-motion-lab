# 审核与验证记录

日期：2026-10-29。此记录覆盖提示词实验室、作品展台、技能地图与六组演示；早前分类纠正的验证仍保留在下方。

## 界面分类

三类演示分别为官网网页（内容浏览与参观信息）、Dashboard Web UI（桌面日程工作台）、手机 App（单列手机任务流、底部导航和表单面板）。Dashboard 属于网页 Web UI；手机 App 是浏览器原型，不声称原生应用或小程序成品。

## Skill 审核

三个 Skill 均新增 surface routing 入口和各自自包含的 `references/surface-routing.md`。要求按任务、内容、导航、输入情境分类，不能凭浏览器运行、有无交互或屏幕宽度判断，也不能将所有 App 当作 Dashboard。本机三个对应 Skill 副本已同步。UTF-8 模式运行 `quick_validate.py`，三份均通过；Windows 默认 GBK 解码曾失败，启用 UTF-8 后复验成功。

演示验证具体界面行为，不证明通用设计质量。

## 浏览器与视觉验证

Edge / Playwright，1440 × 1000、390 × 844，减少动态效果模式。三类演示和展台共八张截图已人工查看，文档均无横向溢出。手机 App 在桌面宽度仍为受限宽度单列手机界面，底部导航固定；手机截图使用视口截取，避免长截图中固定导航叠在文档中部的截图伪影。

`node scripts/verify.cjs` 通过：

- 三标签左右方向键/Home、焦点、ARIA 状态、App 和 Dashboard hash 深链及同文档 hash 切换。
- 官网 FAQ 键盘展开与参观信息锚点；确认不再含应用式筛选或贴纸收集控件。
- Dashboard 分类、详情、完成状态保存与新增事项。
- 手机 App 底导航、分类、独立详情、编辑、完成、刷新保存、新增、空白标题拦截、日历切周/今天、目标与我的。
- 三类演示桌面/手机横向溢出与全程 JavaScript pageerror 检查。

## 发布范围

上传三个 Skill、设计指南、README、此记录、三类静态演示、测试脚本和截图。临时检查产物和依赖不属于发布内容。App 和 Dashboard 的示例状态只保存在当前浏览器，不提供真实账户、服务端或同步。

## Skills 模块扩展（2026-10-28）

新增设计系统、组件工程、动效工程、无障碍审查和手机模式，共八个模块；外部资料见 SKILL-CATALOG.md。核对了上游官方仓库、Skill 入口与许可证声明，没有导入第三方源码或执行安装脚本。

八份 Skill 的格式、本地引用和 UI 元数据检查通过，已同步本机。静态职责检查覆盖：只询问术语不实施、组件改造不强推 React、动效不替代业务状态、截图审查不声称键盘合规、手机网站不自动当手机 App。此项为指令审查，不等于独立模型行为评测；新增模块尚未逐一用于完整项目，现有三个 Demo 也不是五份新增模块的完整覆盖证明。

## 八项 Skill 组合实例验证补充

2026-10-28 增加「组合工作台」「组件动效」两组，展台当时增至五标签；本轮再增加「技能地图」为第六标签。逐项产出、实际验收结果与限制见 [SKILL-VALIDATION.md](SKILL-VALIDATION.md)。新增测试覆盖主题、代表文本实际对比度、常规与减少动态、快速重复、表单错误恢复、模态焦点和手机导航焦点。浅/深主题两个新增demo各三组代表对比均≥4.5，具体RGB和ratio保存在 screenshots/contrast-results.json，未据此推断全页认证。

桌面/手机布局与深浅主题截图已实际目视；仅桌面浏览器手机仿真，未做真机软键盘/读屏或性能trace。此次检查不等于 WCAG 认证，也不声明帧率保证。工作台loading是650ms本地延时，不是真实网络；新建和编辑仅当前页面内存。两个demo的 ACCEPTANCE.md 记录行为契约，集成脚本记录实际执行。

## 作品展台重设计验证

展台本身使用页面规划、视觉方向、交互规格、双主题token、组件状态、动效和无障碍策略，作为独立作品呈现：巨幅标题、斜向丝带、四张真实demo截图与可揭贴纸；原五组实例和深链保留，并新增第六组「技能地图」。视觉目标及实现取舍见 SHOWCASE-DESIGN.md。

新增 verify-showcase.cjs 检验真实图片、预览选例、hash/iframe/焦点同步、贴纸Enter/Space、常规动效中间帧与快速反向、减少动态替代、双主题及代表文字对比。截图分别记录首屏、整页、手机、深色及贴纸中间状态；截图已实际查看。动画中间帧通过WAAPI暂停到160ms用于确定性检查，不能以静态图代替运行行为。

标题/导语对比浅15.60、深14.32，贴纸7.41；仅代表测试范围，非全页WCAG认证。卷角为三角折面与整体变形的近似；没有物理仿真或性能帧率保证。原五组demo完整回归保留，第六组技能地图另见下节。

## 技能地图与第六标签验证（2026-10-28）

展台新增 `#atlas` 专题区和第六个体验标签「技能地图」，并单独发布 [Skill Atlas](docs/demos/skills/)。页面把六个上游 Skill 各做成一个实时展台，加上 15 条技能索引（9 个本项目模块 + 6 上游）与八个设计模块的自我说明。设计与取舍见 [SHOWCASE-DESIGN.md](docs/SHOWCASE-DESIGN.md)，展台契约、数据边界和逐项结果见 [ACCEPTANCE.md](docs/demos/skills/ACCEPTANCE.md)。

`node scripts/verify.cjs` 现在覆盖六个 Demo 的桌面/手机截图、六个标签的键盘顺序与深链、第六标签的 iframe/舞台/主题同步，以及 `#atlas` 截图与独立入口。新增 [verify-skills.cjs](scripts/verify-skills.cjs) 覆盖：

- 五句用户原话 → 五个术语；无命中提示。
- brand / product / H5 三种 register 的图片、替代文字、标签、说明、两个度量与键盘 tab。
- 「fintech dashboard」在风格/配色/字体三个资料域的命中与无命中回退。
- 六个方向中抽三张、选择后预览变化、再次抽取不重复同一组。
- 产品界面默认/设计后切换与四条决定。
- 审查 4 条 → 修复（role=alert、aria-describedby、热区、焦点、对比度）→ 重置 → 重新审查。
- 15 条索引、9/6/15 来源筛选、阶段定位、双主题、390 宽无横向溢出与两行标题。

代表文本对比度写入 [atlas-contrast-results.json](docs/screenshots/atlas-contrast-results.json)：浅色 15.10 / 6.75 / 6.23 / 6.75 / 6.23 / 6.23，深色 14.82 / 7.78 / 8.59 / 7.78 / 8.59 / 8.59；展台内技能地图专题的 kicker 与正文为浅 6.39 / 15.60、深 6.53 / 14.32（深主题改用更深的专题强调色）。只覆盖这些明确背景，不据此声称全页 WCAG 认证。截图见 `skills-desktop.png`、`skills-fold.png`、`skills-mobile.png`、`skills-dark.png`、`showcase-atlas.png`。

边界：六个上游展台是按公开输出形态手写的可操作证据，不执行上游脚本，不覆盖完整词库/风格库/24 个子命令，也不是独立模型行为评测。中途发现两个集成问题并修正：`#atlas` 使体验区下移后，深链验收需要先滚到现场才能触发 lazy iframe；技能地图的 `h1/h2` 使用 `ch` 上限导致中文标题多断一行，改为 `em` 并调整栏目比例。均为真实浏览器回归中发现，不是仅改静态截图。


## 提示词实验室与自然语言生成（2026-10-29）

首页从作品展台改为提示词实验室，展台保留在原地址 [showcase.html](docs/showcase.html)。实验室把 141 条提示词按网页（58）与 App / 小程序（83）分成两类，21 个场景家族全部有真实渲染器，选中即挂载。下方增加本地规则式生成器，把自然语言需求补成「场景 / 动作 / 手感 / 边界 / 验收」，支持复制和跳到匹配场景；它不是模型调用，也不上传输入。

新增 [verify-lab.cjs](scripts/verify-lab.cjs) 覆盖：

- 141/141 条逐条点选：详情标题、提示词正文、至少两条验收、场景节点、无回退文案、`#p/<id>` hash。
- 58 / 83 分类计数、搜索、家族筛选、空态、重置、`/` 聚焦搜索、剪贴板复制。
- 自然语言生成：3 个匹配、结构化输出、复制、预览跳转、空输入提示。
- 主题切换与刷新持久化；浅色 / 深色代表文字对比度；桌面与 390 宽无横向溢出；全程无页面错误。

场景实现中发现并修正的问题：移动端提示词横向列表把页面撑到 14,520px（加 `min-width:0` 与宽度约束）；选中提示词时 `scrollIntoView` 连带滚动整页（改为只滚动列表容器）；工作台排序使用闭包中的旧索引（改为拖动时重算）；仪表盘指针角度、曲线插值、选择器菜单裁切、重名 id、若干浅色按钮文字不可见，均在浏览器截图中定位后修复。修复后 141 条全部通过，页面无 JS 错误。

证据：[lab-desktop.png](docs/screenshots/lab-desktop.png)、[lab-scene-app.png](docs/screenshots/lab-scene-app.png)、[lab-scene-web.png](docs/screenshots/lab-scene-web.png)、[lab-composer.png](docs/screenshots/lab-composer.png)、[lab-mobile.png](docs/screenshots/lab-mobile.png)、[lab-mobile-app.png](docs/screenshots/lab-mobile-app.png)、[lab-contrast-results.json](docs/screenshots/lab-contrast-results.json)。

边界：逐条自动检查证明场景可挂载、详情契约完整，不等于每个手势、动画时序和错误状态都已人工操作；对比度只抽检明确纯色背景；没有真机、读屏或性能 trace。生成器依赖有限中文同义词与概念组，遇到新业务词可能匹配失败并返回澄清清单。
