# Changelog

All notable changes to the "Markdown Preview in Extension Area" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.6] - 2025-11-01

### Fixed
- Pin機能がプレビュー中のファイルを正しく固定するように修正（以前はアクティブエディタのファイルを固定していた）

### Added
- Pin/Unpin実行時に操作成功を示すフィードバックメッセージを表示
  - Pin時: "Pinned preview to [ファイル名]"
  - Unpin時: "Unpinned preview"
- プレビューにフォーカスして「p」キーを押すことでPin/Unpinをトグル実行できるキーボードショートカット
- プレビューにフォーカスして「e」キーを押すことでプレビュー中のファイルをエディタで開くキーボードショートカット
  - 成功時: "Opened [ファイル名] in editor"
- ファイル切り替え時に「Switched preview to [ファイル名]」メッセージを表示

### Improved
- Pin状態でも左右キーでファイルを切り替え可能に変更（切り替え時にPin対象も自動更新）

## [0.1.5] - Previous Release

### Added
- Arrow-key navigation between preview targets

## [Unreleased]

### Changed
- (Future changes will be documented here)
