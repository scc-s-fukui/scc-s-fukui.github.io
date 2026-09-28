import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WORKS from "@/content/works.json";

const NAV_ITEMS = [
  { href: "/person/", label: "Home" },
  { href: "/person/works/", label: "Works" },
];

export default function PersonWorksPage() {
  return (
    <div className="animate-fade-in opacity-0">
      <Header logoLabel="S.Fukui" navItems={NAV_ITEMS} />

      <main>
        <section className="mx-auto max-w-content px-6 pt-18 pb-8">
          <p className="mb-3 text-sm tracking-widest text-accent uppercase">Works</p>
          <h1 className="mb-4 text-2xl font-semibold text-ink">技術スタック別 実績</h1>
          <p className="max-w-copy text-muted">これまでの案件で携わった技術と、その中での取り組みを技術スタック別にまとめています。</p>
        </section>

        <section className="mx-auto max-w-content border-t border-line px-6 py-12">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
            {WORKS.map((work) => (
              <article
                className="overflow-hidden rounded-xl border border-line bg-surface transition-all hover:-translate-y-1 hover:border-accent"
                key={work.title}
              >
                <div className="flex flex-wrap gap-2 px-4 pt-5">
                  {work.tags.map((tag) => (
                    <span
                      className="rounded-full border border-accent/35 bg-accent/12 px-3 py-1 text-xs text-accent"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mx-4 mt-4 mb-2 text-base font-medium text-ink">{work.title}</h3>
                <p className="mx-4 mb-4 text-sm whitespace-pre-line text-muted">{work.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer backHref="/" />
    </div>
  );
}
