/* Effect catalogue and prompt builder for the pipeline playground.
   Every effect has a live scene (scenes.js) and an interaction contract that
   maps onto the uiux-* skill stages, so the generated prompt can be executed
   by an agent that has the skills installed. */
(() => {
  'use strict';

  const FEELS = {
    subtle: { label: '克制', k: 0.85, ease: 'cubic-bezier(.2,.8,.2,1)', easeText: 'ease-out，无回弹', over: 0 },
    normal: { label: '标准', k: 1, ease: 'cubic-bezier(.3,1.25,.5,1)', easeText: 'ease-out，轻微回弹（≤ 4%）', over: 0.04 },
    lively: { label: '活泼', k: 1.15, ease: 'cubic-bezier(.3,1.6,.45,1)', easeText: '弹簧感，回弹约 12%', over: 0.12 }
  };

  const EFFECTS = [
    /* ---------------- web ---------------- */
    {
      id: 'w-status', cat: 'web', fam: '按钮与反馈', scene: 'statusButton',
      title: '状态按钮：提交 → 加载 → 成功',
      sum: '按钮原地收拢成进度圈，成功画出对勾；失败时轻摇并恢复文案。',
      hint: '点击“保存设置”。每第三次会模拟失败。',
      keys: ['按钮', '提交', '保存', '加载', 'loading', '成功', '失败', '对勾', '进度', '点击反馈', '转圈'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '表单的主提交按钮',
        trig: '点击、回车或空格',
        seq: '按下缩放到 0.97 → 文案淡出、宽度收拢为圆形进度 → 成功时描出对勾并变为成功色；失败时左右轻摇两次后恢复文案“重试”',
        res: '成功 1.2s 后回到可提交；加载中重复点击被忽略；失败保留表单内容',
        acc: '按钮带 aria-busy；polite 播报“正在保存 / 已保存 / 保存失败”；减少动态效果时只切换文案和颜色，不变形'
      },
      states: 'idle · pressed · loading · success · error · disabled',
      intr: '加载中忽略再次点击；成功动画可被下一次点击立即结束',
      motion: [['按下', 120], ['收拢', 240], ['对勾', 320], ['失败轻摇', 360]],
      acc: ['加载期间连续点击只触发一次提交', '失败后焦点仍在按钮上，文案变为“重试”', '读屏能听到三种结果之一', '开启减少动态效果后按钮宽度不变']
    },
    {
      id: 'w-sort', cat: 'web', fam: '拖拽与排序', scene: 'dragSort',
      title: '拖拽排序：其余项让位',
      sum: '拖起一项时它浮起，其余项平滑让出位置；松手吸附到新位置。',
      hint: '按住 ⠿ 拖动；或聚焦把手后按空格拿起、↑↓ 移动、空格放下。',
      keys: ['拖拽', '拖动排序', '排序', '让位', '重新排列', '优先级', '调整顺序', '吸附', 'drag'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '可排序的任务列表项',
        trig: '指针按住把手拖动；键盘聚焦把手后空格拿起、方向键移动、空格放下、Esc 取消',
        seq: '拿起时该项放大 1.02 并加阴影 → 跨过相邻项中线时，相邻项沿反方向平移一个行高 → 松手后该项吸附到空位',
        res: '新顺序立即写入数据；Esc 或拖出列表外松手时回到原位',
        acc: '把手有可读名称；拿起、移动、放下都会播报“第 n 项，共 m 项”；减少动态效果时让位瞬间完成'
      },
      states: 'idle · grabbed · moving · dropped · cancelled',
      intr: '拖动中其余项的让位动画随指针实时重定向，不排队',
      motion: [['浮起', 140], ['让位', 180], ['吸附', 220]],
      acc: ['只用键盘可以把第 1 项移到第 4 项', '拖动中每次越过中线都有位置播报', 'Esc 取消后顺序不变', '快速来回拖动不出现重叠或空洞']
    },
    {
      id: 'w-filter', cat: 'web', fam: '布局与筛选', scene: 'filterGrid',
      title: '筛选重排：卡片滑到新位置',
      sum: '切换筛选标签时，留下的卡片从旧位置滑到新位置，离开的淡出。',
      hint: '点上方的标签切换分类。',
      keys: ['筛选', '过滤', '分类', '标签', '卡片', '网格', '重排', 'flip', '切换分类', 'tab'],
      skills: ['uiux-interaction-spec', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '作品网格与上方的分类标签',
        trig: '点击标签或键盘激活',
        seq: '离开的卡片缩小淡出 → 留下的卡片从旧位置平移到新位置（FLIP）→ 新出现的卡片淡入并上移 8px',
        res: '标签显示选中态；结果数量更新；再次点击“全部”恢复',
        acc: '标签用 aria-pressed；polite 播报“显示 n 项”；减少动态效果时直接切换布局'
      },
      states: 'all · filtered · empty',
      intr: '动画中再次切换时，从卡片当前位置重新计算，不跳回起点',
      motion: [['离开', 160], ['移位', 280], ['进入', 220]],
      acc: ['连续快速切换三个标签，卡片最终位置正确且无残影', '结果数量被播报', '卡片在动画中仍可点击/聚焦', '减少动态效果下没有位移动画']
    },
    {
      id: 'w-cmdk', cat: 'web', fam: '弹层与导航', scene: 'commandPalette',
      title: '命令面板：⌘K 搜索执行',
      sum: '快捷键或按钮唤出命令面板，输入即筛选，回车执行，关闭后焦点回到原处。',
      hint: '点“搜索命令”，或在舞台内按 Ctrl/⌘ + K。',
      keys: ['命令面板', '搜索', '快捷键', 'cmdk', '⌘k', 'ctrl k', '弹窗', '对话框', 'modal', '快速跳转', 'spotlight'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '工作台顶部的命令面板',
        trig: 'Ctrl/⌘ + K 或点击搜索按钮',
        seq: '遮罩淡入，面板从 0.96 缩放并下移 8px 出现 → 输入时列表实时筛选并高亮匹配字 → ↑↓ 移动选中项',
        res: '回车执行选中命令并关闭；Esc 或点遮罩关闭；焦点回到触发按钮',
        acc: '面板为模态对话框，焦点限制在面板内；输入框用 aria-activedescendant 指向选中项；无结果时显示空状态'
      },
      states: 'closed · open · filtering · empty · executed',
      intr: '打开动画进行中按 Esc 立即反向关闭',
      motion: [['遮罩', 160], ['面板出现', 200], ['关闭', 140]],
      acc: ['只用键盘可以打开、筛选、执行、关闭', '关闭后焦点回到触发按钮', '无匹配时显示空状态并可清空输入', '面板打开时 Tab 不会跑到页面背后']
    },
    {
      id: 'w-accordion', cat: 'web', fam: '弹层与导航', scene: 'accordion',
      title: '展开收起：高度跟随内容',
      sum: 'FAQ 点击后高度平滑展开，箭头旋转；动画中再点会从当前高度反向。',
      hint: '点问题展开或收起；动画中快速连点试试。',
      keys: ['展开', '收起', '折叠', '手风琴', 'faq', '问答', 'accordion', '详情', '更多'],
      skills: ['uiux-interaction-spec', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: 'FAQ 列表中的每个问题',
        trig: '点击问题行，或回车/空格',
        seq: '内容高度从 0 动画到实际高度，同时内容淡入；箭头旋转 180°',
        res: '再次激活收起；多个问题可同时展开',
        acc: '问题为 button，带 aria-expanded 与 aria-controls；减少动态效果时直接显示/隐藏'
      },
      states: 'collapsed · expanding · expanded · collapsing',
      intr: '展开途中再次点击，从当前高度反向收起',
      motion: [['展开', 260], ['收起', 200]],
      acc: ['动画中连点 5 次不出现高度错乱', '展开后内容可被 Tab 访问，收起后不可', 'aria-expanded 与视觉状态一致', '长内容展开后高度正确']
    },
    {
      id: 'w-chart', cat: 'web', fam: '数据可视化', scene: 'chartBrush',
      title: '图表十字线 + 拖选范围',
      sum: '悬停显示十字线与数值；按住拖动刷选一段日期，右侧汇总随之更新。',
      hint: '在图表上移动指针；按住拖动选范围。键盘：聚焦图表后 ←→ 移动，Shift+←→ 扩展。',
      keys: ['图表', '折线', '数据', '曲线', '十字线', 'tooltip', '悬停', '刷选', '范围', '区间', '选一段', '时间段', '合计', '平均', '统计', '看板', 'dashboard', '仪表盘'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '30 天访问量折线图',
        trig: '指针移动显示十字线；按住拖动选择区间；键盘方向键移动、Shift 扩展',
        seq: '十字线吸附到最近的数据点，提示框跟随 → 拖动时区间半透明填充 → 松手后汇总卡数字滚动到新值',
        res: '区间保持到点击“清除”或双击图表；单点击不改变区间',
        acc: '图表聚焦后可用键盘操作；汇总区为 polite live region；颜色之外还用填充纹理区分区间'
      },
      states: 'idle · hover · brushing · selected',
      intr: '拖动中提示框跟随，不做延迟动画',
      motion: [['十字线吸附', 80], ['数字滚动', 360]],
      acc: ['只用键盘能选出第 5–12 天的区间', '汇总值与选中区间一致', '指针离开图表后十字线消失', '提示框不超出图表边界']
    },
    {
      id: 'w-form', cat: 'web', fam: '表单与输入', scene: 'formValidate',
      title: '表单校验：轻摇 + 内联提示',
      sum: '失焦时校验，错误字段轻摇并滑出提示；密码强度条实时增长；提交成功翻面。',
      hint: '随便填一个错误邮箱再离开输入框，或直接点“注册”。',
      keys: ['表单', '校验', '验证', '输入', '错误', '提示', '注册', '登录', '密码', '强度', '抖动', '摇'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '注册表单（邮箱、密码）',
        trig: '字段失焦、提交',
        seq: '错误字段边框变色并左右轻摇一次，提示文字从上方滑入 → 密码输入时强度条宽度与颜色连续变化 → 全部有效时提交，卡片翻面显示成功',
        res: '修正后提示立即消失；提交失败时焦点移到第一个错误字段',
        acc: '提示通过 aria-describedby 关联，aria-invalid 同步；提交时汇总错误数量播报；减少动态效果时不摇、不翻面'
      },
      states: 'pristine · invalid · valid · submitting · success',
      intr: '连续触发校验时轻摇不叠加',
      motion: [['轻摇', 300], ['提示滑入', 180], ['翻面', 420]],
      acc: ['只按回车提交时，焦点落到第一个错误字段', '错误文字被读屏读到', '修正后错误立即清除', '已输入内容在出错后保留']
    },
    {
      id: 'w-compare', cat: 'web', fam: '拖拽与排序', scene: 'compareSlider',
      title: '前后对比滑块',
      sum: '拖动中线对比修图前后；点击任意处中线滑过去；键盘方向键微调。',
      hint: '拖动中间的把手，或点图上任意位置；聚焦后用 ←→。',
      keys: ['对比', '前后', 'before', 'after', '滑块', '拖动', '修图', '图片', '分割线', '比较'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '前后两张图的分割对比',
        trig: '拖动把手；点击图片任意位置；聚焦后 ←→（Shift 大步）',
        seq: '拖动时分割线跟手无延迟 → 点击时分割线以缓动滑到点击处 → 靠近边缘时对应标签淡出',
        res: '位置保持；双击把手回到 50%',
        acc: '把手为 role="slider"，有 aria-valuenow 与可读文本；减少动态效果时点击直接跳转'
      },
      states: 'idle · dragging · animating',
      intr: '滑动动画中再次按下立即接管为拖动',
      motion: [['点击滑动', 260]],
      acc: ['键盘可以把分割线移到 0% 与 100%', '拖动时不选中文本', '标签在边缘时不遮挡内容', '读屏读出“前后对比，显示修图后 60%”之类的值']
    },

    /* ---------------- app ---------------- */
    {
      id: 'a-swipe', cat: 'app', fam: '手势', scene: 'swipeDelete',
      title: '左滑删除 + 撤销',
      sum: '左滑露出删除，滑过一半直接删除；行飞走、下方补位，底部出现撤销条。',
      hint: '左滑一行；滑一点会停在露出删除按钮的位置。',
      keys: ['左滑', '滑动删除', '删除', '飞走', '撤销', '列表', '清单', '移除', '划掉', 'swipe'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: '列表中的每一行（消息、任务等，按你的产品替换）',
        trig: '左滑：滑过行宽 30% 松手停在露出固定宽度（约 88px）“删除”按钮处，滑过 55% 直接删除；行内“⋯”按钮或聚焦后按 Delete 等价',
        seq: '行跟手左移，露出红色删除区 → 删除时行向左离开并轻微倾斜 → 下方行补位 → 撤销条从底部升起',
        res: '数据立即标记删除；5 秒内可撤销并回到原位；同一时间只保留最近一次的撤销，新的删除会结束上一次的撤销窗口；撤销条超时消失时不移动焦点；未过阈值松手弹回',
        acc: '删除后焦点移到下一行；polite 播报“已删除，可撤销”；手势有可见按钮替代；减少动态效果时只淡出'
      },
      states: 'idle · dragging · revealed · removing · removed(undo)',
      intr: '撤销发生在离场动画中途时原路反向',
      motion: [['跟手回弹', 160], ['离场', 220], ['补位', 180]],
      acc: ['不用手势也能删除（露出的按钮或 Delete 键）', '删除中途撤销不残留空行', '撤销条不被底部导航和安全区遮挡', '焦点永不落到 body']
    },
    {
      id: 'a-sheet', cat: 'app', fam: '面板与弹层', scene: 'bottomSheet',
      title: '底部弹层：拖拽吸附三档',
      sum: '把手拖动面板，超出边界有橡皮筋阻尼，松手按速度和位置吸附到收起/半屏/全屏。',
      hint: '拖动面板顶部把手；快速甩动试试；或点把手循环切换。',
      keys: ['底部弹层', '底部面板', '抽屉', 'sheet', 'bottom sheet', '上拉', '吸附', '半屏', '全屏', '橡皮筋', '地图', '弹窗'],
      skills: ['uiux-interaction-spec', 'uiux-motion-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: '地图页上的底部信息面板',
        trig: '拖动把手或面板头部；点击把手按 收起 → 半屏 → 全屏 循环；Esc 回到收起',
        seq: '面板跟手移动，超出上下限按 1 − e^(−x) 阻尼 → 松手时按速度预测落点，吸附到最近档位 → 背景遮罩透明度随高度变化',
        res: '档位保持；全屏时内容区独立滚动，只有把手与标题区拖动面板，避免和内容滚动冲突',
        acc: '把手是有名称的按钮并报告当前档位；减少动态效果时直接切换档位'
      },
      states: 'peek · half · full · dragging',
      intr: '吸附动画中再次按下，从当前位置接管拖动',
      motion: [['吸附', 320], ['遮罩', 200]],
      acc: ['快速上甩从收起直接到全屏', '超出边界有阻尼且松手回弹', '不用拖动也能切换三档', '把手在拇指可达区域内']
    },
    {
      id: 'a-tabs', cat: 'app', fam: '导航', scene: 'tabPill',
      title: '底部导航：胶囊滑过去',
      sum: '切换标签时背景胶囊滑到新位置，图标轻弹；内容按方向左右切换。',
      hint: '点底部标签；或在内容区左右滑动。',
      keys: ['底部导航', '底栏', 'tab', 'tab bar', '标签栏', '胶囊', '滑过去', '切换', '导航', '背景块'],
      skills: ['uiux-interaction-spec', 'uiux-motion-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: 'App 底部四个一级导航',
        trig: '点击标签；内容区横向滑动；键盘 ←→',
        seq: '背景胶囊从旧标签平移并伸缩到新标签 → 新图标放大 1.15 再回落 → 内容区按方向滑入，旧内容反向滑出',
        res: '每个标签保留各自的滚动位置；重复点击当前标签回到顶部',
        acc: 'role="tablist"，选中项 aria-selected；减少动态效果时胶囊直接跳到位置、内容淡入'
      },
      states: 'selected · pressed · switching',
      intr: '快速连点不同标签时胶囊直接重定向到最新目标',
      motion: [['胶囊平移', 280], ['图标轻弹', 240], ['内容切换', 260]],
      acc: ['快速连点四个标签，胶囊停在最后点击的标签下', '每个标签保留各自滚动位置', '键盘 ←→ 可切换', '胶囊不遮挡文字']
    },
    {
      id: 'a-pull', cat: 'app', fam: '手势', scene: 'pullRefresh',
      title: '下拉刷新：橡皮筋 + 新内容',
      sum: '在顶部下拉时阻尼越来越大，指示器转动；过阈值松手刷新，新条目滑入并高亮。',
      hint: '在列表顶部向下拖；也可以点右上角“刷新”。',
      keys: ['下拉刷新', '下拉', '刷新', '橡皮筋', '阻尼', '加载', '信息流', 'feed', 'pull'],
      skills: ['uiux-interaction-spec', 'uiux-motion-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: '信息流列表顶部',
        trig: '列表在顶部时向下拖动；或点击刷新按钮',
        seq: '下拉距离按阻尼曲线递减，指示器随进度旋转 → 超过 64px 时指示器变实心提示“松开刷新” → 松手停在加载位转圈 → 新条目从上方滑入并短暂高亮',
        res: '刷新完成后列表回到顶部；失败时提示并可重试；刷新中再次下拉无效',
        acc: '按钮替代手势；完成后播报“已更新 n 条”；减少动态效果时不旋转、不滑入'
      },
      states: 'idle · pulling · armed · refreshing · done · error',
      intr: '刷新中忽略新的下拉；未过阈值松手回弹',
      motion: [['回弹', 240], ['新条目滑入', 300]],
      acc: ['未到阈值松手不触发刷新', '刷新中不能重复触发', '按钮也能刷新', '完成后数量被播报']
    },
    {
      id: 'a-cards', cat: 'app', fam: '卡片', scene: 'cardStack',
      title: '卡片堆叠：左右甩出',
      sum: '拖动卡片会随方向倾斜并显示“跳过/收藏”印章；甩出后下一张从后方升起。',
      hint: '左右拖动最上面的卡片；或点下方 ✕ / ♥ 按钮。',
      keys: ['卡片', '堆叠', '左右滑', '甩出', '探探', '收藏', '跳过', '喜欢', '翻牌', '推荐'],
      skills: ['uiux-interaction-spec', 'uiux-motion-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: '推荐卡片堆',
        trig: '左右拖动顶部卡片；底部 ✕ / ♥ 按钮；键盘 ←→',
        seq: '卡片跟手平移并按位移倾斜（最多 12°），对应印章透明度随距离增加 → 过阈值或快速甩出时卡片沿方向飞出 → 后一张从 0.95 放大到 1',
        res: '结果立即记录；“撤回”把上一张从原方向飞回',
        acc: '按钮与键盘等价；每次结果播报；减少动态效果时卡片淡出，后一张直接出现'
      },
      states: 'idle · dragging · decided · empty',
      intr: '飞出动画中可以继续拖下一张',
      motion: [['回弹', 260], ['飞出', 300], ['下一张升起', 220]],
      acc: ['只用按钮能完成全部卡片', '撤回恢复上一张与其结果', '空堆时显示空状态与“重来”', '倾斜不超过 12°']
    },
    {
      id: 'a-hold', cat: 'app', fam: '按钮与确认', scene: 'holdConfirm',
      title: '长按确认：圆环蓄力',
      sum: '危险操作需要按住 1.2 秒，圆环随按住时间填满；提前松手回退并提示。',
      hint: '按住按钮直到圆环填满；或聚焦后按住空格。',
      keys: ['长按', '按住', '确认', '蓄力', '进度环', '危险操作', '转账', '支付', '防误触', '二次确认'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: '转账确认按钮',
        trig: '指针或触摸按住；键盘按住空格/回车',
        seq: '按下后按钮缩到 0.97，圆环在 1.2s 内匀速填满 → 填满时短震动（若支持）并变为对勾 → 提前松手时圆环以 200ms 退回并提示“再按住一会儿”',
        res: '完成后执行一次；完成状态 2s 后可重置',
        acc: '说明文字写明“按住 1.2 秒”；读屏用户可通过“改用确认对话框”完成同一操作；减少动态效果时圆环改为百分比文字'
      },
      states: 'idle · holding · cancelled · confirmed',
      intr: '松手立即反向，不等待动画',
      motion: [['蓄力', 1200], ['回退', 200], ['完成', 260]],
      acc: ['提前松手不会执行操作', '键盘按住空格同样可完成', '有不依赖长按的替代路径', '完成只触发一次']
    },
    {
      id: 'a-like', cat: 'app', fam: '输入与反馈', scene: 'likeBurst',
      title: '双击点赞：爱心迸发',
      sum: '双击图片在点击处弹出大爱心与粒子；按钮点赞有缩放回弹，数字上下滚动。',
      hint: '双击图片；或点下方的心形按钮。',
      keys: ['点赞', '双击', '爱心', '喜欢', '粒子', '迸发', '数字滚动', '计数', '微交互', 'like'],
      skills: ['uiux-interaction-spec', 'uiux-motion-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: '动态卡片的图片与点赞按钮',
        trig: '双击图片（只点赞不取消）；点击心形按钮切换',
        seq: '双击处爱心从 0 放大到 1.2 再回到 1 并上浮淡出，6 个粒子向外扩散 → 按钮心形填色并缩放回弹 → 计数数字向上滚动',
        res: '状态立即写入；取消点赞时心形缩小褪色，数字向下滚动',
        acc: '按钮带 aria-pressed 与计数；双击只是快捷方式；减少动态效果时无粒子、无滚动'
      },
      states: 'unliked · liked · animating',
      intr: '连续双击不叠加多个大爱心，只重播一次',
      motion: [['爱心弹出', 420], ['粒子', 500], ['数字滚动', 240]],
      acc: ['按钮单独即可完成点赞与取消', '连续双击不会把点赞取消', '计数与状态始终一致', '粒子不拦截点击']
    },
    {
      id: 'a-expand', cat: 'app', fam: '页面转场', scene: 'sharedExpand',
      title: '共享元素：卡片展开成详情',
      sum: '点击卡片，它从原位置放大成详情页；返回时缩回原处。',
      hint: '点任意卡片；用左上角返回或 Esc 收回。',
      keys: ['共享元素', '展开', '详情', '转场', '放大', '卡片', '页面切换', 'hero', '过渡', '进入详情'],
      skills: ['uiux-interaction-spec', 'uiux-motion-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: '发现页的内容卡片与详情页',
        trig: '点击卡片；返回按钮、Esc 或右滑返回',
        seq: '卡片从网格中的位置与圆角过渡到全屏（FLIP）→ 详情文字在展开后段淡入上移 → 返回时文字先淡出，卡片缩回原位',
        res: '返回后网格滚动位置不变，焦点回到原卡片',
        acc: '详情打开后焦点移到标题；减少动态效果时直接切换页面'
      },
      states: 'grid · opening · detail · closing',
      intr: '展开中按返回，从当前进度反向收回',
      motion: [['展开', 360], ['内容淡入', 200], ['收回', 300]],
      acc: ['返回后焦点在原卡片上', '展开中途返回不闪跳', '详情可滚动且返回按钮始终可见', '减少动态效果下没有缩放']
    }
  ];

  const SURFACE = {
    web: '网页（指针 + 键盘，桌面优先并适配窄屏）',
    app: 'App / 小程序（手持触摸为主，单手可达，注意安全区）'
  };

  const AGENTS = {
    claude: { label: 'Claude Code', lead: '请使用 uiux-workflow skill 统筹这次实现，按它的工序调用下列 uiux-* skill。' },
    codex: { label: 'Codex', lead: '$uiux-workflow 请按工序统筹这次实现，并调用下列 $uiux-* skill。' },
    plain: { label: '通用', lead: '请按“意图 → 行为契约 → 组件状态 → 动效 → 验收”的顺序实现下面的界面效果。' }
  };

  function motionLine(e, feel) {
    const f = FEELS[feel] || FEELS.normal;
    return e.motion.map(([n, ms]) => `${n} ≈ ${Math.round((ms * f.k) / 10) * 10}ms`).join('、') + `；${f.easeText}`;
  }

  /* opts: { need, cat, feel, agent, stack, extras: [], secondary } */
  function buildPrompt(list, opts = {}) {
    const feel = opts.feel || 'normal';
    const f = FEELS[feel];
    const agent = AGENTS[opts.agent] || AGENTS.claude;
    const cat = opts.cat || (list[0] && list[0].cat) || 'web';
    const L = [];
    const skillName = s => (opts.agent === 'codex' ? '$' + s : s);
    const allSkills = [...new Set(list.flatMap(e => e.skills))];
    if (cat === 'app' && !allSkills.includes('uiux-mobile-patterns')) allSkills.splice(-1, 0, 'uiux-mobile-patterns');
    L.push(agent.lead);
    if (opts.agent !== 'plain') L.push(`涉及：${allSkills.map(skillName).join('、')}。没有安装这些 skill 时，直接按下面的字段执行。`);
    L.push('');
    if (opts.need) L.push(`需求原话：「${opts.need}」`);
    L.push(`界面：${SURFACE[cat]}`);
    L.push(`技术栈：${opts.stack ? `${opts.stack}；` : ''}沿用项目现有框架、组件和设计令牌；项目里没有可用代码时，用原生 HTML/CSS/JS 写一个可直接打开的单文件演示。`);
    L.push(`手感：${f.label}（${f.easeText}）`);
    (opts.extras || []).forEach(x => L.push(x));

    list.forEach((e, i) => {
      L.push('');
      L.push(`${list.length > 1 ? `效果 ${i + 1}：` : '效果：'}${e.title} —— ${e.sum}`);
      L.push(`【交互契约 · ${skillName('uiux-interaction-spec')}】`);
      L.push(`- 对象：${e.c.obj}`);
      L.push(`- 触发：${e.c.trig}`);
      L.push(`- 过程：${e.c.seq}`);
      L.push(`- 结果与反向：${e.c.res}`);
      L.push(`- 无障碍与降级：${e.c.acc}`);
      if (e.skills.includes('uiux-component-engineering')) L.push(`【组件状态 · ${skillName('uiux-component-engineering')}】${e.states}；业务数据由父级持有，组件只持有交互中的临时状态。`);
      L.push(`【动效 · ${skillName('uiux-motion-engineering')}】${motionLine(e, feel)}。中断：${e.intr}。以上数值是提议值，可按项目令牌调整；业务状态不能依赖动画完成。`);
    });

    if (cat === 'app') {
      L.push('');
      L.push(`【手持检查 · ${skillName('uiux-mobile-patterns')}】可点区域 ≥ 44px；每个手势都有可见按钮或键盘替代；浮层与提示条避开底部导航和安全区；在 390×844 视口检查。`);
    }
    L.push('');
    L.push(`【验收 · ${skillName('uiux-accessibility-review')}】`);
    const acc = [...new Set(list.flatMap(e => e.acc))];
    acc.push('开启系统“减少动态效果”后，状态与反馈仍然完整');
    acc.forEach((a, i) => L.push(`${i + 1}. ${a}`));
    L.push('');
    L.push('交付：可运行的代码；一句话说明每个字段如何落实；最后列出“已在浏览器验证”和“未验证（真机、读屏软件、低端设备帧率等）”两份清单。不要改动与本效果无关的页面或依赖。');
    return L.join('\n');
  }

  window.PIPE = { FEELS, EFFECTS, AGENTS, SURFACE, buildPrompt, motionLine };
})();
