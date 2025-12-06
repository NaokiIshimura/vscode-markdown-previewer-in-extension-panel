# Markdown Previewer in Extension Area

A VS Code extension that keeps a fully featured Markdown preview docked in the sidebar (or panel) so you can keep writing without juggling editor tabs.

![demo2](assets/demo2.gif)

![demo3](assets/demo3.gif)

## Features

| Feature | Shortcut | Description |
| --- | --- | --- |
| Headings | `h` or Hover | Toggle headings panel or expand on hover; displays h1-h6 navigation in the file path header. Use arrow keys to navigate, Enter to select, Esc to close |
| File list | `l` or Hover | Toggle file list panel or expand on hover; displays markdown files in the same directory for quick navigation. Use arrow keys to navigate, Enter to select, Esc to close |
| Search | `f` | Shows search bar with case-sensitive option; navigate matches with Enter/Shift+Enter, close with Esc |
| Copy | `c` | Copy selected text to clipboard; shows VS Code notification message |
| File Path Copy | Click path | Copy the file path to clipboard by clicking the file path; shows VS Code notification message |
| Copy as Quote | `q` | When text is selected, press `q` to copy selected text with `> ` prefix on each line for quoting in Markdown |
| Light Theme<br>Dark Theme | `t` | Switch between light and dark theme for the preview |
| Zoom In<br>Zoom Out | `+`<br>`-` | Zoom in/out the preview (displays current zoom level) |
| Reset Zoom | `r` | Reset zoom level to 100% |
| Navigate Previous<br>Navigate Next | `←`<br>`→` | Opens File list panel and highlights next/previous file; press Enter to navigate to the selected file |
| Pin<br>Unpin | `p` | Freeze the preview on the currently displayed Markdown file or return to follow mode |
| Edit | `e` | Open the previewed document in an editor tab |
| File Path Display | Always visible | Shows the relative path from project root at the top of the preview |
| Code Block Syntax Highlighting | Automatic | Adds language-aware coloring to fenced code blocks when you specify a language (for example, <code>```javascript</code>) |
| Code Block Copy Button | Hover toolbar | Copies the entire fenced code block to your clipboard with one click |
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
- The File List panel displays all Markdown files in the same directory as the current file, with the current file highlighted.
- Press `l` to toggle the file list, or hover over "Files" in the header. Click any file to switch to it.
- When using left/right arrow keys to navigate, the file list panel appears temporarily for 3 seconds.
- The Headings panel automatically extracts h1-h6 headings from your Markdown document and provides clickable navigation.
- The Headings panel is located in the file path header area at the top of the preview.
- Hover over the Headings title to expand the navigation dropdown menu.
- Clicking on a heading in the dropdown smoothly scrolls to that section in the preview.
- The File list panel displays other markdown files in the same directory for quick navigation.
- The File list panel only appears when there are 2 or more markdown files in the directory.
- Click on a file name in the File list dropdown to switch preview to that file.
- When the Headings or File list panel is open, use any arrow key (↑/↓/←/→) to navigate items, Enter to select, and Esc to close.
- Pressing ←/→ arrow keys will show the File list panel and highlight the target file. Press Enter to confirm navigation.
- Mermaid diagrams load from the jsDelivr CDN; an offline environment will skip diagram rendering.
- Images and links resolve using VS Code's workspace paths—ensure referenced files exist in reachable locations.
- When no Markdown file is open, the preview automatically shows the workspace's README.md if available.
- The preview persists even when switching to non-Markdown files, allowing you to keep your documentation visible while working on code.
- When switching to a different Markdown file, the scroll position automatically resets to the top for a fresh viewing experience.
- The Copy as Quote feature is useful for quoting content in issues, pull requests, or other Markdown documents.

## Feedback
Please report bugs or request features via GitHub Issues. Screenshots and concise reproduction steps help us respond quickly.
