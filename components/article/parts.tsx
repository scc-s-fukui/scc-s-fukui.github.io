import type { CSSProperties, ReactNode } from "react";

// 技術共有の記事で使う図解・紙面の部品。見た目は app/retro/article.css（掲示板テーマ）が担当し、ここは構造だけを持つ

export type Tone = "key" | "good" | "warn" | "bad";
type CardTone = "bad" | "good" | "key" | "dim";

const NOTE_LABEL: Record<Tone, string> = { key: "POINT", good: "OK", warn: "CAUTION", bad: "NG" };

/** 1章＝1枚の貼り紙。画鋲と章番号つき */
export function Sheet({ id, no, title, children }: { id: string; no: string; title: string; children: ReactNode }) {
  return (
    <section className="art-sheet" id={id}>
      <span className="pin" aria-hidden="true" />
      <div className="art-sheet-head">
        <span className="art-no">{no}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

/** 付箋。key=要点 / good=良い例 / warn=注意 / bad=失敗 */
export function Note({ tone = "key", title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  return (
    <div className="art-note" data-tone={tone}>
      <span className="art-note-label" aria-hidden="true">
        {NOTE_LABEL[tone]}
      </span>
      {title && <b className="art-note-title">{title}</b>}
      {children}
    </div>
  );
}

/** 図解の箱（インデックスカード） */
export function Card({
  tone,
  tag,
  title,
  children,
  stamp,
}: {
  tone?: CardTone;
  tag?: string;
  title?: ReactNode;
  children?: ReactNode;
  stamp?: string;
}) {
  return (
    <div className="art-card" data-tone={tone}>
      {stamp && <span className="art-stamp">{stamp}</span>}
      {tag && <span className="art-card-tag">{tag}</span>}
      {title && <b className="art-card-title">{title}</b>}
      {children}
    </div>
  );
}

/** カードを並べる。min は1枚の最小幅（狭い画面では自動で折り返す） */
export function Grid({ min, children }: { min?: string; children: ReactNode }) {
  return (
    <div className="art-grid" style={min ? ({ "--min": min } as CSSProperties) : undefined}>
      {children}
    </div>
  );
}

/** 要点カード（番号つき） */
export function Takeaway({ n, title, href, children }: { n: string; title: string; href?: string; children?: ReactNode }) {
  return (
    <div className="art-card" data-tone="key">
      <span className="art-card-num">{n}</span>
      <b className="art-card-title">{title}</b>
      {children && <p>{children}</p>}
      {href && (
        <a className="art-card-link" href={href}>
          → 詳しく
        </a>
      )}
    </div>
  );
}

export type FlowStep = { title: ReactNode; sub?: ReactNode; tone?: CardTone };

/** 矢印でつないだ手順図。dir="col" で縦並び */
export function Flow({ steps, dir = "row" }: { steps: FlowStep[]; dir?: "row" | "col" }) {
  return (
    <ol className="art-flow" data-dir={dir}>
      {steps.flatMap((s, i) => {
        const items = [
          <li className="art-card" data-tone={s.tone} key={`s${i}`}>
            <b className="art-card-title">{s.title}</b>
            {s.sub && <span className="art-flow-sub">{s.sub}</span>}
          </li>,
        ];
        if (i < steps.length - 1) {
          items.push(
            <li className="art-flow-arrow" aria-hidden="true" key={`a${i}`}>
              ▶
            </li>,
          );
        }
        return items;
      })}
    </ol>
  );
}

/** Before / After の対比（左=悪い例、右=良い例） */
export function Versus({
  left,
  right,
}: {
  left: { tag: string; children: ReactNode };
  right: { tag: string; children: ReactNode };
}) {
  return (
    <div className="art-versus">
      <Card tone="bad" tag={left.tag}>
        {left.children}
      </Card>
      <Card tone="good" tag={right.tag}>
        {right.children}
      </Card>
    </div>
  );
}

export type BarRow = { label: string; value: number; max: number; text?: string; tone?: "good" | "key" | "dim" };

/** ゲージ風の横棒グラフ。value/max で長さを決める */
export function Bars({ rows }: { rows: BarRow[] }) {
  return (
    <ul className="art-bars">
      {rows.map((r) => (
        <li className="art-bar" data-tone={r.tone} key={r.label}>
          <span>{r.label}</span>
          <span className="art-bar-track" aria-hidden="true">
            <span className="art-bar-fill" style={{ "--w": `${Math.min(100, (r.value / r.max) * 100)}%` } as CSSProperties} />
          </span>
          <span className="art-bar-value">{r.text ?? r.value}</span>
        </li>
      ))}
    </ul>
  );
}

/** 全体のうちいくつか、をドットで見せる（例：14個中5個） */
export function Dots({ on, total, tone, label }: { on: number; total: number; tone?: "good"; label: string }) {
  return (
    <ul className="art-dots" role="img" aria-label={label}>
      {Array.from({ length: total }, (_, i) => (
        <li data-on={i < on} data-tone={tone} key={i} />
      ))}
    </ul>
  );
}

/** 大きな数字 */
export function Stat({ value, label }: { value: string; label: ReactNode }) {
  return (
    <p className="art-stat">
      <span className="art-stat-value">{value}</span>
      <span className="art-stat-label">{label}</span>
    </p>
  );
}

/** 強調したい一文 */
export function Quote({ children }: { children: ReactNode }) {
  return <div className="art-quote">{children}</div>;
}

/** コード・ログの抜粋 */
export function Code({ children, wrap }: { children: string; wrap?: boolean }) {
  return (
    <pre className="art-code" data-wrap={wrap}>
      <code>{children}</code>
    </pre>
  );
}

export type StepItem = { title: ReactNode; sub?: ReactNode; time?: string };

/** 番号つきの手順カード（時間の目安つき） */
export function Steps({ items }: { items: StepItem[] }) {
  return (
    <ol className="art-steps">
      {items.map((s, i) => (
        <li className="art-card" key={i}>
          <b className="art-card-title">{s.title}</b>
          {s.sub && <span className="art-flow-sub">{s.sub}</span>}
          {s.time && <span className="art-time">{s.time}</span>}
        </li>
      ))}
    </ol>
  );
}

/** 全体に占める割合を1本のバーで見せる（各区間の幅は flex 比） */
export function Segments({ items }: { items: { label: string; flex: number; bg?: string }[] }) {
  return (
    <div className="art-seg" role="img" aria-label={items.map((i) => i.label).join(" / ")}>
      {items.map((it, i) => (
        <span key={i} style={{ "--f": it.flex, "--bg": it.bg } as CSSProperties}>
          {it.label}
        </span>
      ))}
    </div>
  );
}

/** 折りたたみの補足資料 */
export function Fold({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="art-fold">
      <summary>{summary}</summary>
      <div className="art-fold-body">{children}</div>
    </details>
  );
}

/** 表。横にあふれる場合はこの枠の中だけスクロールする */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="art-table-wrap">
      <table>{children}</table>
    </div>
  );
}

export type TreeRow = { q: ReactNode; yes: ReactNode; yesTone?: CardTone; noLabel: string };

/** 質問に YES で答えた先を横に、NO の場合は下の質問へ進む判定図。最後の行の NO は end に至る */
export function Tree({ rows, end }: { rows: TreeRow[]; end: ReactNode }) {
  return (
    <ol className="art-tree">
      {rows.flatMap((r, i) => [
        <li className="art-tree-row" key={`r${i}`}>
          <div className="art-card">{r.q}</div>
          <span className="art-tree-yes" aria-hidden="true">
            YES ▶
          </span>
          <div className="art-card" data-tone={r.yesTone ?? "good"}>
            {r.yes}
          </div>
        </li>,
        <li className="art-tree-no" aria-hidden="true" key={`n${i}`}>
          NO ▼ {r.noLabel}
        </li>,
      ])}
      <li className="art-card" data-tone="bad">
        {end}
      </li>
    </ol>
  );
}
