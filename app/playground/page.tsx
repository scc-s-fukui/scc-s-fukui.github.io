import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LakesideDayScene from "@/components/LakesideDayScene";

const NAV_ITEMS = [{ href: "/playground/", label: "一覧" }];

const EXPERIMENTS = [
  {
    href: "/playground/radar-chart/",
    title: "レーダーチャートメーカー",
    desc: "項目名と値を入力してレーダーチャートを作成。目盛り・配色の調整やPNG/SVG保存に対応。",
  },
];

export default function PlaygroundPage() {
  return (
    <div className="animate-fade-in opacity-0">
      <Header logoLabel="Playground" navItems={NAV_ITEMS} />

      <main>
        <section className="mx-auto max-w-content px-6 pt-18 pb-8">
          <p className="mb-3 text-sm tracking-widest text-accent uppercase">Playground</p>
          <h1 className="mb-4 text-2xl font-semibold text-ink">技術検証</h1>
          <p className="max-w-copy text-muted">技術検証や実験的な取り組みを置いていく予定です。</p>
          <LakesideDayScene />
          <p className="mt-3 text-sm text-muted">お城をクリック（タップ）すると……？</p>
        </section>

        <section className="mx-auto max-w-content border-t border-line px-6 py-12">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
            {EXPERIMENTS.map((item) => (
              <Link
                className="block overflow-hidden rounded-xl border border-line bg-surface no-underline transition-all hover:-translate-y-1 hover:border-accent"
                href={item.href}
                key={item.href}
              >
                <h3 className="mx-4 mt-5 mb-2 text-base font-medium text-ink">{item.title}</h3>
                <p className="mx-4 mb-5 text-sm text-muted">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer backHref="/" />
    </div>
  );
}
