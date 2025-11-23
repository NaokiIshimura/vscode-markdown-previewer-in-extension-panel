# Changelog

All notable changes to the "Markdown Preview in Extension Area" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.9] - 2025-11-23

### Added
- Tooltip on headings panel showing keyboard shortcut hint
  - Displays "Toggle headings panel [h]" when hovering over the headings header
  - Improves discoverability of the keyboard shortcut

### Changed
- Headings panel now displays all heading levels (h1-h6)
  - Previously only showed h1-h3 headings
  - h4-h6 headings are now included with appropriate indentation
  - Provides complete document structure navigation

## [0.3.8] - 2025-11-23

### Added
- Keyboard shortcut `h` to toggle headings panel visibility
  - Press `h` key to show/hide headings navigation panel
  - Works alongside existing hover functionality
  - Manual toggle state is preserved until explicitly changed
  - Hover behavior continues to work when panel is not manually toggled
- File path copy functionality with multiple methods
  - Press `c` key to copy file path to clipboard
  - Click file path text to copy to clipboard
  - Shows VS Code notification message on successful copy
  - Visual feedback with checkmark (✓) in webview
  - Error notification if copy fails
  - Feedback automatically resets after 1.5 seconds
  - Copy icon (📋) appears on hover for visual hint

### Changed
- Headings panel can now be controlled with both `h` key and hover
- File path section updated with clickable design
- File path now visually indicates it's clickable with hover effects

### Removed
- Separate copy button (📋 icon button) next to file path

## [0.3.7] - 2025-11-22

### Added
- Search functionality with integrated search bar in file path header
  - Press `f` key to show search bar with auto-focus to search input
  - Search bar positioned after Pin/Unpin button in the toolbar
  - Case-sensitive search option via checkbox
  - Navigate matches with Enter (next) / Shift+Enter (previous)
  - Close search bar with Esc key
  - Real-time match highlighting with current match indicator
  - Match counter displays "X/Y" format
  - Search input focus control prevents keyboard shortcuts from firing during typing

### Changed
- Toolbar button order updated: Search button now appears immediately after Pin/Unpin
- All keyboard shortcuts (r, t, p, e, +, -, ←, →) are disabled when typing in search input

## [0.3.6] - 2025-11-22

### Added
- Keyboard shortcut `r` to reset zoom level to 100%
- Keyboard shortcut `t` to toggle between light and dark themes
- Notification messages when using keyboard shortcuts:
  - "Zoom: 100%" when pressing `r`
  - "Theme: Light" or "Theme: Dark" when pressing `t`

### Changed
- Updated toolbar tooltips to display keyboard shortcuts for reset zoom and theme toggle
- Removed refresh command (replaced by reset zoom on `r` key)

## [0.3.5] - 2025-11-21

### Fixed
- Code block copy button functionality
  - Reimplemented copy button with simplified and reliable code
  - Copy button now appears on hover over code blocks
  - Provides clear visual feedback ("Copied!" / "Failed") after clicking
  - Uses modern clipboard API with proper error handling

## [0.3.4] - 2025-11-21

### Added
- Copy button inside each fenced code block to quickly copy its contents

### Changed
- Scrollbars now inherit the active preview theme in both light and dark modes
- Reduced code block font size for improved readability
- Documentation updated to describe the new copy button and themed scrollbars

## [0.3.3] - 2025-11-20

### Added
- Syntax highlighting for fenced code blocks that specify a language
  - Uses `highlight.js` so code fences such as <code>```javascript</code> gain readable colors
  - Automatically matches the preview's light/dark theme colors
  - Applies to both pinned and live-follow previews without extra actions

## [0.3.2] - 2025-11-18

### Changed
- Moved Headings panel to the file path header area
  - Headings title now appears in the top sticky header alongside the file path
  - Headings list dropdown spans from the header area into the content area
  - Maintains hover-to-expand functionality for better space efficiency
  - Provides more integrated UI with better visual hierarchy
  - Creates a cleaner, more organized interface with navigation at the top

## [0.3.1] - 2025-11-17

### Changed
- Renamed "Table of Contents" feature to "Headings" for better clarity
  - Updated all user-facing text from "Table of Contents" to "Headings"
  - Updated CSS class names from `toc-*` to `headings-*`
  - Updated function and variable names to reflect the new terminology
  - Provides clearer understanding that this feature displays document headings

## [0.3.0] - 2025-11-17

### Changed
- Headings panel now expands on hover instead of manual toggle
  - Removed toggle button and keyboard shortcut (`t` key)
  - Headings panel is now collapsed by default for cleaner interface
  - Automatically expands when hovering over the Headings area
  - Provides a more intuitive and streamlined user experience
  - Reduces visual clutter while maintaining easy access to navigation

### Improved
- Minimized Headings panel area when collapsed
  - Removed bottom margin and padding from Headings header in collapsed state
  - Border separator only appears when hovering (expanded state)
  - More compact and cleaner UI when not in use
  - Better utilization of preview screen space

## [0.2.8] - 2025-11-17

### Changed
- Reduced Headings panel width for better content area visibility
  - Changed max-width from 300px to 250px (17% reduction)
  - Provides more space for the main preview content
  - Creates a more compact and less intrusive navigation panel
  - Maintains good readability for heading text

## [0.2.7] - 2025-11-17

### Improved
- Headings panel header now displays keyboard shortcut hint on hover
  - Added tooltip to the entire Headings header area showing "Toggle Headings [t]"
  - Provides better discoverability of the keyboard shortcut
  - Removed duplicate tooltip from toggle button to avoid redundancy

## [0.2.6] - 2025-11-17

### Added
- Headings navigation panel in the top-right corner of the preview
  - Automatically extracts h1-h3 headings from the Markdown document
  - Displays headings in a hierarchical list with proper indentation
  - Click on any heading to smoothly scroll to that section
  - Collapsible panel with toggle button (▼/▶) to save screen space
  - Adaptive styling that works with both light and dark themes
  - Custom scrollbar for better visual integration

### Technical
- Integrated `markdown-it-anchor` plugin to automatically generate IDs for headings
- Enhanced heading extraction logic to parse Markdown AST and collect heading information
- Implemented smooth scrolling behavior for better user experience

## [0.2.5] - 2025-11-17

### Fixed
- Scroll position now resets to the top when switching to a different Markdown file
  - Ensures a fresh viewing experience for each document
  - Prevents unexpected scroll positions when navigating between files

## [0.2.4] - 2025-11-09

### Changed
- Improved spacing between markdown sections with adjusted margins for headers and horizontal rules
  - h1 headers now have 32px top margin (0px for first-child)
  - h2 headers now have 28px top margin
  - h3 headers now have 24px top margin
  - h4-h6 headers now have 20px top margin
  - Horizontal rules (hr) now have 28px top and bottom margins

## [0.2.3] - 2025-11-09

### Added
- Automatic README.md preview when no Markdown file is open
  - When the extension activates without a Markdown file in the editor, it automatically displays the workspace's README.md
  - Provides immediate access to project documentation without manual file opening

### Changed
- Preview persistence behavior when switching to non-Markdown files
  - The preview now continues displaying the current Markdown content when switching to non-Markdown files
  - Allows users to keep documentation visible while working on code files
  - Switching back to a Markdown file updates the preview to show that file

### Improved
- Better handling of editor state changes
  - Intelligently decides which Markdown content to display based on current editor state
  - Maintains preview continuity across different editor activities

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
