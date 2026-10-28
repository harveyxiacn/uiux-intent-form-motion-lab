# UI/UX 设计指南

先明确页面目标，再提炼视觉方向，最后定义交互与动效。三个 Skill 可以顺序使用，也可以按任务单独调用。

## 先判断界面类别

| 类别 | 用户目标 | 布局与交互 |
| --- | --- | --- |
| 官网 / 内容网页 | 了解内容、评估价值、规划下一步 | 内容层级、品牌构图、清楚导航、相关行动入口 |
| Dashboard Web UI | 监控、比较、管理和决策 | 工作区导航、数据层级、表格、筛选和状态反馈 |
| 手机 App / 小程序 | 在手持设备中反复完成任务 | 单列任务流、触摸操作、详情返回、紧凑导航和编辑面板 |

Dashboard 属于网页 Web UI。浏览器运行、有无动效或屏幕宽度都不能单独决定类别。同一产品可以同时拥有官网、工作台和手机 App，应分别规划。

## 需求：Plan the page

明确受众、使用场景、核心目标、首屏重点与主要行动。为每个区块说明职责、内容和下一步，记录缺失信息与假设。操作型界面还要考虑空状态、加载、错误和完成反馈。

Dashboard 可按目标行动、趋势详情、内容主视觉、数据与日程分栏、三栏信息或地图运营组织。按用户任务选择，不把这些布局当作固定模板。

## 视觉：Set the look

把参考拆成具体决策：构图与层级、字体尺度、颜色角色、图像处理、间距和组件特征。说明每项选择如何支持内容，保留用户的品牌约束。不要把多个参考的装饰无差别叠加。

官网的视觉组织服务内容阅读；Dashboard 的信息密度服务比较与操作；手机 App 优先考虑可达性、连续任务和小屏阅读。

## 交互：Name the motion

为每个交互写清目的、对象、触发、起始状态、变化顺序、结束状态、重复或中断行为，以及键盘、触摸和减少动态效果的替代路径。名称只是沟通起点，不能代替行为说明。

| 模式 | 可描述的行为 |
| --- | --- |
| Overlap Row | 重叠元素展开并显示名称，再次操作可收回 |
| Progress Fill | 填充比例表达完成状态，同时保持文字可读 |
| Accordion Row | 展开当前项，其余区域相应调整 |
| Card Tray | 以分层组织主次内容 |
| Magnify Row | 指针或触摸邻近元素放大并逐渐还原 |
| Pull Summary | 展开摘要并调整相关内容位置 |
| Filter Chips | 切换选择，显示明确选中状态与计数 |
| Removable Tags | 删除后其余标签平滑补位 |
| Suggest Popover | 随输入显示候选，选择后插入结果 |
| Size Dial | 调整刻度并实时反馈字号 |
| Press Tilt | 按压提供轻微倾斜反馈，释放后回位 |
| Hold to Record | 持续按压进入录音状态，明确取消和结束行为 |

这些描述性模式不全是行业统一术语。是否采用取决于任务、平台和无障碍要求；不要为了展示效果而增加操作负担。

## 项目示例

- 官网：展览定位、策展内容、参观信息与 FAQ，帮助访客理解并规划到访。
- Dashboard Web UI：日程工作台，支持筛选、详情、完成状态与新增事项。
- 手机 App：单列日程流程、底部导航、详情返回、底部编辑面板及完成反馈。

示例内容为虚构数据。App 和 Dashboard 仅使用浏览器本地存储，不提供后端或账户同步。

## 相关公开工具

- [Animation Vocabulary](https://animations.dev/vocabulary) 与 [animation-vocabulary](https://github.com/emilkowalski/skills/blob/main/skills/animation-vocabulary/SKILL.md)：为动效命名和辨析。
- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)：设计规则、风格与设计系统资料。
- [Taste Skill](https://github.com/Leonxlnx/taste-skill)：艺术方向与浏览器检查。
- [Impeccable](https://github.com/pbakaus/impeccable)：界面规划、审查和打磨。

这些是独立的相关项目，不是本仓库的运行依赖。选择适合当前任务的工具，避免让多个不同方向同时主导界面。
