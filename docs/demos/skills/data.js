/* Skill Atlas data.
   Term entries are a 10-entry subset of finesse-term 0.3.0 (MIT).
   Style, palette and typography entries are excerpts of ui-ux-pro-max 2.15.0 (MIT).
   Direction names and ideas are distilled from design-taste-frontend 2.1.5 (MIT).
   Exact upstream revisions are recorded in skills/upstream/sources.json. */
window.ATLAS_DATA = {
  terms: [
    {
      id: "safe-area", title: "安全区", en: "Safe Area", surface: "H5", layer: "布局",
      plain: "手机屏幕上被刘海、圆角和底部那根横条占掉的一圈，内容放进去就会被挡。",
      say: "底部操作栏用 env(safe-area-inset-bottom) 预留安全区内边距，顶部标题栏预留 safe-area-inset-top。",
      trap: "只写 position: fixed; bottom: 0 —— 全面屏上按钮被 Home 条压掉一半，而且模拟器看不出来，只有真机才暴露。安全区必须和 viewport-fit=cover 一起用，否则 env() 恒为 0。",
      pairs: ["视口设置", "吸底操作栏", "底部标签栏"],
      triggers: ["按钮被挡住", "下面那条黑杠", "iPhone 上盖住了", "底部按钮太靠下", "刘海挡住了"]
    },
    {
      id: "hover-state", title: "悬停态", en: "Hover State", surface: "Web", layer: "交互",
      plain: "鼠标停在元素上时它变成的样子。只有鼠标有，手指没有。",
      say: "为按钮补充 Hover 状态：背景色加深一档，配合 150ms 过渡。",
      trap: "只做 Hover 不做 Active 和 Focus —— 手机上完全没有 Hover，键盘用户也看不见任何反馈。三态要一起给。",
      pairs: ["按下态", "焦点态", "过渡"],
      triggers: ["鼠标放上去", "鼠标移上去", "指上去", "经过的时候变", "悬浮变色", "滑过变"]
    },
    {
      id: "empty-state", title: "空状态", en: "Empty State", surface: "Web", layer: "状态",
      plain: "一条数据都没有时这块地方长什么样。新用户第一次打开看到的就是它。",
      say: "为列表补充空状态：一句说明这里将来会有什么，加一个引导用户创建第一条的主按钮。",
      trap: "空状态只画一张灰色插画配「暂无数据」—— 这是产品最重要的一屏，却什么也没说。必须有下一步动作。",
      pairs: ["骨架屏", "错误态", "加载态"],
      triggers: ["没有数据的时候", "一条都没有", "新用户打开", "空空的", "什么都没有时"]
    },
    {
      id: "skeleton", title: "骨架屏", en: "Skeleton", surface: "Web", layer: "状态",
      plain: "加载时先摆一堆和真实内容同样形状的灰块，等数据到了原地替换。",
      say: "首屏列表用骨架屏替代转圈：按真实卡片的行高和列数摆灰块，数据到达后原位替换。",
      trap: "骨架的形状和真实内容对不上 —— 数据一到整页跳一下，比转圈还难受。骨架必须按真实布局的尺寸画。",
      pairs: ["加载态", "布局偏移", "微光"],
      triggers: ["先显示灰块", "占位", "假的框先撑着", "别让页面跳"]
    },
    {
      id: "scroll-lock", title: "滚动穿透", en: "Scroll Lock", surface: "H5", layer: "交互",
      plain: "弹窗开着的时候手指在弹窗里滑，底下的页面也跟着滚了。",
      say: "弹层打开时锁定背景滚动并记录当前滚动位置，关闭后恢复原位。",
      trap: "锁的时候直接给 body 加 overflow: hidden —— iOS 上页面会瞬间弹回顶部，关掉弹窗用户发现自己回到了第一屏。必须先存 scrollTop，关闭时还原。",
      pairs: ["滚动容器", "模态框", "底部弹层", "橡皮筋滚动"],
      triggers: ["弹窗底下还能滑", "背景跟着动", "关掉弹窗回到顶部", "穿透"]
    },
    {
      id: "keyboard-push", title: "键盘顶起", en: "Keyboard Push", surface: "H5", layer: "交互",
      plain: "点输入框时虚拟键盘弹出来，占掉半个屏幕，页面被顶或被压。",
      say: "输入框聚焦时确保其滚动进可视区域，底部提交按钮跟随键盘上移而不是被遮挡。",
      trap: "iOS 和安卓行为不同：安卓压缩视口高度，iOS 不改视口只是把页面推上去。写死 100vh 的布局在 iOS 上会被键盘顶出屏幕。用 visualViewport 判断真实可视高度。",
      pairs: ["滚动容器", "安全区", "吸底操作栏"],
      triggers: ["键盘挡住输入框", "打字时看不见", "输入法弹出来乱了", "底部按钮被键盘遮住"]
    },
    {
      id: "cls", title: "布局偏移", en: "Cumulative Layout Shift", surface: "Web", layer: "性能",
      plain: "内容加载完把已经显示的东西挤走，用户正要点的按钮突然位移。",
      say: "消除首屏布局偏移：图片和广告位预留固定尺寸，字体用 font-display: optional 避免换行重排。",
      trap: "以为「加载快就没事」—— 越快的网络越容易在用户手指落下的瞬间发生位移。要靠占位，不靠速度。",
      pairs: ["宽高比容器", "骨架屏", "懒加载"],
      triggers: ["页面往下跳", "内容往下窜", "点歪了", "刚要点就跑了", "加载完位置变了"]
    },
    {
      id: "truncate", title: "文本省略", en: "Text Truncation", surface: "Web", layer: "布局",
      plain: "文字太长时截断并显示「…」，限定只占一行或几行。",
      say: "卡片标题限制两行，超出用省略号，完整内容通过 Tooltip 或详情页查看。",
      trap: "只截断不给出路 —— 用户永远看不到完整内容。截断必须配 Tooltip、展开按钮或详情页之一。",
      pairs: ["文字提示", "宽高比容器", "栅格"],
      triggers: ["太长了省略", "显示不下", "只显示两行", "加个点点点"]
    },
    {
      id: "touch-target", title: "点击热区", en: "Touch Target", surface: "H5", layer: "交互",
      plain: "手指能舒服点中的最小面积。视觉上的小图标可以配一个更大的隐形热区。",
      say: "所有可点元素的热区不小于 44×44pt，视觉尺寸可以更小，用内边距或伪元素撑开命中区域。",
      trap: "两个小图标挨在一起且热区互相重叠 —— 用户点了删除以为点的是编辑。相邻热区之间至少留 8pt。",
      pairs: ["拇指区", "点击高亮", "按下态"],
      triggers: ["点不准", "太小了", "老点错", "手指点不到"]
    },
    {
      id: "focus-visible", title: "焦点态", en: "Focus Visible", surface: "Web", layer: "无障碍",
      plain: "用 Tab 键走到某个元素上时出现的那圈描边，告诉键盘用户「现在在这」。",
      say: "保留焦点环，用 :focus-visible 只在键盘操作时显示，鼠标点击时不出现。",
      trap: "嫌难看直接 outline: none —— 键盘用户从此不知道自己在页面哪个位置，这是最常见的无障碍事故。要么换个好看的，不能删。",
      pairs: ["悬停态", "对比度", "键盘顺序"],
      triggers: ["那个蓝框好丑", "点完有个框", "去掉描边", "Tab 键", "键盘操作"]
    }
  ],

  styles: [
    { id: "minimalism-and-swiss-style", name: "Minimalism & Swiss Style", type: "通用", keywords: "留白、网格、高对比、无衬线、几何、功能性", colors: "单色 + 一个强调色", bestFor: "企业应用、Dashboard、文档站、SaaS", risk: "低 · 需保证文字对比与可见焦点" },
    { id: "glassmorphism", name: "Glassmorphism", type: "通用", keywords: "毛玻璃、透明、模糊背景、多层、光感", colors: "半透明白 rgba(255,255,255,.1–.3)", bestFor: "现代 SaaS、金融看板、模态层、导航", risk: "条件性 · 背景变化会破坏对比" },
    { id: "brutalism", name: "Brutalism", type: "通用", keywords: "原始、未打磨、强对比、默认字体、可见边框、不对称", colors: "红 #FF0000、蓝 #0000FF、黄 #FFFF00、黑白", bestFor: "设计作品集、艺术项目、反主流品牌、媒体站", risk: "低 · 但容易牺牲可读性" },
    { id: "data-dense-dashboard", name: "Data-Dense Dashboard", type: "BI / 分析", keywords: "多图表、数据表、KPI 卡片、最小内边距、网格、最大信息量", colors: "中性底 + 数据色（蓝/绿/红）+ 深色文字", bestFor: "商业智能、财务分析、运营看板、数据仓库", risk: "低 · 需限制视觉噪声" },
    { id: "bento-box-grid", name: "Bento Box Grid", type: "通用", keywords: "模块卡片、不对称网格、不同尺寸、Apple 风、负空间", colors: "中性底 + 品牌强调色", bestFor: "Dashboard、产品页、作品集、功能展示", risk: "低 · 尺寸必须有层级理由" },
    { id: "editorial-grid-magazine", name: "Editorial Grid / Magazine", type: "通用", keywords: "杂志布局、不对称网格、编辑字体、引文、首字下沉、分栏", colors: "黑白高对比 + 品牌强调色", bestFor: "新闻、博客、杂志、长文、出版", risk: "低 · 移动端需重排分栏" }
  ],

  palettes: [
    { product: "SaaS (General)", primary: "#2563EB", onPrimary: "#FFFFFF", accent: "#EA580C", bg: "#F8FAFC", fg: "#1E293B", card: "#FFFFFF", muted: "#E9EFF8", mutedFg: "#475569", border: "#E2E8F0", ring: "#2563EB", note: "信任蓝 + 橙色 CTA", tags: "saas 企业 后台 效率 专业" },
    { product: "Fintech / Crypto", primary: "#F59E0B", onPrimary: "#0F172A", accent: "#8B5CF6", bg: "#0F172A", fg: "#F8FAFC", card: "#222735", muted: "#272F42", mutedFg: "#94A3B8", border: "#334155", ring: "#F59E0B", note: "金色信任 + 紫色科技", tags: "fintech 金融 加密 交易 数据 暗色" },
    { product: "Healthcare App", primary: "#0891B2", onPrimary: "#000000", accent: "#059669", bg: "#ECFEFF", fg: "#164E63", card: "#FFFFFF", muted: "#E8F1F6", mutedFg: "#475569", border: "#A5F3FC", ring: "#0891B2", note: "平静青色 + 健康绿", tags: "health 健康 医疗 护理 平静" },
    { product: "E-commerce Luxury", primary: "#1C1917", onPrimary: "#FFFFFF", accent: "#A16207", bg: "#FAFAF9", fg: "#0C0A09", card: "#FFFFFF", muted: "#E8ECF0", mutedFg: "#475569", border: "#D6D3D1", ring: "#1C1917", note: "高级深色 + 金色点缀", tags: "ecommerce 电商 奢侈品 零售 高级" },
    { product: "Portfolio / Personal", primary: "#18181B", onPrimary: "#FFFFFF", accent: "#2563EB", bg: "#FAFAFA", fg: "#09090B", card: "#FFFFFF", muted: "#E8ECF0", mutedFg: "#475569", border: "#E4E4E7", ring: "#18181B", note: "单色 + 蓝色强调", tags: "portfolio 作品集 个人 设计师 编辑" },
    { product: "Developer Tool / IDE", primary: "#1E293B", onPrimary: "#FFFFFF", accent: "#22C55E", bg: "#0F172A", fg: "#F8FAFC", card: "#1B2336", muted: "#272F42", mutedFg: "#94A3B8", border: "#475569", ring: "#FFFFFF", note: "代码暗色 + 运行绿", tags: "developer 开发者 工具 ide 代码 终端" }
  ],

  fonts: [
    { name: "Modern Professional", category: "Sans + Sans", heading: "Poppins", body: "Open Sans", mood: "现代、专业、干净、友好", bestFor: "SaaS、企业站、商业应用、创业公司", tags: "saas 企业 专业 现代 金融 fintech dashboard 后台 health 健康" },
    { name: "Tech Startup", category: "Sans + Sans", heading: "Space Grotesk", body: "DM Sans", mood: "技术、创业、创新、锐利", bestFor: "技术公司、开发者工具、AI 产品", tags: "tech 技术 开发者 ai 创业 fintech 金融" },
    { name: "Editorial Classic", category: "Serif + Serif", heading: "Cormorant Garamond", body: "Libre Baskerville", mood: "编辑、经典、文学、精致", bestFor: "出版、博客、新闻、文学杂志", tags: "editorial 编辑 出版 杂志 文学 portfolio 作品集" },
    { name: "Minimal Swiss", category: "Sans + Sans", heading: "Inter", body: "Inter", mood: "极简、干净、瑞士、功能、中性", bestFor: "Dashboard、后台、文档、设计系统", tags: "minimal 极简 dashboard 后台 设计系统 saas" },
    { name: "Bold Statement", category: "Display + Sans", heading: "Bebas Neue", body: "Source Sans 3", mood: "大胆、有力、戏剧化、现代", bestFor: "营销站、作品集、机构、活动页", tags: "bold 大胆 营销 作品集 活动 editorial portfolio" },
    { name: "Developer Mono", category: "Mono + Sans", heading: "JetBrains Mono", body: "IBM Plex Sans", mood: "代码、开发者、精确、功能", bestFor: "开发者工具、文档、代码编辑器、技术博客", tags: "developer 开发者 代码 技术 终端 tool" }
  ],

  directions: [
    { id: "name-as-monument", name: "The name as a monument", zh: "名字即纪念碑", tones: ["大胆", "编辑"], idea: "把名字放到建筑尺度，其他内容退到角落。第一屏只做一件事：让名字成为构图。", type: "Grotesk tight · heavy black", palette: ["#171814", "#f1ede1", "#d7ff3f", "#6b6f5f"], layout: "monument" },
    { id: "colour-chapters", name: "Colour chapters", zh: "色彩分章", tones: ["大胆", "俏皮"], idea: "用整屏色块把内容分成章节，滚动就是换气口。颜色不是装饰，是导航。", type: "Geometric grotesk · heavy", palette: ["#f6c6d8", "#b9e06f", "#2b2b2b", "#fff8e8"], layout: "chapters" },
    { id: "place-carries-it", name: "The place carries it", zh: "让场地说话", tones: ["安静", "精致", "温暖"], idea: "一张真实的场地照片承担气氛，文字只做注解。先让人想进去，再告诉他在哪。", type: "Serif display · light large", palette: ["#2f3a2e", "#c9b79c", "#efe7d8", "#a45d3a"], layout: "place" },
    { id: "product-performs", name: "The product performs", zh: "产品自己表演", tones: ["技术", "安静"], idea: "把真实界面放进首屏，用密度和精确感代替装饰。让产品本身成为最有说服力的画面。", type: "Grotesk tight · light", palette: ["#0f1412", "#d7ff4f", "#8b97a3", "#f3f5f2"], layout: "instrument" },
    { id: "quiet-instrument", name: "The quiet instrument", zh: "安静仪器", tones: ["安静", "技术"], idea: "像仪表盘一样克制：细线、等宽数字、一个行动色。所有注意力留给正在发生的事。", type: "Grotesk light · mono data", palette: ["#e8e4da", "#2a2c27", "#8f9a7c", "#c07a4a"], layout: "quiet" },
    { id: "loud-flat-poster", name: "Loud and flat", zh: "响亮平涂", tones: ["大胆", "俏皮"], idea: "高饱和平涂、超大粗字、没有渐变，像一张贴在城市里的海报。先被看见，再被读完。", type: "Heavy black · condensed", palette: ["#ff4d00", "#111111", "#f4f0e6", "#2f5bff"], layout: "poster" }
  ],

  skills: [
    { id: "uiux-page-planning", label: "页面规划", source: "local", stage: "定义", effect: "先把受众、目标和信息层级排清楚，再谈布局。", target: "../../showcase.html#web", targetLabel: "看展览官网", detail: "五组演示的分类、首屏与阅读顺序" },
    { id: "uiux-mobile-patterns", label: "移动模式", source: "local", stage: "定义", effect: "手持任务流、返回路径、输入情境与安全区。", target: "../../showcase.html#app", targetLabel: "看手机原型", detail: "390px 单列任务流与底部导航" },
    { id: "uiux-prompt-playbook", label: "提示词手册", source: "local", stage: "行动", effect: "141 条可执行提示词，每一条都能在场景舞台里当场操作。", target: "../../", targetLabel: "打开实验室", detail: "141 prompts · 21 scenes · 网页 / App 双分类" },
    { id: "finesse-term", label: "术语翻译", source: "upstream", stage: "定义", effect: "把「按钮被挡住」翻译成安全区、视口设置与吸底操作栏。", target: "#station-term", targetLabel: "跳到展台", detail: "finesse-term 0.3.0 · 142 条词库节选" },
    { id: "uiux-style-direction", label: "视觉方向", source: "local", stage: "造型", effect: "把「好看」拆成构图、字体、配色与图像方向。", target: "../../showcase.html#web", targetLabel: "看展览官网", detail: "大标题、丝带与原创插画的视觉语言" },
    { id: "uiux-design-system", label: "设计系统", source: "local", stage: "造型", effect: "语义 token 让双主题和组件说同一种语言。", target: "../../showcase.html#studio", targetLabel: "看工作台", detail: "浅/深主题与组件状态矩阵" },
    { id: "uiux-component-engineering", label: "组件工程", source: "local", stage: "造型", effect: "状态归属清楚，组件才能组合、复现和测试。", target: "../../showcase.html#studio", targetLabel: "看工作台", detail: "单一数据源派生的项目列表与编辑" },
    { id: "finesse-ui", label: "全场景构建", source: "upstream", stage: "造型", effect: "同一任务按 brand / product / h5 切换界面语法。", target: "#station-register", targetLabel: "跳到展台", detail: "finesse-ui 0.22.0 · 四种 register" },
    { id: "design-taste-frontend", label: "艺术方向", source: "upstream", stage: "造型", effect: "从研究过的方向里抽三张牌，拒绝模型的默认答案。", target: "#station-taste", targetLabel: "跳到展台", detail: "design-taste-frontend 2.1.5 · 20 个方向" },
    { id: "ui-ux-pro-max", label: "设计资料库", source: "upstream", stage: "造型", effect: "先查风格、配色、字体与 UX 规则，再做决定。", target: "#station-search", targetLabel: "跳到展台", detail: "ui-ux-pro-max 2.15.0 · 79 种风格节选" },
    { id: "uiux-interaction-spec", label: "交互规格", source: "local", stage: "行动", effect: "定义触发、过程、结果与反向操作，不只画静态状态。", target: "../../showcase.html#components", targetLabel: "看组件实验室", detail: "tabs、展开、对话框与表单的状态契约" },
    { id: "uiux-motion-engineering", label: "动效工程", source: "local", stage: "行动", effect: "动效可中断、可降级、可清理，业务状态不等待动画。", target: "../../showcase.html#components", targetLabel: "看组件实验室", detail: "快速反向、减少动态与 WAAPI 取消" },
    { id: "interface-design", label: "产品界面", source: "upstream", stage: "行动", effect: "产品 UI 的差别在层级、间距和状态，不在装饰。", target: "#station-interface", targetLabel: "跳到展台", detail: "interface-design 2026.6.20 · 产品界面" },
    { id: "uiux-accessibility-review", label: "无障碍审查", source: "local", stage: "验证", effect: "用键盘、焦点、表单和可复现证据做限定范围审查。", target: "../../showcase.html#components", targetLabel: "看组件实验室", detail: "键盘路径、焦点返回与错误恢复" },
    { id: "impeccable", label: "审查与打磨", source: "upstream", stage: "验证", effect: "审查不是打分，是定位到具体元素并修复。", target: "#station-impeccable", targetLabel: "跳到展台", detail: "impeccable 4.8.0 · audit / critique / polish" }
  ]
};
