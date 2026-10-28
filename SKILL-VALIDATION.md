# 八项 Skill 的实例验收

日期：2026-10-28。运行环境为 Windows / Edge / Playwright，桌面 1440×1000、手机仿真 390×844。入口：[五组在线演示](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/)。此表以实际源码、交互及截图证据为依据，不把格式通过等同于实例验收。

| Skill | 具体实例与产出 | 实际验收与结果 | 边界 |
| --- | --- | --- | --- |
| [page-planning](skills/uiux-page-planning/SKILL.md) | 官网按定位→展览→参观信息→FAQ；光谱工作台按概况→项目→详情编辑组织任务 | 官网参观CTA定位正确；工作台搜索/筛选→详情→修改→返回全流程通过；空态和本地loading可恢复 | 两个具体任务，未做目标用户访谈或转化实验 |
| [style-direction](skills/uiux-style-direction/SKILL.md) | 官网用展览插画与大标题；光谱用深墨导航、暖白工作区、琥珀行动；手机App保留单列任务语言 | 五组demo桌面/手机截图目视；新增两组深浅主题均检查，无页面横向溢出；工作台表格在手机重排为条目 | 主次与可读性为人工判断，未证明通用审美优越性 |
| [interaction-spec](skills/uiux-interaction-spec/SKILL.md) | 组件实验室将tabs、展开、对话框/面板、表单分为明确状态；工作台定义取消/保存/筛出结果后的返回 | tabs方向键/Home/End；展开aria-expanded、open、inert一致；面板Escape/按钮关闭、错误与成功反馈通过 | 测试列举的状态，未穷举全部输入顺序 |
| [design-system](skills/uiux-design-system/SKILL.md) | 两个新demo以语义token驱动浅/深主题，按钮/输入/选择/错误/焦点有状态；[工作台契约](docs/demos/studio/ACCEPTANCE.md)列token表 | 真实computed color与逐层背景合成：组件正文13.95/13.29、次级5.42/8.68、主按钮13.95/13.29；工作台正文12.93/14.49、次级4.70/8.47、主按钮8.27/8.27（浅/深），均≥4.5；切换主题与截图通过 | 仅取三个明确背景代表组合；不代表所有元素/图片/半透明图层均已审核 |
| [component-engineering](skills/uiux-component-engineering/SKILL.md) | 组件tabs由一个选择状态管理panel；原生dialog/modal；工作台projects单一数据源派生列表和计数 | tabs只显示所选panel；原生modal内焦点与Tab保持，Escape返回触发器；工作台保存可移除当前筛选项目后焦点回搜索，新增与reload计数一致 | 无框架依赖的页面内组件，未作为npm库跨项目集成 |
| [motion-engineering](skills/uiux-motion-engineering/SKILL.md) | 展开使用可反向CSS transition；工作台WAAPI进入、关闭取消；系统和模拟减少动态保留状态 | 常规动态9次展开反向、工作台10次快速开关通过；无遗留modal；减少动态时CSS transition为0，工作台运行中的animation为0，仍可开关/保存 | 没有性能trace/帧率或低端设备数据，不能声称性能或流畅度认证 |
| [accessibility-review](skills/uiux-accessibility-review/SKILL.md) | 有名称的原生dialog、label/error关联、状态文本、键盘焦点、双主题对比 | 键盘tabs/表单错误焦点与纠正、modal焦点约束/返回、代表文本对比通过；修复实验室dialog缺少aria-labelledby后复验；手机导航与详情返回补测通过 | 这是限定范围审查，不等于WCAG认证；未做屏幕阅读器、200%缩放全流程或真实辅助硬件测试 |
| [mobile-patterns](skills/uiux-mobile-patterns/SKILL.md) | 间App底导航→日历/详情→编辑面板→返回；光谱手机布局与全屏编辑 | 390仿真下导航Enter后focus main；新增Escape回add；详情返回原条目；新增/编辑/完成/日期与保存通过；光谱390编辑带引号/尖括号名称、关闭返回通过 | 桌面浏览器手机仿真，不是真机；软键盘遮挡、iOS/Android系统返回和手势未实测 |

## 组合如何产生效果

[光谱工作台](docs/demos/studio/)把规划、视觉、token、组件、交互、动态与无障碍策略放在同一“找到项目→修改→返回”的任务里；窄屏保持同一业务任务并调整信息密度。[组件实验室](docs/demos/components/)把相同的状态契约拆成可重复测试的控件。手机App单独覆盖手持导航任务；官网保留浏览与参观决策。它们共同覆盖八项能力，而不是把每个surface硬套同一布局。

复现：运行 `python -m http.server 4173`，执行 [scripts/verify.cjs](scripts/verify.cjs)，它会调用 advanced / studio 验证和 [contrast.cjs](scripts/contrast.cjs)。对比明细在 [contrast-results.json](docs/screenshots/contrast-results.json)，截图见 README。支持 `PLAYWRIGHT_MODULE` 与 `DEMO_BASE` 环境变量。

全部原型没有后端。App / Dashboard事项保存范围为本浏览器；新工作台为当前页面内存，刷新或reload会复位；组件表单仅验证，不发送邮箱。
