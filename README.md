# Antigravity Meme Picker

> ✨ 为 Google Antigravity 打造的原生聊天表情包抽屉与自定义图库扩展。

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
1. 将你的表情图片放入 `assets/presets/default/` 目录下（推荐命名规则如 `01-开心.png`、`02-点赞.png`）。
2. 执行构建脚本：
   ```bash
   python build.py
   ```
3. 运行 `install.bat` 更新客户端注入代码即可。

---

## 🗑️ 卸载

双击运行 **`uninstall.bat`**（或右键运行 `uninstall.ps1`），刷新客户端即可彻底清除注入。

---

## 📝 更新日志

详细版本变更与修复记录请查看 [CHANGELOG.md](CHANGELOG.md)。

---

## 📄 开源许可

本项目基于 [MIT License](LICENSE) 开源。
