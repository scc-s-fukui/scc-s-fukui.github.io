import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RadarChartTool from "@/components/RadarChartTool";

const NAV_ITEMS = [
  { href: "/playground/", label: "一覧" },
  { href: "/playground/radar-chart/", label: "レーダーチャート" },
];

export default function RadarChartPage() {
  return (
    <div className="animate-fade-in opacity-0">
      <Header logoLabel="Playground" logoHref="/playground/" navItems={NAV_ITEMS} />

      <main>
        <section className="mx-auto max-w-content px-6 pt-18 pb-8">
          <p className="mb-3 text-sm tracking-widest text-accent uppercase">Playground</p>
          <h1 className="mb-4 text-2xl font-semibold text-ink">レーダーチャートメーカー</h1>
          <p className="max-w-copy text-muted">
            項目名と値を入力すると、レーダーチャートがその場で描かれます。外枠の値を変えると、何を100%とみなすかを調整できます。
          </p>
        </section>

        <section className="mx-auto max-w-content border-t border-line px-6 py-12">
          <RadarChartTool />
        </section>
      </main>

      <Footer backHref="/playground/" backLabel="Playground 一覧に戻る" />
    </div>
  );
}
