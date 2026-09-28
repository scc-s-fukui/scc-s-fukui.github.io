import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LakesideScene from "@/components/LakesideScene";

export default function PortalPage() {
  return (
    <div className="animate-fade-in opacity-0">
      <Header logoLabel="S.Fukui" />

      <main>
        <section className="mx-auto max-w-content px-6 pt-24 pb-16">
          <p className="mb-3 text-sm tracking-widest text-accent uppercase">
            Portal
          </p>
          <h1 className="mb-5 text-4xl font-bold text-ink sm:text-5xl">
            S.Fukui
          </h1>
          <p className="mb-8 max-w-lead text-muted">
            実績紹介・技術共有・技術検証をフォルダ単位で公開しています。
            <br />
            それぞれ下記から移動してください。
          </p>
        </section>

        <section className="mx-auto max-w-content border-t border-line px-6 py-12">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
            <Link
              className="block rounded-xl border border-line bg-surface p-7 no-underline transition-all hover:-translate-y-1 hover:border-accent"
              href="/person/"
            >
              <h2 className="mb-2 text-lg font-medium text-ink">Person</h2>
              <p className="text-sm text-muted">経歴・実績紹介ページ。</p>
            </Link>
            <Link
              className="block rounded-xl border border-line bg-surface p-7 no-underline transition-all hover:-translate-y-1 hover:border-accent"
              href="/knowledges/"
            >
              <h2 className="mb-2 text-lg font-medium text-ink">Knowledges</h2>
              <p className="text-sm text-muted">技術共有ページ。</p>
            </Link>
            <Link
              className="block rounded-xl border border-line bg-surface p-7 no-underline transition-all hover:-translate-y-1 hover:border-accent"
              href="/playground/"
            >
              <h2 className="mb-2 text-lg font-medium text-ink">Playground</h2>
              <p className="text-sm text-muted">技術検証・遊びページ。</p>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-content px-6 pb-16">
          <LakesideScene />
        </section>
      </main>

      <Footer />
    </div>
  );
}
