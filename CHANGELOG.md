# Changelog

All notable changes to the "Markdown Preview in Extension Area" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2026-09-06

### Added
- **URL Context Menu in the Preview**: Right-clicking an external link now offers a choice of browser
  - **Open in Default Browser** opens the URL in the system browser, the same as a left-click
  - **Open in Integrated Browser** opens it in VS Code's built-in Simple Browser
  - The menu header shows the target URL (truncated to 60 characters, full URL in the tooltip)
  - Only `http` / `https` links show the menu; relative links and in-document anchors keep the standard VS Code context menu
  - The menu closes on a click outside it, `Escape`, scrolling with the wheel, or losing window focus

### Technical
- **Browser Helper**: Added `src/browserUtils.ts` with the pure `normalizeUrl()` and `isExternalUrl()` functions
  - VS Code API calls (`env.openExternal`, `simpleBrowser.show`) stay in `MarkdownPreviewProvider`, keeping the helpers unit testable
- Added 14 unit tests for the URL helpers (50 unit tests in total)
- Ported from `vscode-ai-coding-sidebar` v1.1.11, adapting the Terminal view feature to preview links

## [1.1.0] - 2026-06-13

### Added
- Bidirectional scroll synchronization between the source Markdown editor and the preview
  - Scrolling the editor moves the preview to the matching content, and vice versa
  - Uses source-line anchors (`data-source-line`) injected at render time, mapped
    via a pure, unit-tested interpolation module (`src/scrollSync.ts`)
  - New setting `markdownPreviewInExtensionPanel.scrollSync` (boolean, default `true`)
  - Echo-loop guards on both sides keep editor and preview from fighting each other

### Technical
- Added 11 unit tests for the scroll-sync mapping functions

## [1.0.1] - 2026-01-29

### Added
- Test infrastructure with Mocha and @vscode/test-electron
  - Unit test suite with 25 test cases covering utility functions
  - Tests for slugify, clampZoom, validateThemeMode, and decodeHtmlEntities
  - Run tests with `npm test` command
  - Integration test support (environment-dependent)

### Technical
- Added devDependencies: mocha, @types/mocha, @vscode/test-electron
- New test directory structure under `src/test/`
- Test scripts: `npm test`, `npm run test:unit`, `npm run test:integration`

## [1.0.0] - 2026-01-26

### Milestone
- 🎉 **v1.0.0 Stable Release** - First stable version of Markdown Preview in Extension Area

### Summary
This major version release marks the extension as production-ready with a comprehensive feature set, established design system, and proven stability.

**Why v1.0.0:**
- **Feature Completeness**: All core features are implemented and polished
  - Sidebar display with Preview, Outline, Files, History, and Help tabs
  - Rich preview experience with Mermaid diagrams, syntax highlighting, and copy features
  - Comprehensive navigation with pin/unpin, file switching, and keyboard shortcuts
  - Theme management with light/dark modes and zoom controls
- **Design System**: Comprehensive design system introduced in v0.5.0
  - 60+ CSS variables for consistent design tokens
  - Typography scale, spacing system, color palette, and shadow system
- **Stability**: Proven through extensive development from v0.1.x to v0.5.x
  - Performance optimization (70-90% CPU usage reduction)
  - Continuous improvements based on user feedback
- **Backward Compatibility**: No breaking changes from v0.5.x

### Highlights

**Core Features:**
- Extension area display (primary sidebar, secondary sidebar, or panel)
- Rich Markdown preview with Mermaid diagrams and syntax highlighting
- Four-tab sidebar: Outline, Files, History, and Help
- Pin/unpin functionality to freeze or follow active file
- Light/dark theme toggle with auto-sync to VS Code theme
- Zoom controls (50-200%) with keyboard shortcuts
- File navigation with arrow keys and file list
- Code block and Mermaid diagram copy/save features
- Copy selected text and copy as quote features
- File path copy by clicking the path
- Keyboard-driven workflow with comprehensive shortcuts

**Technical:**
- Built on TypeScript 4.9.4 and VS Code Extension API 1.74.0+
- Markdown rendering with markdown-it 13.0.1
- Syntax highlighting with highlight.js
- Modern design system with 60+ CSS variables

### No Breaking Changes
All existing features and settings are preserved. This release is fully backward compatible with v0.5.x.

## [0.5.2] - 2026-01-26

### Improved
- Optimized spacing for code elements and buttons to achieve a more compact and refined design
  - Reduced inline code (`code`) padding from 4px 8px to 2px 6px for a sleeker appearance
  - Added horizontal margin (2px) to inline code for better visual separation from surrounding text
  - Reduced Copy/Save button padding from 8px 12px to 4px 8px for more compact controls
  - Creates a balanced and cohesive spacing system across inline code and interactive elements

## [0.5.1] - 2026-01-17

### Improved
- Enhanced VS Code Marketplace discoverability by adding keywords to package.json
  - Added 10 relevant keywords: markdown, preview, viewer, sidebar, panel, mermaid, outline, documentation, readme, navigator
  - Improves search results for users looking for markdown preview extensions
  - Better categorization for related extension recommendations

## [0.5.0] - 2026-01-16

### Improved
- Modernized the design system with a comprehensive set of design tokens
  - Added 60+ CSS variables for typography, spacing, colors, shadows, and transitions
  - Typography scale based on Major Third ratio (1.250) for better visual hierarchy
  - 8px grid-based spacing system for consistent layout
  - Extended color palette for both light and dark themes
  - 5-tier shadow system (xs to xl) for depth and elevation
  - Standardized border radius and transition values

### Changed
- Enhanced typography for better readability
  - Adjusted heading sizes to be more suitable for sidebar/panel display
  - h1: 1.75rem (28px), h2: 1.5rem (24px), h3: 1.25rem (20px)
  - Improved line heights and letter spacing
  - Added display font family with Japanese font support
  - Enhanced heading borders with better visual weight

- Improved code block styling
  - Added borders and shadows for better visual separation
  - Enhanced inline code with subtle borders
  - Modernized copy button design with smooth hover effects
  - Added elevation animation on hover (translateY)
  - Improved Mermaid toolbar button styling

- Enhanced blockquote design
  - Increased left border thickness to 5px
  - Added rounded corners on the right side
  - Applied italic styling for emphasis
  - Added subtle shadow for depth

- Refined table styling
  - Added rounded corners and shadows
  - Implemented alternating row colors (striped pattern)
  - Enhanced header styling with uppercase text
  - Added smooth hover effects on rows
  - Improved cell spacing and padding

- Improved link interactions
  - Replaced underline with animated bottom border
  - Added smooth transitions for all states
  - Enhanced focus outline for accessibility
  - Increased font weight for better visibility

- Enhanced list styling
  - Improved spacing using design system variables
  - Better line height for readability
  - Refined nested list margins

### Technical
- Refactored CSS to use design system variables throughout
- Improved code maintainability with semantic variable naming
- Ensured backward compatibility with existing features
- All changes successfully compiled without errors

## [0.4.16] - 2025-12-21

### Added
- History tab in the sidebar for viewing and navigating preview history
  - Displays recently previewed Markdown files in chronological order (most recent first)
  - Click on any history item to switch preview to that file
  - Clear button to remove all history entries
  - Maximum 50 history entries stored in memory
  - Press `h` key to open sidebar and show History tab
  - Use Tab key to cycle through Outline, Files, History, and Help tabs
  - Keyboard navigation: ↑/↓ to navigate items, Enter to select, Esc to close
  - Current file highlighted in history list

## [0.4.15] - 2025-12-20

### Changed
- Renamed settings property prefix from `markdownPreview` to `markdownPreviewInExtensionPanel`
  - `markdownPreviewInExtensionPanel.defaultZoomLevel` - Default zoom percentage (50-200)
  - `markdownPreviewInExtensionPanel.themeMode` - Theme mode for the preview (auto, light, dark)
  - `markdownPreviewInExtensionPanel.fileSortOrder` - Sort order for files in the Files tab (name, modified)
  - This change prevents conflicts with other Markdown preview extensions that may use similar settings names

## [0.4.14] - 2025-12-20

### Improved
- Added filename header with separator line to Outline tab in sidebar
  - Displays current filename with file icon at the top of the Outline panel
  - Shows horizontal separator line below the filename for visual consistency with Files tab
  - Provides consistent sidebar design across Outline and Files tabs

## [0.4.13] - 2025-12-20

### Improved
- Added margin between sidebar and preview content for better visual separation
  - 16px left margin added to the sidebar when visible
  - Provides clearer distinction between the main content area and the sidebar

## [0.4.12] - 2025-12-20

### Added
- File sort feature in the Files tab
  - Toggle between name (alphabetical) and modified date (newest first) sort order
  - Sort button displayed in the Files tab header showing current sort mode
  - Press `a` key to toggle sort order from anywhere in the preview
  - Sort icon indicates current mode: 🔤 for name, 🕐 for modified date
  - Sort order is persisted in VS Code settings (`markdownPreviewInExtensionPanel.fileSortOrder`)

## [0.4.11] - 2025-12-20

### Changed
- Renamed "Headings" tab to "Outline" in the sidebar
  - Tab label now displays "Outline" instead of "Headings"
  - Keyboard shortcut changed from `h` to `o` (for "Outline")
  - Help section updated to reflect the new naming
  - Internal code refactored (function names, variable names, DOM IDs)

## [0.4.10] - 2025-12-16

### Fixed
- Mermaid diagram copy feature now correctly handles non-ASCII characters (Japanese, Chinese, etc.)
  - Previously, copying Mermaid diagrams containing non-ASCII characters would result in garbled text
  - Fixed by properly decoding UTF-8 encoded Base64 data using TextDecoder

## [0.4.9] - 2025-12-14

### Fixed
- File path copy now correctly excludes the checkmark icon (✓) that appears after successful copy
  - Previously, copying the file path after a successful copy would include the checkmark in the copied text (e.g., "README.md✓")
  - Now the copy icon content is properly excluded when extracting the file path

## [0.4.8] - 2025-12-13

### Added
- Help tab in the sidebar providing quick reference for all features and keyboard shortcuts
  - Comprehensive list of features with descriptions
  - Complete keyboard shortcuts reference table
  - Accessible via Tab key when sidebar is open to cycle through Headings, Files, and Help tabs
  - Styled with theme-aware colors for better readability

## [0.4.7] - 2025-12-13

### Added
- Sidebar state persistence: sidebar remains visible when switching to different files
- File list tab now auto-selects the current file when opened, making it easier to navigate relative to your position

### Changed
- Keyboard shortcuts reorganization for better usability
  - Press `s` key to toggle sidebar visibility (previously `b`)
  - Press `h` key to open sidebar and show Headings tab (previously toggled dropdown)
  - Press `f` key to open sidebar and show File list tab (previously `l` key toggled dropdown)
  - Press `Tab` key to switch between Headings and Files tabs when sidebar is open
  - Use arrow keys (↑/↓) to navigate sidebar items, Enter to select, Esc to close
  - Left/right arrow keys (←/→) now always navigate between files, even when sidebar is open
  - Click items in the sidebar to navigate to headings or switch files
  - Sidebar toggle button (☰) in the header toolbar

### Removed
- Keyboard shortcuts help overlay (previously `s` key)
- Headings dropdown panel (replaced by sidebar Headings tab)
- File list dropdown panel (replaced by sidebar File list tab)
- Search feature (previously `f` key, now repurposed for File list)
- `l` key shortcut for File list (use `f` key instead)

## [0.4.6] - 2025-12-13

### Added
- Mermaid diagram copy and save features
  - Copy button: Copies Mermaid source code as Markdown code block to clipboard
  - Save button: Saves Mermaid diagram as PNG image (2x resolution for clarity) via VS Code save dialog
  - Buttons appear on hover over Mermaid diagrams
  - Provides visual feedback with button text changes (Copied!/Saving.../Failed)

## [0.4.5] - 2025-12-13

### Added
- Mermaid diagram rendering now documented as an official feature in the Features table
  - Flowcharts (TD, LR, etc.) with automatic rendering
  - Sequence diagrams for documenting interactions
  - Class diagrams for object-oriented design visualization
  - Theme-aware rendering that respects light/dark mode settings
  - Uses jsDelivr CDN for Mermaid library (requires internet connection)

## [0.4.4] - 2025-12-09

### Improved
- Mermaid diagram test file updated with additional flowchart examples
  - Added Left-Right (LR) direction flowchart example
  - Demonstrates support for Japanese text in diagram nodes

## [0.4.3] - 2025-12-07

### Added
- Keyboard shortcuts help overlay
  - Press `s` key to display the help overlay showing all available keyboard shortcuts
  - Hold the `s` key to keep the help overlay visible
  - Release the `s` key or press `Esc` to close the help overlay
  - Help overlay displays shortcuts organized by categories: Navigation, Panels, Editing, View, and Help
  - Styled overlay with theme-aware colors matching the preview theme

### Changed
- Arrow key navigation improved for better user experience
  - Left/Right arrow keys (`←`/`→`) now directly navigate to previous/next Markdown file instead of showing file list panel
  - When panel is open (Headings or File list), arrow keys still navigate items within that panel
  - When no panel is open, arrow keys trigger file navigation

## [0.4.2] - 2025-12-06

### Added
- Copy as Quote feature for selected text
  - Press `q` key to copy selected text with `> ` prefix on each line
  - Useful for quoting content in issues, pull requests, or other Markdown documents
  - Shows VS Code notification message on successful copy
  - Shows message when no text is selected

## [0.4.1] - 2025-11-30

### Added
- File list panel for quick navigation between markdown files in the same directory
  - Displays all markdown files in the current directory
  - Shows current file highlighted in the list
  - Click on a file name to switch preview to that file
  - Located in the file path header next to the Headings panel
  - Press `l` key to toggle file list panel visibility
  - Hover over "File list" title to expand the dropdown
  - Panel only appears when there are 2 or more markdown files in the directory
  - Tooltip shows "Toggle file list panel [l]" on hover
- Keyboard navigation for Headings and File list panels
  - Use any arrow key (↑/↓/←/→) to navigate items when panel is open
  - Press Enter to select the highlighted item
  - Press Esc to close the panel
  - Selected item is highlighted with accent color
- File list panel automatically appears when using ←/→ navigation keys
  - Shows the target file highlighted without immediate navigation
  - Press Enter to confirm and navigate to the selected file
  - Provides visual preview of file selection before actual navigation

### Changed
- Header layout reorganized with Headings and File list panels grouped together
  - Both panels now appear in the same header section for better visual consistency
  - Order: Headings, File list (left to right)
- Increased z-index for Headings and File list dropdown panels to ensure they appear on top of other content

## [0.4.0] - 2025-11-29

### Added
- File list panel showing all Markdown files in current directory
  - Press `l` key to toggle file list panel visibility
  - Hover over "Files" in header to expand the panel
  - Current file is highlighted in the list
  - Click any file to switch to it
  - Displays file count indicator (e.g., "3 / 10 files")
- File list auto-display when navigating with arrow keys
  - Panel appears temporarily for 3 seconds when using left/right arrow navigation
  - Provides visual feedback of current position within directory
  - Auto-hides after timeout unless manually toggled

### Changed
- Navigate Previous/Next now shows file list panel temporarily
- Updated README with file list feature documentation

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

<!-- Version links -->
[1.1.2]: https://github.com/NaokiIshimura/vscode-markdown-previewer-in-extension-panel/compare/v1.1.0...v1.1.2
[1.0.1]: https://github.com/NaokiIshimura/vscode-markdown-previewer-in-extension-panel/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/NaokiIshimura/vscode-markdown-previewer-in-extension-panel/compare/v0.5.2...v1.0.0
[0.5.2]: https://github.com/NaokiIshimura/vscode-markdown-previewer-in-extension-panel/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/NaokiIshimura/vscode-markdown-previewer-in-extension-panel/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/NaokiIshimura/vscode-markdown-previewer-in-extension-panel/compare/v0.4.17...v0.5.0
[0.4.17]: https://github.com/NaokiIshimura/vscode-markdown-previewer-in-extension-panel/compare/v0.4.16...v0.4.17
[0.4.16]: https://github.com/NaokiIshimura/vscode-markdown-previewer-in-extension-panel/compare/v0.4.15...v0.4.16

