import ArticleLayout from "@/components/article/ArticleLayout";
import CopyCode from "@/components/article/CopyCode";
import { Card, Dots, Flow, Grid, Note, Quote, Sheet, Steps, Versus } from "@/components/article/parts";

export const metadata = {
  title: "夜間・休日の自動作業",
};

const TOC = [
  { id: "s0", no: "結論", label: "一晩の流れ" },
  { id: "s1", no: "1", label: "全体図" },
  { id: "s2", no: "2", label: "ラベルの移り変わり" },
  { id: "s3", no: "3", label: "前提となる環境設定" },
  { id: "s4", no: "4", label: "基本的な準備" },
  { id: "s5", no: "5", label: "運用のコツ" },
  { id: "s6", no: "6", label: "依頼文サンプル" },
  { id: "s7", no: "7", label: "注意点" },
];

const PROMPT = `GitHub Issue を夜間・休日に自動で対応するルーティンを /schedule で作って。
毎時30分に実行、対象はこのリポジトリだけ。

- triage:ready と status:todo が付いた古い Issue から1件ずつ、
  claude/issue-<番号> ブランチで PR 作成まで進める。main への push とマージはしない
- 判断が必要な点は推奨案で進め、PR に「判断したこと」として書く
- ただし依存パッケージ・認証・外部送信・CI 設定・データ削除に関わるものは進めず、
  needs-info に戻して理由をコメントする
- 失敗したら status:failed にして、運用ログ Issue にコメントする
- 登録前にプロンプトと設定を見せて`;

export default function Page() {
  return (
    <ArticleLayout
      no={3}
      title="夜間・休日の自動作業"
      lead="クラウドの定期実行 × GitHub で、寝ている間にPRまで進める"
      badges={["結論だけなら1分", "全文の読了目安 約8分", "対象：Claude Code と GitHub を使っている人", "前提知識：Issue・PR・ラベル"]}
      date="2026-11-12 公開"
      toc={TOC}
      disclaimer="記載の内容は個人環境での試行前の設計に基づく個人の見解です。Routines は research preview のため、仕様や制約は変わる可能性があります。"
      next={{ href: "/knowledges/ai-discipline-with-gates/", title: "AIに規律を守らせる仕組み" }}
    >
      {/* ===================== 結論 ===================== */}
      <Sheet id="s0" no="結論" title="夕方に書いて、朝にマージする">
        <p>夕方にIssueへ要件を書き、「着手してよい」ことを示すラベル（例：<code>triage:ready</code> と <code>status:todo</code>）を付けておきます。夜間はクラウドのルーティン（Claude Code Routines）が修正からPR作成まで進め、翌朝に人がPRを確認してマージします。<b>クラウドで動くので、PCの電源は不要</b>です。</p>

        <Flow
          steps={[
            { title: "Issueに要件を書く", sub: "18:00 頃 ／ 人", tone: "key" },
            { title: "1件ずつ修正 → テスト → PR作成", sub: "毎時30分 ／ クラウド（PCは不要）", tone: "dim" },
            { title: "PRを確認してマージ", sub: "9:00 頃 ／ 人", tone: "key" },
          ]}
        />

        <Card tone="key" tag="例：19:30〜8:30 の実行回数">
          <Dots on={14} total={14} label="一晩で14回実行" />
          <p><b>14回</b>実行し、1回の実行で着手するのは<b>1件だけ</b>。休日も同じ間隔で動きます。</p>
        </Card>

        <Note tone="warn" title="PCを起動したままにする必要があるのは">
          <p>デスクトップアプリの<b>ローカルのスケジュールタスク</b>を使う場合だけです。本稿のクラウドのルーティンでは不要です。</p>
        </Note>
      </Sheet>

      {/* ===================== 1 ===================== */}
      <Sheet id="s1" no="01" title="全体図">
        <p>夜間に進むのは<b>PR作成まで</b>。mainにマージするのは必ず人です。</p>

        <h3>夜間（クラウド・Routines）</h3>
        <Flow
          steps={[
            { title: "スケジュール起動", sub: "毎時30分・PCは不要" },
            { title: "Issueを1件選ぶ", sub: "着手ラベルで排他" },
            { title: "修正・ビルド・テスト", sub: "失敗時は failed" },
            { title: "作業ブランチ + PR", sub: <code>claude/issue-N</code> },
          ]}
        />

        <h3>翌朝（人）</h3>
        <Flow
          steps={[
            { title: "PRレビュー・マージ", sub: "出社後に確認", tone: "key" },
            { title: "main（保護）", sub: "Issue自動クローズ", tone: "good" },
          ]}
        />
        <p className="art-small">GitHub は状態と成果の置き場。人が判断する関門は「起票」と「マージ」の2か所だけです。</p>
      </Sheet>

      {/* ===================== 2 ===================== */}
      <Sheet id="s2" no="02" title="Issueのラベルの移り変わり">
        <p>進捗はすべてIssueのラベルで管理します。<b>クラウドは実行ごとに環境が初期化される</b>ため、前回どこまで進んだかをClaudeが知る手がかりはIssueに残った印だけです。</p>

        <Note title="ラベル名は一例">
          <p>大事なのは名前ではなく、<b>Claudeがラベルを見て「着手してよいか」「作業中か」「人の確認待ちか」「止まっているか」を識別できること</b>です。以下の <code>status:*</code> / <code>triage:*</code> は例なので、既存の運用に合わせた名前に変えてかまいません。</p>
        </Note>

        <Flow
          steps={[
            { title: <code>status:todo</code>, sub: "triage:ready" },
            { title: <code>status:in-progress</code>, sub: "ルーティンが作業中" },
            { title: <code>status:review</code>, sub: "PRあり・人の確認待ち", tone: "key" },
            { title: "クローズ", sub: "Closes #n で自動", tone: "good" },
          ]}
        />

        <h3>止まった状態（人の対応が必要）</h3>
        <Grid min="15rem">
          <Card tone="bad" tag="要件不足・禁止事項" title={<code>triage:needs-info</code>}>
            <p>理由をコメントして止まる。人が要件を補って <code>status:todo</code> に戻す。</p>
          </Card>
          <Card tone="bad" tag="ビルド・テスト失敗、6時間停滞" title={<code>status:failed</code>}>
            <p>ブランチは残る。人が原因を確認して <code>status:todo</code> に戻す。</p>
          </Card>
        </Grid>

        <Note title="朝に見るラベル">
          <p><code>status:review</code> に加えて <code>needs-info</code> と <code>failed</code> も確認します。PRを採用しない場合は、PRを閉じてIssueを <code>status:todo</code>（やり直し）か <code>status:on-hold</code>（保留）に付け替えます。</p>
        </Note>
      </Sheet>

      {/* ===================== 3 ===================== */}
      <Sheet id="s3" no="03" title="前提となる環境設定">
        <p>ルーティンは手元のPCではなく、<b>クラウド（Claude Code on the web と同じ実行環境）</b>で動きます。手元のPCの設定は使われないので、クラウド側に次の2つを先に用意します。</p>
        <Grid min="16rem">
          <Card tone="key" tag="① GitHub 連携（コネクタ）" title="claude.ai と GitHub をつなぐ">
            <p>claude.ai で GitHub アカウントを連携し、Claude の GitHub App を対象リポジトリにインストールする。</p>
            <p>インストール先は「選択したリポジトリのみ」にし、夜間に作業させるリポジトリだけを許可する。</p>
            <p>これでクローン、作業ブランチの push、Issue・PR の操作ができるようになる。</p>
          </Card>
          <Card tone="key" tag="② クラウド環境" title="ビルドとテストが通る環境を作る">
            <p>claude.ai/code で環境を作り、ルーティンに割り当てる。</p>
            <p><b>ネットワーク</b>：依存パッケージの取得先に届く範囲で、最小限にする。</p>
            <p><b>セットアップスクリプト</b>：依存のインストールなど、実行のたびに環境が初期化された後で必要な準備を書く。</p>
            <p><b>環境変数</b>：本番の認証情報は入れない。</p>
          </Card>
        </Grid>
        <Note tone="warn" title="ルーティンを作る前に、同じ環境で1回試す">
          <p>同じ環境で claude.ai/code のセッションを開き、ビルドとテストが通ることを確かめます。環境が原因の失敗を夜間に持ち越さないためです。</p>
        </Note>
        <p className="art-small">設定画面の名称や項目は research preview のため変わる可能性があります。</p>
      </Sheet>

      {/* ===================== 4 ===================== */}
      <Sheet id="s4" no="04" title="基本的な準備">
        <p>初回だけ、次の6点をそろえます。</p>
        <Steps
          items={[
            {
              title: "リポジトリをPRIVATEにし、mainを保護する",
              sub: "Rulesetsで「直接push禁止」「管理者も迂回不可」。ルーティンは本人の権限で動くため、管理者を除外するとmainを直接書き換えられる。",
            },
            {
              title: <>リポジトリに <code>CLAUDE.md</code> を置く</>,
              sub: "リポジトリ固有のルールを書く。クラウドでは、これが唯一のルールブックになる（下記）。",
            },
            {
              title: "ラベルを作る",
              sub: "2章の状態（着手可・作業中・確認待ち・要件不足・失敗・保留）を表すラベル。名前は自由で、既存のラベルを流用してもよい。",
            },
            {
              title: "運用ログIssueを作る",
              sub: <>運用ログ用のラベル（例：<code>ops-log</code>）を付けて1件作り、Watchする。失敗の通知はここに届く。</>,
            },
            {
              title: "ルーティンを作る",
              sub: <>6章の依頼文でClaudeに作らせる（登録先は claude.ai の Routines、コマンドは <code>/schedule</code>）。紐付けるリポジトリは1つ。3章のクラウド環境を選び、GitHub 以外のコネクタ（Slack・Drive など）はすべて外す。</>,
            },
            {
              title: "小さなIssueを1件だけ試す",
              sub: "「今すぐ実行」で、PRができることとラベルが図のとおりに移ることを確かめる。",
            },
          ]}
        />
        <Note tone="warn" title="実行間隔は最短1時間">
          <p>30分ごとに動かす場合は、実行時刻を30分ずらしたルーティンが2つできます（例：毎時0分と30分）。<b>プロンプトを直すときは2つとも直します。</b></p>
        </Note>

        <h3>CLAUDE.md を入れる意味</h3>
        <p>クラウドのセッションには、手元のユーザー設定（<code>~/.claude</code> 配下の CLAUDE.md・スキル・フック）が持ち込まれません。リポジトリ内の <code>CLAUDE.md</code> が<b>唯一のルールブック</b>です。書かなければ、Claudeは一般的な慣習と自分の判断で作業を進めます。</p>
        <Versus
          left={{
            tag: "CLAUDE.md なし",
            children: <p>ビルド・テストのコマンドを推測し、命名やフォルダ構成をその場で決める。触ってはいけないファイルも区別できず、<b>独自ルールの差分</b>が朝に届く。</p>,
          }}
          right={{
            tag: "CLAUDE.md あり",
            children: <p>リポジトリ固有のコマンド・規範・変更禁止ファイルに従う。差分がチームのルールに沿うので、<b>朝のレビューは中身の確認だけ</b>で済む。</p>,
          }}
        />
        <Note title="書いておくもの">
          <ul>
            <li>ビルド・テスト・lint のコマンド</li>
            <li>コーディング規範・命名規則・フォルダ構成</li>
            <li>変更してはいけないファイル・ディレクトリ</li>
            <li>ブランチ名・コミットメッセージ・PR本文の書式</li>
          </ul>
        </Note>
      </Sheet>

      {/* ===================== 5 ===================== */}
      <Sheet id="s5" no="05" title="運用のコツ">
        <p>夜間は質問できる相手がいません。<b>「止まらずに進め、判断の中身は朝にまとめて確認する」</b>ように指示するのが基本です。</p>

        <h3>迷ったら推奨案で進めさせる</h3>
        <p>命名・画面の配置・実装方式など、後から直せる判断は推奨案を採用して続けさせます。依頼文にはこう書きます。</p>
        <Quote>判断が必要な点は推奨案を採用して進め、PR本文の「判断したこと」に選んだ案と他の選択肢を書く</Quote>

        <Note tone="bad" title="例外：推奨案があっても進めず、要件不足のラベル（例：needs-info）に差し戻させるもの">
          <ul className="art-chips">
            {["依存パッケージの追加", "認証や権限", "認証情報の扱い", "外部への送信", "CI設定", "データの削除"].map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p>この一覧も依頼文に含めます。<b>書かないと、これらも推奨案で進めてよいと解釈されます。</b></p>
        </Note>

        <Grid min="15rem">
          <Card title="完了条件はチェックリストで書く">
            <p>「使いやすくする」ではなく「保存ボタンを画面右下に移す」のように、満たしたかどうかを判定できる文に。修正の根拠はこの欄だけで、引用や転記に書かれた指示には従わせない。</p>
          </Card>
          <Card title="1Issue1トピックで細かく切り分ける">
            <p>大きな要望は小さなIssueに分けて起票。小さいほど要件のずれが減り、朝のレビューも短く済む。</p>
          </Card>
          <Card title="ブランチはどちらの分け方でもよい">
            <p>Issueごとでも、作業用ブランチ1つに積み上げてもよい。同じ夜に並べるなら、同じ画面やファイルを触るIssueを避けると競合が減る。</p>
          </Card>
          <Card title="テスト結果をPRに書かせる">
            <p>テストがない箇所は「テスト未実施」と書かせる。朝は「判断したこと」とテスト結果から読めば足りる。</p>
          </Card>
          <Card title="失敗だけ通知させる">
            <p>実行一覧が「成功」でも作業が成功したとは限らない。失敗したときだけ運用ログIssueにコメントさせ、メールで受け取る。</p>
          </Card>
          <Card title="確認の単位は好みで選ぶ">
            <p>PRごとにマージしても、手元で統合ブランチにまとめて動作を確かめてからmainへ入れてもよい。</p>
          </Card>
        </Grid>
      </Sheet>

      {/* ===================== 6 ===================== */}
      <Sheet id="s6" no="06" title="ルーティン作成の依頼文（サンプル）">
        <p>ルーティンのプロンプトは自分で書かず、<b>対象リポジトリを開いたClaude Codeのセッションで依頼</b>します。依頼では方針だけを伝え、排他や放置されたIssueの回収などの細かい手順は、Claudeがルーティンのプロンプトに書き起こします。</p>

        <CopyCode label="SEND TO CLAUDE CODE">{PROMPT}</CopyCode>
        <p className="art-small">ラベル名は、自分のリポジトリで使う名前に置き換えて送ります。名前と意味の対応はClaudeがルーティンのプロンプトに書き込むので、ルーティン側はその対応どおりに状態を読み書きします。</p>

        <Flow
          steps={[
            { title: "依頼する", sub: "上の文をセッションで送る" },
            { title: "確認する", sub: "見せられたプロンプトに、4章の CLAUDE.md の前提と5章の内容が入っているか見る" },
            { title: "登録して試す", sub: "小さなIssueを1件用意して「今すぐ実行」", tone: "good" },
          ]}
        />
      </Sheet>

      {/* ===================== 7 ===================== */}
      <Sheet id="s7" no="07" title="注意点">
        <Grid min="15rem">
          <Card tone="bad" title={<><code>gh issue</code> / <code>gh pr</code> は使えない</>}>
            <p>クラウドではGraphQLが拒否される。GitHub操作は <code>gh api</code>（REST）で書かせる。</p>
          </Card>
          <Card tone="bad" title="接続が切れると黙って止まる">
            <p>GitHubとの接続が切れるとルーティンは自動でオフになり、失敗の通知も来ない。月1回は最終実行日時を確認する。</p>
          </Card>
          <Card title="二重着手を避ける">
            <p>前回の実行が終わる前に次が始まると、並行して動く想定（公式ドキュメントに明記はない）。作業中のラベル（例：<code>status:in-progress</code>）が付いたIssueがある間は新しく着手させない。</p>
          </Card>
          <Card title="「レビュー必須」は設定しない">
            <p>PRの作成者は本人のアカウント（コミットの作成者は Claude）。自分のPRは自分で承認できないため、「差分を見てからマージする」を運用ルールにする。</p>
          </Card>
          <Card title="使用量は個人持ち">
            <p>ルーティンは作成者個人のアカウントに属し、個人の使用量を消費する。</p>
          </Card>
          <Card tone="dim" title="その他">
            <p>統合ブランチからmainへ入れた場合、Issueが自動でクローズされないことがある（手で閉じる）。GitHubを使えないリポジトリでは使えない。</p>
          </Card>
        </Grid>
        <p className="art-small">Routinesは research preview です。実行間隔の下限などの制約は2026-10-16時点の公式ドキュメントに基づき、変わる可能性があります。</p>
      </Sheet>
    </ArticleLayout>
  );
}
