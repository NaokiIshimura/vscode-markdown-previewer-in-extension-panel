# Markdown Previewer in Extension Area

[![Version](https://img.shields.io/badge/version-1.1.2-blue)](https://marketplace.visualstudio.com/items?itemName=nacn.markdown-previewer-in-extension-panel) [![VS Code](https://img.shields.io/badge/VS%20Code-1.74.0%2B-blue)](https://code.visualstudio.com/) [![VS Marketplace](https://img.shields.io/badge/VS%20Marketplace-Install-blue)](https://marketplace.visualstudio.com/items?itemName=nacn.markdown-previewer-in-extension-panel)

[English](README.md) | [日本語](README-JA.md) | [한국어](README-KO.md) | 简体中文 | [繁體中文](README-ZH-TW.md) | [Português (BR)](README-PT-BR.md)

一款 VS Code 扩展，可在扩展区域（主侧边栏、辅助侧边栏或面板）中显示功能完整的 Markdown 预览，让你无需在编辑器标签页之间来回切换即可阅读和浏览文档。

## 功能

### 🎯 在扩展区域中显示

可显示在主侧边栏、辅助侧边栏或面板中。

![demo3](assets/demo3.gif)

| 功能 | 快捷键 | 说明 |
| --- | --- | --- |
| 上一个/下一个文件 | `←` / `→` | 跳转到同一目录中的上一个/下一个 Markdown 文件 |
| 固定/取消固定 | `p` | 将预览固定在当前显示的 Markdown 文件上，或恢复为跟随模式 |
| 编辑 | `e` | 在编辑器标签页中打开正在预览的文档 |
| 复制文件路径 | 点击路径 | 点击文件路径即可复制到剪贴板，并显示 VS Code 通知消息 |
| 打开设置 | 仅工具栏 | 跳转到本扩展的设置页面 |


### 🎨 丰富的预览体验

提供多种功能，带来舒适的阅读体验。

![demo2](assets/demo2.gif)

| 功能 | 快捷键 | 说明 |
| --- | --- | --- |
| 浅色/深色主题 | `t` | 切换预览的浅色/深色主题 |
| 放大/缩小 | `+` / `-` | 放大/缩小预览（显示当前缩放比例） |
| 重置缩放 | `r` | 将缩放比例重置为 100% |
| Mermaid 图表 | 自动 | 在预览中直接渲染 Mermaid 图表（流程图、时序图、类图等） |
| 复制 Mermaid | 悬停工具栏 | 将 Mermaid 图表源码以 Markdown 代码块形式复制到剪贴板 |
| 保存 Mermaid | 悬停工具栏 | 通过 VS Code 保存对话框将 Mermaid 图表保存为 PNG 图片 |
| 代码语法高亮 | 自动 | 为指定了语言的围栏代码块添加语法着色（例如 <code>```javascript</code>） |
| 复制代码块 | 悬停工具栏 | 一键将整个围栏代码块复制到剪贴板 |
| 复制选中文本 | `c` | 将选中的文本复制到剪贴板，并显示 VS Code 通知消息 |
| 以引用格式复制 | `q` | 在选中文本的每一行前添加 `> ` 后复制，便于在 Markdown 中引用 |
| 显示文件路径 | 始终显示 | 在预览顶部显示相对于项目根目录的路径 |
| 主题适配滚动条 | 自动 | 滚动条跟随当前浅色/深色主题，提升可读性 |
| 链接右键菜单 | 右键点击链接 | 可选择使用默认浏览器或 VS Code 内置的 Simple Browser 打开 `http`/`https` 链接 |

### 🗂️ 侧边栏功能

包含四个标签页（大纲、文件、历史、帮助），用于查看各类信息。

| 标签页 | 快捷键 | 说明 |
| --- | --- | --- |
| 侧边栏 | `s` | 显示/隐藏包含大纲、文件、历史和帮助标签页的侧边栏面板。使用 Tab 切换标签页，↑/↓ 移动项目，Enter 选择，Esc 关闭 |
| 大纲 | `o` | 打开侧边栏并显示大纲标签页，显示当前文件名及 h1-h6 导航。使用 ↑/↓ 移动，Enter 选择，Esc 关闭 |
| 文件 | `f` | 打开侧边栏并显示文件列表标签页，列出同一目录中的 Markdown 文件以便快速跳转。使用 ↑/↓ 移动，Enter 选择，Esc 关闭 |
| 文件排序 | `a` | 在按名称（字母顺序）和按修改时间（最新优先）之间切换文件排序 |
| 历史 | `h` | 打开侧边栏并显示历史标签页，列出最近预览过的文件以便快速跳转。使用 ↑/↓ 移动，Enter 选择，Esc 关闭 |
| 帮助 | Tab 键 | 在侧边栏的帮助标签页中查看所有功能和键盘快捷键；侧边栏打开时可通过 Tab 键访问 |

**注意**：键盘快捷键仅在预览获得焦点时生效。

## 设置

| 设置项 | 默认值 | 说明 |
| --- | --- | --- |
| `markdownPreviewInExtensionPanel.defaultZoomLevel` | `100` | 默认缩放百分比（50–200） |
| `markdownPreviewInExtensionPanel.themeMode` | `auto` | 预览的主题模式（`auto`、`light`、`dark`） |
| `markdownPreviewInExtensionPanel.fileSortOrder` | `name` | 文件标签页中的文件排序方式（`name`、`modified`） |
| `markdownPreviewInExtensionPanel.scrollSync` | `true` | 在源编辑器与预览之间同步滚动（双向）。源编辑器需要与预览同时可见。 |

## 系统要求
- Visual Studio Code 1.74.0 或更高版本
- 当前工作区中的 Markdown 文件（`.md`）

## 开发
```bash
npm install      # 安装依赖
npm run compile  # 一次性构建到 ./out
npm run watch    # 开发时增量构建
npm test         # 运行单元测试
```
启动 VS Code 扩展开发宿主（`F5`），即可在沙盒窗口中实时试用更改。

## 提示与已知限制
- **侧边栏**：按 `s` 可显示/隐藏以标签页形式整合了大纲、文件、历史和帮助的侧边栏面板。使用 Tab 切换标签页，↑/↓ 移动项目，Enter 选择，Esc 关闭。
- **大纲**：按 `o` 打开侧边栏并显示大纲标签页。标签页顶部显示当前文件名及分隔线，下方是从 Markdown 文档中提取的 h1-h6 标题，可点击跳转。
- **文件列表**：按 `f` 打开侧边栏并显示文件列表标签页。侧边栏会列出与当前文件同一目录下的所有 Markdown 文件，并高亮当前文件。点击任意文件即可切换。按 `a` 可在按名称和按修改时间排序之间切换。
- **历史**：按 `h` 打开侧边栏并显示历史标签页。标签页按时间顺序（最新优先）列出最近预览过的 Markdown 文件。点击任意文件即可切换，或使用 Clear 按钮清除所有历史记录。
- **帮助**：侧边栏中的帮助标签页提供所有功能和键盘快捷键的速查。按 Tab 在侧边栏标签页之间循环即可访问。
- 仅当目录中有 2 个或以上 Markdown 文件时，才会显示文件列表标签页。
- 侧边栏打开时，使用 ↑/↓ 移动项目，Enter 选择，Esc 关闭。
- 即使侧边栏处于打开状态，左右方向键（←/→）也始终跳转到上一个/下一个 Markdown 文件。
- Mermaid 图表从 jsDelivr CDN 加载；离线环境下将跳过图表渲染。
- 图片和链接使用 VS Code 的工作区路径进行解析，请确保被引用的文件位于可访问的位置。
- 未打开任何 Markdown 文件时，如果工作区中存在 README.md，预览会自动显示该文件。
- 切换到非 Markdown 文件时预览仍会保留，便于在编写代码时持续查看文档。
- 切换到其他文件时侧边栏保持显示，导航状态得以保留。
- 切换到其他 Markdown 文件时，滚动位置会自动重置到顶部，带来全新的阅读体验。
- 以引用格式复制功能便于在 Issue、Pull Request 或其他 Markdown 文档中引用内容。

## 反馈
请通过 GitHub Issues 报告问题或提出功能请求。附上截图和简洁的复现步骤有助于我们更快地响应。
