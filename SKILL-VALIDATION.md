# 十五项 Skill 的实例与展台验收

日期：2026-10-29。运行环境为 Windows / Edge / Playwright，桌面 1440×1000、手机仿真 390×844。入口：[六组在线演示](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/)。此表以实际源码、交互及截图证据为依据，不把格式通过等同于实例验收。

本表第 1–9 行覆盖本项目的九个模块。[`skills/upstream/`](skills/upstream/README.md) 收录的六个上游快照完成了源码、许可证与依赖审查，并另做了展台级效果验收（见下节）；展台验收不等于完整 Skill 回归或独立模型行为评测。

| Skill | 具体实例与产出 | 实际验收与结果 | 边界 |
| --- | --- | --- | --- |
| [page-planning](skills/uiux-page-planning/SKILL.md) | 官网按定位→展览→参观信息→FAQ；光谱工作台按概况→项目→详情编辑组织任务 | 官网参观CTA定位正确；工作台搜索/筛选→详情→修改→返回全流程通过；空态和本地loading可恢复 | 两个具体任务，未做目标用户访谈或转化实验 |
| [style-direction](skills/uiux-style-direction/SKILL.md) | 官网用展览插画与大标题；光谱用深墨导航、暖白工作区、琥珀行动；手机App保留单列任务语言 | 各组 demo 桌面/手机截图目视；新增两组深浅主题均检查，无页面横向溢出；工作台表格在手机重排为条目 | 主次与可读性为人工判断，未证明通用审美优越性 |
| [interaction-spec](skills/uiux-interaction-spec/SKILL.md) | 组件实验室将tabs、展开、对话框/面板、表单分为明确状态；工作台定义取消/保存/筛出结果后的返回 | tabs方向键/Home/End；展开aria-expanded、open、inert一致；面板Escape/按钮关闭、错误与成功反馈通过 | 测试列举的状态，未穷举全部输入顺序 |
| [design-system](skills/uiux-design-system/SKILL.md) | 两个新demo以语义token驱动浅/深主题，按钮/输入/选择/错误/焦点有状态；[工作台契约](docs/demos/studio/ACCEPTANCE.md)列token表 | 真实computed color与逐层背景合成：组件正文13.95/13.29、次级5.42/8.68、主按钮13.95/13.29；工作台正文12.93/14.49、次级4.70/8.47、主按钮8.27/8.27（浅/深），均≥4.5；切换主题与截图通过 | 仅取三个明确背景代表组合；不代表所有元素/图片/半透明图层均已审核 |
| [component-engineering](skills/uiux-component-engineering/SKILL.md) | 组件tabs由一个选择状态管理panel；原生dialog/modal；工作台projects单一数据源派生列表和计数 | tabs只显示所选panel；原生modal内焦点与Tab保持，Escape返回触发器；工作台保存可移除当前筛选项目后焦点回搜索，新增与reload计数一致 | 无框架依赖的页面内组件，未作为npm库跨项目集成 |
| [motion-engineering](skills/uiux-motion-engineering/SKILL.md) | 展开使用可反向CSS transition；工作台WAAPI进入、关闭取消；系统和模拟减少动态保留状态 | 常规动态9次展开反向、工作台10次快速开关通过；无遗留modal；减少动态时CSS transition为0，工作台运行中的animation为0，仍可开关/保存 | 没有性能trace/帧率或低端设备数据，不能声称性能或流畅度认证 |
| [accessibility-review](skills/uiux-accessibility-review/SKILL.md) | 有名称的原生dialog、label/error关联、状态文本、键盘焦点、双主题对比 | 键盘tabs/表单错误焦点与纠正、modal焦点约束/返回、代表文本对比通过；修复实验室dialog缺少aria-labelledby后复验；手机导航与详情返回补测通过 | 这是限定范围审查，不等于WCAG认证；未做屏幕阅读器、200%缩放全流程或真实辅助硬件测试 |
| [mobile-patterns](skills/uiux-mobile-patterns/SKILL.md) | 间App底导航→日历/详情→编辑面板→返回；光谱手机布局与全屏编辑 | 390仿真下导航Enter后focus main；新增Escape回add；详情返回原条目；新增/编辑/完成/日期与保存通过；光谱390编辑带引号/尖括号名称、关闭返回通过 | 桌面浏览器手机仿真，不是真机；软键盘遮挡、iOS/Android系统返回和手势未实测 |
| [prompt-playbook](skills/uiux-prompt-playbook/SKILL.md) | [提示词实验室](docs/index.html)把 141 条提示词、21 个场景与自然语言生成器放在同一页 | 141/141 条逐条点选并确认场景挂载、详情、验收与 hash；分类/搜索/家族筛选、空态、复制、主题、390 宽无横向溢出通过；生成器可复制与预览；无页面错误 | 每条只自动验证挂载与静态契约，未逐条手测全部手势；生成器是规则匹配，不是 LLM；不证明任何实际实现可访问或高性能 |

## 六个上游 Skill 的展台级验收（2026-10-29）

[技能地图](docs/demos/skills/)把六个上游 Skill 各做成一个可操作展台。它验证的是「这个 Skill 的效果能否被看见、能否被亲手触发」，不是把上游脚本完整跑一遍。详细契约、截图和限制见 [ACCEPTANCE.md](docs/demos/skills/ACCEPTANCE.md)。

| Skill | 展台中可验证的效果 | 实际检查 | 边界 |
| --- | --- | --- | --- |
| finesse-term 0.3.0 | 把用户的模糊描述翻成术语、可直接发出的说法和常见坑 | 五句原话分别命中安全区、悬停态、滚动穿透、布局偏移、点击热区；无命中给提示 | 10/142 条节选；页面内启发式匹配，未运行上游 Node 脚本 |
| finesse-ui 0.22.0 | 同一任务在 brand / product / H5 三种 register 下改变构图、密度与文案 | 三种 register 的图片、替代文字、标签、说明、两个度量与三条变化同步；tab 键盘通过 | 三种而非全部四种；使用本项目截图，不是上游渲染结果 |
| ui-ux-pro-max 2.15.0 | 按产品语境检索风格、配色、字体候选与风险 | 「fintech dashboard」在三个资料域均命中合理候选；切换资料域与无命中回退通过 | 各 6 条节选；页面内关键词检索，未调用上游 Python 搜索 |
| design-taste-frontend 2.1.5 | 从研究过的方向里抽三张结构不同的牌，选择后改变预览 | 每次抽 3 个且可选择；预览的文字、色板、字体语气与布局随方向更新 | 6/20 个方向的手写转述；未运行上游 Node/Chromium 检查器 |
| interface-design 2026.6.20 | 产品 UI 的差别在层级、间距、状态与焦点，而非装饰 | 默认/设计后切换同时改变标题层级、间距、状态标签、按钮和焦点规则 | 同一条模拟工作台的两种呈现，不是自动生成 |
| impeccable 4.8.0 | 审查定位到具体元素，再逐条修复，而不是给一个分数 | 4 条问题可修复与重置；对比度、热区、焦点、错误播报的状态确实改变 | 4 条固定示例；未下载或调用上游引擎，不代表 24 个子命令的实际执行 |

技能地图还提供 15 条索引（9 个本项目模块 + 6 个上游）、来源筛选、阶段定位、双主题与 390 宽响应式。索引把每个上游条目指回展台，把每个本项目模块指回已有实例；页面自述的八条则记录本项目设计模块如何参与这页本身。


## 提示词实验室验收（2026-10-29）

[提示词实验室](docs/index.html)把提示词从文本清单变成现场舞台。验收分四层：

1. **目录完整性**：构建脚本检查 141 个唯一 id、必填字段与 21 个场景引用；生成器与页面共用同一份 `prompts.json`。
2. **逐条挂载**：Playwright 依次点选 58 条网页提示词与 83 条 App / 小程序提示词，断言详情标题、提示词正文、至少两条验收、场景节点、场景无回退文案以及 `#p/<id>` 深链。141 条全部通过，无页面错误。
3. **操作路径**：搜索「拖拽」收窄结果；无结果时显示空态；家族筛选保留结果；分类切换 58 / 83；重置重挂载；`/` 聚焦搜索；复制写入剪贴板；主题切换重挂场景且刷新后保留。
4. **自然语言生成**：输入「底部导航 + 卡片删除」得到 3 个匹配；生成文本包含目标场景、核心效果、手感、边界与验收；复制成功；「在预览中查看」跳到匹配项。空输入不生成并提示。

视觉与响应式：桌面 1440×1000、手机 390×844，均无横向溢出；移动端舞台高度保持 650px，提示词列表与舞台可分别使用。对比度抽检浅色 / 深色下的导语、舞台说明、详情摘要与列表次级文字，均 ≥4.5:1。证据：[lab-desktop.png](docs/screenshots/lab-desktop.png)、[lab-scene-app.png](docs/screenshots/lab-scene-app.png)、[lab-scene-web.png](docs/screenshots/lab-scene-web.png)、[lab-composer.png](docs/screenshots/lab-composer.png)、[lab-mobile.png](docs/screenshots/lab-mobile.png)。

边界：逐条测试证明的是「能挂载并符合目录契约」，不是每个手势、动画和边界状态都已人工操作；自动对比度只覆盖抽样元素与纯色背景；没有真机、屏幕阅读器或性能 trace。生成器是确定性的本地规则匹配，不理解任意业务，也不调用模型。

## 组合如何产生效果

[光谱工作台](docs/demos/studio/)把规划、视觉、token、组件、交互、动态与无障碍策略放在同一“找到项目→修改→返回”的任务里；窄屏保持同一业务任务并调整信息密度。[组件实验室](docs/demos/components/)把相同的状态契约拆成可重复测试的控件。手机App单独覆盖手持导航任务；官网保留浏览与参观决策。技能地图作为第六组入口，把这些本地实例与六个上游 Skill 放进同一张可操作索引。它们共同覆盖十五项能力，而不是把每个surface硬套同一布局。

复现：运行 `python -m http.server 4173`，执行 [scripts/verify-lab.cjs](scripts/verify-lab.cjs) 与 [scripts/verify.cjs](scripts/verify.cjs)。前者遍历 141 条提示词并验证生成器、复制、主题与 390 宽响应式；后者调用 advanced / studio / showcase / skills 回归和 [contrast.cjs](scripts/contrast.cjs)。对比明细在 [contrast-results.json](docs/screenshots/contrast-results.json)、[showcase-contrast-results.json](docs/screenshots/showcase-contrast-results.json)、[atlas-contrast-results.json](docs/screenshots/atlas-contrast-results.json) 与 [lab-contrast-results.json](docs/screenshots/lab-contrast-results.json)，截图见 README。支持 `PLAYWRIGHT_MODULE` 与 `DEMO_BASE` 环境变量。

全部原型没有后端。App / Dashboard事项保存范围为本浏览器；新工作台为当前页面内存，刷新或reload会复位；组件表单仅验证，不发送邮箱。

## 展台自身的设计与运行验收

展台由嵌入式切换壳改为完整作品页面：两行巨幅标题、斜向丝带、四张错落的项目实图、可揭贴纸、六类项目索引、现场交互区和八项方法。页面目标是先看懂作品，再亲手体验；设计决策见 [SHOWCASE-DESIGN.md](docs/SHOWCASE-DESIGN.md)。

测试 [verify-showcase.cjs](scripts/verify-showcase.cjs) 覆盖：四张预览图真实加载；六个体验入口（含第六标签「技能地图」）选择对应标签、URL hash、iframe 地址及焦点；`#atlas` 区块截图加载与独立入口；深链与手机框；Enter/Space 揭回贴纸；正常动效中间帧、反向和快速重复；减少动态时无动画但状态即时完成；双主题及主题同步到内嵌技能地图。结合首屏、整页、手机、暗色、贴纸中间帧和技能地图内嵌截图目视，确认构图与行为分别成立。

贴纸是使用角部三角折面、整体高度/旋转和位移表达揭起的浏览器近似，不是物理纸张模拟。没有运行性能trace或真机测试。展台代表对比：主标题与导语浅色15.60、深色14.32；贴纸文字7.41，两主题相同。只验证这些明确背景组合，不扩展为全页WCAG认证。明细见 [showcase-contrast-results.json](docs/screenshots/showcase-contrast-results.json)。
