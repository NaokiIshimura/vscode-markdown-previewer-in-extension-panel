# Markdown Previewer in Extension Area

A VS Code extension that keeps a fully featured Markdown preview docked in the sidebar (or panel) so you can keep writing without juggling editor tabs.

![demo2](assets/demo2.gif)

![demo3](assets/demo3.gif)

## Features

| Feature | Shortcut | Description |
| --- | --- | --- |
| Sidebar | `s` | Toggle sidebar panel with Outline, Files, and Help tabs; use Tab to switch between tabs, ↑/↓ to navigate items, Enter to select, Esc to close |
| Outline | `o` | Open sidebar and show Outline tab; displays h1-h6 navigation. Use ↑/↓ to navigate, Enter to select, Esc to close |
| File list | `f` | Open sidebar and show File list tab; displays markdown files in the same directory for quick navigation. Use ↑/↓ to navigate, Enter to select, Esc to close |
| Help | Sidebar tab | View all features and keyboard shortcuts in the sidebar Help tab; accessible via Tab key when sidebar is open |
| Copy | `c` | Copy selected text to clipboard; shows VS Code notification message |
| File Path Copy | Click path | Copy the file path to clipboard by clicking the file path; shows VS Code notification message |
| Copy as Quote | `q` | When text is selected, press `q` to copy selected text with `> ` prefix on each line for quoting in Markdown |
| Light Theme<br>Dark Theme | `t` | Switch between light and dark theme for the preview |
| Zoom In<br>Zoom Out | `+`<br>`-` | Zoom in/out the preview (displays current zoom level) |
| Reset Zoom | `r` | Reset zoom level to 100% |
| Navigate Previous<br>Navigate Next | `←`<br>`→` | Navigate to previous/next Markdown file in the same directory |
| Pin<br>Unpin | `p` | Freeze the preview on the currently displayed Markdown file or return to follow mode |
| Edit | `e` | Open the previewed document in an editor tab |
| File Path Display | Always visible | Shows the relative path from project root at the top of the preview |
| Code Block Syntax Highlighting | Automatic | Adds language-aware coloring to fenced code blocks when you specify a language (for example, <code>```javascript</code>) |
| Code Block Copy Button | Hover toolbar | Copies the entire fenced code block to your clipboard with one click |
| Mermaid Diagrams | Automatic | Renders Mermaid diagrams (flowcharts, sequence diagrams, class diagrams, etc.) directly in the preview |
| Mermaid Copy | Hover toolbar | Copy Mermaid diagram source as Markdown code block to clipboard |
| Mermaid Save | Hover toolbar | Save Mermaid diagram as PNG image via VS Code save dialog |
| Theme-Aware Scrollbars | Automatic | Scrollbars inside the preview now respect the active light/dark theme for better readability |
| Open Settings | Toolbar only | Jump to the extension's configuration section |

**Note**: Keyboard shortcuts work only when the preview is focused.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `markdownPreview.defaultZoomLevel` | `100` | Default zoom percentage (50–200) |
| `markdownPreview.themeMode` | `auto` | Theme mode for the preview (`auto`, `light`, `dark`) |

## Requirements
- Visual Studio Code 1.74.0 or later
- Markdown files (`.md`) in the current workspace

## Development
```bash
npm install      # install dependencies
npm run compile  # one-shot build to ./out
npm run watch    # incremental build while developing
```
Launch the VS Code Extension Host (`F5`) to try changes live in a sandbox window.

## Tips & Known Limitations
- **Sidebar**: Press `s` to toggle a sidebar panel that combines Outline, Files, and Help in a tabbed interface. Use Tab to switch between tabs, ↑/↓ to navigate items, Enter to select, and Esc to close.
- **Outline**: Press `o` to open the sidebar and display the Outline tab. The sidebar automatically extracts h1-h6 headings from your Markdown document and provides clickable navigation.
- **File list**: Press `f` to open the sidebar and display the File list tab. The sidebar displays all Markdown files in the same directory as the current file, with the current file highlighted. Click any file to switch to it.
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
