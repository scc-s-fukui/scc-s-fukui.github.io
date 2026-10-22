import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LakesideScene from "@/components/LakesideScene";
import PixelIcon from "@/components/PixelIcon";
import { BOOK, HERO, PAD } from "@/components/pixelArt";

// 展示室（各フォルダ）。ガラスケースの中に、そのフォルダを象徴するドット絵を飾る
const ROOMS = [
  { href: "/person/", no: "ROOM 01", title: "Person", desc: "経歴・実績紹介ページ。", art: HERO, size: 8 },
  { href: "/knowledges/", no: "ROOM 02", title: "Knowledges", desc: "技術共有ページ。", art: BOOK, size: 8 },
  { href: "/playground/", no: "ROOM 03", title: "Playground", desc: "技術検証・遊びページ。", art: PAD, size: 8 },
];

export default function PortalPage() {
  return (
    <div className="theme-museum animate-fade-in opacity-0">
      <Header logoLabel="S.Fukui" variant="museum" />

      <main>
        <section className="museum-hero mx-auto max-w-content px-6">
          <p className="museum-eyebrow">WELCOME TO THE EXHIBITION</p>
          <h1 className="museum-title">S.Fukui</h1>
          <div className="museum-rule" aria-hidden="true">
            ◆
          </div>
          <p className="museum-lead">
            実績紹介・技術共有・技術検証をフォルダ単位で公開しています。
            <br />
            それぞれ下記から移動してください。
          </p>
        </section>

        <section className="mx-auto max-w-content px-6 py-12">
          <h2 className="museum-heading">― 展示室のご案内 ―</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-8">
            {ROOMS.map((room) => (
              <Link className="exhibit" href={room.href} key={room.href}>
                <div className="exhibit-case">
                  <div className="exhibit-spot" aria-hidden="true" />
                  <div className="exhibit-pedestal" aria-hidden="true" />
                  <div className="exhibit-item">
                    <PixelIcon rows={room.art.rows} palette={room.art.palette} size={room.size} />
                  </div>
                </div>
                <div className="plaque exhibit-plaque">
                  <span className="plaque-no">{room.no}</span>
                  <span className="plaque-title">{room.title}</span>
                  <span className="plaque-text">{room.desc}</span>
                  <span className="plaque-go">入室する ▶</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-content px-6 pt-8 pb-12">
          <div className="gallery-frame">
            <span className="picture-light" aria-hidden="true" />
            <div className="gallery-mat">
              <span className="demo-badge blink" aria-hidden="true">
                DEMO PLAY
              </span>
              <LakesideScene />
            </div>
          </div>
          <div className="plaque gallery-plaque">
            <span className="plaque-no">No.000</span>
            <span className="plaque-title">湖畔の夜</span>
            <span className="plaque-text">ドット絵デモ（Canvas 2D・自動再生）</span>
          </div>
          <p className="credit-plate">このサイトはClaude Codeを使用して作成しました。</p>
        </section>
      </main>

      <Footer variant="museum" />
    </div>
  );
}
