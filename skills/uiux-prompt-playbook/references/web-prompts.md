# Web prompts

Generated from `assets/prompts.json`. 58 prompts in 9 families. Each prompt names its live scene, related skills and acceptance checks.

| Family | Prompts |
| --- | --- |
| 按钮 | 8 |
| 版式与布局 | 8 |
| 表单与选择 | 10 |
| 菜单与导航 | 6 |
| 场景组件 | 6 |
| 工作台布局 | 6 |
| 面板与弹层 | 3 |
| 数据可视化 | 7 |
| 网站与组件 | 4 |

## 按钮

### 001 · 按钮变进度条

`web-button-progress` · scene `buttonLab` / `progress`

点击后原地切上传进度，显示百分比，完成后变成功并复位。

**Prompt**

> 做上传按钮：点击后原地切换成进度条，显示实时百分比；完成后变成成功状态，短暂停留自动复位。失败时显示重试，不要假装成功。

**Skills** `uiux-component-engineering` · `uiux-motion-engineering`

**Tags** 上传 · 进度 · 成功 · 失败

**Acceptance**

- 进度真实
- 失败可重试
- 复位可预期

### 002 · 按钮让位

`web-button-yield` · scene `buttonLab` / `yield`

点击主按钮后放大宽度、收窄次要按钮，切换二次确认文案。

**Prompt**

> 做按钮让位：点击主按钮后放大宽度并收窄次要按钮，切换为二次确认文案；再次点击完成并恢复布局。取消时恢复原状。

**Skills** `uiux-interaction-spec` · `uiux-motion-engineering`

**Tags** 按钮 · 让位 · 二次确认 · 恢复

**Acceptance**

- 主次清晰
- 取消恢复
- 键盘可完成

### 003 · 按钮展开面板

`web-button-panel` · scene `buttonLab` / `panel`

点击后圆形裁剪扩展成浮层面板，关闭反向收缩。

**Prompt**

> 做按钮展开面板：点击后通过圆形裁剪扩展成浮层面板，关闭时反向收缩；同步处理层级、点击外部关闭和焦点返回。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 按钮 · 圆形裁剪 · 面板 · 焦点

**Acceptance**

- 层级正确
- 外部可关
- 焦点复位

### 004 · 磁吸跟随

`web-button-magnet` · scene `buttonLab` / `magnet`

按指针距离产生轻微位移，离开后弹性复位。

**Prompt**

> 做磁吸按钮：按指针与按钮中心的距离计算轻微位移，离开交互区后用弹性动画复位；触屏和键盘不启用磁吸，避免误触。

**Skills** `uiux-motion-engineering` · `uiux-mobile-patterns`

**Tags** 磁吸 · 指针 · 复位 · 触屏

**Acceptance**

- 位移有上限
- 离开复位
- 触屏不启用

### 005 · 点击位置扩散填充

`web-button-liquid` · scene `buttonLab` / `liquid`

液体从点击位置扩散填满按钮，切换文案与状态，再点反向恢复。

**Prompt**

> 给按钮添加从点击位置开始的液体扩散填充动画，填满后切换文案和状态；再次点击反向恢复。键盘触发时从按钮中心扩散，状态变化可被读屏播报。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 按钮 · 液体 · 扩散 · 状态

**Acceptance**

- 正反向可逆
- 键盘中心扩散
- 状态被播报

### 006 · 滑动确认

`web-button-slide` · scene `buttonLab` / `slide`

向右拖动，填充轨道，过阈值成功，未到回弹。

**Prompt**

> 做向右滑动确认按钮：拖动时填充轨道，过阈值进入成功，没到就自动回弹；键盘可用方向键或 Enter 完成。拖动过程中显示进度文字。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 滑动确认 · 阈值 · 回弹 · 键盘

**Acceptance**

- 阈值明确
- 未到回弹
- 键盘可完成

### 007 · 文案滚动切换

`web-button-roll` · scene `buttonLab` / `roll`

点击时文字纵向位移切换状态，同步更新颜色和图标。

**Prompt**

> 做文案滚动按钮：点击时文字纵向位移切换状态，同步更新按钮颜色和图标；切换中旧文字和新文字不要重叠，读屏只播报最终状态。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 按钮 · 文案 · 滚动 · 状态

**Acceptance**

- 文字不重叠
- 状态完整
- 只播报最终值

### 008 · 长按环形确认

`web-button-hold` · scene `buttonLab` / `hold`

按住时环形进度增长，到时完成，中途松开取消复位。

**Prompt**

> 做长按完成按钮：按住时环形进度条增长，到指定时长完成操作；中途松开就取消并复位。提供键盘长按替代和清晰的完成反馈。

**Skills** `uiux-interaction-spec` · `uiux-accessibility-review`

**Tags** 长按 · 环形 · 确认 · 取消

**Acceptance**

- 松开取消
- 时长可配
- 键盘可完成

## 版式与布局

### 009 · 标题里嵌小图

`web-layout-inline` · scene `layoutLab` / `inline`

大标题中间嵌等高圆角小图，点击原地展开成全宽大图，文字避让。

**Prompt**

> 做标题里嵌小图的版式：大标题中间嵌入等高圆角小图，点击原地展开成全宽大图，文字自动避让；再点缩回原位，标题不断行。

**Skills** `uiux-style-direction` · `uiux-component-engineering`

**Tags** 标题 · 内嵌图 · 展开 · 避让

**Acceptance**

- 文字不断行
- 展开可逆
- 图片有替代文本

### 010 · 档案夹标签页

`web-layout-folder` · scene `layoutLab` / `folder`

多页内容层叠只露顶部标签，点击标签对应页到最上层，其余后退。

**Prompt**

> 做档案夹标签页：多页内容层叠只露出顶部标签，点击标签时对应页到最上层，其余页依次后退；当前页有清晰标签和焦点，页面内容保持可读。

**Skills** `uiux-motion-engineering` · `uiux-component-engineering`

**Tags** 档案夹 · 标签页 · 层叠 · 焦点

**Acceptance**

- 当前页可读
- 层叠有层次
- 键盘可切

### 011 · 点一格撑成通栏

`web-layout-grid` · scene `layoutLab` / `grid`

两列网格中点击任意格子扩展成整行，其余格子自动调整，不跳转。

**Prompt**

> 做两列网格内容：点击任意格子扩展成整行通栏，其余格子自动调整，不跳转新页；再次点击恢复。展开时内容从格子内错层进入，焦点留在该格。

**Skills** `uiux-motion-engineering` · `uiux-component-engineering`

**Tags** 网格 · 通栏 · 展开 · 焦点

**Acceptance**

- 布局不跳
- 焦点保留
- 可逆

### 012 · 镂空大标题

`web-layout-cutout` · scene `layoutLab` / `cutout`

照片从大标题镂空处透出，上滑文字放大照片铺满，下滑收缩。

**Prompt**

> 做镂空大标题版式：照片从大标题的镂空处透出，上滑文字放大、照片铺满全屏，下滑照片收缩回镂空内，带流畅动画。文字与照片的层叠关系在两端都正确。

**Skills** `uiux-style-direction` · `uiux-motion-engineering`

**Tags** 镂空 · 标题 · 照片 · 滚动

**Acceptance**

- 镂空对齐
- 两端图层正确
- 减少动态可读

### 013 · 双列错位滚动

`web-layout-parallax` · scene `layoutLab` / `parallax`

左右两列同时上滚，左快右慢，滚到底部自动对齐。

**Prompt**

> 做双列错位滚动版式：左右两列同时上滚，左快右慢，图片产生时差；滚到底部时两列自动对齐，不留下空白。外层滚动驱动，不劫持用户手势。

**Skills** `uiux-motion-engineering` · `uiux-page-planning`

**Tags** 版式 · 双列 · 视差 · 对齐

**Acceptance**

- 底部对齐
- 不劫持
- 减少动态同步

### 014 · 拖动分屏比例

`web-layout-split` · scene `layoutLab` / `split`

上下两区中间有把手，拖动时同步变化，松手吸附到预设比例。

**Prompt**

> 做上下分屏：中间有可拖拽把手，拖动时两区大小同步变化，松手自动吸附到 30/50/70 预设比例；键盘上下键可调。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 分屏 · 把手 · 吸附 · 键盘

**Acceptance**

- 预设吸附
- 两区同步
- 键盘可调

### 015 · 圆泡堆叠选择

`web-layout-bubbles` · scene `layoutLab` / `bubbles`

大小不一的圆泡紧密堆叠，选中放大高亮，周围挤开后重新聚拢。

**Prompt**

> 做圆泡堆叠选择：大小不一的圆泡紧密堆叠，点击后选中的圆泡放大高亮，周围气泡挤开后重新聚拢；再次点击恢复。每个圆泡有可读标签。

**Skills** `uiux-motion-engineering` · `uiux-style-direction`

**Tags** 圆泡 · 堆叠 · 选择 · 聚拢

**Acceptance**

- 标签可读
- 挤开可逆
- 键盘可选

### 016 · 左栏日期吸住

`web-layout-sticky` · scene `layoutLab` / `sticky`

左侧大号日期固定，右侧日程滚动，下一日日期平滑推入。

**Prompt**

> 做左栏日期吸住版式：左侧窄栏放大号日期，右侧日程滚动；滚动时日期栏固定在顶部，下一日日期平滑推入切换，和右侧分组严格对齐。

**Skills** `uiux-page-planning` · `uiux-motion-engineering`

**Tags** 版式 · 吸顶 · 日期 · 日程

**Acceptance**

- 日期与分组对齐
- 吸顶不遮
- 可滚动

## 表单与选择

### 017 · 本地筛选下拉

`web-select-local` · scene `selectLab` / `local`

输入筛选，上下键和回车确认，无匹配显示提示。

**Prompt**

> 做支持本地筛选的可搜索下拉：输入时实时过滤，上下键移动，回车确认；无匹配项显示明确提示，Esc 关闭并恢复焦点。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 下拉 · 搜索 · 筛选 · 空状态

**Acceptance**

- 实时过滤
- 键盘选择
- 空状态明确

### 018 · 拆分按钮

`web-select-split` · scene `selectLab` / `split`

左侧执行主动作，右侧箭头展开次要动作，主次明确。

**Prompt**

> 做拆分按钮：左侧点击执行主动作，右侧箭头展开次要动作；主次操作视觉区分明确，键盘可分别聚焦。

**Skills** `uiux-component-engineering` · `uiux-design-system`

**Tags** 拆分按钮 · 主动作 · 次要动作 · 键盘

**Acceptance**

- 主次清晰
- 键盘可分别聚焦
- 菜单可关

### 019 · 单选下拉

`web-select-single` · scene `selectLab` / `single`

五个固定选项，默认选中第一个，选完自动收起。

**Prompt**

> 做一个单选下拉：五个固定选项，默认选中第一个，选完自动收起；支持上下键和回车，选中项带对勾，触发器显示当前值。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 下拉 · 单选 · 键盘 · 对勾

**Acceptance**

- 选完收起
- 键盘完整
- 显示当前值

### 020 · 多选折叠选择器

`web-select-multi` · scene `selectLab` / `multi`

已选项以可删除块显示，超三行折叠并显示剩余数量。

**Prompt**

> 做多选选择器：已选项以可删除块显示，超过三行后折叠并显示剩余数量；支持全选和清空，删除块要有可聚焦的按钮。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 多选 · 折叠 · 删除 · 全选

**Acceptance**

- 折叠计数正确
- 删除可聚焦
- 全选可逆

### 021 · 分组下拉

`web-select-group` · scene `selectLab` / `group`

按团队和项目分组，组标题不可选，滚动时固定顶部。

**Prompt**

> 做一个分组下拉：按团队和项目分组，组标题不可选，滚动时固定在顶部；选项支持键盘遍历，分组标题作为 aria-group 的标签。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 下拉 · 分组 · 吸顶 · aria-group

**Acceptance**

- 组标题不可选
- 滚动吸顶
- 键盘遍历

### 022 · 父子联动树形选择器

`web-select-tree` · scene `selectLab` / `tree`

半选用单独样式，只回传最上层选中节点。

**Prompt**

> 做父子联动的树形选择器：勾选父级选中全部子级，子级部分选中时父级显示半选样式；只回传最上层选中节点，展开状态保持。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 树形 · 半选 · 父子联动 · 回传

**Acceptance**

- 半选样式独立
- 只回传顶层
- 展开保持

### 023 · 可新建选择器

`web-select-creatable` · scene `selectLab` / `creatable`

无匹配时显示新建选项，创建前清首尾空格、检查重名。

**Prompt**

> 做可新建选择器：无匹配时显示「新建」选项，创建前清除首尾空格并检查重名；创建成功后立即选中，失败时保留输入。

**Skills** `uiux-component-engineering` · `uiux-interaction-spec`

**Tags** 新建 · 去重 · 空匹配 · 保留输入

**Acceptance**

- 去重提示
- 创建即选中
- 失败保留

### 024 · 日期区间选择器

`web-select-date` · scene `selectLab` / `date`

选起止时预览范围，两端日期可单独修改。

**Prompt**

> 做日期区间选择器：选择起止日期时预览中间范围，两端日期可单独修改；起止不能颠倒，选择完成后回填触发器。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 日期区间 · 预览 · 起止 · 回填

**Acceptance**

- 起止不颠倒
- 范围预览
- 键盘可选

### 025 · 三列分组多列导航

`web-select-mega` · scene `selectLab` / `mega`

带说明文字，鼠标斜移延迟收起，支持键盘遍历。

**Prompt**

> 做三列分组多列导航：每项带说明文字，鼠标斜移时延迟收起，支持键盘在列间遍历；组标题不可聚焦，只作为结构。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 多列导航 · 分组 · 斜移 · 键盘

**Acceptance**

- 斜移不闪
- 键盘遍历
- 组标题不聚焦

### 026 · 远程搜索下拉

`web-select-remote` · scene `selectLab` / `remote`

输入停止 300ms 再请求，旧请求不覆盖新请求，显示加载/空/失败。

**Prompt**

> 做远程搜索下拉：输入停止 300ms 再请求，旧请求不能覆盖新请求；显示加载、空结果和失败三种状态，失败可重试。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 远程搜索 · 防抖 · 竞态 · 状态

**Acceptance**

- 旧请求不覆盖
- 三种状态
- 可重试

## 菜单与导航

### 027 · 菜单内搜索

`web-menu-search` · scene `dashboardMenu` / `search`

输入时实时过滤，匹配项上移并高亮命中文字，清空恢复顺序。

**Prompt**

> 侧边栏顶部加搜索框：输入时实时过滤菜单项，不匹配的项收起，匹配项上移并高亮命中文字；清空后恢复原有顺序。没有结果时给出明确空状态。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 菜单搜索 · 过滤 · 高亮 · 空状态

**Acceptance**

- 高亮命中
- 清空恢复
- 键盘可操作

### 028 · 菜单拖动排序

`web-menu-sort` · scene `dashboardMenu` / `sort`

按住拖动排序，项放大、其余让位，拖过分隔线固定为常用。

**Prompt**

> 菜单项支持按住拖动排序：拖动时该项轻微放大，其余项平滑让位，松手吸附到新位置；拖到顶部分隔线以上固定为常用项。排序结果在当前会话保存。

**Skills** `uiux-component-engineering` · `uiux-interaction-spec`

**Tags** 菜单 · 排序 · 常用 · 保存

**Acceptance**

- 拖动实时让位
- 固定可逆
- 键盘可排序

### 029 · 工作区切换器

`web-menu-workspace` · scene `dashboardMenu` / `workspace`

侧边栏顶部原地弹出工作区列表，切换后名称滚动替换，强调色跟随。

**Prompt**

> 在侧边栏顶部做工作区切换器：点击原地弹出工作区列表，当前项带对勾；切换后名称滚动替换，菜单强调色跟随工作区变化，页面标题同步更新。

**Skills** `uiux-design-system` · `uiux-component-engineering`

**Tags** 工作区 · 切换器 · 强调色 · 同步

**Acceptance**

- 当前项有对勾
- 强调色跟随
- 键盘可选

### 030 · 弧形快捷菜单

`web-menu-arc` · scene `dashboardMenu` / `arc`

圆形按钮点击后图标沿弧线依次弹出，再加号旋转成叉号。

**Prompt**

> 页面右下角放圆形快捷按钮，点击后几个图标沿弧线依次弹出，按钮图标从加号旋转为叉号；再次点击沿原路收回。每个图标有文字标签，Esc 可收起。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 弧形菜单 · 快捷按钮 · 交错 · Esc

**Acceptance**

- 依次弹出
- 原路收回
- 每项有标签

### 031 · 面包屑加同级下拉

`web-menu-breadcrumb` · scene `dashboardMenu` / `breadcrumb`

每一段可展开同级页面，选择后文字滚动替换，后续层级更新。

**Prompt**

> 页面顶部加面包屑导航：每一段可点击展开同级页面下拉列表，选择后该段文字滚动替换，后续层级同步更新。当前页不可选，下拉可键盘浏览。

**Skills** `uiux-component-engineering` · `uiux-interaction-spec`

**Tags** 面包屑 · 同级下拉 · 层级 · 滚动替换

**Acceptance**

- 后续层级同步
- 当前页不可选
- 键盘可用

### 032 · 悬停滑出二级面板

`web-menu-flyout` · scene `dashboardMenu` / `flyout`

一级菜单悬停时右侧滑出二级面板，项间移动保持打开，离开后收起。

**Prompt**

> 一级菜单悬停时在右侧滑出二级面板；在一级项之间移动时面板保持打开，只切换内容；鼠标离开整个菜单区域后自动收起。键盘聚焦也要能打开。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 二级菜单 · 悬停 · 保持打开 · 键盘

**Acceptance**

- 移动不闪
- 离开可收
- 键盘可打开

## 场景组件

### 033 · 快捷控制台

`web-mini-console` · scene `dashboardMini` / `console`

切换阅读/休息/离开场景，灯光、温度与雨声音量同步平滑变化。

**Prompt**

> 做一个快捷控制台：切换阅读、休息和离开场景，灯光开关、温度和雨声音量同步平滑变化，同时保留独立调节并循环演示。场景切换要能手动中断。

**Skills** `uiux-interaction-spec` · `uiux-design-system`

**Tags** 控制台 · 场景 · 联动 · 可中断

**Acceptance**

- 联动正确
- 可独立调节
- 可中断

### 034 · 能量面板

`web-mini-energy` · scene `dashboardMini` / `energy`

切换能量/睡眠/活动指标，数字滚动，柱高和颜色错峰变化。

**Prompt**

> 做能量面板：切换能量、睡眠和活动指标，数字滚动过渡，柱高和颜色错峰变化，柱顶逐个显示数值。切换时保留上一指标的对比残影。

**Skills** `uiux-motion-engineering` · `uiux-design-system`

**Tags** 能量 · 柱状 · 数字滚动 · 对比

**Acceptance**

- 数值准确
- 错峰可感知
- 可切换

### 035 · 日程轨道

`web-mini-schedule` · scene `dashboardMini` / `schedule`

点击事项展开详情，其他事项连续让位，左侧光点同步移动。

**Prompt**

> 做日程轨道：点击事项时展开详情，其他事项连续让位，左侧光点同步移动到当前事项；三项独立循环演示，也可手动点击。

**Skills** `uiux-motion-engineering` · `uiux-page-planning`

**Tags** 日程 · 轨道 · 展开 · 让位

**Acceptance**

- 光点对齐
- 让位连续
- 可手动

### 036 · 文件收纳盒

`web-mini-files` · scene `dashboardMini` / `files`

文件沿弧线移动缩小淡出，文件夹抬起展开，数量增加。

**Prompt**

> 做文件收纳盒：文件沿弧线移动并缩小淡出，目标文件夹抬起展开，数量增加，停留后沿原路恢复并循环演示；也支持手动拖放。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec`

**Tags** 文件 · 弧线 · 文件夹 · 拖放

**Acceptance**

- 数量与文件一致
- 可拖放
- 动画可逆

### 037 · 习惯打卡盘

`web-mini-habit` · scene `dashboardMini` / `habit`

七个日期沿圆周排列，打卡节点变色扩散光圈，中心数字滚动，路径连续绘制。

**Prompt**

> 做习惯打卡盘：七个日期沿圆周排列，打卡时节点变色并扩散光圈，中心数字滚动，路径连续绘制；全部完成显示对勾并停止循环。

**Skills** `uiux-motion-engineering` · `uiux-design-system`

**Tags** 打卡 · 圆周 · 路径 · 完成

**Acceptance**

- 节点与日期对应
- 路径闭合
- 可重置

### 038 · 专注仪表

`web-mini-focus` · scene `dashboardMini` / `focus`

拖动滑块调时长，圆环和数字联动，开始倒计时，完成变绿打勾。

**Prompt**

> 做一个专注仪表：拖动滑块调节时长，圆环和数字联动；开始后倒计时，完成时圆环变绿并显示对勾，再自动复位。支持暂停和提前结束。

**Skills** `uiux-motion-engineering` · `uiux-component-engineering`

**Tags** 专注 · 倒计时 · 圆环 · 暂停

**Acceptance**

- 计时准确
- 完成态明确
- 可暂停

## 工作台布局

### 039 · 地图主导布局

`web-layout-map` · scene `dashboardLayout` / `map`

地图为核心，适合物流与园区管理后台。

**Prompt**

> 设计地图主导的物流/园区后台：地图占主要区域，顶部放搜索与图层筛选，右侧浮动面板显示选中对象详情；列表可收起，地图不因面板出现而缩放跳动。

**Skills** `uiux-page-planning` · `uiux-design-system`

**Tags** 地图 · 物流 · 浮动面板 · 筛选

**Acceptance**

- 地图不跳
- 面板可收
- 选中联动

### 040 · 目标导向布局

`web-layout-goal` · scene `dashboardLayout` / `goal`

突出核心目标与快捷操作，适合目标类看板。

**Prompt**

> 设计一个目标导向的工作台布局：首屏突出一个核心目标、当前进度和三个快捷操作；次要信息下沉到第二屏，主操作在视线终点。给出桌面与 1024 宽的响应式规则。

**Skills** `uiux-page-planning` · `uiux-design-system`

**Tags** Dashboard · 目标 · 快捷操作 · 层级

**Acceptance**

- 一个视觉主角
- 主操作明确
- 窄屏不挤

### 041 · 内容主视觉布局

`web-layout-content` · scene `dashboardLayout` / `content`

大封面为中心，适合媒体内容后台。

**Prompt**

> 设计内容主视觉后台：大封面作为视觉中心，标题、状态和发布操作围绕它排列；列表退到侧边，选中项与封面联动。适合媒体、作品集和内容审核场景。

**Skills** `uiux-page-planning` · `uiux-style-direction`

**Tags** 内容 · 封面 · 媒体 · 联动

**Acceptance**

- 封面为主角
- 列表联动
- 操作可见

### 042 · 趋势主导布局

`web-layout-trend` · scene `dashboardLayout` / `trend`

核心放趋势图，先看整体再看明细。

**Prompt**

> 设计趋势主导的 Dashboard：核心区域放趋势图，上方给结论和变化幅度，明细表格放在下方；图表与表格共享同一时间范围筛选。

**Skills** `uiux-page-planning` · `uiux-design-system`

**Tags** 趋势 · 图表 · 明细 · 时间范围

**Acceptance**

- 先结论后明细
- 筛选共享
- 空状态明确

### 043 · 三栏信息布局

`web-layout-three` · scene `dashboardLayout` / `three`

三列拆分不同信息，信息多也整洁有序。

**Prompt**

> 设计三栏信息布局：左栏导航与筛选，中栏主列表，右栏详情或辅助信息；三栏宽度按内容权重分配，详情打开时不挤压主列表。

**Skills** `uiux-page-planning` · `uiux-component-engineering`

**Tags** 三栏 · 列表 · 详情 · 权重

**Acceptance**

- 详情不挤压
- 筛选可用
- 窄屏可折叠

### 044 · 数据日程分栏

`web-dash-split` · scene `dashboardLayout` / `split`

左右分栏，一边数据一边日程，适合项目管理。

**Prompt**

> 设计数据与日程分栏布局：左侧数据概览，右侧今日日程，中间用一条分隔线而不是卡片堆叠；两栏各自滚动，顶部共享项目切换。

**Skills** `uiux-page-planning` · `uiux-component-engineering`

**Tags** 分栏 · 数据 · 日程 · 项目

**Acceptance**

- 两栏独立滚动
- 顶部共享
- 窄屏堆叠

## 面板与弹层

### 045 · 按钮弹出菜单

`web-overlay-button-menu` · scene `overlayLab` / `buttonMenu`

以按钮为原点展开，点击外部原路收回。

**Prompt**

> 做按钮弹出菜单：菜单以按钮为原点展开，点击外部或 Esc 原路收回；菜单项支持键盘上下选择，当前焦点有清晰轮廓。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 菜单 · 弹出 · 原点 · 键盘

**Acceptance**

- 原点展开
- 外部可关
- 焦点可见

### 046 · 侧边抽屉推走页面

`web-overlay-drawer` · scene `overlayLab` / `drawer`

面板从左侧滑入，主页面右移缩小，点击主页面复原。

**Prompt**

> 做侧边抽屉：面板从左侧滑入，主页面右移并轻微缩小；点击主页面或 Esc 复原。抽屉内焦点受限，关闭后回到触发按钮。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 抽屉 · 左滑 · 主页面 · 焦点

**Acceptance**

- 主页面可点回
- 焦点受限
- 关闭复位

### 047 · 卡片弹出详情

`web-overlay-card-detail` · scene `overlayLab` / `cardDetail`

从原位放大为居中面板，关闭时缩回。

**Prompt**

> 做卡片弹出详情：点击卡片后从原位置放大为居中面板，背景变暗；关闭时缩回原卡片位置。焦点进入面板并循环，关闭后回到卡片。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 卡片 · 详情 · 原位 · 焦点

**Acceptance**

- 缩回原位
- 焦点循环
- Esc 可关

## 数据可视化

### 048 · 弹性排序柱

`web-chart-bars` · scene `chartLab` / `bars`

五根柱子错峰生长，数值同步，按大小平滑换位。

**Prompt**

> 做五根排序柱：错峰弹性生长，顶部数值同步变化，按数值大小平滑换位，保留星期标签并循环演示；支持切换排序方向。

**Skills** `uiux-motion-engineering` · `uiux-design-system`

**Tags** 柱状图 · 错峰 · 排序 · 换位

**Acceptance**

- 数值与高度一致
- 换位不跳
- 可切换排序

### 049 · 分段选择器联动图表

`web-chart-segmented` · scene `chartLab` / `segmented`

选中背景平滑移动，切换时会员数量与趋势图同步更新，悬停显示月份数值。

**Prompt**

> 做 Apple 风格数据统计卡：顶部分段选择器，选中背景平滑移动；切换选项时数字和趋势图同步更新；悬停图表显示月份数值与高亮。统一圆角、留白、字体层级和动效节奏。

**Skills** `uiux-design-system` · `uiux-component-engineering`

**Tags** 分段控件 · 统计卡 · 图表 · 悬停

**Acceptance**

- 选中块对齐
- 数据同步
- 悬停可读

### 050 · 轨道分配环

`web-chart-donut` · scene `chartLab` / `donut`

三段彩色圆弧按比例绘制，中心百分比同步，右侧图例。

**Prompt**

> 做一个轨道分配环：三段彩色圆弧按比例绘制，中心百分比与选中项同步变化，右侧保留图例并循环演示；悬停图例高亮对应弧段。

**Skills** `uiux-design-system` · `uiux-motion-engineering`

**Tags** 环形图 · 比例 · 图例 · 联动

**Acceptance**

- 比例准确
- 图例联动
- 可键盘切换

### 051 · 活动热力矩阵

`web-chart-heat` · scene `chartLab` / `heat`

二十八个格子按波纹顺序亮起，展开时向四周让位，中心详情卡放大。

**Prompt**

> 做活动热力矩阵：二十八个格子按波纹顺序亮起，点击时向四周让位，中心详情卡放大出现，停留后恢复并循环演示。每个格子有日期与数值的可读标签。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 热力图 · 波纹 · 详情卡 · 循环

**Acceptance**

- 颜色有数值依据
- 详情可读
- 键盘可遍历

### 052 · 流量曲线与探针

`web-chart-curve` · scene `chartLab` / `curve`

曲线与渐变面积生长，探针移动，虚线浮层读数跟随。

**Prompt**

> 做一条流量曲线：曲线和渐变面积同步生长，探针沿曲线移动，虚线和浮层读数实时跟随；支持拖动查看，离开后探针回到最新点。

**Skills** `uiux-motion-engineering` · `uiux-design-system`

**Tags** 曲线 · 探针 · 浮层 · 拖动

**Acceptance**

- 读数与曲线一致
- 拖动可用
- 离开复位

### 053 · 流量占比条

`web-chart-share` · scene `chartLab` / `share`

三个来源百分比与条形宽度同步变化，合计始终 100%。

**Prompt**

> 做流量占比条：三个来源的百分比与条形宽度同步平滑变化，合计始终为 100%，支持切换分配并循环演示；图例与条形使用同一颜色映射。

**Skills** `uiux-design-system` · `uiux-motion-engineering`

**Tags** 占比 · 条形 · 总计 · 循环

**Acceptance**

- 合计 100%
- 颜色一致
- 可切换

### 054 · 双针目标仪表

`web-chart-gauge` · scene `chartLab` / `gauge`

半圆刻度逐段点亮，实际指针弹性追随目标，可切换目标。

**Prompt**

> 做一个双针目标仪表：半圆刻度逐段点亮，实际指针弹性追随目标，弧形进度与百分比同步变化，支持切换目标。目标与实际用不同颜色和形状区分。

**Skills** `uiux-design-system` · `uiux-motion-engineering`

**Tags** 仪表 · 双针 · 目标 · 弹性

**Acceptance**

- 两针可区分
- 目标可切换
- 数值准确

## 网站与组件

### 055 · 建筑设计网站

`web-arch-site` · scene `appleLab` / `arch`

全屏建筑摄影、左下超大标题、玻璃导航与光线滑块。

**Prompt**

> 设计 Apple 风建筑设计官网：首屏全屏高质量建筑摄影，左下方超大标题，极简导航，作品为视觉中心；右上角主题按钮切换明暗，底部光线滑块调整画面氛围，文字、按钮、背景同步响应。控制留白、对比和层级，输出响应式单页代码。

**Skills** `uiux-style-direction` · `uiux-design-system`

**Tags** 建筑 · 全屏图 · 玻璃导航 · 光线

**Acceptance**

- 文字始终可读
- 主题联动
- 响应式

### 056 · 图片取色控件

`web-palette` · scene `appleLab` / `palette`

从图片提取 5 种代表色，点击更新预览与 HEX/RGB，可复制。

**Prompt**

> 做图片取色组件：上方展示建筑照片，下方提取 5 种代表色块；点击色块同步更新颜色预览和 HEX/RGB，提供一键复制与成功反馈；支持上传或切换示例图。

**Skills** `uiux-component-engineering` · `uiux-design-system`

**Tags** 取色 · 色板 · HEX · 复制

**Acceptance**

- 颜色值准确
- 复制有反馈
- 键盘可选

### 057 · 艺术作品网站

`web-art-site` · scene `appleLab` / `art`

首屏大标题与彩色扇形卡片，滚动变台阶排列，切换按钮换位，明暗主题联动。

**Prompt**

> 设计 Apple 高级审美的艺术作品展示网页：首屏超大标题与彩色扇形卡片，向下滚动时卡片平滑变为台阶式排列；点击切换按钮，卡片依次换位、作品名称同步更新；支持明暗主题切换。使用无衬线字体、大留白、柔和阴影、圆角卡片、600ms 缓动，输出可运行 HTML/CSS/JS，不用外部图片。

**Skills** `uiux-style-direction` · `uiux-motion-engineering` · `uiux-page-planning`

**Tags** 作品集 · 扇形卡 · 台阶 · 主题

**Acceptance**

- 滚动可逆
- 换位名称同步
- 无外部图片

### 058 · 音效调节面板

`web-audio` · scene `appleLab` / `audio`

三种音效模式与低中高频滑块联动，实时显示数值。

**Prompt**

> 做 Apple 风音效调节面板：顶部耳机产品图，下方三种音效模式与低/中/高频滑块；切换模式时滑块与参数联动，拖动实时显示数值与进行状态；提供重置按钮。

**Skills** `uiux-component-engineering` · `uiux-design-system`

**Tags** 音效 · 滑块 · 模式 · 重置

**Acceptance**

- 模式与滑块联动
- 重置可逆
- 数值实时
