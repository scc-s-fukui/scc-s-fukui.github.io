import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LakesideDayScene from "@/components/LakesideDayScene";

const NAV_ITEMS = [{ href: "/playground/", label: "一覧" }];

export default function PlaygroundPage() {
  return (
    <div className="page-transition">
      <Header logoLabel="Playground" navItems={NAV_ITEMS} />

      <main>
        <section className="page-head container">
          <p className="hero-eyebrow">Playground</p>
          <h1 className="section-title">技術検証</h1>
          <p className="section-text">技術検証や実験的な取り組みを置いていく予定です。準備中。</p>
          <LakesideDayScene />
          <p className="scene-hint">お城をクリック（タップ）すると……？</p>
        </section>
      </main>

      <Footer backHref="/" />
    </div>
  );
}
