# まねき公園研究所

まねき公園研究所の公式ウェブサイトです。静的ファイルだけで構成しているため、GitHub Pages にそのまま公開できます。

## ファイル構成

- `index.html`: ページ本体
- `styles.css`: デザイン
- `script.js`: スライダー、メニュー、動画モーダル
- `assets/`: 画像、favicon、OGP 画像、動画
- `.nojekyll`: GitHub Pages で Jekyll 処理を無効化

## ローカル確認

```bash
python -m http.server 8081
```

ブラウザで `http://127.0.0.1:8081/` を開きます。

## GitHub Pages 公開手順

1. GitHub で新しいリポジトリを作成します。
2. このフォルダの内容をリポジトリへ push します。
3. GitHub の `Settings` > `Pages` を開きます。
4. `Build and deployment` の `Source` を `Deploy from a branch` にします。
5. `Branch` を `main`、フォルダを `/ (root)` にして保存します。

公開 URL は通常 `https://<ユーザー名>.github.io/<リポジトリ名>/` になります。
