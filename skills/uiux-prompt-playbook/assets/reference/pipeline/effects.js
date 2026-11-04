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

    /* ---- 新拟态组件 (scenes from ../playground/neu.js via bridge-scenes.js) ---- */
    {
      id: 'w-neu-light', cat: 'web', fam: '新拟态组件', scene: 'nuLight',
      title: '新拟态灯光开关：下沉、平移、回弹',
      sum: '按下时滑块下沉，松开后平移到另一端并回弹，灯光和 On / Off 文字同步切换。',
      hint: '点开关，或聚焦后按空格。',
      keys: ['新拟态', 'neumorphism', '拟物', '开关', 'switch', '灯光', '下沉', '凹陷', '凸起', '回弹', 'on off', '软阴影'],
      skills: ['uiux-style-direction', 'uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '浅灰白底上的新拟态开关：内凹轨道、凸起滑块、灯泡和 On / Off 文字',
        trig: '指针按下与松开；键盘空格或回车',
        seq: '按下时滑块由凸起变为内凹并缩小到 0.94 → 松开后滑块平移到另一端 → 越过终点约 3% 再回弹 → 灯泡亮起或熄灭，文字切换',
        res: '每次点击只切换一次；按住拖出开关区域再松开不切换',
        acc: 'role=switch 与 aria-checked 同步；On / Off 用文字表达，不只靠阴影；减少动态效果时直接切换'
      },
      states: 'off · pressed · on · focus',
      intr: '回弹途中再次点击，从当前位置直接走向新状态',
      motion: [['按下下沉', 120], ['平移', 600], ['回弹', 600]],
      acc: ['按下有可见下沉，松开后切换', 'aria-checked 与 On / Off 文字一致', '只用空格可以切换', '焦点框在浅色底上清晰可见']
    },
    {
      id: 'w-neu-thermo', cat: 'web', fam: '新拟态组件', scene: 'nuThermo',
      title: '新拟态温控旋钮：刻度、圆弧、数字同步',
      sum: '拖动旋钮时指示点、进度圆弧和温度数字同步变化，范围 16–30℃，底部有死区。',
      hint: '拖动旋钮；或聚焦后用方向键、Home / End，也可点加减。',
      keys: ['旋钮', '温控', '温度', '刻度', '圆弧', 'dial', 'knob', 'slider', '拖动调节', '新拟态', '16-30'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '凸起的圆形旋钮、外圈细刻度、270° 进度圆弧、中心温度数字和加减按钮',
        trig: '指针按住旋钮拖动（按角度取值）；方向键 ±1℃、PageUp / PageDown ±3℃、Home / End；加减按钮',
        seq: '指针角度换算成温度并取整 → 指示点转到对应角度 → 圆弧长度跟着变化 → 数字与「凉爽 / 舒适 / 温暖」同步更新',
        res: '温度始终在 16–30℃；拖到底部死区时停在最近的一端，不会从 30 跳到 16',
        acc: 'role=slider，带 aria-valuemin / max / now 和 aria-valuetext「n℃」；减少动态效果时圆弧不做过渡'
      },
      states: 'idle · dragging · focus · min · max',
      intr: '拖动时取消按键带来的过渡，直接跟手',
      motion: [['圆弧跟随', 120], ['指示点', 120], ['按钮回弹', 600]],
      acc: ['温度不会超出 16–30℃', '指示点、圆弧和数字始终一致', '方向键与 Home / End 可完成全部调节', '底部死区不会跳到另一端']
    },
    {
      id: 'w-neu-player', cat: 'web', fam: '新拟态组件', scene: 'nuPlayer',
      title: '新拟态播放器：频谱随播放起落',
      sum: '凸起的播放键切换播放与暂停；播放时频谱跳动、进度前进，暂停时频谱收回。',
      hint: '点中间的播放键；两侧可前进 / 后退 10 秒。',
      keys: ['播放器', '音乐', '播放', '暂停', '频谱', '进度条', 'player', 'audio', '新拟态', '凸起按钮'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '封面、曲目信息、频谱条、内凹进度槽、播放 / 前进 / 后退按钮',
        trig: '点击或空格切换播放；前进 / 后退按钮',
        seq: '播放：按钮由凸起变内凹，图标换成暂停 → 频谱条按不同节奏起落，进度条与时间前进 → 暂停：频谱在 600ms 内收回到底，进度停住',
        res: '播放到结尾自动停止；暂停后再播放从当前位置继续',
        acc: '播放键 aria-label 在「播放 / 暂停」之间切换；频谱是装饰（aria-hidden）；减少动态效果时频谱不跳动，只显示进度'
      },
      states: 'paused · playing · ended',
      intr: '频谱收回途中再次播放，从当前高度重新起跳',
      motion: [['按钮按压', 120], ['频谱收回', 600], ['进度刷新', 250]],
      acc: ['播放时进度和时间前进', '暂停后频谱收回', '按钮名称随状态切换', '播放结束自动停止']
    },
    {
      id: 'w-neu-upload', cat: 'web', fam: '新拟态组件', scene: 'nuUpload',
      title: '新拟态上传：文件收拢、进度、勾选复位',
      sum: '按下内凹入口后文件卡片依次收拢进入口，进度条填满，完成显示勾选，再回弹复位。',
      hint: '点「点这里上传」，上传中再点不会重复触发。',
      keys: ['上传', '文件', 'upload', '进度', '进度条', '收拢', '完成', '对勾', '复位', '新拟态', '内凹'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '三张待上传文件卡、内凹上传入口、进度槽和百分比',
        trig: '点击或回车上传入口',
        seq: '入口按下回弹 → 文件卡依次（间隔约 110ms）飞向入口并缩小淡出 → 进度从 0 填到 100% → 入口图标变为绿色对勾、文案「上传完成」→ 停留约 1.6s 后文件卡回弹出现，进度归零',
        res: '上传中入口 aria-disabled，重复点击无效；完成后可再次上传',
        acc: '进度条 role=progressbar 并更新 aria-valuenow；状态通过 polite 播报；减少动态效果时没有飞行，只更新进度和文案'
      },
      states: 'idle · uploading · done · resetting',
      intr: '上传中忽略再次点击；复位不打断尚未完成的进度',
      motion: [['依次收拢', 600], ['进度填充', 1400], ['完成停留', 1600], ['回弹复位', 600]],
      acc: ['文件卡依次收拢', '进度从 0 到 100%', '完成后显示勾选再复位', '上传中不能重复触发']
    },
    {
      id: 'w-neu-booking', cat: 'web', fam: '新拟态组件', scene: 'nuBooking',
      title: '新拟态预约：选日期展开时段，选中显示结果',
      sum: '先选日期，时段区平滑展开；选中时段后结果卡缩放出现，可以取消。已满的时段禁用。',
      hint: '先点一天，再点一个时段；结果里可以取消。',
      keys: ['预约', '日期', '时段', '日历', '展开', '收起', 'booking', '选择', '已满', '新拟态', '缩放'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '五个日期按钮、时段网格、预约结果卡',
        trig: '点击日期、时段与「取消」',
        seq: '选日期：该日由凸起变内凹并变为品牌色 → 时段区高度从 0 展开 → 选时段：结果卡从 0.9 缩放淡入 → 取消：结果卡收起，焦点回到第一个可选时段',
        res: '再点同一天收起时段并清空选择；换一天时清空已选时段',
        acc: '选中项同时用颜色和 aria-pressed 表达；已满时段 disabled 并写明「已满」；收起的区域 inert；减少动态效果时直接显示'
      },
      states: 'no-date · date-picked · slot-picked · cancelled',
      intr: '展开途中换日期，直接从当前高度走向新内容',
      motion: [['展开时段', 600], ['结果缩放', 600], ['按压回弹', 600]],
      acc: ['没选日期时看不到时段', '已满时段不可选', '选中时段后显示完整预约信息', '取消后结果收起']
    },
    {
      id: 'w-neu-qty', cat: 'web', fam: '新拟态组件', scene: 'nuQty',
      title: '新拟态数量调节：边界禁用',
      sum: '凸起加减按钮按下下沉回弹，数量和金额同步变化，到达 1 或 9 时禁用对应按钮。',
      hint: '点加减按钮，试试到达上下限。',
      keys: ['数量', '加减', '步进', 'stepper', '金额', '合计', '边界', '禁用', '购物车', '新拟态'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '商品信息、凸起的加减按钮、内凹数量框和合计金额',
        trig: '点击加减按钮',
        seq: '按钮下沉到 0.93 → 回弹到 1.03 → 落定 → 数量变化，合计金额轻微放大后复原',
        res: '数量在 1–9 之间；到边界时对应按钮禁用，焦点移到另一个按钮',
        acc: '按钮有「增加一袋 / 减少一袋」名称；到边界时 polite 播报「已到上限 / 下限」；减少动态效果时没有缩放'
      },
      states: 'min · normal · max',
      intr: '连点时每次都从当前缩放重新开始，不排队',
      motion: [['下沉回弹', 600], ['金额强调', 360]],
      acc: ['数量与金额始终一致', '到边界时对应按钮禁用', '禁用按钮外观不同', '焦点不会停在禁用按钮上']
    },
    /* ---- 看板菜单 (scenes from ../playground/menu.js via bridge-scenes.js) ---- */
    {
      id: 'w-menu-sidebar', cat: 'web', fam: '看板菜单', scene: 'mnSidebar',
      title: '图文侧栏菜单：返回总览时高亮恢复',
      sum: '左侧图标加文字的侧栏，选中高亮，右侧内容同步切换；点「返回总览」时高亮回到总览。',
      hint: '点左侧入口；进入子页面后点右上角「返回总览」。',
      keys: ['侧栏', '侧边栏', 'sidebar', '菜单', '导航', '图标', '高亮', '选中', '总览', '返回', '看板', 'dashboard'],
      skills: ['uiux-page-planning', 'uiux-interaction-spec', 'uiux-component-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '左侧品牌与五个图文入口，右侧标题、返回按钮和内容区',
        trig: '点击或回车菜单入口；点击「返回总览」',
        seq: '选中项变为深色圆角底 → 右侧内容淡出 120ms → 新内容上移淡入 240ms → 非总览页显示「返回总览」',
        res: '菜单高亮和右侧内容由同一个选中值决定；返回总览后高亮回到总览，焦点回到总览入口',
        acc: '当前项 aria-current=page；窄屏时侧栏收为图标，文字保留给读屏；减少动态效果时直接替换内容'
      },
      states: 'overview · page · hover · focus',
      intr: '快速连点时只渲染最后一次的内容',
      motion: [['内容淡出', 120], ['内容进入', 240], ['高亮切换', 200]],
      acc: ['任何时候只有一个当前项', '返回总览后高亮恢复', '内容与高亮一致', '窄屏下侧栏收成图标仍可操作']
    },
    {
      id: 'w-menu-groups', cat: 'web', fam: '看板菜单', scene: 'mnGroups',
      title: '内容分组菜单：按业务模块组织入口',
      sum: '左侧按「内容 / 运营 / 数据」分组，选中用浅品牌底色；点节目、发现等入口后列表与面包屑同步。',
      hint: '点不同分组里的入口。',
      keys: ['分组', '菜单', '模块', '业务', '品牌色', '浅色底', '节目', '发现', '面包屑', '层级', '侧栏', 'dashboard'],
      skills: ['uiux-page-planning', 'uiux-interaction-spec', 'uiux-design-system', 'uiux-component-engineering'],
      c: {
        obj: '三个带标题的入口分组、右侧面包屑、标题和列表',
        trig: '点击或回车入口',
        seq: '选中项变为浅品牌底色并带左侧色条 → 面包屑「分组 / 入口」更新 → 列表淡出后替换',
        res: '分组标题只做层级，不可点击；切换不改变其他分组的展开状态',
        acc: '分组标题与入口在视觉和结构上分层；当前项 aria-current=page；hover 有底色反馈'
      },
      states: 'selected · hover · focus',
      intr: '快速切换时只保留最后一次的列表',
      motion: [['内容淡出', 120], ['内容进入', 240], ['底色切换', 200]],
      acc: ['分组与入口层级清楚', '面包屑与当前项一致', '列表随入口更新', 'hover 和焦点都有反馈']
    },
    {
      id: 'w-menu-capsule', cat: 'web', fam: '看板菜单', scene: 'mnCapsule',
      title: '顶部胶囊菜单：深色底块滑到当前项',
      sum: '没有侧栏，顶部胶囊容器里的深色底块滑到当前选项，内容区更宽。',
      hint: '点顶部的「概览 / 流量 / 转化 / 留存」。',
      keys: ['胶囊', '顶部菜单', '顶栏', '横向菜单', '分段', 'segmented', 'pill', '滑块', '底块', '无侧栏', 'dashboard'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '顶栏中部的胶囊容器、四个选项、深色底块和下方宽内容区',
        trig: '点击或回车选项',
        seq: '深色底块的位置和宽度过渡到新选项（300ms）→ 选项文字变白 → 内容淡出后替换',
        res: '窗口尺寸变化后底块重新对齐；内容区占满宽度',
        acc: '当前项 aria-current=page；深浅对比 ≥ 4.5:1；减少动态效果时底块直接跳到新位置'
      },
      states: 'selected · hover · focus',
      intr: '底块移动途中再次点击，从当前位置直接走向新选项',
      motion: [['底块滑动', 300], ['内容淡出', 120], ['内容进入', 240]],
      acc: ['底块始终停在当前项下', '窗口变化后不偏位', '内容与当前项一致', '窄屏下选项仍可完整点击']
    },
    {
      id: 'w-menu-rail', cat: 'web', fam: '看板菜单', scene: 'mnRail',
      title: '极简图标侧栏：窄轨与文字提示',
      sum: '浅色页面左侧窄图标轨，业务入口在上、通知和头像在底，当前页用高对比底色；悬停或聚焦显示名称。',
      hint: '点图标；聚焦后可用 ↑↓ 在图标间移动。',
      keys: ['图标', '图标栏', '窄侧栏', 'rail', '极简', '线性图标', '提示', 'tooltip', '通知', '头像', '省空间'],
      skills: ['uiux-component-engineering', 'uiux-design-system', 'uiux-accessibility-review'],
      c: {
        obj: '64px 宽的图标轨：顶部 logo、四个业务图标、底部通知和账户',
        trig: '点击或回车图标；↑↓ 在图标间移动焦点',
        seq: '当前图标变为深色圆角底 → 悬停或聚焦时右侧出现文字提示 → 内容区切换',
        res: '底部两项固定在底部；提示不遮挡点击',
        acc: '每个图标按钮有 aria-label；提示对鼠标和键盘都出现；当前项 aria-current=page'
      },
      states: 'selected · hover · focus · tooltip',
      intr: '提示随焦点立即切换，不排队',
      motion: [['提示出现', 150], ['底色切换', 200], ['内容进入', 240]],
      acc: ['图标尺寸与间距一致', '当前页高对比标记', '键盘聚焦也显示名称', '底部入口固定在下方']
    },
    {
      id: 'w-menu-brand', cat: 'web', fam: '看板菜单', scene: 'mnBrand',
      title: '品牌色图标侧栏：深色看板',
      sum: '深色 Dashboard 左侧图标侧栏，当前项用珊瑚橙底色，提醒 / 设置 / 账户在底部。',
      hint: '点侧栏图标，悬停查看名称。',
      keys: ['品牌色', '珊瑚橙', '深色', 'dark', '侧栏', '图标', '提醒', '设置', '账户', '看板', 'dashboard'],
      skills: ['uiux-style-direction', 'uiux-design-system', 'uiux-component-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '深色看板、图标侧栏（品牌 logo、四个主功能、底部三项）和内容区',
        trig: '点击或回车图标',
        seq: '当前图标底色变为品牌色并带柔和投影 → 内容淡出后替换',
        res: '品牌色只用于当前项和 logo，不扩散到其他装饰',
        acc: '深色下文字与图标对比足够；当前项 aria-current=page；提示用浅底深字'
      },
      states: 'selected · hover · focus',
      intr: '快速切换时只渲染最后一次的内容',
      motion: [['底色切换', 200], ['内容淡出', 120], ['内容进入', 240]],
      acc: ['只有当前项使用品牌色', '深色下文字清晰', '底部三项固定', '内容随选中切换']
    },
    {
      id: 'w-menu-tabs', cat: 'web', fam: '看板菜单', scene: 'mnTabs',
      title: '分组标签顶栏：多维数据联动',
      sum: '白色顶栏左侧品牌，中部四个分组标签，深色圆角底加小圆点标出当前项；切换后产量与种植阶段同步更新。',
      hint: '点「小麦 / 玉米 / 水稻 / 大豆」。',
      keys: ['分组标签', '标签', 'tab', '顶栏', '小圆点', '数据联动', '产量', '种植', '阶段', '多维', '看板'],
      skills: ['uiux-page-planning', 'uiux-interaction-spec', 'uiux-component-engineering'],
      c: {
        obj: '白色顶栏（品牌、四个分组标签、头像）和下方的 KPI、阶段条与长势图',
        trig: '点击或回车分组标签',
        seq: '当前标签变为深色圆角底，左侧小圆点亮起 → 数据区淡出 → 亩产、面积、当前阶段、阶段条和长势柱同步换成该作物的数据',
        res: '只有当前标签显示小圆点；数据全部来自同一个选中值',
        acc: '当前项 aria-current=page；阶段用文字标出，不只靠颜色；窄屏时标签占满一行'
      },
      states: 'selected · hover · focus',
      intr: '快速切换时只保留最后一次的数据',
      motion: [['底色切换', 200], ['数据淡出', 120], ['数据进入', 240]],
      acc: ['小圆点只在当前标签', '产量与阶段随标签更新', '阶段有文字说明', '窄屏下标签可完整点击']
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
    },
    {
      id: 'a-fan', cat: 'app', fam: '照片与转场', scene: 'photoFan',
      title: '扇形叠切：整组弹簧摆位',
      sum: '四张照片展开成扇形；左右滑动时整组跟手转动，松手用弹簧摆位，标题同步替换，当前分页点拉长。',
      hint: '左右拖动照片，或用下方按钮 / 方向键切换。',
      keys: ['扇形', '叠切', '照片', '相册', '轮播', '弹簧', 'spring', '摆位', '分页点', '指示点', '拉长', '滑动切换', 'carousel', 'fan', 'fanned', 'photo'],
      skills: ['uiux-interaction-spec', 'uiux-motion-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: '一组 4 张照片卡片、上方标题和下方分页点',
        trig: '横向拖动照片组；左右按钮；聚焦后按 ← →',
        seq: '照片以底部中心为轴展开成扇形，当前张居中在最上层 → 拖动时整组按位移连续转动 → 松手按位置和速度吸附到最近一张，用弹簧摆位 → 标题在遮罩里上下替换，当前分页点拉长成胶囊',
        res: '松手总落在整张上；拖过首尾有阻尼；摆动途中再拖动从当前角度接着走',
        acc: '照片组有可读名称和“轮播”角色描述；切换时 polite 播报“第 n 张，共 m 张”；减少动态效果时直接切换不摆动'
      },
      states: 'idle · dragging · settling',
      intr: '弹簧运行中被新的拖动或按键打断时保留当前位置与速度，直接走向新目标',
      motion: [['弹簧摆位', 420], ['标题替换', 300], ['分页点拉长', 380]],
      acc: ['松手后总是吸附到整张，不停在两张之间', '快速连续滑动不错位', '标题和分页点始终与当前照片一致', '只用按钮或方向键也能切换全部照片']
    },
    {
      id: 'a-ticket', cat: 'app', fam: '照片与转场', scene: 'photoTicket',
      title: '共享元素：缩略图变票根',
      sum: '点缩略图，图片从原位平滑放大成票根卡片；旧页缩放淡出，票根文字随后淡入，返回时缩回原缩略图。',
      hint: '点任意缩略图；用左上角返回或 Esc 收回。',
      keys: ['共享元素', '共享转场', '缩略图', '票根', '门票', '放大', '转场', '切页', '页面切换', 'hero', '详情', 'thumbnail', 'ticket'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '行程列表里的缩略图与详情页的票根卡片',
        trig: '点击缩略图；返回按钮或 Esc 返回',
        seq: '图片从缩略图的位置和尺寸平滑过渡到票根头图的位置（FLIP）→ 旧页同时缩小到 0.94 并淡出 → 图片接近到位时票根文字与撕口淡入上移；返回时文字先淡出，图片沿原路缩回',
        res: '返回后回到同一张缩略图；转场中重复点击被忽略',
        acc: '打开后焦点移到票根标题，返回后回到原缩略图；减少动态效果时改为淡入淡出'
      },
      states: 'list · opening · ticket · closing',
      intr: '转场进行中忽略新的点击，结束后才接受返回',
      motion: [['图片放大', 400], ['旧页淡出', 280], ['票根淡入', 440], ['缩回', 360]],
      acc: ['图片从缩略图原位放大，过程中不跳动', '返回时缩回同一张缩略图', '焦点进入票根标题并在返回后回到原缩略图', '转场中连续点击不会叠加两次转场']
    },
    {
      id: 'a-gather', cat: 'app', fam: '照片与转场', scene: 'photoGather',
      title: '照片收拢：聚成封面再切页',
      sum: '点“生成相册”，网格里的照片带旋转飞向中心叠成一摞，弹簧落定后切到相册页；返回时散回原格子。',
      hint: '点“生成相册”；在相册页点“‹ 照片”看照片散回去。',
      keys: ['收拢', '聚合', '聚拢', '汇聚', '照片', '相册', '封面', '生成', '叠成一摞', '弹性', '弹簧', '切页', 'gather', 'pile', 'photo'],
      skills: ['uiux-interaction-spec', 'uiux-motion-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: '照片网格、“生成相册”按钮和相册页封面',
        trig: '点击“生成相册”；相册页的返回按钮',
        seq: '每张照片从自己的格子飞向网格中心，带轻微旋转并缩小到 0.82，依次错开约 30ms → 弹簧落定成一摞 → 全部落定后切到相册页，那一摞成为封面；返回时照片从中心散回原位',
        res: '收拢期间按钮禁用；返回后网格与按钮恢复',
        acc: '切到相册页后焦点移到相册标题，返回后回到按钮；polite 播报“相册已生成”；减少动态效果时直接切页'
      },
      states: 'grid · gathering · album · scattering',
      intr: '收拢进行中不接受第二次触发；返回总是从当前位置散开',
      motion: [['错开', 30], ['弹簧落定', 520], ['切页淡入', 300]],
      acc: ['每张照片都从自己的格子出发', '全部落定后才切页', '返回时照片散回原来的格子', '收拢中按钮不能再次触发']
    },
    {
      id: 'a-sort', cat: 'app', fam: '照片与转场', scene: 'photoSort',
      title: '滑动分拣：倾斜跟手，按距离回弹',
      sum: '卡片左右滑动分拣，拖动时位移带倾斜；过阈值飞出计入分组，没过就弹簧回中，拉得越远回弹越明显。',
      hint: '向右拖保留，向左拖跳过；拖一点松手会弹回。',
      keys: ['分拣', '分类', '滑动分拣', '左右滑', '保留', '跳过', '倾斜', '回弹', '甩出', '挑选', '筛照片', 'tinder', 'sort', 'sorting', 'keep or skip', 'swipe', 'photo'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: '一叠待分拣的照片卡片与“跳过 / 保留”两个分组',
        trig: '横向拖动最上面的卡片；“跳过 / 保留”按钮；聚焦后按 ← →；撤销按钮',
        seq: '卡片跟手横移并按位移倾斜（最大约 12°），对应一侧的“保留 / 跳过”标记随距离变实 → 松手时超过卡片区宽度 35% 或快速甩出则沿方向飞出 → 未过阈值用弹簧回中，回弹幅度随拉出的距离增大',
        res: '计数立即更新；撤销把上一张从原方向飞回顶部；分完显示空状态和结果',
        acc: '每次分拣 polite 播报“已保留 / 已跳过”；手势有可见按钮替代；减少动态效果时只淡出'
      },
      states: 'idle · dragging · flying · settling · empty',
      intr: '回弹中再次拖动从当前位置与速度接着走；飞出中忽略新输入',
      motion: [['回弹', 360], ['飞出', 260], ['撤销飞回', 360]],
      acc: ['没过阈值时卡片回到中间', '快速甩出也能完成分拣', '计数正确，撤销后计数同步减回', '按钮与方向键能完成同样的分拣']
    },
    {
      id: 'a-lines', cat: 'app', fam: '照片与转场', scene: 'photoLines',
      title: '大标题逐行切换',
      sum: '大标题每行单独遮罩，间隔 60ms 逐行出入；主视觉先淡出缩小，新内容就位后用弹簧弹回。',
      hint: '点底部的章节按钮；连续快点也不会残留旧行。',
      keys: ['标题', '大标题', '逐行', '一行一行', '遮罩', '错峰', 'stagger', '主视觉', '头图', '章节', '文字动画', 'headline', 'line by line', 'stagger'],
      skills: ['uiux-interaction-spec', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '页面顶部主视觉与下方的多行大标题',
        trig: '点击章节按钮',
        seq: '旧标题每行在自己的遮罩里向上退出，行间隔 60ms → 主视觉同时淡出并缩到 0.9 → 新标题每行从下方进入，行间隔 60ms → 主视觉换图后用弹簧放大回 1',
        res: '章节按钮显示选中态；连续切换时取消未完成的动画，从当前状态走向最新章节',
        acc: '标题用一个完整的可读名称（各行 aria-hidden），切换时只播报一次完整标题；减少动态效果时只做淡入淡出'
      },
      states: 'idle · leaving · entering',
      intr: '新的切换会取消进行中的退出和进入动画，只保留最新目标',
      motion: [['行间隔', 60], ['旧行退出', 240], ['新行进入', 360], ['主视觉弹回', 420]],
      acc: ['能看出各行错开约 60ms', '连续快速切换后只剩最新章节的行', '读屏读到的是完整标题而不是零散的行', '减少动态效果时没有位移']
    },
    {
      id: 'a-album', cat: 'app', fam: '照片与转场', scene: 'photoAlbum',
      title: '相册堆叠：滑走后弹簧重排',
      sum: '相册卡片叠成一摞，后面的依次偏移、缩小并带旋转；滑走最上面一张后，其余用弹簧依次前移，指示器同步更新。',
      hint: '把最上面的相册左右滑走；也可以用按钮或方向键。',
      keys: ['相册', '堆叠', '叠放', '卡片组', '偏移', '旋转', '重排', '指示器', '翻页', '滑走', '卡片切换', 'album', 'restack', 'photo'],
      skills: ['uiux-interaction-spec', 'uiux-motion-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: '叠成一摞的相册卡片、底部指示器与页码',
        trig: '横向拖动最上面的卡片；上一本 / 下一本按钮；聚焦后按 ← →',
        seq: '后面的卡片依次下移 12px、缩小 5% 并带 ±3° 旋转露出边缘 → 拖动顶卡跟手倾斜 → 过阈值后顶卡滑出并移到最底 → 其余卡片用弹簧依次前移，每张错开约 45ms',
        res: '指示器与页码同步到新的顶卡；没过阈值时顶卡回弹',
        acc: '只有顶卡对读屏可见；切换后 polite 播报“相册 n / m”；减少动态效果时直接换序'
      },
      states: 'idle · dragging · leaving · restacking',
      intr: '重排进行中忽略新的切换，结束后立即可用',
      motion: [['滑出', 200], ['弹簧重排', 520], ['错开', 45]],
      acc: ['堆叠层次清楚，能看到后面卡片的边缘', '重排后顺序正确，最上面的卡片与页码一致', '指示器和页码与顶卡同步', '连续切换不出现两张卡片重叠在顶层']
    },
    {
      id: 'a-lift', cat: 'app', fam: '照片与转场', scene: 'photoLift',
      title: '列表卡片浮起展开',
      sum: '点击列表卡片，它先放大上浮、其余模糊变淡，再展开成详情；返回时缩回原位并轻微回弹。',
      hint: '点任意卡片；用左上角返回或 Esc 收回。',
      keys: ['列表', '卡片', '上浮', '浮起', '放大', '模糊', '景深', '弹性转场', '回弹', '详情', '展开', 'lift', 'blur'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '故事列表中的卡片与详情页',
        trig: '点击卡片；返回按钮或 Esc',
        seq: '卡片放大约 4% 并上浮 6px、阴影加深 → 其他卡片和标题模糊 3px 并变淡 → 约 190ms 后卡片从原位置展开成全屏详情，正文延后淡入 → 返回时详情缩回卡片原位置，落位带轻微回弹，模糊同步撤掉',
        res: '转场期间列表不可操作；返回后列表位置不变',
        acc: '打开后焦点移到详情标题，返回后回到原卡片；减少动态效果时去掉模糊和回弹，只做淡入淡出'
      },
      states: 'list · lifting · opening · detail · closing',
      intr: '转场进行中忽略新的点击；返回总是落回被点的那张卡片',
      motion: [['上浮', 190], ['展开', 380], ['正文淡入', 420], ['回弹落位', 440]],
      acc: ['展开从被点的那张卡片开始', '返回后落回原位置', '模糊和变淡在返回后完全撤掉', '焦点进出正确']
    },
    /* ---- 状态与回应 (scenes from ../playground/states.js via bridge-scenes.js) ---- */
    {
      id: 'a-plane', cat: 'app', fam: '状态与回应', scene: 'stPlane',
      title: '纸飞机发送：发送中 → 已分享 / 失败重试',
      sum: '点分享，按钮轻压，纸飞机从按钮里飞出并显示「发送中」，随后变为「已分享」；失败时可重试。',
      hint: '点「分享行程」；勾选「模拟网络失败」看错误态。',
      keys: ['纸飞机', '发送', '分享', 'send', 'share', '发送中', '已分享', '加载', '成功', '失败', '重试', '按钮状态'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '行程页底部的「分享行程」主按钮',
        trig: '点击或回车',
        seq: '按下缩放到 0.92 再回弹 → 纸飞机从按钮内向右上飞出并淡出 → 按钮显示转圈和「发送中…」→ 约 0.9s 后变为绿色「已分享 ✓」或红色「发送失败，点此重试」',
        res: '发送中和已分享时再次点击无效；失败后点按钮重试；重置回到初始态',
        acc: '发送中 aria-busy=true；结果通过 polite 播报；纸飞机是装饰（aria-hidden）；减少动态效果时不飞行，只切换文字和颜色'
      },
      states: 'idle · sending · done · error',
      intr: '发送中忽略点击；纸飞机动画不影响结果状态',
      motion: [['按压回弹', 300], ['纸飞机飞出', 720], ['发送中停留', 900], ['成功强调', 320]],
      acc: ['发送中不能重复触发', '成功与失败都有明确文字', '失败后可以重试', '减少动态效果时没有飞行']
    },
    {
      id: 'a-press', cat: 'app', fam: '状态与回应', scene: 'stPress',
      title: '长按快捷菜单：卡片浮起，菜单展开',
      sum: '按住卡片约 0.45 秒，卡片轻微浮起，旁边展开操作菜单；选中操作后菜单收起、卡片回位。',
      hint: '按住卡片不放；或聚焦卡片按 Enter，方向键选择，Esc 关闭。',
      keys: ['长按', 'long press', '按住', '快捷菜单', '上下文菜单', 'context menu', '浮起', '操作菜单', '置顶', '分享'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: '笔记卡片与它的四项操作菜单',
        trig: '按住 450ms；键盘 Enter、菜单键或 Shift+F10',
        seq: '按下时卡片缩到 0.98 → 满 450ms 后上浮 6px 并放大到 1.02，加深投影 → 菜单从右上角缩放展开，菜单项错开 30ms 出现，焦点进入第一项 → 选择后菜单淡出，卡片回位',
        res: '短按不触发；手指移动超过 10px 取消；点菜单外或 Esc 关闭',
        acc: '卡片 aria-haspopup=menu 与 aria-expanded；菜单 role=menu，方向键循环；关闭后焦点回到卡片；减少动态效果时不缩放'
      },
      states: 'idle · pressing · open · closing',
      intr: '按住过程中移动或松手立即取消，不留下浮起状态',
      motion: [['按住触发', 450], ['卡片浮起', 300], ['菜单展开', 260], ['菜单收起', 200]],
      acc: ['短按不会打开菜单', '移动手指取消长按', '选择后菜单收起、卡片回位', '键盘可以打开并操作菜单']
    },
    {
      id: 'a-accordion', cat: 'app', fam: '状态与回应', scene: 'stAccordion',
      title: '手风琴问答：只开一个，下方让位',
      sum: '点问题时答案平滑展开，下方内容自动让位；点另一个问题时旧答案收起、新答案展开。',
      hint: '依次点不同的问题。',
      keys: ['手风琴', 'accordion', '问答', 'faq', '展开', '收起', '折叠', '让位', '常见问题'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '四条问答和列表下方的一行说明',
        trig: '点击或回车问题按钮',
        seq: '答案高度从 0 展开（grid 行 0fr → 1fr，约 320ms），文字延迟 80ms 淡入，箭头翻转 180° → 下方内容随高度变化平滑下移 → 同时收起之前打开的答案',
        res: '同一时间只展开一个；再点已展开的问题则全部收起',
        acc: '问题按钮 aria-expanded 与 aria-controls；收起的答案 inert，不可 Tab 聚焦；减少动态效果时直接展开'
      },
      states: 'collapsed · expanded',
      intr: '展开途中点另一个问题，两者从当前高度同时反向',
      motion: [['展开', 320], ['文字淡入', 220], ['箭头翻转', 300]],
      acc: ['同一时间只展开一个', '下方内容平滑让位', 'aria-expanded 与视觉一致', '收起的答案不可聚焦']
    },
    {
      id: 'a-multi', cat: 'app', fam: '状态与回应', scene: 'stMulti',
      title: '多选操作栏：选择框依次亮起，底栏升起',
      sum: '勾选时选择框亮起并描出对勾，底部操作栏升起显示选中数量；全选时依次亮起，全部取消后操作栏收回。',
      hint: '勾选几张照片，或点「全选」。',
      keys: ['多选', '批量', '勾选', '选择框', 'checkbox', '全选', '操作栏', '底部栏', '已选', '删除'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-mobile-patterns', 'uiux-accessibility-review'],
      c: {
        obj: '六项照片列表、每项的选择框、底部浮起的操作栏',
        trig: '点击列表项；「全选 / 全不选」；操作栏的「取消」「删除」',
        seq: '勾选：选择框填色并描出对勾（260ms），轻微回弹 → 选中数从 0 变为 1 时操作栏从下方升起（320ms）→ 全选时选择框间隔 45ms 依次亮起 → 数量回到 0 时操作栏收回',
        res: '删除后列表与计数同步；删空时显示空状态和「恢复示例」',
        acc: '列表项 role=checkbox 与 aria-checked；操作栏收起时 aria-hidden 且按钮不可聚焦；数量通过 polite 播报'
      },
      states: 'none-selected · some-selected · all-selected · empty',
      intr: '依次亮起途中取消，只影响画面，选中数据立即生效',
      motion: [['对勾描画', 260], ['操作栏升起', 320], ['依次亮起', 45]],
      acc: ['数量与勾选一致', '全选时选择框依次亮起', '全部取消后操作栏收回', '删除后计数正确并有空状态']
    },
    {
      id: 'a-stepper', cat: 'app', fam: '状态与回应', scene: 'stStepper',
      title: '数量步进器：数字纵向滚动',
      sum: '点加减时数字纵向滚动切换（加向上、减向下），按钮轻微回弹，数量不能小于 0。',
      hint: '点加减，试试减到 0。',
      keys: ['步进器', 'stepper', '数量', '加减', '数字滚动', '翻牌', '回弹', '下限', '购物车'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '商品图、单价、加减按钮、遮罩里的数字和合计',
        trig: '点击加减按钮',
        seq: '按钮缩到 0.92 再回弹 → 旧数字向上（加）或向下（减）移出遮罩 → 新数字从另一侧进入（300ms）→ 合计更新',
        res: '数量在 0–20 之间；到边界时对应按钮禁用，焦点移到另一个按钮',
        acc: '按钮有「增加一件 / 减少一件」名称；合计 output 通过 polite 播报；减少动态效果时数字直接替换'
      },
      states: 'zero · normal · max',
      intr: '快速连点时先移除上一轮的旧数字，不重叠',
      motion: [['按钮回弹', 300], ['数字滚动', 300]],
      acc: ['数量不会小于 0', '到边界时对应按钮禁用', '快速连点数字不重叠', '合计与数量一致']
    },
    {
      id: 'a-flip', cat: 'app', fam: '状态与回应', scene: 'stFlip',
      title: '卡片翻面：隐藏背面镜像',
      sum: '点卡片沿竖轴旋转到背面，旋转中看不到镜像文字；再点翻回。',
      hint: '点会员卡，或聚焦后按 Enter / 空格。',
      keys: ['翻面', '翻转', 'flip', '3d', '卡片', '正反面', '背面', 'backface', '会员卡'],
      skills: ['uiux-interaction-spec', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '一张会员卡的正面和背面',
        trig: '点击、回车或空格',
        seq: '卡片沿 Y 轴旋转 180°（350ms）→ 两面都设 backface-visibility: hidden，过半前只看到正面，过半后只看到背面',
        res: '再次点击翻回；状态只有正面和背面两种',
        acc: '卡片是按钮，aria-pressed 表示翻面；当前不朝上的一面 aria-hidden；减少动态效果时不旋转，直接切换'
      },
      states: 'front · back',
      intr: '旋转途中再次点击，从当前角度反向转回',
      motion: [['翻面', 350]],
      acc: ['旋转中看不到镜像文字', '再次点击翻回', '键盘可以翻面', '读屏只读当前朝上的一面']
    },
    {
      id: 'a-chips', cat: 'app', fam: '状态与回应', scene: 'stChips',
      title: '搜索筛选标签：底色滑动，结果错峰出现',
      sum: '点标签时选中底色平滑移动，结果卡先淡出再依次出现；搜索框输入同样过滤，无结果显示空状态。',
      hint: '点「景点 / 美食 / 住宿」，或在搜索框输入。',
      keys: ['筛选', '标签', 'chips', '搜索', '过滤', '分类', '底色滑动', '错峰', 'stagger', '空状态'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '搜索框、四个筛选标签与滑动底色、结果卡网格',
        trig: '点击标签；在搜索框输入（停顿 180ms 后生效）',
        seq: '深色底色的位置和宽度过渡到新标签（300ms）→ 结果区淡出 150ms → 新结果按 40ms 间隔从下方依次淡入',
        res: '只显示最后一次筛选的结果；无结果时显示「没有找到」',
        acc: '标签 aria-pressed；结果数量通过 polite 播报；减少动态效果时底色直接跳到新位置、结果直接出现'
      },
      states: 'all · filtered · searching · empty',
      intr: '快速连点时取消上一轮的错峰动画，只显示最后一次',
      motion: [['底色滑动', 300], ['结果淡出', 150], ['依次出现', 260]],
      acc: ['底色停在当前标签下', '快速连点不残留旧结果', '结果数量与筛选一致', '无结果有空状态']
    },
    {
      id: 'a-steps', cat: 'app', fam: '状态与回应', scene: 'stSteps',
      title: '步骤进度条：对勾、连线、下一步亮起',
      sum: '完成一步后当前圆点变对勾、连接线填满、下一步圆点亮起，下方说明同步切换；完成前有短暂的「处理中」。',
      hint: '点「完成这一步」，也可以返回上一步。',
      keys: ['步骤', '步骤条', 'steps', 'stepper', '进度', '对勾', '连线', '流程', '向导', 'wizard', '下一步'],
      skills: ['uiux-interaction-spec', 'uiux-component-engineering', 'uiux-motion-engineering', 'uiux-accessibility-review'],
      c: {
        obj: '四步进度条（圆点、连接线、步骤名）、说明卡和上一步 / 下一步按钮',
        trig: '点击「完成这一步」或「上一步」',
        seq: '按钮显示「处理中…」约 420ms → 当前圆点变绿并描出对勾 → 连接线从左向右填满（320ms）→ 下一步圆点加光环亮起 → 说明卡左移淡出、新说明右侧进入',
        res: '可以返回上一步；全部完成后显示成功并可「重新开始」',
        acc: '当前步骤 aria-current=step；处理中按钮禁用；说明卡内容随步骤更新；减少动态效果时不位移'
      },
      states: 'step-1 · step-2 · step-3 · processing · done',
      intr: '处理中忽略点击；返回上一步时连线立即退回',
      motion: [['处理中', 420], ['对勾描画', 300], ['连线填满', 320], ['说明切换', 240]],
      acc: ['对勾、连线、下一步同时更新', '说明与当前步骤一致', '处理中时按钮不可重复点击', '可以返回上一步']
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

  /* Every line goes through I18N.t, so the dictionaries translate whole lines
     (patterns like "- 对象：{0}") and their captured data fields. */
  const T = s => (window.I18N && I18N.t ? I18N.t(s) : s);
  const isZh = () => !(window.I18N && I18N.lang === 'en');
  const SEP = () => (isZh() ? '、' : ', ');

  /* Where the working code for an effect lives inside the installed uiux-prompt-playbook skill
     (assets/reference/, see its index.json / INDEX.md). Bridged scenes live in the prompt lab's files. */
  const BRIDGE_FILE = { stateLab: 'states.js', neuLab: 'neu.js', menuLab: 'menu.js' };
  function refOf(e) {
    const b = window.PIPE_BRIDGE && window.PIPE_BRIDGE[e.scene];
    if (b) return `playground/${BRIDGE_FILE[b[0]]} · S.${b[0]} / ${b[1]}`;
    return `${/^photo/.test(e.scene) ? 'pipeline/photo-scenes.js' : 'pipeline/scenes.js'} · S.${e.scene}`;
  }

  function motionLine(e, feel) {
    const f = FEELS[feel] || FEELS.normal;
    const parts = e.motion.map(([n, ms]) => `${T(n)} ≈ ${Math.round((ms * f.k) / 10) * 10}ms`);
    return parts.join(SEP()) + (isZh() ? '；' : '; ') + T(f.easeText);
  }

  /* opts: { need, cat, feel, agent, stack, extras: [] } */
  function buildPrompt(list, opts = {}) {
    const feel = opts.feel || 'normal';
    const f = FEELS[feel];
    const agent = AGENTS[opts.agent] || AGENTS.claude;
    const cat = opts.cat || (list[0] && list[0].cat) || 'web';
    const L = [];
    const push = s => L.push(T(s));
    const skillName = s => (opts.agent === 'codex' ? '$' + s : s);
    const allSkills = [...new Set(list.flatMap(e => e.skills))];
    if (cat === 'app' && !allSkills.includes('uiux-mobile-patterns')) allSkills.splice(-1, 0, 'uiux-mobile-patterns');
    push(agent.lead);
    if (opts.agent !== 'plain') push(`涉及：${allSkills.map(skillName).join(SEP())}。没有安装这些 skill 时，直接按下面的字段执行。`);
    L.push('');
    if (opts.need) push(`需求原话：「${opts.need}」`);
    push(`界面：${SURFACE[cat]}`);
    push(opts.stack ? `技术栈：${opts.stack}；沿用项目现有框架、组件和设计令牌。` : '技术栈：沿用项目现有框架、组件和设计令牌；项目里没有可用代码时，用原生 HTML/CSS/JS 写一个可直接打开的单文件演示。');
    push(`手感：${f.label}（${f.easeText}）`);
    (opts.extras || []).forEach(push);

    list.forEach((e, i) => {
      L.push('');
      push(list.length > 1 ? `效果 ${i + 1}：${e.title} —— ${e.sum}` : `效果：${e.title} —— ${e.sum}`);
      push(`【交互契约 · ${skillName('uiux-interaction-spec')}】`);
      push(`- 对象：${e.c.obj}`);
      push(`- 触发：${e.c.trig}`);
      push(`- 过程：${e.c.seq}`);
      push(`- 结果与反向：${e.c.res}`);
      push(`- 无障碍与降级：${e.c.acc}`);
      if (e.skills.includes('uiux-component-engineering')) push(`【组件状态 · ${skillName('uiux-component-engineering')}】${e.states}；业务数据由父级持有，组件只持有交互中的临时状态。`);
      push(`【动效 · ${skillName('uiux-motion-engineering')}】${motionLine(e, feel)}。中断：${e.intr}。以上数值是提议值，可按项目令牌调整；业务状态不能依赖动画完成。`);
      push(`【参考实现】uiux-prompt-playbook › ${e.id} · ${refOf(e)}：先读这段可运行代码，再按项目技术栈移植。`);
    });

    if (cat === 'app') {
      L.push('');
      push(`【手持检查 · ${skillName('uiux-mobile-patterns')}】可点区域 ≥ 44px；每个手势都有可见按钮或键盘替代；浮层与提示条避开底部导航和安全区；在 390×844 视口检查。`);
    }
    L.push('');
    push(`【验收 · ${skillName('uiux-accessibility-review')}】`);
    const acc = [...new Set(list.flatMap(e => e.acc))];
    acc.push('开启系统“减少动态效果”后，状态与反馈仍然完整');
    acc.forEach((a, i) => L.push(`${i + 1}. ${T(a)}`));
    L.push('');
    push('交付：可运行的代码；一句话说明每个字段如何落实；最后列出“已在浏览器验证”和“未验证（真机、读屏软件、低端设备帧率等）”两份清单。不要改动与本效果无关的页面或依赖。');
    return L.join('\n');
  }

  window.PIPE = { FEELS, EFFECTS, AGENTS, SURFACE, buildPrompt, motionLine, T };
})();
