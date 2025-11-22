# [v0.3.6] Add keyboard shortcuts for reset zoom and theme toggle

## Summary
This PR adds keyboard shortcuts for reset zoom and theme toggle functionality, improving user experience with quick access to these features. Both shortcuts now display notification messages for better user feedback.

## Changes

### Added
- Keyboard shortcut `r` to reset zoom level to 100%
- Keyboard shortcut `t` to toggle between light and dark themes
- `toggleTheme()` method to switch between light and dark themes
- Message handlers for `resetZoom` and `toggleTheme` commands in webview
- Notification messages:
  - "Zoom: 100%" when pressing `r`
  - "Theme: Light" or "Theme: Dark" when pressing `t`

### Changed
- Updated toolbar tooltips to display keyboard shortcuts:
  - "Use Light Theme [t]" / "Use Dark Theme [t]"
  - "Reset Zoom [r]"
- Replaced refresh command with reset zoom on `r` key
- Updated keyboard event handler in webview to support new shortcuts
- Reset zoom now always resets to 100% instead of default zoom level

### Documentation
- Updated README.md with new keyboard shortcuts and accurate descriptions
- Updated README-JA.md with new keyboard shortcuts (Japanese)
- Updated CHANGELOG.md with v0.3.6 release notes
- Removed "Refresh" feature from documentation

## Testing
- [x] Compiled successfully
- [ ] Manually tested reset zoom with `r` key (resets to 100% and shows message)
- [ ] Manually tested theme toggle with `t` key (toggles theme and shows message)
- [ ] Verified toolbar tooltips display correct shortcuts

## Version
- Bumped version from 0.3.5 to 0.3.6
