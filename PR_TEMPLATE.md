# [v0.4.3] Add keyboard shortcuts help overlay

## Summary
This PR adds a keyboard shortcuts help overlay that displays when the `s` key is pressed, allowing users to quickly access information about all available keyboard shortcuts in the extension. The overlay can be displayed by pressing and holding the `s` key and hides when the key is released.

## Changes

### Added
- Keyboard shortcut `s` to display the help overlay
- Help overlay component that displays all available keyboard shortcuts organized by categories:
  - Navigation (arrow keys, Enter, Esc)
  - Panels (h, l, f keys)
  - Editing (c, q, e keys)
  - View (zoom, theme, pin)
  - Help (s key)
- CSS styles for help overlay:
  - Fixed position overlay with semi-transparent background
  - Themed help content panel with scroll support
  - Keyboard key styling with monospace font
  - Responsive design with max-width and max-height constraints
- JavaScript state management for help overlay visibility
- `showHelp()` and `hideHelp()` functions for help overlay control
- Keydown event handler for `s` key to show help overlay
- Keyup event handler for `s` key to hide help overlay

### Documentation
- Updated README.md with help overlay feature in the features table
- Updated README-JA.md with help overlay feature in Japanese
- Updated CHANGELOG.md with v0.4.3 release notes
- Version bumped to 0.4.3 in package.json

## Testing
- [x] Compiled successfully
- [x] Manually tested help overlay displays when pressing `s` key
- [x] Manually tested help overlay hides when releasing `s` key
- [x] Verified help overlay displays all keyboard shortcuts correctly
- [x] Verified help overlay respects light/dark theme colors
- [x] Tested Esc key closes help overlay when open

## Version
- Bumped version from 0.4.2 to 0.4.3

