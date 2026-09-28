import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NAV_ITEMS = [
  { href: "/person/", label: "Home" },
  { href: "/person/works/", label: "Works" },
];

type WorkCard = {
  tags: string[];
  title: string;
  desc: string;
};

const WORKS: WorkCard[] = [
  {
    tags: ["React", "TypeScript", "JavaScript"],
    title: "フロントエンド開発",
    desc: "在庫管理システムのWebフロントエンド開発を担当。UI設計から実装まで一貫して対応し、プロジェクトリーダーとして開発を牽引。",
  },
  {
    tags: ["C#", "VB.NET"],
    title: "バックエンド開発",
    desc: "受注管理・在庫管理システムなど基幹システムの機能開発を担当。要件定義〜詳細設計〜プログラミングまで一貫して従事。",
  },
  {
    tags: ["ASP.NET Web Forms", "VB.NET", "Oracle"],
    title: "Webアプリケーション開発",
    desc: "生産管理系Webシステムにて、Excelによるマスタデータのアップロード・ダウンロードや基幹システムへの反映機能の改修を担当。ストアドプロシージャに依存した処理のアプリ側への移行や、ハードコード分岐を設定テーブル駆動へ置き換えるリファクタリングを設計から実施。",
  },
  {
    tags: ["Oracle", "SQL Server", "MySQL"],
    title: "データベース設計・構築",
    desc: "DB設計・改修を担当。保守案件ではアップデート適用前の検証環境構築も経験。百万件規模のテーブルを複数使用する仕組みの処理最適化も経験。",
  },
  {
    tags: ["Amazon AWS"],
    title: "クラウド・インフラ",
    desc: "クラウド環境上で稼働するシステムの保守運用、および大規模アップデート適用前の検証環境構築を担当。",
  },
  {
    tags: ["WindowsForms", "CrystalReport"],
    title: "デスクトップ/クライアントアプリ開発",
    desc: "使用技術の選定も含め担当。",
  },
  {
    tags: ["Git", "GitHub", "SVN"],
    title: "開発プロセス改善・バージョン管理",
    desc: "SVNによるソースコード管理からGitHubへの移行の推進・補助経験。",
  },
  {
    tags: ["Claude Code", "Ollama", "Gemma4"],
    title: "AI活用・生成AI開発",
    desc: "業務においてAI駆動開発の導入を主導し、Claude Codeを活用した開発効率化に取り組む。個人ではOllamaを用いたローカルLLM環境を構築し、Gemma4を中心とした簡易チャットアプリの開発実績あり。",
  },
  {
    tags: ["SE補助", "SE", "PL"],
    title: "プロジェクトリーダー経験",
    desc: "基幹システム刷新プロジェクトにて、SE補助 → SE → PLとステップアップ。プロジェクト後半ではチームをリードし、技術選定・進捗管理を担当。",
  },
];

export default function PersonWorksPage() {
  return (
    <div className="animate-fade-in opacity-0">
      <Header logoLabel="S.Fukui" navItems={NAV_ITEMS} />

      <main>
        <section className="mx-auto max-w-[960px] px-6 pt-18 pb-8">
          <p className="mb-3 text-sm tracking-widest text-accent uppercase">Works</p>
          <h1 className="mb-4 text-2xl font-semibold text-ink">技術スタック別 実績</h1>
          <p className="max-w-[640px] text-muted">これまでの案件で携わった技術と、その中での取り組みを技術スタック別にまとめています。</p>
        </section>

        <section className="mx-auto max-w-[960px] border-t border-line px-6 py-12">
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
                <p className="mx-4 mb-4 text-sm text-muted">{work.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer backHref="/" />
    </div>
  );
}
