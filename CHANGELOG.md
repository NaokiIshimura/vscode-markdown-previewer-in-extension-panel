# Changelog

All notable changes to the "Markdown Preview in Extension Area" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-11-07

### Fixed
- Significantly improved CPU performance during markdown editing
  - Added debounce to document change events (300ms delay)
  - Added debounce to active editor change events (100ms delay)
  - Prevents excessive rendering when typing rapidly or switching files frequently
  - Estimated CPU usage reduction: 70-90% during active editing

### Performance
- Preview updates are now batched to reduce rendering frequency
- More responsive editing experience with reduced system load

## [0.1.8] - 2025-11-02

### Fixed
- Code blocks now correctly preserve line breaks and whitespace in the preview
  - Added `white-space: pre` CSS property to `<pre>` elements
  - Added specific styling for `<pre><code>` elements to override inline code styles

### Added
- Keyboard shortcuts for zoom and refresh operations:
  - `+` or `=` key for zoom in
  - `-` or `_` key for zoom out
  - `r` key for refresh
- Feedback messages for zoom operations:
  - Display current zoom level when zooming in/out (e.g., "Zoom: 110%")
  - Show message when already at maximum/minimum zoom level
- Keyboard shortcut indicators in command titles:
  - Edit [e], Pin [p], Unpin [p], Zoom In [+], Zoom Out [-], Refresh [r]

### Improved
- Regular text content now preserves line breaks
  - Enabled markdown-it `breaks` option to convert single line breaks to `<br>` tags

## [0.1.6] - 2025-11-01

### Fixed
- Pin button now correctly pins the file shown in the preview (previously pinned the active editor file)

### Added
- Feedback messages confirm when you pin or unpin:
  - Pin: "Pinned preview to [filename]"
  - Unpin: "Unpinned preview"
- Press `p` while the preview is focused to quickly toggle Pin/Unpin
- Press `e` while the preview is focused to open the previewed file in an editor tab
  - Shows: "Opened [filename] in editor"
- File navigation shows confirmation messages: "Switched preview to [filename]"

### Improved
- Arrow keys now work even when pinned, automatically updating the pin target

## [0.1.5] - Previous Release

### Added
- Arrow-key navigation between preview targets

## [Unreleased]

### Changed
- (Future changes will be documented here)
