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
    <div className="animate-fade-in opacity-0">
      <Header logoLabel="Knowledges" navItems={NAV_ITEMS} />

      <main>
        <section className="mx-auto max-w-[960px] px-6 pt-18 pb-8">
          <p className="mb-3 text-sm tracking-widest text-accent uppercase">Knowledges</p>
          <h1 className="mb-4 text-2xl font-semibold text-ink">技術共有</h1>
          <p className="max-w-[640px] text-muted">学んだ技術やナレッジを記事としてまとめています。</p>
        </section>

        <section className="mx-auto max-w-[960px] border-t border-line px-6 py-12">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
            {ARTICLES.map((article) => (
              <Link
                className="block overflow-hidden rounded-xl border border-line bg-surface no-underline transition-all hover:-translate-y-1 hover:border-accent"
                href={article.href}
                key={article.href}
              >
                <div className="flex flex-wrap gap-2 px-4 pt-5">
                  {article.tags.map((tag) => (
                    <span
                      className="rounded-full border border-accent/35 bg-accent/12 px-3 py-1 text-xs text-accent"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mx-4 mt-4 mb-2 text-base font-medium text-ink">{article.title}</h3>
                <p className="mx-4 mb-4 text-sm text-muted">{article.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer backHref="/" />
    </div>
  );
}
