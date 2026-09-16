# ADR-0001: リポジトリ名をユーザーサイト形式にする

- 背景: GitHub Pagesでポートフォリオを公開するにあたり、プロジェクトリポジトリ（任意名 + Pages設定/gh-pagesブランチ）とユーザーサイト（`<username>.github.io` + main直下）のどちらの形式にするか選択が必要だった。
- 決定: リポジトリ名を `scc-soichiro-fukui-01.github.io` とし、ユーザーサイト形式で作成する。
- 理由: ルートドメイン（`https://scc-soichiro-fukui-01.github.io/`）で公開でき、Pages設定やブランチ切り替えが不要でベースとして運用が簡単なため。後からURLパスを変えるのは公開後の共有先すべてに影響し後戻りコストが大きい。
