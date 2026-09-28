import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LakesideDayScene from "@/components/LakesideDayScene";

const NAV_ITEMS = [{ href: "/playground/", label: "一覧" }];

export default function PlaygroundPage() {
  return (
    <div className="animate-fade-in opacity-0">
      <Header logoLabel="Playground" navItems={NAV_ITEMS} />

      <main>
        <section className="mx-auto max-w-content px-6 pt-18 pb-8">
          <p className="mb-3 text-sm tracking-widest text-accent uppercase">Playground</p>
          <h1 className="mb-4 text-2xl font-semibold text-ink">技術検証</h1>
          <p className="max-w-copy text-muted">技術検証や実験的な取り組みを置いていく予定です。準備中。</p>
          <LakesideDayScene />
          <p className="mt-3 text-sm text-muted">お城をクリック（タップ）すると……？</p>
        </section>
      </main>

      <Footer backHref="/" />
    </div>
  );
}
