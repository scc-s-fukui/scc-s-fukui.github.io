# progress.md — ポートフォリオサイト（GitHub Pages）ベース作成

## 決定事項
- リポジトリ名: `scc-soichiro-fukui-01.github.io`（ユーザーサイト。main直下で自動公開されるため追加のPages設定が不要）
- 公開範囲: public（GitHub Pagesのユーザーサイトはpublicリポジトリが必須）
- 技術構成: ビルド不要のプレーンHTML/CSS/JS（GitHub Pagesがそのまま配信できるため）
- 画面構成: `index.html`（Home）と `works.html`（Works）の2画面。共通ヘッダーのナビゲーションで相互遷移し、フェードイン/アウトの画面遷移演出を付与

## 完了項目
- [x] プロジェクトフォルダ作成
- [x] progress.md 作成
- [x] サイトファイル一式作成（index.html / works.html / css / js / README）
- [x] ADR記録（docs/adr/0001-user-site-repo-naming.md）
- [x] git init・コミット（5541427）
- [x] GitHubリポジトリ作成・push（https://github.com/scc-soichiro-fukui-01/scc-soichiro-fukui-01.github.io）
- [x] 動作確認（ローカルでHome/Worksの表示・コンソールエラー無しを確認）
- [x] 完了報告

## 保留・未対応事項
- 初回ビルド(commit 5541427)は「Page build failed」でerrored。2回目のpush(commit 54c7e8c)で再ビルドされbuiltに成功し、公開URLでHome→Worksのフェード遷移も実機確認済み(問題なし)
- index.html / works.html 内の氏名・自己紹介・実績内容はダミーテキストのため、公開前に実内容へ差し替えが必要
