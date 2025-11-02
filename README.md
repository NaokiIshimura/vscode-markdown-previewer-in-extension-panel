# Markdown Previewer in Extension Area

A VS Code extension that keeps a fully featured Markdown preview docked in the sidebar (or panel) so you can keep writing without juggling editor tabs.

![demo](assets/demo.gif)

## Features
- Always-on Markdown preview that follows the active editor or stays pinned to the file you care about
- Live updates with theme-aware styling plus manual light/dark overrides when you need to force the look
- Zoom controls with a persistent default zoom level (50–200%)
- Quick `Edit`, `Refresh`, `Pin/Unpin`, `Open Settings`, and zoom/theme toolbar commands right inside the view
- Keyboard shortcuts for efficient workflow:
  - Left/right arrow keys to jump across Markdown files in the current folder (works even when pinned)
  - `p` key to toggle Pin/Unpin while the preview is focused
  - `e` key to open the previewed file in an editor tab
  - `+` key to zoom in
  - `-` key to zoom out
  - `r` key to refresh the preview
- Mermaid diagram rendering and smart image path resolution for workspace-relative assets
- Flexible layout: keep it in the sidebar or drag the view into the panel for more room

## Requirements
- Visual Studio Code 1.74.0 or later
- Markdown files (`.md`) in the current workspace

## Usage
1. Open any Markdown file—the "Markdown Preview" view comes to life automatically.
2. Keep typing in the editor; updates appear in real time. If you switch to another Markdown document, the preview follows along.
3. Use the pin button or press `p` (when the preview is focused) to keep the **currently previewed file** visible while browsing other notes. Pin/Unpin operations show confirmation messages to let you know they succeeded.
4. When the preview shows a different file than the one you are editing, press `e` or click the `Edit` button to open it in an editor tab instantly.
5. Navigate between Markdown files with arrow keys (`←` / `→`)—even when pinned! The preview updates and shows a confirmation message.
6. Adjust zoom levels with `+` and `-` keys or use the toolbar buttons. The current zoom level is displayed when you zoom.
7. Press `r` or hit `Refresh` button if you want to force a redraw (for example after external file changes or when mermaid diagrams need a rerun).

### View toolbar commands
- `Edit [e]` — reopen the previewed document in an editor tab when it is not active.
- `Pin [p]` / `Unpin [p]` — freeze the preview on the **currently displayed** Markdown file (not the active editor) or return to follow mode. A message confirms the action.
- `Use Light Theme` / `Use Dark Theme` — override automatic theming for the preview only.
- `Zoom In [+]`, `Zoom Out [-]`, `Reset Zoom` — adjust rendering scale; the default persists across sessions. Displays current zoom level.
- `Refresh [r]` — force the markdown to render again.
- `Open Settings` — jump straight to the extension's configuration section.

### Keyboard shortcuts (when preview is focused)
- `←` / `→` — Navigate to the previous or next Markdown file in the current directory (works even when pinned)
- `p` — Toggle Pin/Unpin for hands-free workflow
- `e` — Open the previewed file in an editor tab
- `+` — Zoom in (shows current zoom level)
- `-` — Zoom out (shows current zoom level)
- `r` — Refresh the preview

### Settings
- `markdownPreview.defaultZoomLevel` — choose the default zoom percentage (50–200, default 100).
- `markdownPreview.themeMode` — control how the preview resolves its theme (`auto`, `light`, `dark`).

## Development
```bash
npm install      # install dependencies
npm run compile  # one-shot build to ./out
npm run watch    # incremental build while developing
```
Launch the VS Code Extension Host (`F5`) to try changes live in a sandbox window.

## Tips & Known Limitations
- Mermaid diagrams load from the jsDelivr CDN; an offline environment will skip diagram rendering.
- Images and links resolve using VS Code’s workspace paths—ensure referenced files exist in reachable locations.
- When a non-Markdown document is active, the view shows a helper message until you return to a `.md` file.

## Feedback
Please report bugs or request features via GitHub Issues. Screenshots and concise reproduction steps help us respond quickly.
