# 更新日志 (Changelog)

本项目遵循语义化版本规范记录所有重要变更。

## [v1.0.2] - 2026-11-23

### 🛡️ 稳定性与安全性重构
- **安装/卸载自动备份与回滚**：`install.ps1` 与 `uninstall.ps1` 在修改 `current.js` 前自动生成 `.bak.<时间戳>` 备份文件，写入异常时自动回滚还原，避免损坏宿主客户端启动文件。
- **图片压缩与存储升级**：自定义导入图片自动经 Canvas 缩放至最大 `160px` 并压缩为 WebP，同时将图库存储升级为 **IndexedDB**（首次启动自动迁移并清理旧版 `localStorage` 数据），彻底告别 5MB 容量上限溢出。
- **导入边界容错**：修复选中包含非图片文件或损坏图片时 `loaded === files.length` 导致导入挂起的边界 Bug，改用预过滤 + `Promise.allSettled` 容错处理。
- **DOM 增量扫描**：移除每秒全量轮询 `setInterval`，改为 `MutationObserver` + `requestAnimationFrame` 仅针对新增 DOM 子树增量渲染。
- **安全 DOM 构建**：移除卡片渲染、空状态和图文混排中的 `innerHTML` 字符串拼接，改用 `document.createElement`、`textContent` 及 `TreeWalker` 文本节点替换，消除文件名 XSS 风险。

### 📦 工程化完善
- 新增标准 MIT `LICENSE` 与 `requirements.txt`（`Pillow>=10.0.0`）。
- 统一同步 `package.json`、`build.py` 打包头注释与 `CHANGELOG.md` 版本号至 `v1.0.2`。
- 更新 `README.md`，嵌入 `picker_preview.png` / `sticker_preview.png` 预览图并补充文本标记渲染与客户端注入原理说明。

---

## [v1.0.1] - 2026-11-23

### ✨ 功能与体验优化
- **用户发送表情尺寸重构**：
  - 单张纯表情消息：从 `108px` 调整为 **`120px × 120px`** 高清无框贴纸；
  - 连续多张纯表情消息：不再误判为行内小表情，自动横向排列为 **`96px × 96px`** 贴纸组；
  - 图文混排消息：行内表情从 `26px` 放大至 **`52px × 52px`**（支持居中对齐与柔和投影），二次元大头贴细节清晰可读。
- **助手回复表情精准识别（`.ag-chat-sticker`）**：
  - 放弃脆弱的全局 `.group\/media` CSS 转义匹配，改为在 `renderChatMemes()` 中通过 DOM 扫描 `[class*="group/media"]` 并比对 `img[alt]`（匹配预设图库、自定义收藏及 `表情:` / `meme:` / `sticker:` 前缀）动态挂载 `.ag-chat-sticker` 类名；
  - 彻底兼容实际 DOM 中 `.group/media` 与 `<img>` 之间的多层 `div` 嵌套，同时**完全避免普通技术截图、图表被误缩成 140px**；
  - 贴纸容器去除多余边框/阴影与底部冗余说明，图片悬浮操作按钮默认隐藏、悬停时浮现。

### 🐛 Bug 修复与安装迁移
- 修复旧版模板字符串内 `.group\/media` 反斜杠转义丢失导致整段贴纸尺寸 CSS 被浏览器忽略的问题。
- 升级 `install.ps1` 与 `uninstall.ps1`：自动检测并清理历史遗留的 `CASEY MEME INJECTOR` 注入块，避免新旧脚本冲突（`__antigravityMemeSystemLoaded` 抢占拦截）导致更新不生效。

---

## [v1.0.0] - 2026-11-23

### 🎉 首次发布
- 发布完全解耦、中立化的 Google Antigravity 原生表情包抽屉插件；
- 支持底栏微笑触发按钮、5 列紧凑网格布局、实时关键词搜索、本地图片导入至「我的收藏」（`localStorage` 本地存储）；
- 提供一键压缩打包脚本 `build.py` 及 Windows 一键安装/卸载脚本 `install.bat` / `uninstall.bat`。
