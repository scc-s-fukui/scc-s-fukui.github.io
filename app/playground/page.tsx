import type { CSSProperties } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LakesideDayScene from "@/components/LakesideDayScene";

const NAV_ITEMS = [{ href: "/playground/", label: "一覧" }];

// まだ遊べないステージ（準備中の実験枠）
const LOCKED_STAGES = ["1-2", "1-3", "1-4"];

const BUTTONS = ["#e5384f", "#ffd23f", "#3a8dff"];

export default function PlaygroundPage() {
  return (
    <div className="theme-arcade animate-fade-in opacity-0">
      <Header logoLabel="Playground" navItems={NAV_ITEMS} variant="arcade" />

      <main>
        <section className="mx-auto max-w-content px-6 pt-10">
          <div className="hud" aria-hidden="true">
            <span>
              <b>PLAYER</b> S.FUKUI
            </span>
            <span>
              <b>STAGE</b> 1-1
            </span>
            <span className="hud-life">
              <b>LIFE</b> ♥♥♥
            </span>
          </div>
        </section>

        <section className="mx-auto max-w-content px-6 pt-10">
          <div className="cab">
            <div className="cab-marquee">
              <h1>
                <span className="cab-marquee-main">PLAYGROUND</span>
                <span className="cab-marquee-sub">技術検証</span>
              </h1>
            </div>
            <div className="cab-body">
              <div className="cab-bezel">
                <div className="cab-screen">
                  <LakesideDayScene />
                  <div className="cab-glass" aria-hidden="true" />
                </div>
              </div>

              <div className="cab-panel" aria-hidden="true">
                <span className="cab-stick">
                  <span className="cab-stick-plate" />
                  <span className="cab-stick-lever" />
                </span>
                <span className="cab-buttons">
                  {BUTTONS.map((color) => (
                    <span className="cab-btn" key={color} style={{ "--btn": color } as CSSProperties} />
                  ))}
                </span>
                <span className="cab-coin">
                  INSERT
                  <br />
                  COIN
                  <i />
                </span>
              </div>
            </div>
          </div>

          <div className="rpg-window mx-auto max-w-copy">
            <span className="rpg-name">S.FUKUI</span>
            <p>技術検証や実験的な取り組みを置いていく予定です。準備中。</p>
            <p>お城をクリック（タップ）すると……？</p>
            <span className="rpg-cursor blink" aria-hidden="true">
              ▼
            </span>
          </div>
        </section>

        <section className="mx-auto max-w-content px-6 pb-4">
          <h2 className="stage-heading">― STAGE SELECT ―</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-6">
            {LOCKED_STAGES.map((stage) => (
              <div className="cartridge" key={stage} aria-label={`STAGE ${stage} 準備中`}>
                <div className="cartridge-label">
                  STAGE {stage}
                  <b>???</b>
                  LOCKED
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer backHref="/" variant="arcade" />
    </div>
  );
}
