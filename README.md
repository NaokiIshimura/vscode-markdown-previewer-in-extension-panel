# Markdown Previewer in Extension Area

A VS Code extension that keeps a fully featured Markdown preview docked in the sidebar (or panel) so you can keep writing without juggling editor tabs.

![demo](assets/demo.gif)

## Features

| Feature | Shortcut | Description |
| --- | --- | --- |
| Light Theme<br>Dark Theme | Toolbar only | Switch between light and dark theme for the preview |
| Zoom In<br>Zoom Out | `+`<br>`-` | Zoom in/out the preview (displays current zoom level) |
| Reset Zoom | Toolbar only | Reset zoom level to default |
| Navigate Previous<br>Navigate Next | `←`<br>`→` | Navigate to the previous/next Markdown file in the current directory (works even when pinned) |
| Pin<br>Unpin | `p` | Freeze the preview on the currently displayed Markdown file or return to follow mode |
| Edit | `e` | Open the previewed document in an editor tab |
| Refresh | `r` | Force the markdown to render again |
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
- Mermaid diagrams load from the jsDelivr CDN; an offline environment will skip diagram rendering.
- Images and links resolve using VS Code’s workspace paths—ensure referenced files exist in reachable locations.
- When a non-Markdown document is active, the view shows a helper message until you return to a `.md` file.

## Feedback
Please report bugs or request features via GitHub Issues. Screenshots and concise reproduction steps help us respond quickly.
