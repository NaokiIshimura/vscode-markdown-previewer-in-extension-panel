# Markdown Previewer in Extension Area

VS Code のサイドバー（またはパネル）にフル機能の Markdown プレビューを常駐させ、タブ移動の手間なく執筆を続けられる拡張機能です。

## 機能一覧

| 機能名 | ショートカット | 説明 |
| --- | --- | --- |
| Light Theme<br>Dark Theme | ツールバーのみ | プレビューのライト/ダークテーマを切り替え |
| Zoom In<br>Zoom Out | `+`<br>`-` | プレビューを拡大/縮小表示（現在のズームレベルを表示） |
| Reset Zoom | ツールバーのみ | ズームレベルをデフォルトにリセット |
| Navigate Previous<br>Navigate Next | `←`<br>`→` | 現在のディレクトリ内の前後のMarkdownファイルに移動（固定時も動作） |
| Pin<br>Unpin | `p` | 現在表示中のMarkdownファイルにプレビューを固定、または追従モードに戻る |
| Edit | `e` | プレビュー中のドキュメントをエディタタブで開く |
| Refresh | `r` | プレビューを強制的に再描画 |
| Open Settings | ツールバーのみ | 拡張機能の設定画面を開く |

**注意**: キーボードショートカットはプレビューにフォーカスがある時のみ動作します

## 設定項目

| 設定項目 | デフォルト値 | 説明 |
| --- | --- | --- |
| `markdownPreview.defaultZoomLevel` | `100` | デフォルトのズーム率を設定（50–200） |
| `markdownPreview.themeMode` | `auto` | プレビューのテーマモード（`auto`, `light`, `dark`） |

## 動作条件
- Visual Studio Code 1.74.0 以降
- 現在のワークスペース内にある Markdown ファイル（`.md`）

## 開発
```bash
npm install      # 依存関係のインストール
npm run compile  # ./out への単発ビルド
npm run watch    # 開発中の継続ビルド
```
VS Code の拡張機能開発ホスト（F5）を起動すると、新しいウィンドウで変更を即座に確認できます。

## ヒントと既知の制限
- Mermaid 図は jsDelivr CDN から読み込むため、オフライン環境では描画されません。
- 画像やリンクは VS Code のワークスペースパス解決を利用します。参照先ファイルが到達可能な場所に存在することを確認してください。
- 非 Markdown ファイルをアクティブにしている間は、ビューに案内メッセージを表示します。

## フィードバック
不具合報告や機能リクエストは GitHub Issues からお寄せください。スクリーンショットや再現手順を添えていただけると対応がスムーズになります。
