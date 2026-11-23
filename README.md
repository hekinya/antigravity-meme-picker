# Antigravity Meme Picker

> ✨ 为 Google Antigravity 打造的原生聊天表情包抽屉与自定义图库扩展。

<p align="center">
  <img src="assets/screenshots/picker_preview.png" alt="表情包抽屉预览" width="46%" />
  <img src="assets/screenshots/sticker_preview.png" alt="聊天贴纸渲染预览" width="46%" />
</p>

---

## 🌟 特性一览

- **原生输入框集成**：在底栏输入框旁原生渲染表情按钮，无缝呼出表情面板。
- **5 列紧凑栅格布局**：自适应滚动面板，告别大图占屏与单列排版。
- **即时搜索与过滤**：支持表情描述与关键词实时筛选，秒速定位表情。
- **自定义图库导入**：支持一键选择本地图片或表情包批量导入至「我的收藏」（本地存储，隐私安全）。
- **气泡消息自适应**：
  - 单独发送：以 120px 高清无气泡贴纸形式展示（连发多张自动横排 96px）；
  - 图文混排：自动缩放为 52px 清晰行内表情混排；
  - 助手回复：智能约束表情媒体在合理视野范围内（<=140px）。
- **即点即发 / 输入框回填**：可自由切换「点击直接发送」或「插入文本框编辑」。

---

## 🚀 快速安装

### 方式一：Windows 一键安装（推荐）

1. 下载或克隆本项目：
   ```bash
   git clone https://github.com/urlien/antigravity-meme-picker.git
   cd antigravity-meme-picker
   ```
2. 双击运行目录下的 **`install.bat`**（或右键运行 `install.ps1`）。
3. 脚本会自动检测 Antigravity 安装路径并注入脚本。
4. 重启或在 Antigravity 客户端中按 `Ctrl + R` 刷新即可生效！

### 方式二：手动引入

将 `dist/antigravity-meme-picker.bundle.js` 的内容追加至你的 Antigravity 自定义主题脚本中（通常位于 `<安装目录>\resources\custom-theme\current.js`）。

---

## 🎨 自定义与二次构建

项目结构：

```
antigravity-meme-picker/
├── assets/
│   └── presets/
│       └── default/          # 默认内置表情包图片 (支持 PNG/JPG/WEBP)
├── src/
│   └── core.js               # 表情面板与渲染引擎核心逻辑
├── dist/
│   └── antigravity-meme-picker.bundle.js  # 打包生成的单文件
├── build.py                  # 构建脚本 (自动压缩图片并打包成 Bundle)
├── install.bat / install.ps1 # 一键安装程序
└── uninstall.bat / uninstall.ps1 # 一键卸载程序
```

如果你想更改默认内置表情包：
1. 安装 Python 构建依赖：
   ```bash
   pip install -r requirements.txt
   ```
2. 将你的表情图片放入 `assets/presets/default/` 目录下（推荐命名规则如 `01-开心.png`、`02-点赞.png`）。
3. 执行构建脚本：
   ```bash
   python build.py
   ```
4. 运行 `install.bat` 更新客户端注入代码即可（脚本会在修改 `current.js` 前自动生成带时间戳的备份）。

---

## ⚠️ 工作原理与注意事项

- **文本标记渲染机制**：点击表情发送的实际是 `[表情: 名称]` 文本标记，再由本扩展在本地界面中将其渲染为贴纸图片。这意味着**大语言模型本身接收到的是文本标记而非真实多模态图片**；同时，在未安装本扩展的设备或客户端上，消息会直接显示为 `[表情: 名称]` 文本。
- **客户端界面注入**：本扩展通过注入 Antigravity 客户端的 `custom-theme/current.js` 实现界面增强，而非官方插件市场接口。安装和卸载脚本均会在修改 `current.js` 前自动创建 `.bak.<时间戳>` 备份，并在写入异常时自动回滚。

---

## 🗑️ 卸载

双击运行 **`uninstall.bat`**（或右键运行 `uninstall.ps1`），刷新客户端即可彻底清除注入。

---

## 📝 更新日志

详细版本变更与修复记录请查看 [CHANGELOG.md](CHANGELOG.md)。

---

## 📄 开源许可

本项目基于 [MIT License](LICENSE) 开源。
