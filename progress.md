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
- [x] `scc-s-fukui` アカウントでのGitHubリポジトリ作成・push（https://github.com/scc-s-fukui/scc-s-fukui.github.io）
- [x] 動作確認（公開URL https://scc-s-fukui.github.io/ でHome/Works表示・フェード画面遷移を確認、ビルドステータスbuilt）
- [x] リポジトリを一時的に非公開（private）に変更（作業中のため。無料アカウントのユーザーサイトは非公開中Pagesがオフラインになる旨をユーザーに説明済み）
- [x] 職務経歴書（`C:\Users\福井宗一郎\Desktop\職務経歴書_外部版\`で匿名化・技術スタック別に整理）の内容をworks.html（実績カード8件）・index.html（About/自己PR）へ反映しcommit・push（8505d96）
- [x] 完了報告

## 保留・未対応事項
- `Your Name` プレースホルダー（logo・hero-title・footer）は未更新。実名表示にするかハンドルネームにするか要確認
- リポジトリは現在非公開（private）。内容確認後、公開（public）に戻すタイミングはユーザー判断待ち（publicに戻さないとGitHub Pagesは配信されない）
