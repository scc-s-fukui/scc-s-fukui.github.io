# ページテンプレート

person / knowledges / playground と同じ要領で、新しいセクションやページを追加するための雛形。
フォルダ名を `_templates`（アンダースコア始まり）にすることで、GitHub Pages のデフォルトの Jekyll ビルドが
このフォルダをビルド対象から自動除外する。公開サイトには出ない、リポジトリ内だけの作業用フォルダ。

## 1. 新しいセクションフォルダを追加する（`_templates/section/`）

person / knowledges / playground のような「独立したテーマのフォルダ」を増やしたいときに使う。

### 手順
1. `_templates/section/` を丸ごとリポジトリ直下にコピーし、フォルダ名を変更する。
   ```bash
   cp -r _templates/section <新フォルダ名>
   ```
2. `<新フォルダ名>/index.html` 内の `__SECTION_TITLE__` `__SECTION_HEADLINE__` `__SECTION_DESCRIPTION__` を置き換える。
3. ルートの [`index.html`](../index.html) の `portal-grid` に、新フォルダへのカードリンクを追加する。
4. ページを追加する場合は `work-grid` 内のコメントアウトされた `work-card` サンプルを使い、`index.html` に一覧カードを増やしていく。
5. css/js はこのフォルダ専用（他フォルダとは独立）。見た目を変えたい場合は `<新フォルダ名>/css/style.css` だけを直接編集してよい（他フォルダに影響しない）。

## 2. 記事ページを追加する（`_templates/article.html`）

knowledges や playground の配下に、読み物としての記事ページを追加したいときに使う。
`knowledges/ai-discipline-with-gates.html` と同じ、ヒーロー・目次・要点カード・callout・テーブル・比較・構造図を一式持つフル機能版。

### 手順
1. `_templates/article.html` を、追加先フォルダに**英語スラッグのファイル名**でコピーする。
   ```bash
   cp _templates/article.html knowledges/my-new-article.html
   ```
   （日本語ファイル名は GitHub Pages 上で URL がパーセントエンコードされて読みにくくなるため避ける）
2. `__XXX__` 形式のプレースホルダをすべて置き換える（エディタの一括置換推奨）。
3. 使わない要素（callout の4種類、テーブル、before/after、構造図など）はブロックごと削除してよい。逆に章や要点カード、テーブル行などが足りなければ該当ブロックをコピーして増やす。
4. 追加先フォルダの `index.html` の `work-grid` に、この記事へのカードリンクを追加する。
5. **公開前チェック**: 個人名・企業名など、公開してよい内容かどうかを確認する。

## 共通の注意点

- ファイルは UTF-8 で保存する。
- 新規ページを追加したら、ローカルHTTPサーバー（例: `python -m http.server 8080`）で実際に開き、ナビゲーション・遷移・レスポンシブ表示を確認してから公開する。
- コミット・プッシュは明示的に依頼されたときのみ行う。
