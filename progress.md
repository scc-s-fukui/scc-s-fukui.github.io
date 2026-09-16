# progress.md — ポートフォリオサイト（GitHub Pages）ベース作成

## 決定事項
- リポジトリ名: `scc-s-fukui.github.io`（ユーザーサイト。main直下で自動公開されるため追加のPages設定が不要）
- 公開範囲: public（GitHub Pagesのユーザーサイトはpublicリポジトリが必須）
- 技術構成: ビルド不要のプレーンHTML/CSS/JS（GitHub Pagesがそのまま配信できるため）
- 画面構成: `index.html`（Home）と `works.html`（Works）の2画面。共通ヘッダーのナビゲーションで相互遷移し、フェードイン/アウトの画面遷移演出を付与

## 経緯（アカウント訂正）
- 初回は誤って `scc-soichiro-fukui-01` アカウントでリポジトリ作成・公開してしまい、ユーザーが該当リポジトリを自力で削除
- 正しいアカウント `scc-s-fukui` でgh CLIにログインし直し、ローカルフォルダ名・ファイル内の参照URL・ADRの記載を `scc-s-fukui.github.io` に更新して作り直し

## 完了項目
- [x] プロジェクトフォルダ作成
- [x] progress.md 作成
- [x] サイトファイル一式作成（index.html / works.html / css / js / README）
- [x] ADR記録（docs/adr/0001-user-site-repo-naming.md）
- [x] git init・コミット（5541427）
- [x] 誤アカウント（scc-soichiro-fukui-01）でのリポジトリ作成・push・動作確認
- [x] ユーザーが誤アカウントのリポジトリを削除
- [x] 正しいアカウント（scc-s-fukui）へのgh CLIログイン確認
- [x] ローカルフォルダ名・ファイル内参照を `scc-s-fukui.github.io` に更新
- [ ] `scc-s-fukui` アカウントでのGitHubリポジトリ作成・push
- [ ] 動作確認（公開URLでHome/Works表示・画面遷移）
- [ ] 完了報告

## 保留・未対応事項
- index.html / works.html 内の氏名・自己紹介・実績内容はダミーテキストのため、公開前に実内容へ差し替えが必要
