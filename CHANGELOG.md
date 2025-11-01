# Changelog

All notable changes to the "Markdown Preview in Extension Area" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
