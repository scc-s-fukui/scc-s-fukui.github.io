# Portfolio Site (Base)

ポートフォリオとかで使う、、、のかな。

## 公開URL

https://scc-s-fukui.github.io/

## 構成

Next.js（App Router）+ TypeScript製。`next build`（`output: "export"`）で静的HTMLに書き出し、GitHub Actions（`.github/workflows/deploy.yml`）でGitHub Pagesに自動デプロイする。

- `app/` — ページ（ルーティングはフォルダ構成がそのままURLになる）
  - `page.tsx` — ポータル（トップページ）
  - `person/` — 実績紹介ページ（`page.tsx` = Home/About, `works/page.tsx` = Works）
  - `knowledges/` — 技術共有ページ（一覧 + 記事ページ）
  - `playground/` — 技術検証・遊びページ
- `components/` — 共通コンポーネント（Header, Footer, Canvas演出）
- `docs/adr/` — 設計判断の記録（リポジトリ管理外・ローカル専用）

## 開発

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # 静的書き出し（out/）
```

新しいページを追加する場合は `app/` 配下にフォルダ＋`page.tsx` を追加する。
