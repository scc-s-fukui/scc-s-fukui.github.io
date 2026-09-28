import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NAV_ITEMS = [
  { href: "/person/", label: "Home" },
  { href: "/person/works/", label: "Works" },
];

export default function PersonHomePage() {
  return (
    <div className="animate-fade-in opacity-0">
      <Header logoLabel="S.Fukui" navItems={NAV_ITEMS} />

      <main>
        <section className="mx-auto max-w-content px-6 pt-24 pb-16">
          <p className="mb-3 text-sm tracking-widest text-accent uppercase">Portfolio</p>
          <h1 className="mb-5 text-4xl font-bold text-ink sm:text-5xl">S.Fukui</h1>
          <p className="mb-8 max-w-lead text-muted">
            基幹システム開発を中心に、SE補助からプロジェクトリーダーまで幅広く経験。
            <br />
            直近ではAI駆動開発の導入にも取り組んでいます。
          </p>
          <Link
            href="/person/works/"
            className="inline-block rounded-full bg-accent px-7 py-3 font-bold text-bg no-underline transition-opacity hover:opacity-85"
          >
            Works を見る
          </Link>
        </section>

        <section className="mx-auto max-w-content border-t border-line px-6 py-12">
          <h2 className="mb-4 text-2xl font-semibold text-ink">About</h2>
          <p className="max-w-copy text-muted">
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
