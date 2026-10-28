# 组件与动效实验室验收

直接用浏览器打开 `index.html`，无需构建或网络。操作状态仅存在当前页面内；表单是本地验证示例，不发送数据。

## 可复现动作

- **Tabs：** 聚焦 `#tab-disclosure`，按右方向键切换到 `#tab-dialog`，按 End 到 `#tab-form`，按 Home 返回。检查选中 tab 的 `aria-selected=true`、`tabindex=0`，只有对应 `role=tabpanel` 可见。
- **展开与反向：** 连续激活 `#expand`，检查 `aria-expanded` 与 `#expand-content` 的 `open`、`inert` 状态一致；动画进行时再次激活会向新目标反向，无需等待上次结束。
- **对话框和面板：** 在 `#tab-dialog` 中分别激活 `#open-dialog` 和 `#open-sheet`，用 Escape 或 `[data-close]` 关闭。检查模态打开时焦点在对话框中，关闭后焦点返回对应触发器。
- **表单：** 在 `#tab-form` 提交空值，检查 `#email-error` 显示且 `#email` 获得焦点和 `aria-invalid=true`。输入无效邮箱再提交；修正为 `hello@example.com` 后提交，检查 `#form-success` 显示，错误消失。其他输入不被重置。
- **主题与动态：** 激活 `#theme-toggle`，检查根元素 `data-theme` 与按钮 `aria-pressed`；切回浅色。激活 `#motion-toggle`，检查 `data-reduced=true`，展开立即完成；关闭后恢复常规动效。系统 `prefers-reduced-motion: reduce` 时，无论模拟开关状态均不产生过渡。
- **视口：** 在 390px 与桌面宽度检查内容可读、不产生页面横向滚动，且所有控件可触达。

## 验证边界

这些是可执行的验收步骤，不代表全部步骤已由辅助技术或真实移动设备验证。自动化和实际运行结果由集成验证记录；不能仅凭截图断言键盘、动画流畅度或屏幕阅读器兼容性。
