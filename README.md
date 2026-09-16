# Portfolio Site (Base)

GitHub Pages で公開するポートフォリオサイトのベーステンプレートです。

## 公開URL

https://scc-s-fukui.github.io/

## 構成

- `index.html` — Home画面
- `works.html` — Works（制作実績）画面
- `css/style.css` — 共通スタイル
- `js/main.js` — ナビゲーション開閉・画面遷移（フェード）演出

## ローカルでの確認方法

`index.html` をブラウザで直接開くか、任意のローカルサーバーで配信してください。

```bash
npx serve .
```

## カスタマイズ方法

- `index.html` / `works.html` 内のテキスト（氏名・自己紹介・実績内容）を実際の内容に置き換えてください。
- `css/style.css` の `:root` 内カラー変数を編集するとテーマカラーを変更できます。
- Works画面のカードは `works.html` 内の `.work-card` をコピーして追加できます。
