# Markdown Previewer in Extension Area

[![Version](https://img.shields.io/badge/version-1.0.1-blue)](https://marketplace.visualstudio.com/items?itemName=nacn.markdown-previewer-in-extension-panel) [![VS Code](https://img.shields.io/badge/VS%20Code-1.74.0%2B-blue)](https://code.visualstudio.com/)

A VS Code extension that displays a fully featured Markdown preview in the extension area (primary sidebar, secondary sidebar, or panel) so you can read and navigate your documentation without juggling editor tabs.

→ [Get it on VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=nacn.markdown-previewer-in-extension-panel)

## Features

### 🎯 Extension Area Display

Can be displayed in the primary sidebar, secondary sidebar, or panel.

![demo3](assets/demo3.gif)

| Feature | Shortcut | Description |
| --- | --- | --- |
| Navigate Previous/Next | `←` / `→` | Navigate to previous/next Markdown file in the same directory |
| Pin/Unpin | `p` | Freeze the preview on the currently displayed Markdown file or return to follow mode |
| Edit | `e` | Open the previewed document in an editor tab |
| File Path Copy | Click path | Copy the file path to clipboard by clicking the file path; shows VS Code notification message |
| Open Settings | Toolbar only | Jump to the extension's configuration section |


### 🎨 Rich Preview Experience

Provides versatile features for a comfortable viewing experience.

![demo2](assets/demo2.gif)

| Feature | Shortcut | Description |
| --- | --- | --- |
| Light/Dark Theme | `t` | Switch between light and dark theme for the preview |
| Zoom In/Out | `+` / `-` | Zoom in/out the preview (displays current zoom level) |
| Reset Zoom | `r` | Reset zoom level to 100% |
| Mermaid Diagrams | Automatic | Renders Mermaid diagrams (flowcharts, sequence diagrams, class diagrams, etc.) directly in the preview |
| Mermaid Copy | Hover toolbar | Copy Mermaid diagram source as Markdown code block to clipboard |
| Mermaid Save | Hover toolbar | Save Mermaid diagram as PNG image via VS Code save dialog |
| Code Syntax Highlighting | Automatic | Adds language-aware coloring to fenced code blocks when you specify a language (for example, <code>```javascript</code>) |
| Code Block Copy | Hover toolbar | Copies the entire fenced code block to your clipboard with one click |
| Copy Selected Text | `c` | Copy selected text to clipboard; shows VS Code notification message |
| Copy as Quote | `q` | Copy selected text with `> ` prefix on each line for quoting in Markdown |
| File Path Display | Always visible | Shows the relative path from project root at the top of the preview |
| Theme-Aware Scrollbars | Automatic | Scrollbars respect the active light/dark theme for better readability |
| Link Context Menu | Right-click a link | Choose between the default browser and VS Code's integrated Simple Browser for `http`/`https` links |

### 🗂️ Sidebar Features

Has four tabs (Outline, Files, History, Help) to view various information.

| Tab | Shortcut | Description |
| --- | --- | --- |
| Sidebar | `s` | Toggle sidebar panel with Outline, Files, History, and Help tabs; use Tab to switch between tabs, ↑/↓ to navigate items, Enter to select, Esc to close |
| Outline | `o` | Open sidebar and show Outline tab; displays current filename with h1-h6 navigation. Use ↑/↓ to navigate, Enter to select, Esc to close |
| Files | `f` | Open sidebar and show File list tab; displays markdown files in the same directory for quick navigation. Use ↑/↓ to navigate, Enter to select, Esc to close |
| File sort | `a` | Toggle file sort order between name (alphabetical) and modified (newest first) |
| History | `h` | Open sidebar and show History tab; displays recently previewed files for quick navigation. Use ↑/↓ to navigate, Enter to select, Esc to close |
| Help | Tab key | View all features and keyboard shortcuts in the sidebar Help tab; accessible via Tab key when sidebar is open |

**Note**: Keyboard shortcuts work only when the preview is focused.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `markdownPreviewInExtensionPanel.defaultZoomLevel` | `100` | Default zoom percentage (50–200) |
| `markdownPreviewInExtensionPanel.themeMode` | `auto` | Theme mode for the preview (`auto`, `light`, `dark`) |
| `markdownPreviewInExtensionPanel.fileSortOrder` | `name` | Sort order for files in the Files tab (`name`, `modified`) |
| `markdownPreviewInExtensionPanel.scrollSync` | `true` | Synchronize scrolling between the source editor and the preview (bidirectional). The source editor must be visible alongside the preview. |

## Requirements
- Visual Studio Code 1.74.0 or later
- Markdown files (`.md`) in the current workspace

## Development
```bash
npm install      # install dependencies
npm run compile  # one-shot build to ./out
npm run watch    # incremental build while developing
npm test         # run unit tests
```
Launch the VS Code Extension Host (`F5`) to try changes live in a sandbox window.

## Tips & Known Limitations
- **Sidebar**: Press `s` to toggle a sidebar panel that combines Outline, Files, History, and Help in a tabbed interface. Use Tab to switch between tabs, ↑/↓ to navigate items, Enter to select, and Esc to close.
- **Outline**: Press `o` to open the sidebar and display the Outline tab. The tab shows the current filename at the top with a separator line, followed by h1-h6 headings extracted from your Markdown document for clickable navigation.
- **File list**: Press `f` to open the sidebar and display the File list tab. The sidebar displays all Markdown files in the same directory as the current file, with the current file highlighted. Click any file to switch to it. Press `a` to toggle sort order between name and modified date.
- **History**: Press `h` to open the sidebar and display the History tab. The tab shows recently previewed Markdown files in chronological order (most recent first). Click any file to switch to it, or use the Clear button to remove all history entries.
- **Help**: The Help tab in the sidebar provides a quick reference for all features and keyboard shortcuts. Press Tab to cycle through sidebar tabs to reach it.
- The File list tab only appears when there are 2 or more markdown files in the directory.
- When the sidebar is open, use ↑/↓ to navigate items, Enter to select, and Esc to close.
- Left/right arrow keys (←/→) always navigate to the previous/next Markdown file, even when the sidebar is open.
- Mermaid diagrams load from the jsDelivr CDN; an offline environment will skip diagram rendering.
- Images and links resolve using VS Code's workspace paths—ensure referenced files exist in reachable locations.
- When no Markdown file is open, the preview automatically shows the workspace's README.md if available.
- The preview persists even when switching to non-Markdown files, allowing you to keep your documentation visible while working on code.
- The sidebar remains visible when switching to a different file, preserving your navigation context.
- When switching to a different Markdown file, the scroll position automatically resets to the top for a fresh viewing experience.
- The Copy as Quote feature is useful for quoting content in issues, pull requests, or other Markdown documents.

## Feedback
Please report bugs or request features via GitHub Issues. Screenshots and concise reproduction steps help us respond quickly.
