# [v0.3.6] Add keyboard shortcuts for reset zoom and theme toggle

## Summary
This PR adds keyboard shortcuts for reset zoom and theme toggle functionality, improving user experience with quick access to these features.

## Changes

### Added
- Keyboard shortcut `r` to reset zoom level to default
- Keyboard shortcut `t` to toggle between light and dark themes
- `toggleTheme()` method to switch between light and dark themes
- Message handlers for `resetZoom` and `toggleTheme` commands in webview

### Changed
- Updated toolbar tooltips to display keyboard shortcuts:
  - "Use Light Theme [t]" / "Use Dark Theme [t]"
  - "Reset Zoom [r]"
- Replaced refresh command with reset zoom on `r` key
- Updated keyboard event handler in webview to support new shortcuts

### Documentation
- Updated README.md with new keyboard shortcuts
- Updated README-JA.md with new keyboard shortcuts (Japanese)
- Updated CHANGELOG.md with v0.3.6 release notes
- Removed "Refresh" feature from documentation

## Testing
- [x] Compiled successfully
- [ ] Manually tested reset zoom with `r` key
- [ ] Manually tested theme toggle with `t` key
- [ ] Verified toolbar tooltips display correct shortcuts

## Version
- Bumped version from 0.3.5 to 0.3.6
