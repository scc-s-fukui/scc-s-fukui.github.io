import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NAV_ITEMS = [
  { href: "/person/", label: "Home" },
  { href: "/person/works/", label: "Works" },
];

export default function PersonHomePage() {
  return (
    <div className="page-transition">
      <Header logoLabel="S.Fukui" navItems={NAV_ITEMS} />

      <main>
        <section className="hero container">
          <p className="hero-eyebrow">Portfolio</p>
          <h1 className="hero-title">S.Fukui</h1>
          <p className="hero-lead">
            基幹システム開発を中心に、SE補助からプロジェクトリーダーまで幅広く経験。
            <br />
            直近ではAI駆動開発の導入にも取り組んでいます。
          </p>
          <Link href="/person/works/" className="button">
            Works を見る
          </Link>
        </section>

        <section className="section container">
          <h2 className="section-title">About</h2>
          <p className="section-text">
            2023年にエンジニアとしてキャリアを開始し、約3年間、基幹システム刷新プロジェクトを中心に要件定義から設計・開発・テスト・保守まで一貫して経験。
            <br />
            直近ではプロジェクトリーダーとしてWebフロントエンド開発を主導する傍ら、AI駆動開発の導入やソースコード管理のSVNからGitHubへの移行推進など、開発プロセス改善にも取り組んでいます。
            <br />
            保有資格: 基本情報技術者 / 日商簿記検定2級
          </p>
        </section>
      </main>

      <Footer backHref="/" />
    </div>
  );
}
