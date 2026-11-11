import Link from "next/link";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ArticleLayoutProps = {
  /** 一覧の貼り紙番号（No.001 の 1） */
  no: number;
  title: string;
  lead: string;
  badges: string[];
  date: string;
  /** 目次。id は各 Sheet の id と一致させる */
  toc: { id: string; no: string; label: string }[];
  /** 記事末尾に出す免責など */
  disclaimer: string;
  /** 次に読む記事への誘導 */
  next?: { href: string; title: string };
  children: ReactNode;
};

const NAV_ITEMS = [{ href: "/knowledges/", label: "一覧" }];

/** 技術共有の記事ページ共通の枠：掲示板テーマのヘッダー・コルクボード・フッターで記事を包む */
export default function ArticleLayout({ no, title, lead, badges, date, toc, disclaimer, next, children }: ArticleLayoutProps) {
  return (
    <div className="theme-board art animate-fade-in opacity-0">
      <Header logoLabel="Knowledges" navItems={NAV_ITEMS} variant="board" />

      <main>
        <article className="mx-auto max-w-content px-2 pt-8 pb-4 sm:px-6 sm:pt-14">
          <div className="board-frame">
            <div className="cork">
              <header className="poster art-hero">
                <span className="tape tape-l" aria-hidden="true" />
                <span className="tape tape-r" aria-hidden="true" />
                <div className="poster-frame">
                  <p className="poster-eyebrow">KNOWLEDGES No.{String(no).padStart(3, "0")}</p>
                  <h1 className="poster-title">{title}</h1>
                  <p className="art-lead">{lead}</p>
                  <ul className="art-badges">
                    {badges.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <p className="art-date">
                    {date.split(" ／ ").map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </p>
                </div>
              </header>

              <nav aria-label="目次">
                <ul className="art-toc">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`}>
                        <b>{t.no}</b>
                        {t.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {children}

              <div className="art-end">
                <p className="art-disclaimer">{disclaimer}</p>
                {next && (
                  <Link className="art-next" href={next.href}>
                    <span className="pin" aria-hidden="true" />
                    <small>NEXT ▶ 次の貼り紙</small>
                    <span>{next.title}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer backHref="/knowledges/" backLabel="Knowledges に戻る" variant="board" />
    </div>
  );
}
