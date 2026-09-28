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

export default function KnowledgesIndexPage() {
  return (
    <div className="page-transition">
      <Header logoLabel="Knowledges" navItems={NAV_ITEMS} />

      <main>
        <section className="page-head container">
          <p className="hero-eyebrow">Knowledges</p>
          <h1 className="section-title">技術共有</h1>
          <p className="section-text">学んだ技術やナレッジを記事としてまとめています。</p>
        </section>

        <section className="section container">
          <div className="work-grid">
            {ARTICLES.map((article) => (
              <Link className="work-card" href={article.href} key={article.href}>
                <div className="work-tags">
                  {article.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="work-title">{article.title}</h3>
                <p className="work-desc">{article.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer backHref="/" />
    </div>
  );
}
