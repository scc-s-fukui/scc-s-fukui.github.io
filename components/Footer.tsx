import Link from "next/link";
import type { RetroVariant } from "./Header";

type FooterProps = {
  backHref?: string;
  backLabel?: string;
  variant?: RetroVariant;
};

export default function Footer({ backHref, backLabel = "Portal に戻る", variant = "plain" }: FooterProps) {
  if (variant === "plain") {
    return (
      <footer className="border-t border-line px-6 py-6 text-sm text-muted">
        <div className="mx-auto max-w-content px-6">
          <p>&copy; 2026 S.Fukui. All rights reserved.</p>
          {backHref && (
            <p className="mt-2">
              <Link href={backHref} className="text-muted no-underline hover:text-accent">
                &larr; {backLabel}
              </Link>
            </p>
          )}
        </div>
      </footer>
    );
  }

  // 戻り先のリンクを、世界観に合わせた「もの」として見せる（非常口サイン／立入禁止テープ／管理人札／コンティニュー画面）
  return (
    <footer className={`ftr ftr-${variant}`}>
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-6 py-8">
        {backHref && variant === "museum" && (
          <Link href={backHref} className="exit-sign">
            <span className="exit-sign-man" aria-hidden="true">
              ◀
            </span>
            <span className="exit-sign-text">
              <b>非常口 EXIT</b>
              <small>{backLabel}</small>
            </span>
          </Link>
        )}
        {backHref && variant === "backroom" && (
          <Link href={backHref} className="neon-exit">
            ← {backLabel}
          </Link>
        )}
        {backHref && variant === "board" && (
          <Link href={backHref} className="board-back">
            ← {backLabel}
          </Link>
        )}
        {backHref && variant === "arcade" && (
          <Link href={backHref} className="continue-box">
            <span className="continue-title">CONTINUE?</span>
            <span className="continue-link">▶ {backLabel}</span>
          </Link>
        )}
        <p className="ftr-copy">&copy; 2026 S.Fukui. All rights reserved.</p>
      </div>
    </footer>
  );
}
