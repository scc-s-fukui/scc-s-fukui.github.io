import type { CSSProperties } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WORKS from "@/content/works.json";

const NAV_ITEMS = [
  { href: "/person/", label: "Home" },
  { href: "/person/works/", label: "Works" },
];

const BEZELS = ["beige", "gray", "black"] as const;
const PHOSPHORS = ["green", "amber", "cyan"] as const;

// 積み方の無造作さ（傾き・横ずれ）は、SSRとクライアントで描画結果がずれないよう乱数ではなく固定テーブルで与える
const TILTS = [-1.6, 0.8, -0.6, 1.4, -1.0, 1.9, -0.9, 0.5, -1.7]; // deg
const SHIFTS = [0.3, -0.4, 0.5, -0.2, 0.4, -0.5, 0.2, 0.5, -0.3]; // rem

// 付箋を貼る機体（WORKSの並び順で指定）
const NOTE_INDEX = 7;

export default function PersonWorksPage() {
  return (
    <div className="animate-fade-in opacity-0">
      <Header logoLabel="S.Fukui" navItems={NAV_ITEMS} />

      <main>
        <section className="mx-auto max-w-content px-6 pt-18 pb-8">
          <p className="mb-3 text-sm tracking-widest text-accent uppercase">Works</p>
          <h1 className="mb-4 text-2xl font-semibold text-ink">技術スタック別 実績</h1>
          <p className="max-w-copy text-muted">これまでの案件で携わった技術と、その中での取り組みを技術スタック別にまとめています。</p>
        </section>

        <section className="mx-auto max-w-content px-6 pt-4 pb-12">
          <div className="crt-room">
            <svg className="crt-cables" viewBox="0 0 640 80" preserveAspectRatio="none" aria-hidden="true">
              <path d="M120 0 C130 50 60 40 30 80" fill="none" stroke="#050607" strokeWidth="3" />
              <path d="M300 0 C310 60 400 30 430 80" fill="none" stroke="#050607" strokeWidth="3" />
              <path d="M470 0 C460 40 560 50 610 80" fill="none" stroke="#6b1d17" strokeWidth="2.5" />
            </svg>
            <div className="relative z-2 grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-x-8">
              {WORKS.map((work, i) => (
                <article
                  className="crt"
                  data-bezel={BEZELS[(i + Math.floor(i / 3)) % BEZELS.length]}
                  data-phosphor={PHOSPHORS[(i * 2) % PHOSPHORS.length]}
                  style={
                    {
                      "--crt-tilt": `${TILTS[i % TILTS.length]}deg`,
                      "--crt-shift": `${SHIFTS[i % SHIFTS.length]}rem`,
                      "--crt-z": WORKS.length - i,
                    } as CSSProperties
                  }
                  key={work.title}
                >
                  {i === NOTE_INDEX && (
                    <span className="crt-note" aria-hidden="true">
                      動作確認済
                    </span>
                  )}
                  <div className="crt-vent" aria-hidden="true" />
                  <div className="crt-glass">
                    <div className="crt-content">
                      <p className="crt-tags">
                        {work.tags.map((tag) => (
                          <span className="crt-tag" key={tag}>
                            [{tag}]
                          </span>
                        ))}
                      </p>
                      <h2 className="crt-title">{work.title}</h2>
                      <p className="crt-desc">{work.desc}</p>
                    </div>
                  </div>
                  <div className="crt-base" aria-hidden="true">
                    <span>
                      <span className="crt-led" />
                      PWR
                    </span>
                    <span>CRT-{String(i + 1).padStart(2, "0")}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer backHref="/" />
    </div>
  );
}
