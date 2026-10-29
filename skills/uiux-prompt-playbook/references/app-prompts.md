# App / 小程序 prompts

Generated from `assets/prompts.json`. 90 prompts in 14 families. Each prompt names its live scene, related skills and acceptance checks.

| Family | Prompts |
| --- | --- |
| 按钮与确认 | 2 |
| 标签与选择 | 4 |
| 导航与悬浮 | 6 |
| 滚动与动效 | 10 |
| 卡片 | 8 |
| 控件 | 8 |
| 面板与弹层 | 11 |
| 排序与拖拽 | 3 |
| 手势 | 7 |
| 输入与反馈 | 6 |
| 页面场景 | 5 |
| 移动组件 | 6 |
| 主题与状态 | 7 |
| 照片与转场 | 7 |

## 按钮与确认

### 001 · 保存按钮变进度环

`app-save-progress` · scene `buttonLab` / `progress`

点击后收缩成圆显示环形进度，完成后展开回按钮，文字切为打开。

**Prompt**

> 做保存按钮：点击后收缩成圆形并显示环形进度，完成后展开回按钮，文字切换为「打开」；失败时恢复「保存」并提供重试。

**Skills** `uiux-motion-engineering` · `uiux-component-engineering`

**Tags** 保存 · 进度环 · 完成 · 重试

**Acceptance**

- 失败可重试
- 完成文字切换
- 进度真实

### 002 · 状态按钮文字纵向滚动

`app-status-roll` · scene `buttonLab` / `roll`

点击时文字纵向滚动切换，出现对勾，宽度随文字平滑变化。

**Prompt**

> 做状态切换按钮：点击时文字纵向滚动切换，出现对勾图标，按钮宽度随文字长度平滑变化；重复点击可切回，读屏只播报最终状态。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 按钮 · 文字滚动 · 对勾 · 宽度

**Acceptance**

- 文字不重叠
- 宽度平滑
- 只播报最终值

## 标签与选择

### 003 · 滑动选色，相邻弹起

`app-tag-colors` · scene `tagLab` / `colors`

手指经过的色块依次放大弹起，松手选中，主题色平滑过渡。

**Prompt**

> 做一排横向颜色选择：支持按住滑动选择，手指经过的色块依次放大弹起；松手选中当前色块，界面主题色平滑过渡。键盘左右键也能逐色选择。

**Skills** `uiux-motion-engineering` · `uiux-design-system`

**Tags** 颜色 · 滑动选择 · 放大 · 主题过渡

**Acceptance**

- 经过与选中区分
- 主题色同步
- 键盘可选

### 004 · 可删除标签收缩成圆点

`app-tag-removable` · scene `tagLab` / `removable`

删除时先收缩成小圆点再消失，并能新增标签。

**Prompt**

> 做一组可删除标签：每个标签带删除按钮，删除时先收缩成小圆点再消失，其余标签平滑补位；支持输入新增标签并去重。删除和新增都要能用键盘完成。

**Skills** `uiux-component-engineering` · `uiux-motion-engineering`

**Tags** 标签 · 删除 · 收缩 · 新增

**Acceptance**

- 删除动画不阻塞状态
- 空输入不新增
- 重名有提示

### 005 · 筛选标签实心反白

`app-tag-filter` · scene `tagLab` / `filter`

点击标签背景变实心、文字反白，再点恢复。

**Prompt**

> 做一排可横向滚动的筛选标签：点击后背景变实心、文字反白，再点恢复；支持多选，选中数量显示在标题旁。移动端横向滚动，但不要拦截纵向页面滚动。

**Skills** `uiux-mobile-patterns` · `uiux-component-engineering`

**Tags** 标签 · 筛选 · 多选 · 横滚

**Acceptance**

- 选中态清晰
- 横滚不抢纵滚
- 键盘可切换

### 006 · 选中标签放大，邻居让位

`app-tag-yield` · scene `tagLab` / `yield`

选中标签放大，相邻标签主动向两侧让出空间。

**Prompt**

> 做一排标签选择：选中标签放大并提高对比度，相邻标签主动向两侧让位，未选中标签保持安静。切换时只让变化的标签移动，容器高度不变。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec`

**Tags** 标签 · 放大 · 让位 · 切换

**Acceptance**

- 布局不跳动
- 选中态不只靠颜色
- 键盘可切换

## 导航与悬浮

### 007 · 底栏白色胶囊滑动

`app-nav-capsule` · scene `navLab` / `capsule`

切换时胶囊背景平滑移动，选中项展开文字标签。

**Prompt**

> 做一个底部标签栏：选中项展开显示文字标签，白色胶囊背景滑到选中位置，其余项只保留图标。切换时内容区同步切换，但滚动位置按标签分别保存。

**Skills** `uiux-component-engineering` · `uiux-mobile-patterns`

**Tags** 底栏 · 胶囊 · 标签 · 滚动保存

**Acceptance**

- 胶囊与选中项对齐
- 标签可读
- 键盘可切换

### 008 · 底栏嵌主按钮

`app-nav-embedded` · scene `navLab` / `embedded`

左侧三个文字标签，右端独立主色圆按钮，点击回到首页顶部并打开编辑。

**Prompt**

> 做一个底部导航：左侧三个文字标签，右端单独留一枚主色圆按钮。点击圆按钮时，不管当前在哪个标签页，都回到首页顶部并打开编辑面板。当前标签有明确选中态。

**Skills** `uiux-mobile-patterns` · `uiux-component-engineering`

**Tags** 底栏 · 主按钮 · 回到首页 · 编辑

**Acceptance**

- 任意标签都可回到首页
- 选中态清晰
- 键盘可触发

### 009 · 横向周日期条

`app-nav-week` · scene `navLab` / `week`

选中背景滑到点击日期，左右滑动整周翻页，月份标题同步。

**Prompt**

> 做一个横向周日期条：选中背景滑动到点击日期，左右滑动整周翻页，月份标题同步更新。今天与选中日要有区分，键盘左右键逐日移动。

**Skills** `uiux-component-engineering` · `uiux-mobile-patterns`

**Tags** 周历 · 滑动 · 选中 · 月份

**Acceptance**

- 跨月标题正确
- 今天与选中区分
- 键盘逐日

### 010 · 弧形快捷菜单

`app-nav-arc` · scene `navLab` / `arc`

圆形按钮点击后图标沿弧线依次弹出，加号旋转成叉号。

**Prompt**

> 页面右下角放一个圆形快捷按钮，点击后几个图标沿弧线依次弹出，按钮图标从加号旋转为叉号；再次点击沿原路收回。每个图标有文字标签，键盘可依次聚焦。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 弧形菜单 · 悬浮按钮 · 交错 · 收回

**Acceptance**

- 收展可逆
- 每项有文字
- Esc 收起

### 011 · 吸边悬浮球

`app-nav-edgeball` · scene `navLab` / `edgeBall`

松手后吸附到最近屏幕边缘，滚动时半隐藏，停止后滑出。

**Prompt**

> 做一个吸边悬浮球：拖动松手后吸附到最近的屏幕边缘，页面滚动时半隐藏，停止滚动后滑出；点击展开快捷操作。悬浮球不能挡住底部导航和系统手势区，键盘可移动它。

**Skills** `uiux-mobile-patterns` · `uiux-accessibility-review`

**Tags** 悬浮球 · 吸边 · 半隐藏 · 安全区

**Acceptance**

- 避开安全区
- 滚动后复现
- 键盘可移动

### 012 · 悬浮按钮随滚动收展

`app-nav-fab` · scene `navLab` / `fab`

向下滚动收缩成圆形图标，向上滚动展开文字。

**Prompt**

> 做一个悬浮主按钮：向下滚动时收缩成圆形图标，向上滚动或停止后展开文字；展开状态不遮挡列表关键操作。按钮的点击区域在两种形态下保持一致。

**Skills** `uiux-motion-engineering` · `uiux-mobile-patterns`

**Tags** 悬浮按钮 · 滚动 · 收缩 · 点击区域

**Acceptance**

- 点击区域一致
- 不遮挡内容
- 键盘可触发

## 滚动与动效

### 013 · 背景自适应反色

`app-scroll-contrast` · scene `scrollLab` / `contrast`

悬浮元素按背后区域亮度自动反色，滚动时连续过渡。

**Prompt**

> 悬浮元素按背后区域的亮度自动反色，滚动时连续过渡，不做硬切；在浅色和深色图片上都要保持可读。只改变前景颜色，不改变元素位置。

**Skills** `uiux-design-system` · `uiux-accessibility-review`

**Tags** 反色 · 对比度 · 滚动 · 连续

**Acceptance**

- 两端都够对比
- 过渡无闪烁
- 不改变位置

### 014 · 顶部天气条下拉展开

`app-weather-pull` · scene `overlayLab` / `weather`

下拉跟手展开逐小时天气，上划收起。

**Prompt**

> 做一条顶部天气条：下拉时跟手展开逐小时天气，上划收起；松手根据距离吸附到展开或收起，天气条收起时仍显示当前温度。

**Skills** `uiux-mobile-patterns` · `uiux-motion-engineering`

**Tags** 天气 · 下拉 · 逐小时 · 吸附

**Acceptance**

- 跟手展开
- 松手吸附
- 收起仍可读

### 015 · 滚动绑定动画进度

`app-scroll-progress` · scene `scrollLab` / `progress`

动画进度绑定滚动位置，滚动可逆，停住时停在对应进度。

**Prompt**

> 把一段动画的进度绑定滚动位置，滚动可逆；停住时动画停在对应进度，不自动补播。顶部显示进度条，键盘 PageUp/PageDown 也能驱动。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec`

**Tags** 滚动驱动 · 进度 · 可逆 · 停住

**Acceptance**

- 滚动可逆
- 停住不回放
- 键盘可驱动

### 016 · 滚动拖影模糊

`app-scroll-blur` · scene `scrollLab` / `blur`

列表滚动时按速度加方向性模糊，速度归零平滑恢复。

**Prompt**

> 列表滚动时按速度给内容加方向性模糊，速度归零后平滑恢复清晰；模糊只影响视觉，不改变可读文本和点击位置。减少动态时关闭模糊。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 速度模糊 · 滚动 · 恢复 · 性能

**Acceptance**

- 停止后清晰
- 点击位置不变
- 减少动态关闭

### 017 · 换列数走弧线

`app-scroll-reflow` · scene `scrollLab` / `reflow`

网格列数变化时，每一项沿弧线移动到新位置，相邻项错开延迟。

**Prompt**

> 网格列数变化时，每一项沿弧线移动到新位置，相邻项错开延迟；用 FLIP 记录前后位置，动画中不改变布局占位。减少动态时直接换布局。

**Skills** `uiux-motion-engineering` · `uiux-component-engineering`

**Tags** FLIP · 弧线 · 网格 · 错峰

**Acceptance**

- 布局无跳动
- 错峰可感知
- 减少动态直达

### 018 · 捏合改网格密度

`app-scroll-pinch` · scene `scrollLab` / `pinch`

按缩放比在大图、三列、文字行三档之间切换，每项连续移动到新位置。

**Prompt**

> 给网格加双指捏合的语义缩放：按缩放比在大图、三列、文字行三档之间切换，每一项连续移动到新位置；把手势模拟为可调滑杆，键盘也能切档。

**Skills** `uiux-motion-engineering` · `uiux-mobile-patterns`

**Tags** 捏合 · 网格 · 密度 · 连续移动

**Acceptance**

- 三档布局正确
- 移动连续
- 有滑杆替代

### 019 · 双列错位滚动

`app-scroll-parallax` · scene `scrollLab` / `parallax`

左右两列同时上滚，左快右慢，滚到底部自动对齐。

**Prompt**

> 做两列内容同时上滚，左列快、右列慢，图片产生错位时差；滚到底部时两列自动对齐，不要因为速度差留下空白。滚动由外层容器驱动，内部不劫持。

**Skills** `uiux-motion-engineering` · `uiux-page-planning`

**Tags** 视差 · 双列 · 错位 · 对齐

**Acceptance**

- 底部对齐
- 不劫持滚动
- 减少动态同时滚

### 020 · 下拉放大顶图

`app-scroll-pull` · scene `scrollLab` / `pull`

到顶继续下拉时顶图按距离放大，覆盖文字淡出，松手阻尼回弹。

**Prompt**

> 滚动到顶继续下拉时，顶部大图按下拉距离放大，覆盖文字同步淡出；松手带阻尼回弹。下拉距离超过阈值才触发刷新，未超过时只回弹。

**Skills** `uiux-motion-engineering` · `uiux-mobile-patterns`

**Tags** 下拉 · 放大 · 刷新 · 阻尼

**Acceptance**

- 阈值可区分
- 回弹平滑
- 刷新状态可见

### 021 · 选中聚焦，其余退后

`app-scroll-focus` · scene `scrollLab` / `focus`

选中项放大提亮，同层未选中项降低饱和度并轻微缩小和模糊。

**Prompt**

> 选中项放大提亮，同层未选中项降低饱和度并轻微缩小和模糊；点击空白处恢复全部。被弱化的项仍需可读、可点击，不能只靠颜色区分选中。

**Skills** `uiux-interaction-spec` · `uiux-accessibility-review`

**Tags** 聚焦 · 降饱和 · 选中 · 可点击

**Acceptance**

- 未选中仍可读
- 选中不只靠颜色
- 空白恢复

### 022 · 左栏日期吸住

`app-scroll-sticky` · scene `scrollLab` / `sticky`

左侧大号日期固定，右侧日程滚动，下一日日期平滑推入。

**Prompt**

> 左侧窄栏放大号日期，右侧是日程；滚动时日期栏固定在顶部，下一日日期平滑推入切换。日期切换要与右侧分组对齐，不能提前或滞后。

**Skills** `uiux-page-planning` · `uiux-mobile-patterns`

**Tags** 吸顶 · 日期 · 日程 · 分组

**Acceptance**

- 日期与分组对齐
- 吸顶不遮内容
- 键盘可滚动

## 卡片

### 023 · 底部把手拖拽展开

`app-card-dragsheet` · scene `cardLab` / `dragSheet`

按住卡片底部把手向上拖动，逐步显示更多内容，松手吸附。

**Prompt**

> 给卡片添加底部拖拽展开交互：手势距离同步控制内容高度和封面尺寸，松手后根据阈值吸附到展开或收起状态；拖到一半反向可以取消。

**Skills** `uiux-motion-engineering` · `uiux-mobile-patterns`

**Tags** 拖拽 · 卡片 · 吸附 · 取消

**Acceptance**

- 高度跟手
- 阈值吸附
- 中途可取消

### 024 · 共享元素转场

`app-card-shared` · scene `cardLab` / `shared`

卡片外框和核心信息平滑移动到详情对应位置。

**Prompt**

> 给卡片添加共享元素转场：卡片的位置、尺寸和圆角连续过渡到详情页的对应位置，核心信息移动到详情中的对应位置，避免整体缩放文字；关闭时反向恢复。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec`

**Tags** 共享元素 · 转场 · 圆角 · 反向

**Acceptance**

- 文字不整体缩放
- 关闭恢复
- 减少动态直接切换

### 025 · 横滑吸附卡片

`app-card-snap` · scene `cardLab` / `snap`

横向滑动保留相邻卡片预览，松手吸附到完整卡片。

**Prompt**

> 做一组横向滑动卡片：保留相邻卡片的部分预览，滑动时松手自动吸附到一张完整卡片；每次滑动自然停在整卡位置，页码指示同步。键盘左右键也能切换。

**Skills** `uiux-component-engineering` · `uiux-motion-engineering`

**Tags** 横滑 · 吸附 · 卡片 · 页码

**Acceptance**

- 停在整卡
- 相邻卡可见
- 键盘可切换

### 026 · 加号卡片飞入底栏

`app-card-flydock` · scene `cardLab` / `flyDock`

点击加号时卡片缩成圆形，沿弧线飞入底栏行程图标，角标加一。

**Prompt**

> 点击加号时，卡片缩成圆形，沿弧线飞入底栏行程图标，图标弹跳，角标数字加一；飞行中卡片不可重复点击，结束后状态立即生效。

**Skills** `uiux-motion-engineering` · `uiux-component-engineering`

**Tags** 飞入 · 底栏 · 角标 · 弧线

**Acceptance**

- 角标准确
- 不可重复触发
- 减少动态直接加一

### 027 · 卡片堆叠层级

`app-card-stack` · scene `cardLab` / `stack`

上滑时顶部卡片堆叠，层级随剩余数量调整。

**Prompt**

> 做一组堆叠卡片：上滑时顶部卡片移出，后面的卡片依次上前，缩放和透明度随剩余数量调整；下滑可回看上一张。卡片层级与可点击区域必须一致，不能点到被盖住的卡片。

**Skills** `uiux-motion-engineering` · `uiux-component-engineering`

**Tags** 卡片 · 堆叠 · 层级 · 上滑

**Acceptance**

- 层级与点击一致
- 回看可逆
- 快速滑动不卡

### 028 · 卡片沿曲线飞向删除

`app-card-delete` · scene `cardLab` / `delete`

删除时卡片沿曲线飞向删除图标，同步缩小降透明。

**Prompt**

> 删除卡片时，卡片沿一条曲线飞向右上角的删除图标，同步缩小并降低透明度，图标在接住时弹一下；其余卡片平滑补位。撤销入口保留在提示条里，不能只靠动画表达删除成功。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec`

**Tags** 删除 · 曲线 · 缩小 · 撤销

**Acceptance**

- 撤销可恢复
- 其他卡片补位
- 减少动态时直接移除

### 029 · 卡片展开成全屏详情

`app-card-fullscreen` · scene `cardLab` / `fullscreen`

卡片从原位置放大成详情，文字从底部滑入，下拉缩回。

**Prompt**

> 点击卡片时，卡片从原位置放大展开成全屏详情，文字内容从底部错层滑入；下拉手势跟手缩回原卡片位置。关闭后滚动位置和卡片状态保持不变。

**Skills** `uiux-motion-engineering` · `uiux-mobile-patterns`

**Tags** 全屏详情 · 卡片 · 共享位置 · 下拉

**Acceptance**

- 回到原位置
- 滚动位置保持
- Esc 可关闭

### 030 · 立体翻面卡片

`app-card-flip` · scene `cardLab` / `flip`

点击绕竖轴 3D 翻转，高光随指针位置变化。

**Prompt**

> 做一个带透视的 3D 翻转卡片：点击绕竖轴翻转切换正反面，背面内容不能镜像；指针移动时柔和高光跟随。键盘 Enter/Space 可翻转，减少动态时直接切换内容。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 3D · 翻转 · 透视 · 高光

**Acceptance**

- 背面不镜像
- 键盘可翻
- 减少动态可读

## 控件

### 031 · 滑杆吸附与过冲

`app-slider-snap` · scene `sliderLab` / `snap`

松手后惯性过冲，再被刻度拉回，模拟重量手感。

**Prompt**

> 做一个带刻度的滑杆：拖动时跟手，松手后按速度产生一次轻微惯性过冲，再被最近的刻度拉回。刻度标签同步高亮，键盘左右键逐格移动，Home/End 到两端。

**Skills** `uiux-motion-engineering` · `uiux-component-engineering`

**Tags** 滑杆 · 刻度 · 过冲 · 手感

**Acceptance**

- 松手结果落在刻度
- 快速拖动不丢状态
- 键盘逐格

### 032 · 环形读数平滑停住

`app-ring-readout` · scene `feedbackLab` / `ring`

数字变化时环形进度同步增长，最后平滑停住。

**Prompt**

> 做一个环形读数：数值变化时圆环进度同步增长，数字滚动到新值，最后平滑停住。超过目标时换一种颜色并显示超出量；重置后立即回到起点。

**Skills** `uiux-motion-engineering` · `uiux-design-system`

**Tags** 环形 · 读数 · 数字滚动 · 停住

**Acceptance**

- 数值与弧长一致
- 超目标有区分
- 键盘可调整

### 033 · 联动滑杆与读数

`app-slider-linked` · scene `sliderLab` / `linked`

轨道、滑钮、数值和环形读数同步变化。

**Prompt**

> 做一个联动滑杆：拖动时轨道填充、滑钮位置、数值文字和右侧环形读数同步变化，松手后数值吸附到整数。所有控件共用同一状态，不能出现一个动另一个滞后。

**Skills** `uiux-component-engineering` · `uiux-design-system`

**Tags** 联动 · 滑杆 · 环形 · 同一状态

**Acceptance**

- 四处显示一致
- 整数吸附
- 键盘同步

### 034 · 轮播指示点连续过渡

`app-carousel-dots` · scene `cardLab` / `snap`

当前项拉长成短条，随滑动进度在相邻两点间连续过渡。

**Prompt**

> 做轮播指示点：当前项拉长成短条，随滑动进度在相邻两点之间连续过渡；松手后吸附到目标点，点击指示点也能切换。

**Skills** `uiux-motion-engineering` · `uiux-component-engineering`

**Tags** 轮播 · 指示点 · 连续 · 吸附

**Acceptance**

- 跟随滑动
- 点击可切
- 键盘可切

### 035 · 双头范围滑块

`app-range-dual` · scene `sliderLab` / `dual`

两个把手之间伸缩填充，拖动时浮出实时数值。

**Prompt**

> 做一个双头范围滑块：两个把手之间的填充随拖动伸缩，拖动任一把手时上方浮出实时数值标签，松手后收回。两个把手不能交叉，键盘分别调整起止值。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 范围 · 双把手 · 实时数值 · 键盘

**Acceptance**

- 把手不交叉
- 起止值可分别调整
- 浮层不挡操作

### 036 · 拖动连选时间段

`app-time-range` · scene `sliderLab` / `timeRange`

按住拖动连选多个时段，合并成条，两端可单独调整。

**Prompt**

> 做一个时间段选择器：按住拖动连选多个半小时时段，合并成一条连续色条；两端把手可单独调整，起止时间实时更新。点击已选时段可取消该段，键盘可逐格扩展。

**Skills** `uiux-component-engineering` · `uiux-mobile-patterns`

**Tags** 时间段 · 连选 · 合并 · 把手

**Acceptance**

- 起止时间正确
- 取消时段可逆
- 键盘可扩展

### 037 · 音量条橡皮筋

`app-volume-rubber` · scene `sliderLab` / `volume`

按住变粗，填充跟手，拖过端点拉出橡皮筋，松手回弹。

**Prompt**

> 做一条音量调节条：按住时轨道变粗，填充跟手；拖过 0 或 100 时出现橡皮筋拉伸，松手回弹到端点。拖动时显示当前数值，但不要每帧都让读屏播报。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 音量 · 橡皮筋 · 端点 · 回弹

**Acceptance**

- 越过端点有阻力
- 松手回端点
- 读屏不刷屏

### 038 · 字号刻度实时预览

`app-font-slider` · scene `sliderLab` / `font`

键盘顶部排布字号刻度，拖动时正文实时改大小。

**Prompt**

> 在输入键盘上方做一条字号刻度条，拖动滑块实时改变预览文字字号，并显示当前字号。松手后吸附到常用档位（14/16/18/20/24），键盘保持可操作。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 字号 · 刻度 · 实时预览 · 键盘

**Acceptance**

- 字号与数值一致
- 吸附档位
- 键盘不被遮挡

## 面板与弹层

### 039 · 不压暗的底部面板

`app-sheet-nondim` · scene `overlayLab` / `sheet`

面板升起但不加遮罩，背后页面仍可滚动点击。

**Prompt**

> 做一个底部弹出面板：不加遮罩层，背后页面保持可滚动和可点击；0.55 秒内用指定缓动升起。下拽超过 40px 或点击面板外部时收起。面板内要有明确的关闭按钮，焦点进入面板后可返回触发点。

**Skills** `uiux-interaction-spec` · `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 底部面板 · 无遮罩 · 拖拽 · 焦点

**Acceptance**

- 背后页面可用
- 拖拽阈值明确
- 关闭后焦点复位

### 040 · 顶部计时小条

`app-timer-bar` · scene `overlayLab` / `timer`

离开页面时横向撑开显示剩余时间，点击展开成操作卡片，数秒无操作自动收回。

**Prompt**

> 做一个顶部计时小条：离开页面时横向撑开显示剩余时间；点击展开成操作卡片，数秒无操作自动收回。计时必须基于真实时间戳，页面不可见时也不能停走。

**Skills** `uiux-interaction-spec` · `uiux-component-engineering`

**Tags** 计时 · 顶部条 · 自动收回 · 真实时间

**Acceptance**

- 切页后时间正确
- 自动收回可暂停
- 键盘可展开

### 041 · 分步底部弹窗

`app-step-sheet` · scene `overlayLab` / `stepSheet`

切换步骤时内容横向滑动，弹窗高度平滑过渡。

**Prompt**

> 做一个分步底部弹窗：切换步骤时内容横向滑动，弹窗高度随内容平滑过渡；上一步/下一步按钮状态同步，最后一步变成完成。关闭再打开时回到第一步。

**Skills** `uiux-component-engineering` · `uiux-motion-engineering`

**Tags** 分步 · 底部弹窗 · 高度 · 完成

**Acceptance**

- 高度不跳变
- 步骤状态正确
- 关闭重置

### 042 · 分类标签展开成网格

`app-category-grid` · scene `overlayLab` / `category`

单行标签展开为网格，选中后收回并居中。

**Prompt**

> 做一排分类标签：点击「更多」后单行展开为网格，选中某项后网格收回，被选项居中；再次打开时保持当前选择可见。展开与收回过程中页面不要跳动。

**Skills** `uiux-motion-engineering` · `uiux-mobile-patterns`

**Tags** 分类 · 网格 · 展开 · 居中

**Acceptance**

- 页面不跳动
- 选中项可见
- 键盘可遍历

### 043 · 结算栏弹出清单

`app-checkout-sheet` · scene `overlayLab` / `checkout`

点击结算栏后从栏上方展开清单，再点收回。

**Prompt**

> 做一个底部结算栏：点击后从栏上方展开商品清单，再点收回；展开时栏本身不移动，清单高度随商品数量变化。金额合计始终可见，键盘可以展开和关闭。

**Skills** `uiux-component-engineering` · `uiux-interaction-spec`

**Tags** 结算 · 清单 · 展开 · 合计

**Acceptance**

- 合计始终可见
- 展开不推走栏
- 键盘可开关

### 044 · 气泡提示自动收回

`app-tooltip-auto` · scene `overlayLab` / `tooltip`

带指向箭头的气泡数秒后自动收回。

**Prompt**

> 做一个带指向箭头的气泡提示：出现在目标元素上方，数秒后自动收回；鼠标悬停或聚焦时暂停计时，离开后继续。提示不能被裁切，箭头始终指向目标。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 气泡 · 箭头 · 自动收回 · 暂停

**Acceptance**

- 箭头指向目标
- 聚焦可读
- 不被裁切

### 045 · 确认弹窗回弹后原地完成

`app-confirm-spring` · scene `overlayLab` / `confirm`

弹窗带轻微回弹，确认后原地切换为完成状态。

**Prompt**

> 做一个确认弹窗：弹出时带轻微回弹，确认后不关闭再开新弹窗，而是在原地切换为完成状态并显示对勾；取消则收回原按钮。焦点在弹窗内循环，确认结果可被读屏播报。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 确认 · 回弹 · 完成态 · 焦点

**Acceptance**

- 焦点不逃出弹窗
- 完成态可逆
- 结果被播报

### 046 · 日期弹出日历

`app-calendar-pop` · scene `overlayLab` / `calendar`

日历从标签下方展开，选中后收回并更新文字。

**Prompt**

> 做一个日期选择：点击日期标签后日历从标签下方展开，选中日期后收回并更新标签文字；点击外部或 Esc 关闭。今天的日期有明确标记，键盘方向键可移动日期。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 日期 · 日历 · 弹出 · 键盘

**Acceptance**

- 选中后更新文字
- 今天有标记
- Esc 关闭

### 047 · 撕线取票面板

`app-ticket-tear` · scene `overlayLab` / `ticket`

底部虚线撕口，下拉沿虚线展开取票码，松手回弹。

**Prompt**

> 做一个取票面板：底部有虚线撕口，按住下拉时面板沿虚线展开露出取票码，松手根据距离回弹或保持展开；再上推合上。虚线在展开过程中保持连续，不要变成普通边框。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec`

**Tags** 取票 · 撕线 · 下拉 · 回弹

**Acceptance**

- 展开与合上可逆
- 阈值明确
- 码可被复制

### 048 · 下拉以选中项对齐

`app-select-align` · scene `overlayLab` / `selectAlign`

展开时以当前选中项为中心对齐，选中后收回并更新框内文字。

**Prompt**

> 做移动端下拉选择：展开时列表以当前选中项为中心对齐，选中后收回并更新框内文字；选项较多时列表在视口内滚动，选中项保持可见。

**Skills** `uiux-component-engineering` · `uiux-mobile-patterns`

**Tags** 下拉 · 对齐 · 选中项 · 滚动

**Acceptance**

- 选中项居中
- 收回更新文字
- 键盘可选

### 049 · 照片抽屉

`app-photo-drawer` · scene `overlayLab` / `photo`

照片放大铺满上半屏，面板从底部升起压住下沿；上拖时照片缩成窄条。

**Prompt**

> 做一个照片抽屉：打开时照片放大铺满上半屏，面板从底部升起压住照片下沿；上拖面板时照片同步缩成窄条，下拽则重新铺开。照片与面板的高度始终互补，不能出现空隙。

**Skills** `uiux-motion-engineering` · `uiux-mobile-patterns`

**Tags** 照片 · 抽屉 · 高度互补 · 拖拽

**Acceptance**

- 照片与面板无空隙
- 拖拽跟手
- 关闭可逆

## 排序与拖拽

### 050 · 拖动自动吸附参考线

`app-sort-snap` · scene `sortLab` / `snap`

接近参考线时自动吸附并显示对齐线，吸附瞬间有轻微顿挫。

**Prompt**

> 拖拽卡片时检测它与参考线的距离，进入阈值后自动吸附并显示对齐线；吸附瞬间给一次轻微的位移顿挫，离开阈值后恢复自由拖动。参考线要跟随容器尺寸计算。

**Skills** `uiux-motion-engineering` · `uiux-component-engineering`

**Tags** 吸附 · 参考线 · 拖拽 · 顿挫

**Acceptance**

- 阈值可调
- 吸附不锁死
- 键盘可微调

### 051 · 拖过分隔线固定

`app-sort-favorite` · scene `sortLab` / `favorite`

拖到顶部分隔线以上，松手后成为常用项。

**Prompt**

> 菜单项支持按住拖动排序。拖动时该项轻微放大，其余项平滑让位；松手吸附到新位置。拖到顶部分隔线以上时显示固定区高亮，松手后把该项固定为常用项；向下拖出固定区则取消固定。

**Skills** `uiux-component-engineering` · `uiux-interaction-spec`

**Tags** 拖拽 · 常用项 · 分隔线 · 吸附

**Acceptance**

- 固定区与普通区分开
- 跨越分隔线有明确提示
- 取消固定可逆

### 052 · 拖拽排序，其余让位

`app-sort-basic` · scene `sortLab` / `basic`

按住一行浮起，其他行连续让位，松手吸附到新位置。

**Prompt**

> 做一个可拖动排序的列表。长按一行后该项轻微放大并浮起，拖动时其余项平滑让位，松手吸附到新位置。支持键盘 Alt+方向键移动，并给拖动项保留清晰的阴影和层级。

**Skills** `uiux-component-engineering` · `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 拖拽 · 排序 · 弹簧 · 键盘

**Acceptance**

- 拖动中顺序实时更新
- 松手位置可预测
- 键盘可完成同一操作

## 手势

### 053 · 边缘滑动返回，看速度

`app-gesture-edge` · scene `gestureLab` / `edgeBack`

不只判断距离，还读取松手速度与方向决定继续或取消。

**Prompt**

> 实现边缘滑动返回：读取松手时的速度与方向，快速外甩则继续返回，往回带则取消；加入阻力曲线、阴影位移和进度条。支持中途反向取消，禁用时不破坏页面滚动。

**Skills** `uiux-motion-engineering` · `uiux-mobile-patterns` · `uiux-accessibility-review`

**Tags** 手势 · 返回 · 速度 · 取消

**Acceptance**

- 速度阈值可调
- 中途可反向
- 有键盘替代

### 054 · 横竖滑动锁定

`app-gesture-axis` · scene `gestureLab` / `axis`

初始 12px 内判断主方向，锁定后不再切换。

**Prompt**

> 图片详情同时支持横滑翻页和竖滑关闭：初始 12px 内计算主方向，锁定后不再切换；dx>dy+阈值则横滑，反之竖滑，锁定后允许小幅反向容错。不要让页面滚动同时抢手势。

**Skills** `uiux-motion-engineering` · `uiux-mobile-patterns`

**Tags** 方向锁定 · 横滑 · 竖滑 · 冲突

**Acceptance**

- 一次只锁一个方向
- 容错不跳变
- 有按钮替代

### 055 · 接住飞出去的卡片

`app-gesture-catch` · scene `gestureLab` / `catch`

惯性滑动中再次触摸立即停止动画并接管拖拽。

**Prompt**

> 卡片惯性滑动中，再次触摸立即停止动画并把控制权交给手指；支持拖拽归位或删除，摩擦系数 0.92–0.96，不能出现动画锁死。松手后可以继续惯性。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec`

**Tags** 惯性 · 接管 · 触摸 · 摩擦

**Acceptance**

- 触摸即停
- 可继续拖
- 不锁死

### 056 · 可逃逸按钮

`app-gesture-escape` · scene `gestureLab` / `escape`

手指移出热区就取消提交，松手只在热区内触发。

**Prompt**

> 实现可逃逸按钮：按下时加深/缩放，手指移出热区后逐渐变浅并取消提交；松手仅在热区内触发。热区比视觉按钮大 20%，移出距离超过阈值时 commit=false，不需要二次确认弹窗。

**Skills** `uiux-interaction-spec` · `uiux-accessibility-review`

**Tags** 手势 · 取消 · 热区 · 提交

**Acceptance**

- 移出即取消
- 热区大于视觉
- 键盘可提交

### 057 · 拉到头还能再拉

`app-gesture-rubber` · scene `gestureLab` / `rubber`

边界继续拉动有非线性阻力，松手弹簧回弹。

**Prompt**

> 列表到顶/底后继续拉动产生非线性阻力（阻力=1/(1+offset/limit)），松手用弹簧平滑回弹；禁止无限拉伸，并与下拉刷新兼容。

**Skills** `uiux-motion-engineering` · `uiux-mobile-patterns`

**Tags** 橡皮筋 · 边界 · 弹簧 · 下拉刷新

**Acceptance**

- 阻力非线性
- 回弹不过冲
- 刷新可触发

### 058 · 松手前预知落点

`app-gesture-project` · scene `gestureLab` / `project`

拖拽中实时预测目标索引并高亮指示器。

**Prompt**

> 横向卡片轮播时，拖拽中根据速度和偏移实时预测目标索引，提前高亮页码/指示器；支持加力多翻一页。松手后直接落到预测位置，不要冲过头再回弹。

**Skills** `uiux-motion-engineering` · `uiux-mobile-patterns`

**Tags** 预测 · 轮播 · 指示器 · 速度

**Acceptance**

- 预测与落点一致
- 可多翻一页
- 无过冲

### 059 · 只让变化的字动

`app-gesture-diff` · scene `gestureLab` / `diff`

切换筛选或计数时只对变化字符做翻牌/滚动。

**Prompt**

> 切换筛选或计数时，只对变化的字符做翻牌或滚动动画，不变字符保持原位。新旧文本逐字符 diff，数字用滚动、文字用淡入位移，动画 200–350ms，一眼能看出改动位置。

**Skills** `uiux-motion-engineering` · `uiux-component-engineering`

**Tags** 文字动画 · diff · 数字滚动 · 筛选

**Acceptance**

- 不变字符不动
- 时长可控
- 读屏文本完整

## 输入与反馈

### 060 · 表单错误轻晃滑入

`app-input-error` · scene `inputLab` / `error`

出错时输入框轻晃、边框变红，提示从下方滑入。

**Prompt**

> 表单校验失败时，输入框轻晃一次，边框变红，错误提示从下方滑入；修正后提示收起。晃动不要循环，错误文字要与输入框通过 aria-describedby 关联。

**Skills** `uiux-accessibility-review` · `uiux-motion-engineering`

**Tags** 表单 · 错误 · 晃动 · aria-describedby

**Acceptance**

- 只晃一次
- 修正后收起
- 读屏关联错误

### 061 · 动态搜索框

`app-search-dynamic` · scene `inputLab` / `search`

点击输入区边框高亮，标签上移缩小。

**Prompt**

> 做一个动态搜索框：点击输入区时边框高亮，占位标签上移缩小；输入时显示清空按钮和结果计数，按 Esc 收起并恢复标签。搜索本身不能因动画延迟。

**Skills** `uiux-component-engineering` · `uiux-mobile-patterns`

**Tags** 搜索 · 聚焦 · 标签 · 清空

**Acceptance**

- 输入即过滤
- Esc 复原
- 清空按钮可聚焦

### 062 · 浮动标题输入框

`app-input-floating` · scene `inputLab` / `floating`

聚焦时提示文字缩小上移成标题，为空失焦时复原。

**Prompt**

> 做一个浮动标题输入框：聚焦时提示文字缩小并上移成标题，边框高亮；已经输入内容时失焦保持标题在上方，为空失焦则复原。错误状态要同时改变边框、图标和文字，不只靠颜色。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 输入框 · 浮动标签 · 焦点 · 错误

**Acceptance**

- 标签不遮挡输入
- 空值失焦复原
- 错误不只靠颜色

### 063 · 复制按钮翻转成对勾

`app-copy-flip` · scene `feedbackLab` / `copy`

点击后图标翻面，弹出已复制提示，一秒后复原。

**Prompt**

> 做一个复制按钮：点击后图标沿水平轴翻面成对勾，旁边弹出「已复制」提示，一秒后自动复原。复制失败时显示另一种提示，不要把失败也画成对勾。

**Skills** `uiux-component-engineering` · `uiux-motion-engineering`

**Tags** 复制 · 翻转 · 成功反馈 · 失败状态

**Acceptance**

- 失败与成功可区分
- 一秒后复原
- 读屏收到结果

### 064 · 输入联想与键盘选择

`app-input-autocomplete` · scene `inputLab` / `autocomplete`

输入时弹出联想列表，高亮命中内容，上下键选择。

**Prompt**

> 做一个输入联想：输入时弹出建议列表并高亮匹配文字，支持上下键移动、回车确认、Esc 关闭。没有匹配时说明可以新建，不要把空列表当成加载中。

**Skills** `uiux-component-engineering` · `uiux-accessibility-review`

**Tags** 联想 · 高亮 · 键盘 · 空状态

**Acceptance**

- 键盘可完成选择
- 空状态明确
- Esc 恢复焦点

### 065 · 长按录音，滑动取消

`app-record-hold` · scene `inputLab` / `record`

长按麦克风展开进度条，松手结束，滑动可取消。

**Prompt**

> 做一个长按录音条：长按麦克风后展开计时和波形，松手结束；按住向上滑动超过阈值取消录音，并给出明确提示。展开过程中不能挡住输入框，错误和取消都要能读屏播报。

**Skills** `uiux-mobile-patterns` · `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 录音 · 长按 · 滑动取消 · 计时

**Acceptance**

- 取消与结束可区分
- 松手状态正确
- 键盘有替代操作

## 页面场景

### 066 · 不压暗的日记面板

`app-diary-sheet` · scene `diaryLab` / `sheet`

底部面板不加遮罩，背后页面可滚动，下拽超 40px 或点外部收起。

**Prompt**

> 日记页底部弹出编辑面板，不加遮罩层，背后页面保持可滚动点击；0.55 秒内用指定曲线升起，下拽超过 40px 或点击外部收起。保存后更新当天记录。

**Skills** `uiux-interaction-spec` · `uiux-mobile-patterns`

**Tags** 日记 · 面板 · 无遮罩 · 保存

**Acceptance**

- 背后可滚动
- 阈值收起
- 保存更新记录

### 067 · 大标题跟着选项换

`app-diary-title` · scene `diaryLab` / `title`

三行大标题分别绑定心情、天气、星期，只更新对应行。

**Prompt**

> 三行大标题每行绑定一个选项（心情、天气、星期），选项变化时只更新对应那行文字，其余行保持不动；文字长度变化不能导致下方内容跳动。

**Skills** `uiux-motion-engineering` · `uiux-page-planning`

**Tags** 大标题 · 选项 · 逐行更新 · 不跳动

**Acceptance**

- 只改对应行
- 布局不跳
- 选项可键盘切换

### 068 · 数字卡压住头图

`app-diary-numbers` · scene `diaryLab` / `numbers`

三格数字卡用负外边距压住头图下沿，上滑时头图压缩、数字卡吸顶。

**Prompt**

> 首页头图下方放三格数字卡，用负上外边距让它上移半个卡高压住头图下沿；上滑时头图压缩只剩标题，数字卡吸在顶部，其余内容从下方穿过。

**Skills** `uiux-page-planning` · `uiux-mobile-patterns`

**Tags** 头图 · 数字卡 · 负边距 · 吸顶

**Acceptance**

- 不遮标题
- 吸顶不跳
- 内容可读

### 069 · 头图左右滑翻篇

`app-diary-swipe` · scene `diaryLab` / `swipe`

横向位移超 44px 切换记录，只有头图和大标题切换，下方列表不动。

**Prompt**

> 头图区加左右滑动手势：横向位移超过 44px 切换记录，只有头图和大标题切换，下方列表不动；滑到首尾提示已到最新/最早一篇。

**Skills** `uiux-motion-engineering` · `uiux-mobile-patterns`

**Tags** 横滑 · 翻篇 · 头图 · 边界

**Acceptance**

- 列表不动
- 首尾有提示
- 按钮可替代

### 070 · 月历空格直接补写

`app-diary-calendar` · scene `diaryLab` / `calendar`

有记录日期显彩色圆加贴纸，空格显虚线圈加号，点空格直接编辑。

**Prompt**

> 做五周月历网格：有记录的日期显示彩色圆加贴纸，空日期显示虚线圈加号；点空格直接弹出编辑面板，保存后月历对应格立即更新，不跳转新页面。

**Skills** `uiux-mobile-patterns` · `uiux-component-engineering`

**Tags** 月历 · 空状态 · 编辑 · 即时更新

**Acceptance**

- 空格可编辑
- 保存即更新
- 键盘可遍历

## 移动组件

### 071 · 弹性开关

`app-kit-switch` · scene `mobileKit` / `switch`

滑钮起步横向拉长，滑到终点再恢复形状。

**Prompt**

> 做弹性开关：切换时滑钮起步横向拉长，滑到终点再恢复形状；轨道颜色和文字状态同步。开关必须有 role=switch、aria-checked，并支持 Space 切换。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 开关 · 弹性 · role=switch · 键盘

**Acceptance**

- 状态可读
- 拉长可关闭
- Space 可切换

### 072 · 底部操作栏预留安全区

`app-kit-bottombar` · scene `mobileKit` / `bottomBar`

固定吸底，左侧信息、右侧主按钮，预留安全区高度。

**Prompt**

> 做固定吸底的移动端底部操作栏：左侧展示合计信息，右侧放主操作按钮；用 safe-area-inset-bottom 预留安全区，内容滚动到底部时不被遮挡。

**Skills** `uiux-mobile-patterns` · `uiux-design-system`

**Tags** 底部栏 · 安全区 · 主按钮 · 吸底

**Acceptance**

- 不遮内容
- 安全区生效
- 主按钮可聚焦

### 073 · 多功能操作卡片

`app-kit-operation` · scene `mobileKit` / `operation`

集成加减控件、开关、滑块，本地操作实时反馈，不跳页。

**Prompt**

> 做一张多功能操作卡片：集成加减控件、开关和滑块，所有操作在本地实时反馈，不跳转页面；每个控件有独立状态和清晰标签，重置按钮恢复到初始值。

**Skills** `uiux-component-engineering` · `uiux-mobile-patterns`

**Tags** 操作卡 · 步进器 · 开关 · 滑块

**Acceptance**

- 状态独立
- 重置可逆
- 键盘可操作

### 074 · 分段控件滑块跟随

`app-kit-segmented` · scene `mobileKit` / `segmented`

选中块先拉长再滑动再收回，内容区横向联动。

**Prompt**

> 做移动端分段控件：切换时选中块先拉长、再滑动、再收回，内容区横向联动切换。分段数量变化时滑块宽度自适应，键盘左右键可切换。

**Skills** `uiux-component-engineering` · `uiux-motion-engineering`

**Tags** 分段控件 · 滑块 · 拉长 · 联动

**Acceptance**

- 滑块与文字对齐
- 内容同步
- 键盘可切换

### 075 · 环形读数与滑杆联动

`app-kit-ring` · scene `mobileKit` / `ring`

滑杆拖动时环形进度、数字与颜色同步变化。

**Prompt**

> 做一个环形读数控件：滑杆拖动时环形进度、中心数字与颜色同步变化，松手后平滑停住；超过目标值换色并显示超出量。

**Skills** `uiux-design-system` · `uiux-motion-engineering`

**Tags** 环形 · 滑杆 · 读数 · 目标

**Acceptance**

- 弧长与数值一致
- 超目标有区分
- 键盘可调

### 076 · 搜索筛选合并一行

`app-kit-search` · scene `mobileKit` / `search`

搜索与筛选合并成一行，标签上移缩小，结果实时更新。

**Prompt**

> 把移动端搜索与筛选合并成一行：搜索框占主要宽度，右侧筛选按钮打开面板；聚焦时标签上移缩小，输入时结果实时更新并显示数量。

**Skills** `uiux-mobile-patterns` · `uiux-component-engineering`

**Tags** 搜索 · 筛选 · 合并 · 实时

**Acceptance**

- 筛选可用
- 结果计数
- 键盘不遮挡

## 主题与状态

### 077 · 按压卡片下沉回弹

`app-press-card` · scene `feedbackLab` / `press`

按下缩放下沉，松开回弹，阴影从柔和变紧。

**Prompt**

> 给卡片加按压反馈：按下时轻微缩小并下沉，阴影收紧；松开后弹回原位。按住移动超出卡片范围时取消按压，回到范围内恢复。键盘 Space/Enter 也能触发一次完整反馈。

**Skills** `uiux-motion-engineering` · `uiux-accessibility-review`

**Tags** 按压 · 缩放 · 阴影 · 键盘

**Acceptance**

- 移出取消
- 快速连按不卡住
- 减少动态时仍有颜色反馈

### 078 · 步骤进度先超调再回弹

`app-step-overshoot` · scene `feedbackLab` / `steps`

完成一步时进度条先越过目标再回弹，强化确认感。

**Prompt**

> 做一个四步流程的进度指示。完成一步时进度条先超调约 8%，再回弹到准确位置；当前步骤标签同步切换。支持上一步回退，回退时不播放完成态的庆祝效果。

**Skills** `uiux-interaction-spec` · `uiux-motion-engineering`

**Tags** 步骤 · 超调 · 回弹 · 确认

**Acceptance**

- 回退可逆
- 减少动态时直接到位
- 步骤文字同步

### 079 · 触点扩散换主题

`app-theme-tap` · scene `themeReveal` / `tap`

深色从手指按下的位置圆形扩散，反向沿原路收回。

**Prompt**

> 做一个主题切换：以点击或触摸的位置为圆心，新的深色主题用圆形扩散覆盖全屏；覆盖层只做裁切，不缩放、不位移。再次切换时从同一圆心反向收回。底层内容保持原位，覆盖完成后按钮与文字立即可用。

**Skills** `uiux-motion-engineering` · `uiux-design-system` · `uiux-accessibility-review`

**Tags** 主题 · 圆形扩散 · 可逆 · 触控

**Acceptance**

- 正反切换沿同一路径
- 减少动态时直接切换
- 主题状态与按钮状态一致

### 080 · 开关联动只做视觉震动

`app-switch-group` · scene `feedbackLab` / `switchGroup`

同组其他开关只震动回应，不改变实际状态。

**Prompt**

> 一组四个开关，切换其中一个时，同组其他开关只做轻微视觉震动，不改变它们的真实状态；当前开关正常切换。震动结束后所有状态可被读屏准确读出，不能让人误以为其他项也被打开。

**Skills** `uiux-accessibility-review` · `uiux-motion-engineering`

**Tags** 开关 · 联动 · 震动 · 状态诚实

**Acceptance**

- 其他开关 aria-checked 不变
- 震动可关闭
- 状态文字明确

### 081 · 开关位置扩散

`app-theme-switch` · scene `themeReveal` / `switch`

新主题从深色开关本身向外扩散，像光从灯罩里亮起来。

**Prompt**

> 深色模式开关切换时，新主题从开关的位置圆形扩散覆盖全屏；再次切换时反向收回。扩散过程中开关保持可操作，但不要重复触发；字体、底色和卡片阴影在覆盖结束后统一切换，避免中途闪烁。

**Skills** `uiux-motion-engineering` · `uiux-design-system`

**Tags** 深色模式 · 开关 · 圆形扩散

**Acceptance**

- 快速连点不叠层
- 扩散原点跟随开关
- 键盘可切换

### 082 · 批量勾选逐个弹起

`app-batch-check` · scene `feedbackLab` / `batch`

全选时按顺序逐个勾选，每项带轻微弹性放大。

**Prompt**

> 做一个批量选择列表。点击全选后按顺序逐个勾选，每一项勾选时轻微弹性放大；取消全选时反向逐个取消。单项仍可独立勾选，顶部计数与全选状态实时同步。

**Skills** `uiux-motion-engineering` · `uiux-component-engineering`

**Tags** 批量选择 · 顺序 · 弹性 · 计数

**Acceptance**

- 快速连点不跳过状态
- 计数与勾选一致
- 键盘可操作

### 083 · 文本展开与箭头翻转

`app-text-expand` · scene `feedbackLab` / `expand`

容器高度随文字渐变，箭头同步转 180 度。

**Prompt**

> 做可展开文本卡：点击后容器高度随文字内容渐变展开，箭头同步旋转 180 度；收起时高度回到摘要高度，展开状态可被读屏读出。

**Skills** `uiux-motion-engineering` · `uiux-component-engineering`

**Tags** 展开 · 高度 · 箭头 · 可逆

**Acceptance**

- 高度与内容一致
- 箭头同步
- 展开状态可读

## 照片与转场

### 084 · 扇形叠切切换

`app-photo-fan` · scene `motionLab` / `fan`

四张照片展开成扇形，滑动时整组用弹簧摆位，标题同步替换，当前分页点拉长。

**Prompt**

> 做扇形叠切切换：四张照片以底部中心为轴展开成扇形，当前一张居中且在最上层。左右滑动时整组跟手转动；松手按距离和速度吸附到最近的一张，用弹簧摆位（轻微过冲，不来回晃）。标题在遮罩内随当前照片替换，分页指示点里当前那颗拉长成胶囊。摆动途中再次拖动要从当前位置接着走；提供左右按钮和方向键；减少动态效果时直接切换，不做摆动。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec` · `uiux-mobile-patterns`

**Tags** 扇形 · 照片 · 弹簧 · 分页点 · 滑动切换

**Acceptance**

- 松手总是吸附到整张
- 快速连滑不错位
- 标题和分页点与当前照片一致
- 方向键和按钮可切换

### 085 · 缩略图共享转场成票根

`app-photo-ticket` · scene `motionLab` / `ticket`

点缩略图，图片平滑放大成票根卡片，旧页缩放淡出、新页同步淡入。

**Prompt**

> 做缩略图到票根卡片的共享元素过渡：点击缩略图，图片从原位置和尺寸平滑放大到详情页票根卡片的位置；旧页面同时缩小淡出，票根的文字和撕口在图片接近到位时淡入。返回时沿原路缩回同一张缩略图。转场中重复点击不叠加；焦点进入详情标题，返回后回到原缩略图；减少动态效果时改为淡入淡出。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec` · `uiux-component-engineering`

**Tags** 共享元素 · 票根 · 缩略图 · 转场 · 页面切换

**Acceptance**

- 图片从原位放大且不跳动
- 返回缩回原缩略图
- 焦点进出正确
- 转场中重复点击不叠加

### 086 · 照片收拢成相册

`app-photo-gather` · scene `motionLab` / `gather`

多张照片向中心收拢成一摞，弹簧落定后切到新页面。

**Prompt**

> 做照片收拢转场：点击「生成相册」后，网格里的每张照片从各自位置飞向中心点，带轻微旋转叠成一摞，用弹簧落定（每张错开约 30ms）；全部落定后切到相册页，那一摞变成相册封面。返回时照片从中心散回原来的格子。收拢过程中按钮禁用，不能重复触发；减少动态效果时直接淡入新页面。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec` · `uiux-mobile-patterns`

**Tags** 收拢 · 聚合 · 照片 · 弹簧 · 相册

**Acceptance**

- 每张照片从原格子出发
- 全部落定后才切页
- 返回时散回原位
- 动画中按钮不可重复触发

### 087 · 滑动分拣卡片

`app-photo-sort` · scene `motionLab` / `sort`

卡片左右滑动分拣，拖动时位移带倾斜，松手按距离决定飞出或回弹。

**Prompt**

> 做卡片滑动分拣：卡片跟手横向移动并按位移倾斜（最大约 12°），向右露出「保留」、向左露出「跳过」，越接近阈值提示越清楚。松手时，超过卡片区宽度 35% 或快速甩出，就沿方向飞出并计入对应分组；否则用弹簧回到中间，拉得越远回弹越明显。提供「跳过 / 保留」按钮、左右方向键和撤销；最后一张分完显示空状态和分拣结果。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec` · `uiux-mobile-patterns`

**Tags** 分拣 · 滑动 · 倾斜 · 回弹 · 撤销

**Acceptance**

- 没过阈值时回到中间
- 快速甩出也能分拣
- 计数正确且可撤销
- 按钮和方向键能完成同样操作

### 088 · 大标题逐行切换

`app-title-lines` · scene `motionLab` / `title`

大标题每行单独遮罩，间隔 60ms 逐行出入；主视觉先淡出再用弹簧弹回。

**Prompt**

> 做大标题逐行切换：标题的每一行放在独立遮罩里，切换时旧行依次向上退出，新行依次从下方进入，行与行间隔 60ms；主视觉图同时淡出并略微缩小，新内容就位后用弹簧放大回来。连续切换时取消未完成的动画，从当前状态直接走向新内容；读屏只读一次完整标题；减少动态效果时只做淡入淡出。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec` · `uiux-accessibility-review`

**Tags** 标题 · 逐行 · 遮罩 · 错峰 · 主视觉

**Acceptance**

- 能看出逐行错开约 60ms
- 连续切换不残留旧行
- 读屏读到完整标题
- 减少动态效果时没有位移

### 089 · 相册卡片堆叠切换

`app-album-stack` · scene `motionLab` / `album`

卡片组带堆叠偏移和旋转，滑走最上一张后其余用弹簧重排，指示器同步更新。

**Prompt**

> 做相册卡片滑动切换：相册卡片叠成一摞，后面的卡片依次下移、缩小并带 ±3° 旋转露出边缘。拖动最上面一张横向滑走，越过阈值后它移到最底，其余卡片用弹簧依次前移重排；没过阈值就回弹。底部指示器和页码与最上面的相册同步。提供上一本 / 下一本按钮和方向键；减少动态效果时直接换序。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec` · `uiux-mobile-patterns`

**Tags** 相册 · 堆叠 · 旋转 · 重排 · 指示器

**Acceptance**

- 堆叠层次清楚
- 重排后顺序正确
- 指示器与最上面的卡片一致
- 连续切换不错位

### 090 · 列表卡片浮起展开

`app-list-lift` · scene `motionLab` / `lift`

点击列表卡片先放大上浮、周围模糊，再展开成详情；返回时反向回弹落位。

**Prompt**

> 做列表卡片弹性转场：点击列表项时，卡片先放大约 4% 并上浮、阴影加深，其他卡片和标题模糊变淡；随后卡片展开成详情页。返回时详情缩回列表里原来的位置，落位带轻微回弹，模糊同步撤掉。转场期间不能重复点击；焦点进入详情标题，返回后回到原卡片；减少动态效果时去掉模糊和回弹，只做淡入淡出。

**Skills** `uiux-motion-engineering` · `uiux-interaction-spec` · `uiux-component-engineering`

**Tags** 列表 · 卡片 · 上浮 · 模糊 · 详情 · 回弹

**Acceptance**

- 展开从被点的卡片开始
- 返回落回原位置
- 模糊撤销干净
- 焦点进出正确
