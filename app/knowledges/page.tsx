import type { CSSProperties } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NAV_ITEMS = [{ href: "/knowledges/", label: "一覧" }];

type Article = {
  href: string;
  tags: string[];
  title: string;
  desc: string;
};

const ARTICLES: Article[] = [
  {
    href: "/knowledges/ai-discipline-with-gates/",
    tags: ["Claude Code", "AI駆動開発"],
    title: "AIに規律を守らせる仕組み",
    desc: "指示ではなく、ゲートで担保する ── Claude Code を半年運用して分かったこと。",
  },
  {
    href: "/knowledges/ai-subtraction-aesthetics/",
    tags: ["プロンプト設計", "運用ノウハウ"],
    title: "AIに引き算の美学を持たせる",
    desc: "「もっと短く」と毎回言わないための設計。生まれる量を先に絞る3つの仕組み。",
  },
];

// 貼り紙の紙色と傾き。SSRとクライアントで描画結果がずれないよう乱数ではなく固定テーブルで与える
const PAPERS = ["white", "yellow", "blue", "pink"] as const;
const TILTS = [-1.8, 1.4, -0.9, 2.0]; // deg

export default function KnowledgesIndexPage() {
  return (
    <div className="theme-board animate-fade-in opacity-0">
      <Header logoLabel="Knowledges" navItems={NAV_ITEMS} variant="board" />

      <main>
        <section className="mx-auto max-w-content px-6 pt-14 pb-4">
          <div className="board-frame">
            <div className="cork">
              <div className="poster">
                <span className="tape tape-l" aria-hidden="true" />
                <span className="tape tape-r" aria-hidden="true" />
                <div className="poster-frame">
                  <p className="poster-eyebrow">KNOWLEDGES</p>
                  <h1 className="poster-title">技術共有</h1>
                  <p className="poster-sub">学んだ技術やナレッジを記事としてまとめています。</p>
                </div>
              </div>

              <div className="notes">
                {ARTICLES.map((article, i) => (
                  <Link
                    className="note"
                    data-paper={PAPERS[i % PAPERS.length]}
                    href={article.href}
                    key={article.href}
                    style={{ "--note-tilt": `${TILTS[i % TILTS.length]}deg` } as CSSProperties}
                  >
                    <span className="pin" aria-hidden="true" />
                    <p className="note-meta">
                      No.{String(i + 1).padStart(3, "0")} ／ 投稿者：S.Fukui
                    </p>
                    <p className="note-tags">
                      {article.tags.map((tag) => (
                        <span key={tag}>【{tag}】</span>
                      ))}
                    </p>
                    <h2 className="note-title">{article.title}</h2>
                    <p className="note-desc">{article.desc}</p>
                    <span className="note-more">続きを読む ▶</span>
                  </Link>
                ))}

                <div className="sticky-note" aria-hidden="true">
                  <span className="pin" />
                  気になる貼り紙をクリックすると、記事ページに移動します。
                </div>
              </div>

              <p className="board-footnote">※ 掲示板風の見た目ですが、書き込み機能はありません（見るだけです）。</p>
            </div>
          </div>
        </section>
      </main>

      <Footer backHref="/" variant="board" />
    </div>
  );
}
