# vscode-markdown-sidebar-viewer Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-26

## Active Technologies

- TypeScript 4.9.4 / VS Code Extension API 1.74.0+ + VS Code Extension API, markdown-it 13.0.1

## Project Structure

```text
src/
  extension.ts            - 拡張機能のエントリーポイント
  markdownPreviewProvider.ts - Markdownプレビュー機能の実装（デザインシステム含む）
  themeManager.ts         - テーマ管理機能
tests/
.claude/
  tasks/                  - 実装計画と結果レポート
```

## Commands

```bash
npm run compile         # TypeScriptのコンパイル
npm run watch          # 変更監視モードでコンパイル
npm test && npm run lint # テストとLintの実行
```

## Code Style

TypeScript 4.9.4 / VS Code Extension API 1.74.0+: Follow standard conventions

## Design System

v0.5.0で包括的なデザインシステムを導入：

- **CSS変数**: 60+のデザイントークン
- **タイポグラフィスケール**: Major Third比率（1.250）
- **スペーシングシステム**: 8pxグリッドベース
- **カラーパレット**: ライト/ダークテーマ対応
- **影システム**: 5段階（xs〜xl）
- **トランジション**: 標準化された時間とイージング

デザイン変更は`src/markdownPreviewProvider.ts`の`<style>`タグ内で実施。

## Recent Changes

- v0.5.2: コード要素のスペーシング最適化
  - インラインコード（``）のpaddingを削減（4px 8px → 2px 6px）
  - インラインコードに左右margin（2px）を追加
  - コードブロック（```）のpaddingとmarginを削減（16px → 12px）
  - より洗練されたコンパクトなデザインに改善
- v0.5.1: package.jsonメタデータの改善
  - VS Code Marketplaceでの検索性向上のためkeywordsを追加
  - 10個の関連キーワード（markdown, preview, viewer, sidebar, panel, mermaid, outline, documentation, readme, navigator）
- v0.5.0: モダンなデザインシステムの導入
  - タイポグラフィ、スペーシング、カラー、影の体系化
  - コードブロック、引用ブロック、テーブルの視覚的改善
  - リンクとボタンのインタラクション強化
- 001-theme-settings: Added TypeScript 4.9.4 / VS Code Extension API 1.74.0+ + VS Code Extension API, markdown-it 13.0.1

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

