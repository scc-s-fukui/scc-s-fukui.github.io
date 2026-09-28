import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LakesideScene from "@/components/LakesideScene";

export default function PortalPage() {
  return (
    <div className="page-transition">
      <Header logoLabel="S.Fukui" />

      <main>
        <section className="hero container">
          <p className="hero-eyebrow">Portal</p>
          <h1 className="hero-title">S.Fukui</h1>
          <p className="hero-lead">
            実績紹介・技術共有・技術検証をフォルダ単位で公開しています。
            <br />
            それぞれ下記から移動してください。
          </p>
          <LakesideScene />
        </section>

        <section className="section container">
          <div className="portal-grid">
            <Link className="portal-card" href="/person/">
              <h2 className="portal-card-title">Person</h2>
              <p className="portal-card-desc">経歴・実績紹介ページ。</p>
            </Link>
            <Link className="portal-card" href="/knowledges/">
              <h2 className="portal-card-title">Knowledges</h2>
              <p className="portal-card-desc">技術共有ページ。</p>
            </Link>
            <Link className="portal-card" href="/playground/">
              <h2 className="portal-card-title">Playground</h2>
              <p className="portal-card-desc">技術検証・遊びページ。</p>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
