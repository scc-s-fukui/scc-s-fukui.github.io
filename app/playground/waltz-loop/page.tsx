import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WaltzLoop from "@/components/waltz/WaltzLoop";

export const metadata: Metadata = {
  title: "エンドレス・ワルツ | Playground",
};

const NAV_ITEMS = [
  { href: "/playground/", label: "一覧" },
  { href: "/playground/waltz-loop/", label: "エンドレス・ワルツ" },
];

export default function WaltzLoopPage() {
  return (
    <div className="theme-arcade animate-fade-in opacity-0">
      <Header logoLabel="Playground" logoHref="/playground/" navItems={NAV_ITEMS} variant="arcade" />

      <main>
        <section className="mx-auto max-w-content px-6 pt-10">
          <div className="hud" aria-hidden="true">
            <span>
              <b>PLAYER</b> S.FUKUI
            </span>
            <span>
              <b>STAGE</b> 1-2
            </span>
            <span className="hud-life">
              <b>BGM</b> ♪♪♪
            </span>
          </div>
        </section>

        <section className="mx-auto max-w-copy px-6 pt-10">
          <h1 className="stage-heading !mt-0">― ENDLESS WALTZ ―</h1>
          <p className="mb-6 text-center text-sm leading-loose text-[#d6d9ff]">
            クラシックの旋律の断片を変形して、途切れなく流し続けるワルツです。音はこのページの中で合成していて、サーバーやAIは使っていません。
          </p>
          <WaltzLoop />
          <p className="mt-6 text-xs leading-loose text-[#9d9bd0]">
            旋律の断片は、著作権の切れた曲に着想を得た自作の骨格です。原曲との照合はしていません。
          </p>
        </section>
      </main>

      <Footer backHref="/playground/" backLabel="Playground 一覧に戻る" variant="arcade" />
    </div>
  );
}
