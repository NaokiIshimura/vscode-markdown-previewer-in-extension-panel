# Markdown Previewer in Extension Area

[![Version](https://img.shields.io/badge/version-1.1.2-blue)](https://marketplace.visualstudio.com/items?itemName=nacn.markdown-previewer-in-extension-panel) [![VS Code](https://img.shields.io/badge/VS%20Code-1.74.0%2B-blue)](https://code.visualstudio.com/) [![VS Marketplace](https://img.shields.io/badge/VS%20Marketplace-Install-blue)](https://marketplace.visualstudio.com/items?itemName=nacn.markdown-previewer-in-extension-panel)

[English](README.md) | [日本語](README-JA.md) | [한국어](README-KO.md) | [简体中文](README-ZH-CN.md) | 繁體中文 | [Português (BR)](README-PT-BR.md)

一款 VS Code 擴充功能，可在擴充區域（主要側邊欄、次要側邊欄或面板）中顯示功能完整的 Markdown 預覽，讓你無須在編輯器分頁之間來回切換即可閱讀與瀏覽文件。

## 功能

### 🎯 在擴充區域中顯示

可顯示在主要側邊欄、次要側邊欄或面板中。

![demo3](assets/demo3.gif)

| 功能 | 快速鍵 | 說明 |
| --- | --- | --- |
| 上一個/下一個檔案 | `←` / `→` | 移至同一目錄中的上一個/下一個 Markdown 檔案 |
| 釘選/取消釘選 | `p` | 將預覽固定在目前顯示的 Markdown 檔案上，或恢復為跟隨模式 |
| 編輯 | `e` | 在編輯器分頁中開啟正在預覽的文件 |
| 複製檔案路徑 | 點擊路徑 | 點擊檔案路徑即可複製到剪貼簿，並顯示 VS Code 通知訊息 |
| 開啟設定 | 僅限工具列 | 跳至本擴充功能的設定頁面 |


### 🎨 豐富的預覽體驗

提供多種功能，帶來舒適的閱讀體驗。

![demo2](assets/demo2.gif)

| 功能 | 快速鍵 | 說明 |
| --- | --- | --- |
| 淺色/深色佈景主題 | `t` | 切換預覽的淺色/深色佈景主題 |
| 放大/縮小 | `+` / `-` | 放大/縮小預覽（顯示目前縮放比例） |
| 重設縮放 | `r` | 將縮放比例重設為 100% |
| Mermaid 圖表 | 自動 | 在預覽中直接轉譯 Mermaid 圖表（流程圖、循序圖、類別圖等） |
| 複製 Mermaid | 滑鼠懸停工具列 | 將 Mermaid 圖表原始碼以 Markdown 程式碼區塊形式複製到剪貼簿 |
| 儲存 Mermaid | 滑鼠懸停工具列 | 透過 VS Code 儲存對話框將 Mermaid 圖表儲存為 PNG 圖片 |
| 程式碼語法醒目提示 | 自動 | 為指定了語言的圍欄程式碼區塊加上語法色彩（例如 <code>```javascript</code>） |
| 複製程式碼區塊 | 滑鼠懸停工具列 | 一鍵將整個圍欄程式碼區塊複製到剪貼簿 |
| 複製選取文字 | `c` | 將選取的文字複製到剪貼簿，並顯示 VS Code 通知訊息 |
| 以引用格式複製 | `q` | 在選取文字的每一行前加上 `> ` 後複製，方便在 Markdown 中引用 |
| 顯示檔案路徑 | 永遠顯示 | 在預覽頂端顯示相對於專案根目錄的路徑 |
| 佈景主題適配捲軸 | 自動 | 捲軸會配合目前的淺色/深色佈景主題，提升可讀性 |
| 連結右鍵選單 | 在連結上按右鍵 | 可選擇以預設瀏覽器或 VS Code 內建的 Simple Browser 開啟 `http`/`https` 連結 |

### 🗂️ 側邊欄功能

包含四個分頁（大綱、檔案、歷程記錄、說明），可檢視各類資訊。

| 分頁 | 快速鍵 | 說明 |
| --- | --- | --- |
| 側邊欄 | `s` | 顯示/隱藏包含大綱、檔案、歷程記錄與說明分頁的側邊欄面板。使用 Tab 切換分頁，↑/↓ 移動項目，Enter 選取，Esc 關閉 |
| 大綱 | `o` | 開啟側邊欄並顯示大綱分頁，顯示目前檔名及 h1-h6 導覽。使用 ↑/↓ 移動，Enter 選取，Esc 關閉 |
| 檔案 | `f` | 開啟側邊欄並顯示檔案清單分頁，列出同一目錄中的 Markdown 檔案以便快速切換。使用 ↑/↓ 移動，Enter 選取，Esc 關閉 |
| 檔案排序 | `a` | 在依名稱（字母順序）與依修改時間（最新優先）之間切換檔案排序 |
| 歷程記錄 | `h` | 開啟側邊欄並顯示歷程記錄分頁，列出最近預覽過的檔案以便快速切換。使用 ↑/↓ 移動，Enter 選取，Esc 關閉 |
| 說明 | Tab 鍵 | 在側邊欄的說明分頁中檢視所有功能與鍵盤快速鍵；側邊欄開啟時可透過 Tab 鍵存取 |

**注意**：鍵盤快速鍵僅在預覽取得焦點時有效。

## 設定

| 設定 | 預設值 | 說明 |
| --- | --- | --- |
| `markdownPreviewInExtensionPanel.defaultZoomLevel` | `100` | 預設縮放百分比（50–200） |
| `markdownPreviewInExtensionPanel.themeMode` | `auto` | 預覽的佈景主題模式（`auto`、`light`、`dark`） |
| `markdownPreviewInExtensionPanel.fileSortOrder` | `name` | 檔案分頁中的檔案排序方式（`name`、`modified`） |
| `markdownPreviewInExtensionPanel.scrollSync` | `true` | 在原始碼編輯器與預覽之間同步捲動（雙向）。原始碼編輯器須與預覽同時可見。 |

## 系統需求
- Visual Studio Code 1.74.0 或更新版本
- 目前工作區中的 Markdown 檔案（`.md`）

## 開發
```bash
npm install      # 安裝相依套件
npm run compile  # 一次性建置到 ./out
npm run watch    # 開發時增量建置
npm test         # 執行單元測試
```
啟動 VS Code 擴充功能開發主機（`F5`），即可在沙箱視窗中即時試用變更。

## 提示與已知限制
- **側邊欄**：按 `s` 可顯示/隱藏以分頁形式整合大綱、檔案、歷程記錄與說明的側邊欄面板。使用 Tab 切換分頁，↑/↓ 移動項目，Enter 選取，Esc 關閉。
- **大綱**：按 `o` 開啟側邊欄並顯示大綱分頁。分頁頂端顯示目前檔名與分隔線，下方則是從 Markdown 文件擷取的 h1-h6 標題，可點擊導覽。
- **檔案清單**：按 `f` 開啟側邊欄並顯示檔案清單分頁。側邊欄會列出與目前檔案同一目錄下的所有 Markdown 檔案，並醒目標示目前檔案。點擊任一檔案即可切換。按 `a` 可在依名稱與依修改時間排序之間切換。
- **歷程記錄**：按 `h` 開啟側邊欄並顯示歷程記錄分頁。分頁依時間順序（最新優先）列出最近預覽過的 Markdown 檔案。點擊任一檔案即可切換，或使用 Clear 按鈕清除所有歷程記錄。
- **說明**：側邊欄中的說明分頁提供所有功能與鍵盤快速鍵的快速參考。按 Tab 在側邊欄分頁之間循環即可存取。
- 僅當目錄中有 2 個以上的 Markdown 檔案時，才會顯示檔案清單分頁。
- 側邊欄開啟時，使用 ↑/↓ 移動項目，Enter 選取，Esc 關閉。
- 即使側邊欄處於開啟狀態，左右方向鍵（←/→）也一律移至上一個/下一個 Markdown 檔案。
- Mermaid 圖表從 jsDelivr CDN 載入；離線環境下將略過圖表轉譯。
- 圖片與連結會使用 VS Code 的工作區路徑解析，請確認參照的檔案位於可存取的位置。
- 未開啟任何 Markdown 檔案時，若工作區中存在 README.md，預覽會自動顯示該檔案。
- 切換到非 Markdown 檔案時預覽仍會保留，方便在撰寫程式碼時持續檢視文件。
- 切換到其他檔案時側邊欄會保持顯示，導覽狀態得以保留。
- 切換到其他 Markdown 檔案時，捲動位置會自動重設至頂端，帶來全新的閱讀體驗。
- 以引用格式複製功能方便在 Issue、Pull Request 或其他 Markdown 文件中引用內容。

## 意見回饋
請透過 GitHub Issues 回報錯誤或提出功能需求。附上螢幕截圖與簡潔的重現步驟，有助於我們更快回應。
