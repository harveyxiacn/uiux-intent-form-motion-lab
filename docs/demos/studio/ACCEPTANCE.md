# 光谱综合示例：设计与验收契约

这是 **Dashboard / Web UI**，面向创意负责人与项目协作者，任务是找到需要关注的项目并调整信息。手机端是同一工作流的移动 Web 适配，不冒充原生应用。

## 八个 Skill 如何落地

| Skill | 本例的具体产出 | 可复现验收 |
| --- | --- | --- |
| page-planning | 受众为创意团队；目标为定位项目并调整名称、状态、优先级。信息依次为工作区身份、正在推进/待评审计数、项目表、详情编辑；概况只辅助判断，列表是主任务。 | 首屏有项目入口；从列表打开、修改、返回；不需经过宣传内容或虚假账号流程。 |
| style-direction | 深墨侧栏负责空间定位，暖白主区承载信息，琥珀表示主要行动；低饱和绿/棕项目封面来自编辑设计语境。表格对齐密度，侧面板集中编辑。手机把表格重排为带状态、进度、日期的项目条目。 | 1440 与 390 两种视口检查主次、长名称、页面横向溢出；切深色后逐项检查文字与控件。 |
| interaction-spec | 点击项目：从未打开到原生模态 dialog；面板由右侧进入（240ms建议值）。关闭/Escape立即撤销并恢复焦点。点击筛选改变结果与计数，搜索逐字匹配名称/类型。 | `.project-open` → `#detail[open]`；关闭回项目；筛掉当前项目后回搜索。快速开关不等待动画；重复打开已开面板被忽略。 |
| component-engineering | 单一页面数据源 `projects`，筛选/查询独立；render 只负责列表与派生计数；原生 button/input/select/dialog 保留语义；编辑表单与列表职责分离。 | 表单验证不重建列表、不丢名称；筛选后保存可移出结果，焦点回 `#search`；不产生 body 焦点。 |
| design-system | 下表定义角色与双主题；按钮有 primary/secondary，状态附明确文字；radius/duration/ease统一。 | 切换主题保留过滤、输入与编辑内容；检查focus、error、selected、disabled语义未丢失。 |
| accessibility-review | 所有输入有label；错误由 `aria-describedby` 关联，失败时 `aria-invalid`；列表/成功有status；原生dialog约束焦点并恢复；颜色不是唯一状态线索。 | 用Tab打开项目，输入空格并提交，看到错误且焦点在名称；修正、保存、回到合理位置；Escape回触发点；读屏硬件尚需人工复核。 |
| motion-engineering | 开面板使用transform/opacity WAAPI；关闭取消animation并立即关闭，业务状态独立于动画。筛选只动画新列表；reduced-motion跳过WAAPI与CSS transition。 | 快速重复开关10次后无遗留backdrop；减少动态效果下可开/关/保存，动画数应为0；没有性能trace，不能声称帧率保证。 |
| mobile-patterns | 手机侧栏转紧凑品牌栏，列表变条目；全屏详情保留明确关闭和底部保存，滚动区独立；16px输入避免iOS自动缩放，safe-area保留操作空间。 | 390宽打开/修改/关闭并保持筛选，长内容可滚动；保存区留在底部。仅桌面浏览器仿真，软键盘和真机尚未实测。 |

## Token 与状态矩阵

| 语义角色 | 浅色 | 深色 |
| --- | --- | --- |
| `--ground` / `--surface` | `#f5f4ef` / `#fff` | `#182222` / `#222f2f` |
| `--ink` / `--muted` | `#252c2c` / `#666f6d` | `#f3f2ea` / `#b1beb8` |
| `--accent` / `--on-accent` | `#f1bd64` / `#252c2c` | 同浅色，单独定义文字角色 |
| `--focus` / `--error` | `#326de6` / `#ab2828` | `#9bc4ff` / `#ffaaa4` |
| `--line` / `--selected` | `#e3e6e1` / `#eeeae0` | `#3d4c49` / `#3d4439` |
| motion / radius | `240ms`、`cubic-bezier(.2,.8,.2,1)`、12px | 同浅色；reduced-motion无空间移动 |

| 组件 | default / hover / focus | selected / loading / error / success |
| --- | --- | --- |
| Filter button | 中性底；hover轻变；focus 3px外轮廓 | `aria-pressed=true`+文字粗体；更新结果播报 |
| Project dialog | 原生模态、名称输入获得焦点 | 关闭立即取消动画；取消不保存；保存后列表更新并播报 |
| Name input | label+边界；focus清晰 | 空白失败显示错误、aria-invalid，保留原输入；有效后移除错误 |
| Reload | 原生按钮 | 650ms本地延时期间disabled；`aria-busy`与可见loading；完成恢复样例 |
| Search | 原生search输入 | 零结果显示empty及清除筛选按钮，保留query |

## 验证范围与局限

- `node --check app.js` 已执行通过。浏览器集成验收由同轮集成代理记录截图与交互证据；此文件列验收契约，不把未执行项目写作通过。
- 初始进入与“重新载入”提供真实可见的**本地延时状态**；没有网络请求，没有离线/服务器错误模拟。
- 保存是同步本地内存修改，成功提示仅表示当前页面数据已更新；刷新或重新载入恢复样例。主题同样仅本页有效。
- `#search`、`[data-filter]`、`.project-open[data-open="1"]`、`#new-project`、`#project-name`、`#project-status`、`#project-priority`、`#save`、`#cancel`、`#close-panel`、`#theme`、`#reload` 是测试入口。
- 无外部字体、图像或构建依赖。概况计数从项目推导；装饰柱形不是业务趋势图。

### 本轮视觉复核

开发代理已打开并查看集成代理生成的 `docs/screenshots/studio-desktop.png`、`studio-mobile.png`、`studio-dark.png`、`studio-dark-mobile.png`。浅/深主题在桌面与390px条目布局均完整，无可见文本截断或横向溢出。该结论限这四张静态截图；焦点、快速重复与减少动态效果以集成交互检查为准。
