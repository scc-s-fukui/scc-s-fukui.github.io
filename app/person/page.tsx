import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PixelIcon from "@/components/PixelIcon";
import { HERO } from "@/components/pixelArt";

const NAV_ITEMS = [
  { href: "/person/", label: "Home" },
  { href: "/person/works/", label: "Works" },
];

const CERTIFICATES = ["基本情報技術者", "日商簿記検定2級"];

export default function PersonHomePage() {
  return (
    <div className="theme-museum animate-fade-in opacity-0">
      <Header logoLabel="S.Fukui" navItems={NAV_ITEMS} variant="museum" />

      <main>
        <section className="mx-auto max-w-content px-6 pt-16 pb-10">
          <div className="wall-panel">
            <p className="panel-no">EXHIBIT No.01 ／ PORTFOLIO</p>
            <h1 className="panel-title">S.Fukui</h1>
            <p className="panel-lead">
              基幹システム開発を中心に、SE補助からプロジェクトリーダーまで幅広く経験。
              <br />
              直近ではAI駆動開発の導入にも取り組んでいます。
            </p>
            <Link href="/person/works/" className="route-sign">
              <span className="route-sign-tag">順路</span>
              Works を見る ▶
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-content px-6 py-10">
          <h2 className="museum-heading">― About ―</h2>
          <div className="grid items-start gap-8 md:grid-cols-[16rem_1fr]">
            <div>
              <div className="exhibit-case statue-case">
                <div className="exhibit-spot" aria-hidden="true" />
                <div className="exhibit-pedestal" aria-hidden="true" />
                <div className="exhibit-item">
                  <PixelIcon rows={HERO.rows} palette={HERO.palette} size={9} />
                </div>
              </div>
              <div className="plaque exhibit-plaque">
                <span className="plaque-no">No.001</span>
                <span className="plaque-title">S.Fukui</span>
                <span className="plaque-text">エンジニア（2023年〜）</span>
              </div>
            </div>

            <div className="about-caption">
              <p>
                2023年にエンジニアとしてキャリアを開始し、約3年間、基幹システム刷新プロジェクトを中心に要件定義から設計・開発・テスト・保守まで一貫して経験。
              </p>
              <p>
                直近ではプロジェクトリーダーとしてWebフロントエンド開発を主導する傍ら、AI駆動開発の導入やソースコード管理のSVNからGitHubへの移行推進など、開発プロセス改善にも取り組んでいます。
              </p>
              <div className="cert-row">
                <span className="cert-label">保有資格:</span>
                {CERTIFICATES.map((name) => (
                  <span className="cert-badge" key={name}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer backHref="/" variant="museum" />
    </div>
  );
}
