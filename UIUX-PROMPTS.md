# UI/UX 提示词全集

> 141 条可执行的界面提示词，按「网页」与「App / 小程序」分为两大类。每条都包含效果摘要、可直接复制的提示词、相关 Skill 与可观察的验收点。

- **网页** 58 条 · **App / 小程序** 83 条
- **版本** 1.0.0 · **整理日期** 2026-10-29
- **在线预览** [提示词实验室](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/)：选择任意条目即可操作对应效果。
- **规范来源** `skills/uiux-prompt-playbook/assets/prompts.json`；本文件由 `scripts/build.mjs` 生成，请勿手工编辑。

## 怎么用

1. 先确定界面类型：网页、Dashboard 或桌面组件归入网页；App、小程序、H5 与触摸手势归入 App / 小程序。
2. 找到接近需求的条目，复制「提示词」，替换示例文案、数字与品牌语言。
3. 不要删掉场景、动作、手感、边界与验收；这些字段决定效果能否被实现和检查。
4. 用「验收」逐项检查正常播放、快速重复、反向取消、键盘路径、减少动态与空 / 错误状态。
5. 「高级」「顺滑」不是参数。把它们落成时长、缓动、位移、打断策略与可取消的路径。

> 提示词是设计与工程的输入，不是实现证据。没有运行验证，不要声称效果已经可访问、流畅或完成。

## 目录

### 网页 · 58 条

| 家族 | 条数 | 跳转 |
| --- | --- | --- |
| 按钮 | 8 | [查看](#family-web-0) |
| 版式与布局 | 8 | [查看](#family-web-1) |
| 表单与选择 | 10 | [查看](#family-web-2) |
| 菜单与导航 | 6 | [查看](#family-web-3) |
| 场景组件 | 6 | [查看](#family-web-4) |
| 工作台布局 | 6 | [查看](#family-web-5) |
| 面板与弹层 | 3 | [查看](#family-web-6) |
| 数据可视化 | 7 | [查看](#family-web-7) |
| 网站与组件 | 4 | [查看](#family-web-8) |

### App / 小程序 · 83 条

| 家族 | 条数 | 跳转 |
| --- | --- | --- |
| 按钮与确认 | 2 | [查看](#family-app-0) |
| 标签与选择 | 4 | [查看](#family-app-1) |
| 导航与悬浮 | 6 | [查看](#family-app-2) |
| 滚动与动效 | 10 | [查看](#family-app-3) |
| 卡片 | 8 | [查看](#family-app-4) |
| 控件 | 8 | [查看](#family-app-5) |
| 面板与弹层 | 11 | [查看](#family-app-6) |
| 排序与拖拽 | 3 | [查看](#family-app-7) |
| 手势 | 7 | [查看](#family-app-8) |
| 输入与反馈 | 6 | [查看](#family-app-9) |
| 页面场景 | 5 | [查看](#family-app-10) |
| 移动组件 | 6 | [查看](#family-app-11) |
| 主题与状态 | 7 | [查看](#family-app-12) |

## 一、网页

<a id="family-web-0"></a>

### 按钮

#### 001 · 按钮变进度条

点击后原地切上传进度，显示百分比，完成后变成功并复位。

**提示词**

> 做上传按钮：点击后原地切换成进度条，显示实时百分比；完成后变成成功状态，短暂停留自动复位。失败时显示重试，不要假装成功。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-button-progress) · `web-button-progress`

**关联 Skill** `uiux-component-engineering` · `uiux-motion-engineering`

**标签** 上传 · 进度 · 成功 · 失败

**验收**

- [ ] 进度真实
- [ ] 失败可重试
- [ ] 复位可预期

#### 002 · 按钮让位

点击主按钮后放大宽度、收窄次要按钮，切换二次确认文案。

**提示词**

> 做按钮让位：点击主按钮后放大宽度并收窄次要按钮，切换为二次确认文案；再次点击完成并恢复布局。取消时恢复原状。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-button-yield) · `web-button-yield`

**关联 Skill** `uiux-interaction-spec` · `uiux-motion-engineering`

**标签** 按钮 · 让位 · 二次确认 · 恢复

**验收**

- [ ] 主次清晰
- [ ] 取消恢复
- [ ] 键盘可完成

#### 003 · 按钮展开面板

点击后圆形裁剪扩展成浮层面板，关闭反向收缩。

**提示词**

> 做按钮展开面板：点击后通过圆形裁剪扩展成浮层面板，关闭时反向收缩；同步处理层级、点击外部关闭和焦点返回。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-button-panel) · `web-button-panel`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 按钮 · 圆形裁剪 · 面板 · 焦点

**验收**

- [ ] 层级正确
- [ ] 外部可关
- [ ] 焦点复位

#### 004 · 磁吸跟随

按指针距离产生轻微位移，离开后弹性复位。

**提示词**

> 做磁吸按钮：按指针与按钮中心的距离计算轻微位移，离开交互区后用弹性动画复位；触屏和键盘不启用磁吸，避免误触。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-button-magnet) · `web-button-magnet`

**关联 Skill** `uiux-motion-engineering` · `uiux-mobile-patterns`

**标签** 磁吸 · 指针 · 复位 · 触屏

**验收**

- [ ] 位移有上限
- [ ] 离开复位
- [ ] 触屏不启用

#### 005 · 点击位置扩散填充

液体从点击位置扩散填满按钮，切换文案与状态，再点反向恢复。

**提示词**

> 给按钮添加从点击位置开始的液体扩散填充动画，填满后切换文案和状态；再次点击反向恢复。键盘触发时从按钮中心扩散，状态变化可被读屏播报。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-button-liquid) · `web-button-liquid`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 按钮 · 液体 · 扩散 · 状态

**验收**

- [ ] 正反向可逆
- [ ] 键盘中心扩散
- [ ] 状态被播报

#### 006 · 滑动确认

向右拖动，填充轨道，过阈值成功，未到回弹。

**提示词**

> 做向右滑动确认按钮：拖动时填充轨道，过阈值进入成功，没到就自动回弹；键盘可用方向键或 Enter 完成。拖动过程中显示进度文字。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-button-slide) · `web-button-slide`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 滑动确认 · 阈值 · 回弹 · 键盘

**验收**

- [ ] 阈值明确
- [ ] 未到回弹
- [ ] 键盘可完成

#### 007 · 文案滚动切换

点击时文字纵向位移切换状态，同步更新颜色和图标。

**提示词**

> 做文案滚动按钮：点击时文字纵向位移切换状态，同步更新按钮颜色和图标；切换中旧文字和新文字不要重叠，读屏只播报最终状态。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-button-roll) · `web-button-roll`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 按钮 · 文案 · 滚动 · 状态

**验收**

- [ ] 文字不重叠
- [ ] 状态完整
- [ ] 只播报最终值

#### 008 · 长按环形确认

按住时环形进度增长，到时完成，中途松开取消复位。

**提示词**

> 做长按完成按钮：按住时环形进度条增长，到指定时长完成操作；中途松开就取消并复位。提供键盘长按替代和清晰的完成反馈。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-button-hold) · `web-button-hold`

**关联 Skill** `uiux-interaction-spec` · `uiux-accessibility-review`

**标签** 长按 · 环形 · 确认 · 取消

**验收**

- [ ] 松开取消
- [ ] 时长可配
- [ ] 键盘可完成

<a id="family-web-1"></a>

### 版式与布局

#### 009 · 标题里嵌小图

大标题中间嵌等高圆角小图，点击原地展开成全宽大图，文字避让。

**提示词**

> 做标题里嵌小图的版式：大标题中间嵌入等高圆角小图，点击原地展开成全宽大图，文字自动避让；再点缩回原位，标题不断行。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-layout-inline) · `web-layout-inline`

**关联 Skill** `uiux-style-direction` · `uiux-component-engineering`

**标签** 标题 · 内嵌图 · 展开 · 避让

**验收**

- [ ] 文字不断行
- [ ] 展开可逆
- [ ] 图片有替代文本

#### 010 · 档案夹标签页

多页内容层叠只露顶部标签，点击标签对应页到最上层，其余后退。

**提示词**

> 做档案夹标签页：多页内容层叠只露出顶部标签，点击标签时对应页到最上层，其余页依次后退；当前页有清晰标签和焦点，页面内容保持可读。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-layout-folder) · `web-layout-folder`

**关联 Skill** `uiux-motion-engineering` · `uiux-component-engineering`

**标签** 档案夹 · 标签页 · 层叠 · 焦点

**验收**

- [ ] 当前页可读
- [ ] 层叠有层次
- [ ] 键盘可切

#### 011 · 点一格撑成通栏

两列网格中点击任意格子扩展成整行，其余格子自动调整，不跳转。

**提示词**

> 做两列网格内容：点击任意格子扩展成整行通栏，其余格子自动调整，不跳转新页；再次点击恢复。展开时内容从格子内错层进入，焦点留在该格。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-layout-grid) · `web-layout-grid`

**关联 Skill** `uiux-motion-engineering` · `uiux-component-engineering`

**标签** 网格 · 通栏 · 展开 · 焦点

**验收**

- [ ] 布局不跳
- [ ] 焦点保留
- [ ] 可逆

#### 012 · 镂空大标题

照片从大标题镂空处透出，上滑文字放大照片铺满，下滑收缩。

**提示词**

> 做镂空大标题版式：照片从大标题的镂空处透出，上滑文字放大、照片铺满全屏，下滑照片收缩回镂空内，带流畅动画。文字与照片的层叠关系在两端都正确。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-layout-cutout) · `web-layout-cutout`

**关联 Skill** `uiux-style-direction` · `uiux-motion-engineering`

**标签** 镂空 · 标题 · 照片 · 滚动

**验收**

- [ ] 镂空对齐
- [ ] 两端图层正确
- [ ] 减少动态可读

#### 013 · 双列错位滚动

左右两列同时上滚，左快右慢，滚到底部自动对齐。

**提示词**

> 做双列错位滚动版式：左右两列同时上滚，左快右慢，图片产生时差；滚到底部时两列自动对齐，不留下空白。外层滚动驱动，不劫持用户手势。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-layout-parallax) · `web-layout-parallax`

**关联 Skill** `uiux-motion-engineering` · `uiux-page-planning`

**标签** 版式 · 双列 · 视差 · 对齐

**验收**

- [ ] 底部对齐
- [ ] 不劫持
- [ ] 减少动态同步

#### 014 · 拖动分屏比例

上下两区中间有把手，拖动时同步变化，松手吸附到预设比例。

**提示词**

> 做上下分屏：中间有可拖拽把手，拖动时两区大小同步变化，松手自动吸附到 30/50/70 预设比例；键盘上下键可调。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-layout-split) · `web-layout-split`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 分屏 · 把手 · 吸附 · 键盘

**验收**

- [ ] 预设吸附
- [ ] 两区同步
- [ ] 键盘可调

#### 015 · 圆泡堆叠选择

大小不一的圆泡紧密堆叠，选中放大高亮，周围挤开后重新聚拢。

**提示词**

> 做圆泡堆叠选择：大小不一的圆泡紧密堆叠，点击后选中的圆泡放大高亮，周围气泡挤开后重新聚拢；再次点击恢复。每个圆泡有可读标签。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-layout-bubbles) · `web-layout-bubbles`

**关联 Skill** `uiux-motion-engineering` · `uiux-style-direction`

**标签** 圆泡 · 堆叠 · 选择 · 聚拢

**验收**

- [ ] 标签可读
- [ ] 挤开可逆
- [ ] 键盘可选

#### 016 · 左栏日期吸住

左侧大号日期固定，右侧日程滚动，下一日日期平滑推入。

**提示词**

> 做左栏日期吸住版式：左侧窄栏放大号日期，右侧日程滚动；滚动时日期栏固定在顶部，下一日日期平滑推入切换，和右侧分组严格对齐。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-layout-sticky) · `web-layout-sticky`

**关联 Skill** `uiux-page-planning` · `uiux-motion-engineering`

**标签** 版式 · 吸顶 · 日期 · 日程

**验收**

- [ ] 日期与分组对齐
- [ ] 吸顶不遮
- [ ] 可滚动

<a id="family-web-2"></a>

### 表单与选择

#### 017 · 本地筛选下拉

输入筛选，上下键和回车确认，无匹配显示提示。

**提示词**

> 做支持本地筛选的可搜索下拉：输入时实时过滤，上下键移动，回车确认；无匹配项显示明确提示，Esc 关闭并恢复焦点。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-select-local) · `web-select-local`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 下拉 · 搜索 · 筛选 · 空状态

**验收**

- [ ] 实时过滤
- [ ] 键盘选择
- [ ] 空状态明确

#### 018 · 拆分按钮

左侧执行主动作，右侧箭头展开次要动作，主次明确。

**提示词**

> 做拆分按钮：左侧点击执行主动作，右侧箭头展开次要动作；主次操作视觉区分明确，键盘可分别聚焦。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-select-split) · `web-select-split`

**关联 Skill** `uiux-component-engineering` · `uiux-design-system`

**标签** 拆分按钮 · 主动作 · 次要动作 · 键盘

**验收**

- [ ] 主次清晰
- [ ] 键盘可分别聚焦
- [ ] 菜单可关

#### 019 · 单选下拉

五个固定选项，默认选中第一个，选完自动收起。

**提示词**

> 做一个单选下拉：五个固定选项，默认选中第一个，选完自动收起；支持上下键和回车，选中项带对勾，触发器显示当前值。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-select-single) · `web-select-single`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 下拉 · 单选 · 键盘 · 对勾

**验收**

- [ ] 选完收起
- [ ] 键盘完整
- [ ] 显示当前值

#### 020 · 多选折叠选择器

已选项以可删除块显示，超三行折叠并显示剩余数量。

**提示词**

> 做多选选择器：已选项以可删除块显示，超过三行后折叠并显示剩余数量；支持全选和清空，删除块要有可聚焦的按钮。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-select-multi) · `web-select-multi`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 多选 · 折叠 · 删除 · 全选

**验收**

- [ ] 折叠计数正确
- [ ] 删除可聚焦
- [ ] 全选可逆

#### 021 · 分组下拉

按团队和项目分组，组标题不可选，滚动时固定顶部。

**提示词**

> 做一个分组下拉：按团队和项目分组，组标题不可选，滚动时固定在顶部；选项支持键盘遍历，分组标题作为 aria-group 的标签。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-select-group) · `web-select-group`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 下拉 · 分组 · 吸顶 · aria-group

**验收**

- [ ] 组标题不可选
- [ ] 滚动吸顶
- [ ] 键盘遍历

#### 022 · 父子联动树形选择器

半选用单独样式，只回传最上层选中节点。

**提示词**

> 做父子联动的树形选择器：勾选父级选中全部子级，子级部分选中时父级显示半选样式；只回传最上层选中节点，展开状态保持。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-select-tree) · `web-select-tree`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 树形 · 半选 · 父子联动 · 回传

**验收**

- [ ] 半选样式独立
- [ ] 只回传顶层
- [ ] 展开保持

#### 023 · 可新建选择器

无匹配时显示新建选项，创建前清首尾空格、检查重名。

**提示词**

> 做可新建选择器：无匹配时显示「新建」选项，创建前清除首尾空格并检查重名；创建成功后立即选中，失败时保留输入。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-select-creatable) · `web-select-creatable`

**关联 Skill** `uiux-component-engineering` · `uiux-interaction-spec`

**标签** 新建 · 去重 · 空匹配 · 保留输入

**验收**

- [ ] 去重提示
- [ ] 创建即选中
- [ ] 失败保留

#### 024 · 日期区间选择器

选起止时预览范围，两端日期可单独修改。

**提示词**

> 做日期区间选择器：选择起止日期时预览中间范围，两端日期可单独修改；起止不能颠倒，选择完成后回填触发器。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-select-date) · `web-select-date`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 日期区间 · 预览 · 起止 · 回填

**验收**

- [ ] 起止不颠倒
- [ ] 范围预览
- [ ] 键盘可选

#### 025 · 三列分组多列导航

带说明文字，鼠标斜移延迟收起，支持键盘遍历。

**提示词**

> 做三列分组多列导航：每项带说明文字，鼠标斜移时延迟收起，支持键盘在列间遍历；组标题不可聚焦，只作为结构。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-select-mega) · `web-select-mega`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 多列导航 · 分组 · 斜移 · 键盘

**验收**

- [ ] 斜移不闪
- [ ] 键盘遍历
- [ ] 组标题不聚焦

#### 026 · 远程搜索下拉

输入停止 300ms 再请求，旧请求不覆盖新请求，显示加载/空/失败。

**提示词**

> 做远程搜索下拉：输入停止 300ms 再请求，旧请求不能覆盖新请求；显示加载、空结果和失败三种状态，失败可重试。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-select-remote) · `web-select-remote`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 远程搜索 · 防抖 · 竞态 · 状态

**验收**

- [ ] 旧请求不覆盖
- [ ] 三种状态
- [ ] 可重试

<a id="family-web-3"></a>

### 菜单与导航

#### 027 · 菜单内搜索

输入时实时过滤，匹配项上移并高亮命中文字，清空恢复顺序。

**提示词**

> 侧边栏顶部加搜索框：输入时实时过滤菜单项，不匹配的项收起，匹配项上移并高亮命中文字；清空后恢复原有顺序。没有结果时给出明确空状态。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-menu-search) · `web-menu-search`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 菜单搜索 · 过滤 · 高亮 · 空状态

**验收**

- [ ] 高亮命中
- [ ] 清空恢复
- [ ] 键盘可操作

#### 028 · 菜单拖动排序

按住拖动排序，项放大、其余让位，拖过分隔线固定为常用。

**提示词**

> 菜单项支持按住拖动排序：拖动时该项轻微放大，其余项平滑让位，松手吸附到新位置；拖到顶部分隔线以上固定为常用项。排序结果在当前会话保存。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-menu-sort) · `web-menu-sort`

**关联 Skill** `uiux-component-engineering` · `uiux-interaction-spec`

**标签** 菜单 · 排序 · 常用 · 保存

**验收**

- [ ] 拖动实时让位
- [ ] 固定可逆
- [ ] 键盘可排序

#### 029 · 工作区切换器

侧边栏顶部原地弹出工作区列表，切换后名称滚动替换，强调色跟随。

**提示词**

> 在侧边栏顶部做工作区切换器：点击原地弹出工作区列表，当前项带对勾；切换后名称滚动替换，菜单强调色跟随工作区变化，页面标题同步更新。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-menu-workspace) · `web-menu-workspace`

**关联 Skill** `uiux-design-system` · `uiux-component-engineering`

**标签** 工作区 · 切换器 · 强调色 · 同步

**验收**

- [ ] 当前项有对勾
- [ ] 强调色跟随
- [ ] 键盘可选

#### 030 · 弧形快捷菜单

圆形按钮点击后图标沿弧线依次弹出，再加号旋转成叉号。

**提示词**

> 页面右下角放圆形快捷按钮，点击后几个图标沿弧线依次弹出，按钮图标从加号旋转为叉号；再次点击沿原路收回。每个图标有文字标签，Esc 可收起。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-menu-arc) · `web-menu-arc`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 弧形菜单 · 快捷按钮 · 交错 · Esc

**验收**

- [ ] 依次弹出
- [ ] 原路收回
- [ ] 每项有标签

#### 031 · 面包屑加同级下拉

每一段可展开同级页面，选择后文字滚动替换，后续层级更新。

**提示词**

> 页面顶部加面包屑导航：每一段可点击展开同级页面下拉列表，选择后该段文字滚动替换，后续层级同步更新。当前页不可选，下拉可键盘浏览。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-menu-breadcrumb) · `web-menu-breadcrumb`

**关联 Skill** `uiux-component-engineering` · `uiux-interaction-spec`

**标签** 面包屑 · 同级下拉 · 层级 · 滚动替换

**验收**

- [ ] 后续层级同步
- [ ] 当前页不可选
- [ ] 键盘可用

#### 032 · 悬停滑出二级面板

一级菜单悬停时右侧滑出二级面板，项间移动保持打开，离开后收起。

**提示词**

> 一级菜单悬停时在右侧滑出二级面板；在一级项之间移动时面板保持打开，只切换内容；鼠标离开整个菜单区域后自动收起。键盘聚焦也要能打开。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-menu-flyout) · `web-menu-flyout`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 二级菜单 · 悬停 · 保持打开 · 键盘

**验收**

- [ ] 移动不闪
- [ ] 离开可收
- [ ] 键盘可打开

<a id="family-web-4"></a>

### 场景组件

#### 033 · 快捷控制台

切换阅读/休息/离开场景，灯光、温度与雨声音量同步平滑变化。

**提示词**

> 做一个快捷控制台：切换阅读、休息和离开场景，灯光开关、温度和雨声音量同步平滑变化，同时保留独立调节并循环演示。场景切换要能手动中断。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-mini-console) · `web-mini-console`

**关联 Skill** `uiux-interaction-spec` · `uiux-design-system`

**标签** 控制台 · 场景 · 联动 · 可中断

**验收**

- [ ] 联动正确
- [ ] 可独立调节
- [ ] 可中断

#### 034 · 能量面板

切换能量/睡眠/活动指标，数字滚动，柱高和颜色错峰变化。

**提示词**

> 做能量面板：切换能量、睡眠和活动指标，数字滚动过渡，柱高和颜色错峰变化，柱顶逐个显示数值。切换时保留上一指标的对比残影。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-mini-energy) · `web-mini-energy`

**关联 Skill** `uiux-motion-engineering` · `uiux-design-system`

**标签** 能量 · 柱状 · 数字滚动 · 对比

**验收**

- [ ] 数值准确
- [ ] 错峰可感知
- [ ] 可切换

#### 035 · 日程轨道

点击事项展开详情，其他事项连续让位，左侧光点同步移动。

**提示词**

> 做日程轨道：点击事项时展开详情，其他事项连续让位，左侧光点同步移动到当前事项；三项独立循环演示，也可手动点击。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-mini-schedule) · `web-mini-schedule`

**关联 Skill** `uiux-motion-engineering` · `uiux-page-planning`

**标签** 日程 · 轨道 · 展开 · 让位

**验收**

- [ ] 光点对齐
- [ ] 让位连续
- [ ] 可手动

#### 036 · 文件收纳盒

文件沿弧线移动缩小淡出，文件夹抬起展开，数量增加。

**提示词**

> 做文件收纳盒：文件沿弧线移动并缩小淡出，目标文件夹抬起展开，数量增加，停留后沿原路恢复并循环演示；也支持手动拖放。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-mini-files) · `web-mini-files`

**关联 Skill** `uiux-motion-engineering` · `uiux-interaction-spec`

**标签** 文件 · 弧线 · 文件夹 · 拖放

**验收**

- [ ] 数量与文件一致
- [ ] 可拖放
- [ ] 动画可逆

#### 037 · 习惯打卡盘

七个日期沿圆周排列，打卡节点变色扩散光圈，中心数字滚动，路径连续绘制。

**提示词**

> 做习惯打卡盘：七个日期沿圆周排列，打卡时节点变色并扩散光圈，中心数字滚动，路径连续绘制；全部完成显示对勾并停止循环。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-mini-habit) · `web-mini-habit`

**关联 Skill** `uiux-motion-engineering` · `uiux-design-system`

**标签** 打卡 · 圆周 · 路径 · 完成

**验收**

- [ ] 节点与日期对应
- [ ] 路径闭合
- [ ] 可重置

#### 038 · 专注仪表

拖动滑块调时长，圆环和数字联动，开始倒计时，完成变绿打勾。

**提示词**

> 做一个专注仪表：拖动滑块调节时长，圆环和数字联动；开始后倒计时，完成时圆环变绿并显示对勾，再自动复位。支持暂停和提前结束。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-mini-focus) · `web-mini-focus`

**关联 Skill** `uiux-motion-engineering` · `uiux-component-engineering`

**标签** 专注 · 倒计时 · 圆环 · 暂停

**验收**

- [ ] 计时准确
- [ ] 完成态明确
- [ ] 可暂停

<a id="family-web-5"></a>

### 工作台布局

#### 039 · 地图主导布局

地图为核心，适合物流与园区管理后台。

**提示词**

> 设计地图主导的物流/园区后台：地图占主要区域，顶部放搜索与图层筛选，右侧浮动面板显示选中对象详情；列表可收起，地图不因面板出现而缩放跳动。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-layout-map) · `web-layout-map`

**关联 Skill** `uiux-page-planning` · `uiux-design-system`

**标签** 地图 · 物流 · 浮动面板 · 筛选

**验收**

- [ ] 地图不跳
- [ ] 面板可收
- [ ] 选中联动

#### 040 · 目标导向布局

突出核心目标与快捷操作，适合目标类看板。

**提示词**

> 设计一个目标导向的工作台布局：首屏突出一个核心目标、当前进度和三个快捷操作；次要信息下沉到第二屏，主操作在视线终点。给出桌面与 1024 宽的响应式规则。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-layout-goal) · `web-layout-goal`

**关联 Skill** `uiux-page-planning` · `uiux-design-system`

**标签** Dashboard · 目标 · 快捷操作 · 层级

**验收**

- [ ] 一个视觉主角
- [ ] 主操作明确
- [ ] 窄屏不挤

#### 041 · 内容主视觉布局

大封面为中心，适合媒体内容后台。

**提示词**

> 设计内容主视觉后台：大封面作为视觉中心，标题、状态和发布操作围绕它排列；列表退到侧边，选中项与封面联动。适合媒体、作品集和内容审核场景。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-layout-content) · `web-layout-content`

**关联 Skill** `uiux-page-planning` · `uiux-style-direction`

**标签** 内容 · 封面 · 媒体 · 联动

**验收**

- [ ] 封面为主角
- [ ] 列表联动
- [ ] 操作可见

#### 042 · 趋势主导布局

核心放趋势图，先看整体再看明细。

**提示词**

> 设计趋势主导的 Dashboard：核心区域放趋势图，上方给结论和变化幅度，明细表格放在下方；图表与表格共享同一时间范围筛选。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-layout-trend) · `web-layout-trend`

**关联 Skill** `uiux-page-planning` · `uiux-design-system`

**标签** 趋势 · 图表 · 明细 · 时间范围

**验收**

- [ ] 先结论后明细
- [ ] 筛选共享
- [ ] 空状态明确

#### 043 · 三栏信息布局

三列拆分不同信息，信息多也整洁有序。

**提示词**

> 设计三栏信息布局：左栏导航与筛选，中栏主列表，右栏详情或辅助信息；三栏宽度按内容权重分配，详情打开时不挤压主列表。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-layout-three) · `web-layout-three`

**关联 Skill** `uiux-page-planning` · `uiux-component-engineering`

**标签** 三栏 · 列表 · 详情 · 权重

**验收**

- [ ] 详情不挤压
- [ ] 筛选可用
- [ ] 窄屏可折叠

#### 044 · 数据日程分栏

左右分栏，一边数据一边日程，适合项目管理。

**提示词**

> 设计数据与日程分栏布局：左侧数据概览，右侧今日日程，中间用一条分隔线而不是卡片堆叠；两栏各自滚动，顶部共享项目切换。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-dash-split) · `web-dash-split`

**关联 Skill** `uiux-page-planning` · `uiux-component-engineering`

**标签** 分栏 · 数据 · 日程 · 项目

**验收**

- [ ] 两栏独立滚动
- [ ] 顶部共享
- [ ] 窄屏堆叠

<a id="family-web-6"></a>

### 面板与弹层

#### 045 · 按钮弹出菜单

以按钮为原点展开，点击外部原路收回。

**提示词**

> 做按钮弹出菜单：菜单以按钮为原点展开，点击外部或 Esc 原路收回；菜单项支持键盘上下选择，当前焦点有清晰轮廓。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-overlay-button-menu) · `web-overlay-button-menu`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 菜单 · 弹出 · 原点 · 键盘

**验收**

- [ ] 原点展开
- [ ] 外部可关
- [ ] 焦点可见

#### 046 · 侧边抽屉推走页面

面板从左侧滑入，主页面右移缩小，点击主页面复原。

**提示词**

> 做侧边抽屉：面板从左侧滑入，主页面右移并轻微缩小；点击主页面或 Esc 复原。抽屉内焦点受限，关闭后回到触发按钮。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-overlay-drawer) · `web-overlay-drawer`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 抽屉 · 左滑 · 主页面 · 焦点

**验收**

- [ ] 主页面可点回
- [ ] 焦点受限
- [ ] 关闭复位

#### 047 · 卡片弹出详情

从原位放大为居中面板，关闭时缩回。

**提示词**

> 做卡片弹出详情：点击卡片后从原位置放大为居中面板，背景变暗；关闭时缩回原卡片位置。焦点进入面板并循环，关闭后回到卡片。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-overlay-card-detail) · `web-overlay-card-detail`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 卡片 · 详情 · 原位 · 焦点

**验收**

- [ ] 缩回原位
- [ ] 焦点循环
- [ ] Esc 可关

<a id="family-web-7"></a>

### 数据可视化

#### 048 · 弹性排序柱

五根柱子错峰生长，数值同步，按大小平滑换位。

**提示词**

> 做五根排序柱：错峰弹性生长，顶部数值同步变化，按数值大小平滑换位，保留星期标签并循环演示；支持切换排序方向。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-chart-bars) · `web-chart-bars`

**关联 Skill** `uiux-motion-engineering` · `uiux-design-system`

**标签** 柱状图 · 错峰 · 排序 · 换位

**验收**

- [ ] 数值与高度一致
- [ ] 换位不跳
- [ ] 可切换排序

#### 049 · 分段选择器联动图表

选中背景平滑移动，切换时会员数量与趋势图同步更新，悬停显示月份数值。

**提示词**

> 做 Apple 风格数据统计卡：顶部分段选择器，选中背景平滑移动；切换选项时数字和趋势图同步更新；悬停图表显示月份数值与高亮。统一圆角、留白、字体层级和动效节奏。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-chart-segmented) · `web-chart-segmented`

**关联 Skill** `uiux-design-system` · `uiux-component-engineering`

**标签** 分段控件 · 统计卡 · 图表 · 悬停

**验收**

- [ ] 选中块对齐
- [ ] 数据同步
- [ ] 悬停可读

#### 050 · 轨道分配环

三段彩色圆弧按比例绘制，中心百分比同步，右侧图例。

**提示词**

> 做一个轨道分配环：三段彩色圆弧按比例绘制，中心百分比与选中项同步变化，右侧保留图例并循环演示；悬停图例高亮对应弧段。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-chart-donut) · `web-chart-donut`

**关联 Skill** `uiux-design-system` · `uiux-motion-engineering`

**标签** 环形图 · 比例 · 图例 · 联动

**验收**

- [ ] 比例准确
- [ ] 图例联动
- [ ] 可键盘切换

#### 051 · 活动热力矩阵

二十八个格子按波纹顺序亮起，展开时向四周让位，中心详情卡放大。

**提示词**

> 做活动热力矩阵：二十八个格子按波纹顺序亮起，点击时向四周让位，中心详情卡放大出现，停留后恢复并循环演示。每个格子有日期与数值的可读标签。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-chart-heat) · `web-chart-heat`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 热力图 · 波纹 · 详情卡 · 循环

**验收**

- [ ] 颜色有数值依据
- [ ] 详情可读
- [ ] 键盘可遍历

#### 052 · 流量曲线与探针

曲线与渐变面积生长，探针移动，虚线浮层读数跟随。

**提示词**

> 做一条流量曲线：曲线和渐变面积同步生长，探针沿曲线移动，虚线和浮层读数实时跟随；支持拖动查看，离开后探针回到最新点。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-chart-curve) · `web-chart-curve`

**关联 Skill** `uiux-motion-engineering` · `uiux-design-system`

**标签** 曲线 · 探针 · 浮层 · 拖动

**验收**

- [ ] 读数与曲线一致
- [ ] 拖动可用
- [ ] 离开复位

#### 053 · 流量占比条

三个来源百分比与条形宽度同步变化，合计始终 100%。

**提示词**

> 做流量占比条：三个来源的百分比与条形宽度同步平滑变化，合计始终为 100%，支持切换分配并循环演示；图例与条形使用同一颜色映射。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-chart-share) · `web-chart-share`

**关联 Skill** `uiux-design-system` · `uiux-motion-engineering`

**标签** 占比 · 条形 · 总计 · 循环

**验收**

- [ ] 合计 100%
- [ ] 颜色一致
- [ ] 可切换

#### 054 · 双针目标仪表

半圆刻度逐段点亮，实际指针弹性追随目标，可切换目标。

**提示词**

> 做一个双针目标仪表：半圆刻度逐段点亮，实际指针弹性追随目标，弧形进度与百分比同步变化，支持切换目标。目标与实际用不同颜色和形状区分。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-chart-gauge) · `web-chart-gauge`

**关联 Skill** `uiux-design-system` · `uiux-motion-engineering`

**标签** 仪表 · 双针 · 目标 · 弹性

**验收**

- [ ] 两针可区分
- [ ] 目标可切换
- [ ] 数值准确

<a id="family-web-8"></a>

### 网站与组件

#### 055 · 建筑设计网站

全屏建筑摄影、左下超大标题、玻璃导航与光线滑块。

**提示词**

> 设计 Apple 风建筑设计官网：首屏全屏高质量建筑摄影，左下方超大标题，极简导航，作品为视觉中心；右上角主题按钮切换明暗，底部光线滑块调整画面氛围，文字、按钮、背景同步响应。控制留白、对比和层级，输出响应式单页代码。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-arch-site) · `web-arch-site`

**关联 Skill** `uiux-style-direction` · `uiux-design-system`

**标签** 建筑 · 全屏图 · 玻璃导航 · 光线

**验收**

- [ ] 文字始终可读
- [ ] 主题联动
- [ ] 响应式

#### 056 · 图片取色控件

从图片提取 5 种代表色，点击更新预览与 HEX/RGB，可复制。

**提示词**

> 做图片取色组件：上方展示建筑照片，下方提取 5 种代表色块；点击色块同步更新颜色预览和 HEX/RGB，提供一键复制与成功反馈；支持上传或切换示例图。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-palette) · `web-palette`

**关联 Skill** `uiux-component-engineering` · `uiux-design-system`

**标签** 取色 · 色板 · HEX · 复制

**验收**

- [ ] 颜色值准确
- [ ] 复制有反馈
- [ ] 键盘可选

#### 057 · 艺术作品网站

首屏大标题与彩色扇形卡片，滚动变台阶排列，切换按钮换位，明暗主题联动。

**提示词**

> 设计 Apple 高级审美的艺术作品展示网页：首屏超大标题与彩色扇形卡片，向下滚动时卡片平滑变为台阶式排列；点击切换按钮，卡片依次换位、作品名称同步更新；支持明暗主题切换。使用无衬线字体、大留白、柔和阴影、圆角卡片、600ms 缓动，输出可运行 HTML/CSS/JS，不用外部图片。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-art-site) · `web-art-site`

**关联 Skill** `uiux-style-direction` · `uiux-motion-engineering` · `uiux-page-planning`

**标签** 作品集 · 扇形卡 · 台阶 · 主题

**验收**

- [ ] 滚动可逆
- [ ] 换位名称同步
- [ ] 无外部图片

#### 058 · 音效调节面板

三种音效模式与低中高频滑块联动，实时显示数值。

**提示词**

> 做 Apple 风音效调节面板：顶部耳机产品图，下方三种音效模式与低/中/高频滑块；切换模式时滑块与参数联动，拖动实时显示数值与进行状态；提供重置按钮。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/web-audio) · `web-audio`

**关联 Skill** `uiux-component-engineering` · `uiux-design-system`

**标签** 音效 · 滑块 · 模式 · 重置

**验收**

- [ ] 模式与滑块联动
- [ ] 重置可逆
- [ ] 数值实时

## 二、App / 小程序

<a id="family-app-0"></a>

### 按钮与确认

#### 059 · 保存按钮变进度环

点击后收缩成圆显示环形进度，完成后展开回按钮，文字切为打开。

**提示词**

> 做保存按钮：点击后收缩成圆形并显示环形进度，完成后展开回按钮，文字切换为「打开」；失败时恢复「保存」并提供重试。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-save-progress) · `app-save-progress`

**关联 Skill** `uiux-motion-engineering` · `uiux-component-engineering`

**标签** 保存 · 进度环 · 完成 · 重试

**验收**

- [ ] 失败可重试
- [ ] 完成文字切换
- [ ] 进度真实

#### 060 · 状态按钮文字纵向滚动

点击时文字纵向滚动切换，出现对勾，宽度随文字平滑变化。

**提示词**

> 做状态切换按钮：点击时文字纵向滚动切换，出现对勾图标，按钮宽度随文字长度平滑变化；重复点击可切回，读屏只播报最终状态。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-status-roll) · `app-status-roll`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 按钮 · 文字滚动 · 对勾 · 宽度

**验收**

- [ ] 文字不重叠
- [ ] 宽度平滑
- [ ] 只播报最终值

<a id="family-app-1"></a>

### 标签与选择

#### 061 · 滑动选色，相邻弹起

手指经过的色块依次放大弹起，松手选中，主题色平滑过渡。

**提示词**

> 做一排横向颜色选择：支持按住滑动选择，手指经过的色块依次放大弹起；松手选中当前色块，界面主题色平滑过渡。键盘左右键也能逐色选择。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-tag-colors) · `app-tag-colors`

**关联 Skill** `uiux-motion-engineering` · `uiux-design-system`

**标签** 颜色 · 滑动选择 · 放大 · 主题过渡

**验收**

- [ ] 经过与选中区分
- [ ] 主题色同步
- [ ] 键盘可选

#### 062 · 可删除标签收缩成圆点

删除时先收缩成小圆点再消失，并能新增标签。

**提示词**

> 做一组可删除标签：每个标签带删除按钮，删除时先收缩成小圆点再消失，其余标签平滑补位；支持输入新增标签并去重。删除和新增都要能用键盘完成。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-tag-removable) · `app-tag-removable`

**关联 Skill** `uiux-component-engineering` · `uiux-motion-engineering`

**标签** 标签 · 删除 · 收缩 · 新增

**验收**

- [ ] 删除动画不阻塞状态
- [ ] 空输入不新增
- [ ] 重名有提示

#### 063 · 筛选标签实心反白

点击标签背景变实心、文字反白，再点恢复。

**提示词**

> 做一排可横向滚动的筛选标签：点击后背景变实心、文字反白，再点恢复；支持多选，选中数量显示在标题旁。移动端横向滚动，但不要拦截纵向页面滚动。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-tag-filter) · `app-tag-filter`

**关联 Skill** `uiux-mobile-patterns` · `uiux-component-engineering`

**标签** 标签 · 筛选 · 多选 · 横滚

**验收**

- [ ] 选中态清晰
- [ ] 横滚不抢纵滚
- [ ] 键盘可切换

#### 064 · 选中标签放大，邻居让位

选中标签放大，相邻标签主动向两侧让出空间。

**提示词**

> 做一排标签选择：选中标签放大并提高对比度，相邻标签主动向两侧让位，未选中标签保持安静。切换时只让变化的标签移动，容器高度不变。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-tag-yield) · `app-tag-yield`

**关联 Skill** `uiux-motion-engineering` · `uiux-interaction-spec`

**标签** 标签 · 放大 · 让位 · 切换

**验收**

- [ ] 布局不跳动
- [ ] 选中态不只靠颜色
- [ ] 键盘可切换

<a id="family-app-2"></a>

### 导航与悬浮

#### 065 · 底栏白色胶囊滑动

切换时胶囊背景平滑移动，选中项展开文字标签。

**提示词**

> 做一个底部标签栏：选中项展开显示文字标签，白色胶囊背景滑到选中位置，其余项只保留图标。切换时内容区同步切换，但滚动位置按标签分别保存。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-nav-capsule) · `app-nav-capsule`

**关联 Skill** `uiux-component-engineering` · `uiux-mobile-patterns`

**标签** 底栏 · 胶囊 · 标签 · 滚动保存

**验收**

- [ ] 胶囊与选中项对齐
- [ ] 标签可读
- [ ] 键盘可切换

#### 066 · 底栏嵌主按钮

左侧三个文字标签，右端独立主色圆按钮，点击回到首页顶部并打开编辑。

**提示词**

> 做一个底部导航：左侧三个文字标签，右端单独留一枚主色圆按钮。点击圆按钮时，不管当前在哪个标签页，都回到首页顶部并打开编辑面板。当前标签有明确选中态。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-nav-embedded) · `app-nav-embedded`

**关联 Skill** `uiux-mobile-patterns` · `uiux-component-engineering`

**标签** 底栏 · 主按钮 · 回到首页 · 编辑

**验收**

- [ ] 任意标签都可回到首页
- [ ] 选中态清晰
- [ ] 键盘可触发

#### 067 · 横向周日期条

选中背景滑到点击日期，左右滑动整周翻页，月份标题同步。

**提示词**

> 做一个横向周日期条：选中背景滑动到点击日期，左右滑动整周翻页，月份标题同步更新。今天与选中日要有区分，键盘左右键逐日移动。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-nav-week) · `app-nav-week`

**关联 Skill** `uiux-component-engineering` · `uiux-mobile-patterns`

**标签** 周历 · 滑动 · 选中 · 月份

**验收**

- [ ] 跨月标题正确
- [ ] 今天与选中区分
- [ ] 键盘逐日

#### 068 · 弧形快捷菜单

圆形按钮点击后图标沿弧线依次弹出，加号旋转成叉号。

**提示词**

> 页面右下角放一个圆形快捷按钮，点击后几个图标沿弧线依次弹出，按钮图标从加号旋转为叉号；再次点击沿原路收回。每个图标有文字标签，键盘可依次聚焦。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-nav-arc) · `app-nav-arc`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 弧形菜单 · 悬浮按钮 · 交错 · 收回

**验收**

- [ ] 收展可逆
- [ ] 每项有文字
- [ ] Esc 收起

#### 069 · 吸边悬浮球

松手后吸附到最近屏幕边缘，滚动时半隐藏，停止后滑出。

**提示词**

> 做一个吸边悬浮球：拖动松手后吸附到最近的屏幕边缘，页面滚动时半隐藏，停止滚动后滑出；点击展开快捷操作。悬浮球不能挡住底部导航和系统手势区，键盘可移动它。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-nav-edgeball) · `app-nav-edgeball`

**关联 Skill** `uiux-mobile-patterns` · `uiux-accessibility-review`

**标签** 悬浮球 · 吸边 · 半隐藏 · 安全区

**验收**

- [ ] 避开安全区
- [ ] 滚动后复现
- [ ] 键盘可移动

#### 070 · 悬浮按钮随滚动收展

向下滚动收缩成圆形图标，向上滚动展开文字。

**提示词**

> 做一个悬浮主按钮：向下滚动时收缩成圆形图标，向上滚动或停止后展开文字；展开状态不遮挡列表关键操作。按钮的点击区域在两种形态下保持一致。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-nav-fab) · `app-nav-fab`

**关联 Skill** `uiux-motion-engineering` · `uiux-mobile-patterns`

**标签** 悬浮按钮 · 滚动 · 收缩 · 点击区域

**验收**

- [ ] 点击区域一致
- [ ] 不遮挡内容
- [ ] 键盘可触发

<a id="family-app-3"></a>

### 滚动与动效

#### 071 · 背景自适应反色

悬浮元素按背后区域亮度自动反色，滚动时连续过渡。

**提示词**

> 悬浮元素按背后区域的亮度自动反色，滚动时连续过渡，不做硬切；在浅色和深色图片上都要保持可读。只改变前景颜色，不改变元素位置。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-scroll-contrast) · `app-scroll-contrast`

**关联 Skill** `uiux-design-system` · `uiux-accessibility-review`

**标签** 反色 · 对比度 · 滚动 · 连续

**验收**

- [ ] 两端都够对比
- [ ] 过渡无闪烁
- [ ] 不改变位置

#### 072 · 顶部天气条下拉展开

下拉跟手展开逐小时天气，上划收起。

**提示词**

> 做一条顶部天气条：下拉时跟手展开逐小时天气，上划收起；松手根据距离吸附到展开或收起，天气条收起时仍显示当前温度。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-weather-pull) · `app-weather-pull`

**关联 Skill** `uiux-mobile-patterns` · `uiux-motion-engineering`

**标签** 天气 · 下拉 · 逐小时 · 吸附

**验收**

- [ ] 跟手展开
- [ ] 松手吸附
- [ ] 收起仍可读

#### 073 · 滚动绑定动画进度

动画进度绑定滚动位置，滚动可逆，停住时停在对应进度。

**提示词**

> 把一段动画的进度绑定滚动位置，滚动可逆；停住时动画停在对应进度，不自动补播。顶部显示进度条，键盘 PageUp/PageDown 也能驱动。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-scroll-progress) · `app-scroll-progress`

**关联 Skill** `uiux-motion-engineering` · `uiux-interaction-spec`

**标签** 滚动驱动 · 进度 · 可逆 · 停住

**验收**

- [ ] 滚动可逆
- [ ] 停住不回放
- [ ] 键盘可驱动

#### 074 · 滚动拖影模糊

列表滚动时按速度加方向性模糊，速度归零平滑恢复。

**提示词**

> 列表滚动时按速度给内容加方向性模糊，速度归零后平滑恢复清晰；模糊只影响视觉，不改变可读文本和点击位置。减少动态时关闭模糊。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-scroll-blur) · `app-scroll-blur`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 速度模糊 · 滚动 · 恢复 · 性能

**验收**

- [ ] 停止后清晰
- [ ] 点击位置不变
- [ ] 减少动态关闭

#### 075 · 换列数走弧线

网格列数变化时，每一项沿弧线移动到新位置，相邻项错开延迟。

**提示词**

> 网格列数变化时，每一项沿弧线移动到新位置，相邻项错开延迟；用 FLIP 记录前后位置，动画中不改变布局占位。减少动态时直接换布局。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-scroll-reflow) · `app-scroll-reflow`

**关联 Skill** `uiux-motion-engineering` · `uiux-component-engineering`

**标签** FLIP · 弧线 · 网格 · 错峰

**验收**

- [ ] 布局无跳动
- [ ] 错峰可感知
- [ ] 减少动态直达

#### 076 · 捏合改网格密度

按缩放比在大图、三列、文字行三档之间切换，每项连续移动到新位置。

**提示词**

> 给网格加双指捏合的语义缩放：按缩放比在大图、三列、文字行三档之间切换，每一项连续移动到新位置；把手势模拟为可调滑杆，键盘也能切档。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-scroll-pinch) · `app-scroll-pinch`

**关联 Skill** `uiux-motion-engineering` · `uiux-mobile-patterns`

**标签** 捏合 · 网格 · 密度 · 连续移动

**验收**

- [ ] 三档布局正确
- [ ] 移动连续
- [ ] 有滑杆替代

#### 077 · 双列错位滚动

左右两列同时上滚，左快右慢，滚到底部自动对齐。

**提示词**

> 做两列内容同时上滚，左列快、右列慢，图片产生错位时差；滚到底部时两列自动对齐，不要因为速度差留下空白。滚动由外层容器驱动，内部不劫持。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-scroll-parallax) · `app-scroll-parallax`

**关联 Skill** `uiux-motion-engineering` · `uiux-page-planning`

**标签** 视差 · 双列 · 错位 · 对齐

**验收**

- [ ] 底部对齐
- [ ] 不劫持滚动
- [ ] 减少动态同时滚

#### 078 · 下拉放大顶图

到顶继续下拉时顶图按距离放大，覆盖文字淡出，松手阻尼回弹。

**提示词**

> 滚动到顶继续下拉时，顶部大图按下拉距离放大，覆盖文字同步淡出；松手带阻尼回弹。下拉距离超过阈值才触发刷新，未超过时只回弹。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-scroll-pull) · `app-scroll-pull`

**关联 Skill** `uiux-motion-engineering` · `uiux-mobile-patterns`

**标签** 下拉 · 放大 · 刷新 · 阻尼

**验收**

- [ ] 阈值可区分
- [ ] 回弹平滑
- [ ] 刷新状态可见

#### 079 · 选中聚焦，其余退后

选中项放大提亮，同层未选中项降低饱和度并轻微缩小和模糊。

**提示词**

> 选中项放大提亮，同层未选中项降低饱和度并轻微缩小和模糊；点击空白处恢复全部。被弱化的项仍需可读、可点击，不能只靠颜色区分选中。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-scroll-focus) · `app-scroll-focus`

**关联 Skill** `uiux-interaction-spec` · `uiux-accessibility-review`

**标签** 聚焦 · 降饱和 · 选中 · 可点击

**验收**

- [ ] 未选中仍可读
- [ ] 选中不只靠颜色
- [ ] 空白恢复

#### 080 · 左栏日期吸住

左侧大号日期固定，右侧日程滚动，下一日日期平滑推入。

**提示词**

> 左侧窄栏放大号日期，右侧是日程；滚动时日期栏固定在顶部，下一日日期平滑推入切换。日期切换要与右侧分组对齐，不能提前或滞后。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-scroll-sticky) · `app-scroll-sticky`

**关联 Skill** `uiux-page-planning` · `uiux-mobile-patterns`

**标签** 吸顶 · 日期 · 日程 · 分组

**验收**

- [ ] 日期与分组对齐
- [ ] 吸顶不遮内容
- [ ] 键盘可滚动

<a id="family-app-4"></a>

### 卡片

#### 081 · 底部把手拖拽展开

按住卡片底部把手向上拖动，逐步显示更多内容，松手吸附。

**提示词**

> 给卡片添加底部拖拽展开交互：手势距离同步控制内容高度和封面尺寸，松手后根据阈值吸附到展开或收起状态；拖到一半反向可以取消。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-card-dragsheet) · `app-card-dragsheet`

**关联 Skill** `uiux-motion-engineering` · `uiux-mobile-patterns`

**标签** 拖拽 · 卡片 · 吸附 · 取消

**验收**

- [ ] 高度跟手
- [ ] 阈值吸附
- [ ] 中途可取消

#### 082 · 共享元素转场

卡片外框和核心信息平滑移动到详情对应位置。

**提示词**

> 给卡片添加共享元素转场：卡片的位置、尺寸和圆角连续过渡到详情页的对应位置，核心信息移动到详情中的对应位置，避免整体缩放文字；关闭时反向恢复。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-card-shared) · `app-card-shared`

**关联 Skill** `uiux-motion-engineering` · `uiux-interaction-spec`

**标签** 共享元素 · 转场 · 圆角 · 反向

**验收**

- [ ] 文字不整体缩放
- [ ] 关闭恢复
- [ ] 减少动态直接切换

#### 083 · 横滑吸附卡片

横向滑动保留相邻卡片预览，松手吸附到完整卡片。

**提示词**

> 做一组横向滑动卡片：保留相邻卡片的部分预览，滑动时松手自动吸附到一张完整卡片；每次滑动自然停在整卡位置，页码指示同步。键盘左右键也能切换。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-card-snap) · `app-card-snap`

**关联 Skill** `uiux-component-engineering` · `uiux-motion-engineering`

**标签** 横滑 · 吸附 · 卡片 · 页码

**验收**

- [ ] 停在整卡
- [ ] 相邻卡可见
- [ ] 键盘可切换

#### 084 · 加号卡片飞入底栏

点击加号时卡片缩成圆形，沿弧线飞入底栏行程图标，角标加一。

**提示词**

> 点击加号时，卡片缩成圆形，沿弧线飞入底栏行程图标，图标弹跳，角标数字加一；飞行中卡片不可重复点击，结束后状态立即生效。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-card-flydock) · `app-card-flydock`

**关联 Skill** `uiux-motion-engineering` · `uiux-component-engineering`

**标签** 飞入 · 底栏 · 角标 · 弧线

**验收**

- [ ] 角标准确
- [ ] 不可重复触发
- [ ] 减少动态直接加一

#### 085 · 卡片堆叠层级

上滑时顶部卡片堆叠，层级随剩余数量调整。

**提示词**

> 做一组堆叠卡片：上滑时顶部卡片移出，后面的卡片依次上前，缩放和透明度随剩余数量调整；下滑可回看上一张。卡片层级与可点击区域必须一致，不能点到被盖住的卡片。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-card-stack) · `app-card-stack`

**关联 Skill** `uiux-motion-engineering` · `uiux-component-engineering`

**标签** 卡片 · 堆叠 · 层级 · 上滑

**验收**

- [ ] 层级与点击一致
- [ ] 回看可逆
- [ ] 快速滑动不卡

#### 086 · 卡片沿曲线飞向删除

删除时卡片沿曲线飞向删除图标，同步缩小降透明。

**提示词**

> 删除卡片时，卡片沿一条曲线飞向右上角的删除图标，同步缩小并降低透明度，图标在接住时弹一下；其余卡片平滑补位。撤销入口保留在提示条里，不能只靠动画表达删除成功。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-card-delete) · `app-card-delete`

**关联 Skill** `uiux-motion-engineering` · `uiux-interaction-spec`

**标签** 删除 · 曲线 · 缩小 · 撤销

**验收**

- [ ] 撤销可恢复
- [ ] 其他卡片补位
- [ ] 减少动态时直接移除

#### 087 · 卡片展开成全屏详情

卡片从原位置放大成详情，文字从底部滑入，下拉缩回。

**提示词**

> 点击卡片时，卡片从原位置放大展开成全屏详情，文字内容从底部错层滑入；下拉手势跟手缩回原卡片位置。关闭后滚动位置和卡片状态保持不变。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-card-fullscreen) · `app-card-fullscreen`

**关联 Skill** `uiux-motion-engineering` · `uiux-mobile-patterns`

**标签** 全屏详情 · 卡片 · 共享位置 · 下拉

**验收**

- [ ] 回到原位置
- [ ] 滚动位置保持
- [ ] Esc 可关闭

#### 088 · 立体翻面卡片

点击绕竖轴 3D 翻转，高光随指针位置变化。

**提示词**

> 做一个带透视的 3D 翻转卡片：点击绕竖轴翻转切换正反面，背面内容不能镜像；指针移动时柔和高光跟随。键盘 Enter/Space 可翻转，减少动态时直接切换内容。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-card-flip) · `app-card-flip`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 3D · 翻转 · 透视 · 高光

**验收**

- [ ] 背面不镜像
- [ ] 键盘可翻
- [ ] 减少动态可读

<a id="family-app-5"></a>

### 控件

#### 089 · 滑杆吸附与过冲

松手后惯性过冲，再被刻度拉回，模拟重量手感。

**提示词**

> 做一个带刻度的滑杆：拖动时跟手，松手后按速度产生一次轻微惯性过冲，再被最近的刻度拉回。刻度标签同步高亮，键盘左右键逐格移动，Home/End 到两端。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-slider-snap) · `app-slider-snap`

**关联 Skill** `uiux-motion-engineering` · `uiux-component-engineering`

**标签** 滑杆 · 刻度 · 过冲 · 手感

**验收**

- [ ] 松手结果落在刻度
- [ ] 快速拖动不丢状态
- [ ] 键盘逐格

#### 090 · 环形读数平滑停住

数字变化时环形进度同步增长，最后平滑停住。

**提示词**

> 做一个环形读数：数值变化时圆环进度同步增长，数字滚动到新值，最后平滑停住。超过目标时换一种颜色并显示超出量；重置后立即回到起点。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-ring-readout) · `app-ring-readout`

**关联 Skill** `uiux-motion-engineering` · `uiux-design-system`

**标签** 环形 · 读数 · 数字滚动 · 停住

**验收**

- [ ] 数值与弧长一致
- [ ] 超目标有区分
- [ ] 键盘可调整

#### 091 · 联动滑杆与读数

轨道、滑钮、数值和环形读数同步变化。

**提示词**

> 做一个联动滑杆：拖动时轨道填充、滑钮位置、数值文字和右侧环形读数同步变化，松手后数值吸附到整数。所有控件共用同一状态，不能出现一个动另一个滞后。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-slider-linked) · `app-slider-linked`

**关联 Skill** `uiux-component-engineering` · `uiux-design-system`

**标签** 联动 · 滑杆 · 环形 · 同一状态

**验收**

- [ ] 四处显示一致
- [ ] 整数吸附
- [ ] 键盘同步

#### 092 · 轮播指示点连续过渡

当前项拉长成短条，随滑动进度在相邻两点间连续过渡。

**提示词**

> 做轮播指示点：当前项拉长成短条，随滑动进度在相邻两点之间连续过渡；松手后吸附到目标点，点击指示点也能切换。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-carousel-dots) · `app-carousel-dots`

**关联 Skill** `uiux-motion-engineering` · `uiux-component-engineering`

**标签** 轮播 · 指示点 · 连续 · 吸附

**验收**

- [ ] 跟随滑动
- [ ] 点击可切
- [ ] 键盘可切

#### 093 · 双头范围滑块

两个把手之间伸缩填充，拖动时浮出实时数值。

**提示词**

> 做一个双头范围滑块：两个把手之间的填充随拖动伸缩，拖动任一把手时上方浮出实时数值标签，松手后收回。两个把手不能交叉，键盘分别调整起止值。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-range-dual) · `app-range-dual`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 范围 · 双把手 · 实时数值 · 键盘

**验收**

- [ ] 把手不交叉
- [ ] 起止值可分别调整
- [ ] 浮层不挡操作

#### 094 · 拖动连选时间段

按住拖动连选多个时段，合并成条，两端可单独调整。

**提示词**

> 做一个时间段选择器：按住拖动连选多个半小时时段，合并成一条连续色条；两端把手可单独调整，起止时间实时更新。点击已选时段可取消该段，键盘可逐格扩展。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-time-range) · `app-time-range`

**关联 Skill** `uiux-component-engineering` · `uiux-mobile-patterns`

**标签** 时间段 · 连选 · 合并 · 把手

**验收**

- [ ] 起止时间正确
- [ ] 取消时段可逆
- [ ] 键盘可扩展

#### 095 · 音量条橡皮筋

按住变粗，填充跟手，拖过端点拉出橡皮筋，松手回弹。

**提示词**

> 做一条音量调节条：按住时轨道变粗，填充跟手；拖过 0 或 100 时出现橡皮筋拉伸，松手回弹到端点。拖动时显示当前数值，但不要每帧都让读屏播报。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-volume-rubber) · `app-volume-rubber`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 音量 · 橡皮筋 · 端点 · 回弹

**验收**

- [ ] 越过端点有阻力
- [ ] 松手回端点
- [ ] 读屏不刷屏

#### 096 · 字号刻度实时预览

键盘顶部排布字号刻度，拖动时正文实时改大小。

**提示词**

> 在输入键盘上方做一条字号刻度条，拖动滑块实时改变预览文字字号，并显示当前字号。松手后吸附到常用档位（14/16/18/20/24），键盘保持可操作。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-font-slider) · `app-font-slider`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 字号 · 刻度 · 实时预览 · 键盘

**验收**

- [ ] 字号与数值一致
- [ ] 吸附档位
- [ ] 键盘不被遮挡

<a id="family-app-6"></a>

### 面板与弹层

#### 097 · 不压暗的底部面板

面板升起但不加遮罩，背后页面仍可滚动点击。

**提示词**

> 做一个底部弹出面板：不加遮罩层，背后页面保持可滚动和可点击；0.55 秒内用指定缓动升起。下拽超过 40px 或点击面板外部时收起。面板内要有明确的关闭按钮，焦点进入面板后可返回触发点。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-sheet-nondim) · `app-sheet-nondim`

**关联 Skill** `uiux-interaction-spec` · `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 底部面板 · 无遮罩 · 拖拽 · 焦点

**验收**

- [ ] 背后页面可用
- [ ] 拖拽阈值明确
- [ ] 关闭后焦点复位

#### 098 · 顶部计时小条

离开页面时横向撑开显示剩余时间，点击展开成操作卡片，数秒无操作自动收回。

**提示词**

> 做一个顶部计时小条：离开页面时横向撑开显示剩余时间；点击展开成操作卡片，数秒无操作自动收回。计时必须基于真实时间戳，页面不可见时也不能停走。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-timer-bar) · `app-timer-bar`

**关联 Skill** `uiux-interaction-spec` · `uiux-component-engineering`

**标签** 计时 · 顶部条 · 自动收回 · 真实时间

**验收**

- [ ] 切页后时间正确
- [ ] 自动收回可暂停
- [ ] 键盘可展开

#### 099 · 分步底部弹窗

切换步骤时内容横向滑动，弹窗高度平滑过渡。

**提示词**

> 做一个分步底部弹窗：切换步骤时内容横向滑动，弹窗高度随内容平滑过渡；上一步/下一步按钮状态同步，最后一步变成完成。关闭再打开时回到第一步。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-step-sheet) · `app-step-sheet`

**关联 Skill** `uiux-component-engineering` · `uiux-motion-engineering`

**标签** 分步 · 底部弹窗 · 高度 · 完成

**验收**

- [ ] 高度不跳变
- [ ] 步骤状态正确
- [ ] 关闭重置

#### 100 · 分类标签展开成网格

单行标签展开为网格，选中后收回并居中。

**提示词**

> 做一排分类标签：点击「更多」后单行展开为网格，选中某项后网格收回，被选项居中；再次打开时保持当前选择可见。展开与收回过程中页面不要跳动。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-category-grid) · `app-category-grid`

**关联 Skill** `uiux-motion-engineering` · `uiux-mobile-patterns`

**标签** 分类 · 网格 · 展开 · 居中

**验收**

- [ ] 页面不跳动
- [ ] 选中项可见
- [ ] 键盘可遍历

#### 101 · 结算栏弹出清单

点击结算栏后从栏上方展开清单，再点收回。

**提示词**

> 做一个底部结算栏：点击后从栏上方展开商品清单，再点收回；展开时栏本身不移动，清单高度随商品数量变化。金额合计始终可见，键盘可以展开和关闭。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-checkout-sheet) · `app-checkout-sheet`

**关联 Skill** `uiux-component-engineering` · `uiux-interaction-spec`

**标签** 结算 · 清单 · 展开 · 合计

**验收**

- [ ] 合计始终可见
- [ ] 展开不推走栏
- [ ] 键盘可开关

#### 102 · 气泡提示自动收回

带指向箭头的气泡数秒后自动收回。

**提示词**

> 做一个带指向箭头的气泡提示：出现在目标元素上方，数秒后自动收回；鼠标悬停或聚焦时暂停计时，离开后继续。提示不能被裁切，箭头始终指向目标。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-tooltip-auto) · `app-tooltip-auto`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 气泡 · 箭头 · 自动收回 · 暂停

**验收**

- [ ] 箭头指向目标
- [ ] 聚焦可读
- [ ] 不被裁切

#### 103 · 确认弹窗回弹后原地完成

弹窗带轻微回弹，确认后原地切换为完成状态。

**提示词**

> 做一个确认弹窗：弹出时带轻微回弹，确认后不关闭再开新弹窗，而是在原地切换为完成状态并显示对勾；取消则收回原按钮。焦点在弹窗内循环，确认结果可被读屏播报。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-confirm-spring) · `app-confirm-spring`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 确认 · 回弹 · 完成态 · 焦点

**验收**

- [ ] 焦点不逃出弹窗
- [ ] 完成态可逆
- [ ] 结果被播报

#### 104 · 日期弹出日历

日历从标签下方展开，选中后收回并更新文字。

**提示词**

> 做一个日期选择：点击日期标签后日历从标签下方展开，选中日期后收回并更新标签文字；点击外部或 Esc 关闭。今天的日期有明确标记，键盘方向键可移动日期。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-calendar-pop) · `app-calendar-pop`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 日期 · 日历 · 弹出 · 键盘

**验收**

- [ ] 选中后更新文字
- [ ] 今天有标记
- [ ] Esc 关闭

#### 105 · 撕线取票面板

底部虚线撕口，下拉沿虚线展开取票码，松手回弹。

**提示词**

> 做一个取票面板：底部有虚线撕口，按住下拉时面板沿虚线展开露出取票码，松手根据距离回弹或保持展开；再上推合上。虚线在展开过程中保持连续，不要变成普通边框。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-ticket-tear) · `app-ticket-tear`

**关联 Skill** `uiux-motion-engineering` · `uiux-interaction-spec`

**标签** 取票 · 撕线 · 下拉 · 回弹

**验收**

- [ ] 展开与合上可逆
- [ ] 阈值明确
- [ ] 码可被复制

#### 106 · 下拉以选中项对齐

展开时以当前选中项为中心对齐，选中后收回并更新框内文字。

**提示词**

> 做移动端下拉选择：展开时列表以当前选中项为中心对齐，选中后收回并更新框内文字；选项较多时列表在视口内滚动，选中项保持可见。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-select-align) · `app-select-align`

**关联 Skill** `uiux-component-engineering` · `uiux-mobile-patterns`

**标签** 下拉 · 对齐 · 选中项 · 滚动

**验收**

- [ ] 选中项居中
- [ ] 收回更新文字
- [ ] 键盘可选

#### 107 · 照片抽屉

照片放大铺满上半屏，面板从底部升起压住下沿；上拖时照片缩成窄条。

**提示词**

> 做一个照片抽屉：打开时照片放大铺满上半屏，面板从底部升起压住照片下沿；上拖面板时照片同步缩成窄条，下拽则重新铺开。照片与面板的高度始终互补，不能出现空隙。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-photo-drawer) · `app-photo-drawer`

**关联 Skill** `uiux-motion-engineering` · `uiux-mobile-patterns`

**标签** 照片 · 抽屉 · 高度互补 · 拖拽

**验收**

- [ ] 照片与面板无空隙
- [ ] 拖拽跟手
- [ ] 关闭可逆

<a id="family-app-7"></a>

### 排序与拖拽

#### 108 · 拖动自动吸附参考线

接近参考线时自动吸附并显示对齐线，吸附瞬间有轻微顿挫。

**提示词**

> 拖拽卡片时检测它与参考线的距离，进入阈值后自动吸附并显示对齐线；吸附瞬间给一次轻微的位移顿挫，离开阈值后恢复自由拖动。参考线要跟随容器尺寸计算。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-sort-snap) · `app-sort-snap`

**关联 Skill** `uiux-motion-engineering` · `uiux-component-engineering`

**标签** 吸附 · 参考线 · 拖拽 · 顿挫

**验收**

- [ ] 阈值可调
- [ ] 吸附不锁死
- [ ] 键盘可微调

#### 109 · 拖过分隔线固定

拖到顶部分隔线以上，松手后成为常用项。

**提示词**

> 菜单项支持按住拖动排序。拖动时该项轻微放大，其余项平滑让位；松手吸附到新位置。拖到顶部分隔线以上时显示固定区高亮，松手后把该项固定为常用项；向下拖出固定区则取消固定。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-sort-favorite) · `app-sort-favorite`

**关联 Skill** `uiux-component-engineering` · `uiux-interaction-spec`

**标签** 拖拽 · 常用项 · 分隔线 · 吸附

**验收**

- [ ] 固定区与普通区分开
- [ ] 跨越分隔线有明确提示
- [ ] 取消固定可逆

#### 110 · 拖拽排序，其余让位

按住一行浮起，其他行连续让位，松手吸附到新位置。

**提示词**

> 做一个可拖动排序的列表。长按一行后该项轻微放大并浮起，拖动时其余项平滑让位，松手吸附到新位置。支持键盘 Alt+方向键移动，并给拖动项保留清晰的阴影和层级。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-sort-basic) · `app-sort-basic`

**关联 Skill** `uiux-component-engineering` · `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 拖拽 · 排序 · 弹簧 · 键盘

**验收**

- [ ] 拖动中顺序实时更新
- [ ] 松手位置可预测
- [ ] 键盘可完成同一操作

<a id="family-app-8"></a>

### 手势

#### 111 · 边缘滑动返回，看速度

不只判断距离，还读取松手速度与方向决定继续或取消。

**提示词**

> 实现边缘滑动返回：读取松手时的速度与方向，快速外甩则继续返回，往回带则取消；加入阻力曲线、阴影位移和进度条。支持中途反向取消，禁用时不破坏页面滚动。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-gesture-edge) · `app-gesture-edge`

**关联 Skill** `uiux-motion-engineering` · `uiux-mobile-patterns` · `uiux-accessibility-review`

**标签** 手势 · 返回 · 速度 · 取消

**验收**

- [ ] 速度阈值可调
- [ ] 中途可反向
- [ ] 有键盘替代

#### 112 · 横竖滑动锁定

初始 12px 内判断主方向，锁定后不再切换。

**提示词**

> 图片详情同时支持横滑翻页和竖滑关闭：初始 12px 内计算主方向，锁定后不再切换；dx>dy+阈值则横滑，反之竖滑，锁定后允许小幅反向容错。不要让页面滚动同时抢手势。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-gesture-axis) · `app-gesture-axis`

**关联 Skill** `uiux-motion-engineering` · `uiux-mobile-patterns`

**标签** 方向锁定 · 横滑 · 竖滑 · 冲突

**验收**

- [ ] 一次只锁一个方向
- [ ] 容错不跳变
- [ ] 有按钮替代

#### 113 · 接住飞出去的卡片

惯性滑动中再次触摸立即停止动画并接管拖拽。

**提示词**

> 卡片惯性滑动中，再次触摸立即停止动画并把控制权交给手指；支持拖拽归位或删除，摩擦系数 0.92–0.96，不能出现动画锁死。松手后可以继续惯性。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-gesture-catch) · `app-gesture-catch`

**关联 Skill** `uiux-motion-engineering` · `uiux-interaction-spec`

**标签** 惯性 · 接管 · 触摸 · 摩擦

**验收**

- [ ] 触摸即停
- [ ] 可继续拖
- [ ] 不锁死

#### 114 · 可逃逸按钮

手指移出热区就取消提交，松手只在热区内触发。

**提示词**

> 实现可逃逸按钮：按下时加深/缩放，手指移出热区后逐渐变浅并取消提交；松手仅在热区内触发。热区比视觉按钮大 20%，移出距离超过阈值时 commit=false，不需要二次确认弹窗。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-gesture-escape) · `app-gesture-escape`

**关联 Skill** `uiux-interaction-spec` · `uiux-accessibility-review`

**标签** 手势 · 取消 · 热区 · 提交

**验收**

- [ ] 移出即取消
- [ ] 热区大于视觉
- [ ] 键盘可提交

#### 115 · 拉到头还能再拉

边界继续拉动有非线性阻力，松手弹簧回弹。

**提示词**

> 列表到顶/底后继续拉动产生非线性阻力（阻力=1/(1+offset/limit)），松手用弹簧平滑回弹；禁止无限拉伸，并与下拉刷新兼容。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-gesture-rubber) · `app-gesture-rubber`

**关联 Skill** `uiux-motion-engineering` · `uiux-mobile-patterns`

**标签** 橡皮筋 · 边界 · 弹簧 · 下拉刷新

**验收**

- [ ] 阻力非线性
- [ ] 回弹不过冲
- [ ] 刷新可触发

#### 116 · 松手前预知落点

拖拽中实时预测目标索引并高亮指示器。

**提示词**

> 横向卡片轮播时，拖拽中根据速度和偏移实时预测目标索引，提前高亮页码/指示器；支持加力多翻一页。松手后直接落到预测位置，不要冲过头再回弹。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-gesture-project) · `app-gesture-project`

**关联 Skill** `uiux-motion-engineering` · `uiux-mobile-patterns`

**标签** 预测 · 轮播 · 指示器 · 速度

**验收**

- [ ] 预测与落点一致
- [ ] 可多翻一页
- [ ] 无过冲

#### 117 · 只让变化的字动

切换筛选或计数时只对变化字符做翻牌/滚动。

**提示词**

> 切换筛选或计数时，只对变化的字符做翻牌或滚动动画，不变字符保持原位。新旧文本逐字符 diff，数字用滚动、文字用淡入位移，动画 200–350ms，一眼能看出改动位置。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-gesture-diff) · `app-gesture-diff`

**关联 Skill** `uiux-motion-engineering` · `uiux-component-engineering`

**标签** 文字动画 · diff · 数字滚动 · 筛选

**验收**

- [ ] 不变字符不动
- [ ] 时长可控
- [ ] 读屏文本完整

<a id="family-app-9"></a>

### 输入与反馈

#### 118 · 表单错误轻晃滑入

出错时输入框轻晃、边框变红，提示从下方滑入。

**提示词**

> 表单校验失败时，输入框轻晃一次，边框变红，错误提示从下方滑入；修正后提示收起。晃动不要循环，错误文字要与输入框通过 aria-describedby 关联。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-input-error) · `app-input-error`

**关联 Skill** `uiux-accessibility-review` · `uiux-motion-engineering`

**标签** 表单 · 错误 · 晃动 · aria-describedby

**验收**

- [ ] 只晃一次
- [ ] 修正后收起
- [ ] 读屏关联错误

#### 119 · 动态搜索框

点击输入区边框高亮，标签上移缩小。

**提示词**

> 做一个动态搜索框：点击输入区时边框高亮，占位标签上移缩小；输入时显示清空按钮和结果计数，按 Esc 收起并恢复标签。搜索本身不能因动画延迟。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-search-dynamic) · `app-search-dynamic`

**关联 Skill** `uiux-component-engineering` · `uiux-mobile-patterns`

**标签** 搜索 · 聚焦 · 标签 · 清空

**验收**

- [ ] 输入即过滤
- [ ] Esc 复原
- [ ] 清空按钮可聚焦

#### 120 · 浮动标题输入框

聚焦时提示文字缩小上移成标题，为空失焦时复原。

**提示词**

> 做一个浮动标题输入框：聚焦时提示文字缩小并上移成标题，边框高亮；已经输入内容时失焦保持标题在上方，为空失焦则复原。错误状态要同时改变边框、图标和文字，不只靠颜色。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-input-floating) · `app-input-floating`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 输入框 · 浮动标签 · 焦点 · 错误

**验收**

- [ ] 标签不遮挡输入
- [ ] 空值失焦复原
- [ ] 错误不只靠颜色

#### 121 · 复制按钮翻转成对勾

点击后图标翻面，弹出已复制提示，一秒后复原。

**提示词**

> 做一个复制按钮：点击后图标沿水平轴翻面成对勾，旁边弹出「已复制」提示，一秒后自动复原。复制失败时显示另一种提示，不要把失败也画成对勾。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-copy-flip) · `app-copy-flip`

**关联 Skill** `uiux-component-engineering` · `uiux-motion-engineering`

**标签** 复制 · 翻转 · 成功反馈 · 失败状态

**验收**

- [ ] 失败与成功可区分
- [ ] 一秒后复原
- [ ] 读屏收到结果

#### 122 · 输入联想与键盘选择

输入时弹出联想列表，高亮命中内容，上下键选择。

**提示词**

> 做一个输入联想：输入时弹出建议列表并高亮匹配文字，支持上下键移动、回车确认、Esc 关闭。没有匹配时说明可以新建，不要把空列表当成加载中。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-input-autocomplete) · `app-input-autocomplete`

**关联 Skill** `uiux-component-engineering` · `uiux-accessibility-review`

**标签** 联想 · 高亮 · 键盘 · 空状态

**验收**

- [ ] 键盘可完成选择
- [ ] 空状态明确
- [ ] Esc 恢复焦点

#### 123 · 长按录音，滑动取消

长按麦克风展开进度条，松手结束，滑动可取消。

**提示词**

> 做一个长按录音条：长按麦克风后展开计时和波形，松手结束；按住向上滑动超过阈值取消录音，并给出明确提示。展开过程中不能挡住输入框，错误和取消都要能读屏播报。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-record-hold) · `app-record-hold`

**关联 Skill** `uiux-mobile-patterns` · `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 录音 · 长按 · 滑动取消 · 计时

**验收**

- [ ] 取消与结束可区分
- [ ] 松手状态正确
- [ ] 键盘有替代操作

<a id="family-app-10"></a>

### 页面场景

#### 124 · 不压暗的日记面板

底部面板不加遮罩，背后页面可滚动，下拽超 40px 或点外部收起。

**提示词**

> 日记页底部弹出编辑面板，不加遮罩层，背后页面保持可滚动点击；0.55 秒内用指定曲线升起，下拽超过 40px 或点击外部收起。保存后更新当天记录。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-diary-sheet) · `app-diary-sheet`

**关联 Skill** `uiux-interaction-spec` · `uiux-mobile-patterns`

**标签** 日记 · 面板 · 无遮罩 · 保存

**验收**

- [ ] 背后可滚动
- [ ] 阈值收起
- [ ] 保存更新记录

#### 125 · 大标题跟着选项换

三行大标题分别绑定心情、天气、星期，只更新对应行。

**提示词**

> 三行大标题每行绑定一个选项（心情、天气、星期），选项变化时只更新对应那行文字，其余行保持不动；文字长度变化不能导致下方内容跳动。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-diary-title) · `app-diary-title`

**关联 Skill** `uiux-motion-engineering` · `uiux-page-planning`

**标签** 大标题 · 选项 · 逐行更新 · 不跳动

**验收**

- [ ] 只改对应行
- [ ] 布局不跳
- [ ] 选项可键盘切换

#### 126 · 数字卡压住头图

三格数字卡用负外边距压住头图下沿，上滑时头图压缩、数字卡吸顶。

**提示词**

> 首页头图下方放三格数字卡，用负上外边距让它上移半个卡高压住头图下沿；上滑时头图压缩只剩标题，数字卡吸在顶部，其余内容从下方穿过。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-diary-numbers) · `app-diary-numbers`

**关联 Skill** `uiux-page-planning` · `uiux-mobile-patterns`

**标签** 头图 · 数字卡 · 负边距 · 吸顶

**验收**

- [ ] 不遮标题
- [ ] 吸顶不跳
- [ ] 内容可读

#### 127 · 头图左右滑翻篇

横向位移超 44px 切换记录，只有头图和大标题切换，下方列表不动。

**提示词**

> 头图区加左右滑动手势：横向位移超过 44px 切换记录，只有头图和大标题切换，下方列表不动；滑到首尾提示已到最新/最早一篇。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-diary-swipe) · `app-diary-swipe`

**关联 Skill** `uiux-motion-engineering` · `uiux-mobile-patterns`

**标签** 横滑 · 翻篇 · 头图 · 边界

**验收**

- [ ] 列表不动
- [ ] 首尾有提示
- [ ] 按钮可替代

#### 128 · 月历空格直接补写

有记录日期显彩色圆加贴纸，空格显虚线圈加号，点空格直接编辑。

**提示词**

> 做五周月历网格：有记录的日期显示彩色圆加贴纸，空日期显示虚线圈加号；点空格直接弹出编辑面板，保存后月历对应格立即更新，不跳转新页面。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-diary-calendar) · `app-diary-calendar`

**关联 Skill** `uiux-mobile-patterns` · `uiux-component-engineering`

**标签** 月历 · 空状态 · 编辑 · 即时更新

**验收**

- [ ] 空格可编辑
- [ ] 保存即更新
- [ ] 键盘可遍历

<a id="family-app-11"></a>

### 移动组件

#### 129 · 弹性开关

滑钮起步横向拉长，滑到终点再恢复形状。

**提示词**

> 做弹性开关：切换时滑钮起步横向拉长，滑到终点再恢复形状；轨道颜色和文字状态同步。开关必须有 role=switch、aria-checked，并支持 Space 切换。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-kit-switch) · `app-kit-switch`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 开关 · 弹性 · role=switch · 键盘

**验收**

- [ ] 状态可读
- [ ] 拉长可关闭
- [ ] Space 可切换

#### 130 · 底部操作栏预留安全区

固定吸底，左侧信息、右侧主按钮，预留安全区高度。

**提示词**

> 做固定吸底的移动端底部操作栏：左侧展示合计信息，右侧放主操作按钮；用 safe-area-inset-bottom 预留安全区，内容滚动到底部时不被遮挡。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-kit-bottombar) · `app-kit-bottombar`

**关联 Skill** `uiux-mobile-patterns` · `uiux-design-system`

**标签** 底部栏 · 安全区 · 主按钮 · 吸底

**验收**

- [ ] 不遮内容
- [ ] 安全区生效
- [ ] 主按钮可聚焦

#### 131 · 多功能操作卡片

集成加减控件、开关、滑块，本地操作实时反馈，不跳页。

**提示词**

> 做一张多功能操作卡片：集成加减控件、开关和滑块，所有操作在本地实时反馈，不跳转页面；每个控件有独立状态和清晰标签，重置按钮恢复到初始值。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-kit-operation) · `app-kit-operation`

**关联 Skill** `uiux-component-engineering` · `uiux-mobile-patterns`

**标签** 操作卡 · 步进器 · 开关 · 滑块

**验收**

- [ ] 状态独立
- [ ] 重置可逆
- [ ] 键盘可操作

#### 132 · 分段控件滑块跟随

选中块先拉长再滑动再收回，内容区横向联动。

**提示词**

> 做移动端分段控件：切换时选中块先拉长、再滑动、再收回，内容区横向联动切换。分段数量变化时滑块宽度自适应，键盘左右键可切换。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-kit-segmented) · `app-kit-segmented`

**关联 Skill** `uiux-component-engineering` · `uiux-motion-engineering`

**标签** 分段控件 · 滑块 · 拉长 · 联动

**验收**

- [ ] 滑块与文字对齐
- [ ] 内容同步
- [ ] 键盘可切换

#### 133 · 环形读数与滑杆联动

滑杆拖动时环形进度、数字与颜色同步变化。

**提示词**

> 做一个环形读数控件：滑杆拖动时环形进度、中心数字与颜色同步变化，松手后平滑停住；超过目标值换色并显示超出量。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-kit-ring) · `app-kit-ring`

**关联 Skill** `uiux-design-system` · `uiux-motion-engineering`

**标签** 环形 · 滑杆 · 读数 · 目标

**验收**

- [ ] 弧长与数值一致
- [ ] 超目标有区分
- [ ] 键盘可调

#### 134 · 搜索筛选合并一行

搜索与筛选合并成一行，标签上移缩小，结果实时更新。

**提示词**

> 把移动端搜索与筛选合并成一行：搜索框占主要宽度，右侧筛选按钮打开面板；聚焦时标签上移缩小，输入时结果实时更新并显示数量。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-kit-search) · `app-kit-search`

**关联 Skill** `uiux-mobile-patterns` · `uiux-component-engineering`

**标签** 搜索 · 筛选 · 合并 · 实时

**验收**

- [ ] 筛选可用
- [ ] 结果计数
- [ ] 键盘不遮挡

<a id="family-app-12"></a>

### 主题与状态

#### 135 · 按压卡片下沉回弹

按下缩放下沉，松开回弹，阴影从柔和变紧。

**提示词**

> 给卡片加按压反馈：按下时轻微缩小并下沉，阴影收紧；松开后弹回原位。按住移动超出卡片范围时取消按压，回到范围内恢复。键盘 Space/Enter 也能触发一次完整反馈。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-press-card) · `app-press-card`

**关联 Skill** `uiux-motion-engineering` · `uiux-accessibility-review`

**标签** 按压 · 缩放 · 阴影 · 键盘

**验收**

- [ ] 移出取消
- [ ] 快速连按不卡住
- [ ] 减少动态时仍有颜色反馈

#### 136 · 步骤进度先超调再回弹

完成一步时进度条先越过目标再回弹，强化确认感。

**提示词**

> 做一个四步流程的进度指示。完成一步时进度条先超调约 8%，再回弹到准确位置；当前步骤标签同步切换。支持上一步回退，回退时不播放完成态的庆祝效果。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-step-overshoot) · `app-step-overshoot`

**关联 Skill** `uiux-interaction-spec` · `uiux-motion-engineering`

**标签** 步骤 · 超调 · 回弹 · 确认

**验收**

- [ ] 回退可逆
- [ ] 减少动态时直接到位
- [ ] 步骤文字同步

#### 137 · 触点扩散换主题

深色从手指按下的位置圆形扩散，反向沿原路收回。

**提示词**

> 做一个主题切换：以点击或触摸的位置为圆心，新的深色主题用圆形扩散覆盖全屏；覆盖层只做裁切，不缩放、不位移。再次切换时从同一圆心反向收回。底层内容保持原位，覆盖完成后按钮与文字立即可用。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-theme-tap) · `app-theme-tap`

**关联 Skill** `uiux-motion-engineering` · `uiux-design-system` · `uiux-accessibility-review`

**标签** 主题 · 圆形扩散 · 可逆 · 触控

**验收**

- [ ] 正反切换沿同一路径
- [ ] 减少动态时直接切换
- [ ] 主题状态与按钮状态一致

#### 138 · 开关联动只做视觉震动

同组其他开关只震动回应，不改变实际状态。

**提示词**

> 一组四个开关，切换其中一个时，同组其他开关只做轻微视觉震动，不改变它们的真实状态；当前开关正常切换。震动结束后所有状态可被读屏准确读出，不能让人误以为其他项也被打开。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-switch-group) · `app-switch-group`

**关联 Skill** `uiux-accessibility-review` · `uiux-motion-engineering`

**标签** 开关 · 联动 · 震动 · 状态诚实

**验收**

- [ ] 其他开关 aria-checked 不变
- [ ] 震动可关闭
- [ ] 状态文字明确

#### 139 · 开关位置扩散

新主题从深色开关本身向外扩散，像光从灯罩里亮起来。

**提示词**

> 深色模式开关切换时，新主题从开关的位置圆形扩散覆盖全屏；再次切换时反向收回。扩散过程中开关保持可操作，但不要重复触发；字体、底色和卡片阴影在覆盖结束后统一切换，避免中途闪烁。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-theme-switch) · `app-theme-switch`

**关联 Skill** `uiux-motion-engineering` · `uiux-design-system`

**标签** 深色模式 · 开关 · 圆形扩散

**验收**

- [ ] 快速连点不叠层
- [ ] 扩散原点跟随开关
- [ ] 键盘可切换

#### 140 · 批量勾选逐个弹起

全选时按顺序逐个勾选，每项带轻微弹性放大。

**提示词**

> 做一个批量选择列表。点击全选后按顺序逐个勾选，每一项勾选时轻微弹性放大；取消全选时反向逐个取消。单项仍可独立勾选，顶部计数与全选状态实时同步。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-batch-check) · `app-batch-check`

**关联 Skill** `uiux-motion-engineering` · `uiux-component-engineering`

**标签** 批量选择 · 顺序 · 弹性 · 计数

**验收**

- [ ] 快速连点不跳过状态
- [ ] 计数与勾选一致
- [ ] 键盘可操作

#### 141 · 文本展开与箭头翻转

容器高度随文字渐变，箭头同步转 180 度。

**提示词**

> 做可展开文本卡：点击后容器高度随文字内容渐变展开，箭头同步旋转 180 度；收起时高度回到摘要高度，展开状态可被读屏读出。

**现场预览** [在提示词实验室打开](https://harveyxiacn.github.io/uiux-intent-form-motion-lab/#p/app-text-expand) · `app-text-expand`

**关联 Skill** `uiux-motion-engineering` · `uiux-component-engineering`

**标签** 展开 · 高度 · 箭头 · 可逆

**验收**

- [ ] 高度与内容一致
- [ ] 箭头同步
- [ ] 展开状态可读
