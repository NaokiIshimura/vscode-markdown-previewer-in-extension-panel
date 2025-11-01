# Markdown Previewer in Extension Area

A VS Code extension that keeps a fully featured Markdown preview docked in the sidebar (or panel) so you can keep writing without juggling editor tabs.

![demo](assets/demo.gif)

## Features
- Always-on Markdown preview that follows the active editor or stays pinned to the file you care about
- Live updates with theme-aware styling plus manual light/dark overrides when you need to force the look
- Zoom controls with a persistent default zoom level (50–200%)
- Quick `Edit`, `Refresh`, `Pin/Unpin`, `Open Settings`, and zoom/theme toolbar commands right inside the view
- Keyboard navigation with left/right arrow keys to jump across Markdown files in the current folder
- Mermaid diagram rendering and smart image path resolution for workspace-relative assets
- Flexible layout: keep it in the sidebar or drag the view into the panel for more room

## What's New in v0.1.5
- Added left/right arrow key support for hopping to the previous or next Markdown file in the same directory while the preview is following the editor.
- Automatically refresh the folder listing on create, delete, or rename events so navigation stays in sync with your workspace.

## Requirements
- Visual Studio Code 1.74.0 or later
- Markdown files (`.md`) in the current workspace

## Usage
1. Open any Markdown file—the “Markdown Preview” view comes to life automatically.
2. Keep typing in the editor; updates appear in real time. If you switch to another Markdown document, the preview follows along.
3. Use the pin button when you want to keep the current file visible while browsing other notes. Click again to resume live-follow mode.
4. When the preview shows a different file than the one you are editing, the `Edit` command jumps you back instantly.
5. Toggle the light/dark button or tweak zoom levels from the toolbar whenever the default styling does not match your needs.
6. Hit `Refresh` if you want to force a redraw (for example after external file changes or when mermaid diagrams need a rerun).

### View toolbar commands
- `Edit` — reopen the previewed document in an editor tab when it is not active.
- `Pin` / `Unpin` — freeze the preview on the current Markdown file or return to follow mode.
- `Use Light Theme` / `Use Dark Theme` — override automatic theming for the preview only.
- `Zoom In`, `Zoom Out`, `Reset Zoom` — adjust rendering scale; the default persists across sessions.
- `Refresh` — force the markdown to render again.
- `Open Settings` — jump straight to the extension’s configuration section.

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
