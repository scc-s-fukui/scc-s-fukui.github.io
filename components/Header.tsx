"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export type NavItem = {
  href: string;
  label: string;
};

/** ページの世界観。plain以外は app/retro/*.css の見た目クラスを使う */
export type RetroVariant = "plain" | "museum" | "backroom" | "board" | "arcade";

type HeaderProps = {
  logoLabel: string;
  logoHref?: string;
  navItems?: NavItem[];
  variant?: RetroVariant;
};

// 見た目（色・枠・書体）のクラスだけを世界観ごとに切り替える。レイアウト用ユーティリティは共通
const STYLES: Record<
  RetroVariant,
  { header: string; logo: string; panel: string; link: string; active: string; idle: string }
> = {
  plain: {
    header: "border-b border-line bg-bg/85 backdrop-blur-md",
    logo: "text-lg font-bold text-ink no-underline",
    panel: "border-b border-line bg-bg md:border-none md:bg-transparent",
    link: "border-b border-line md:border-b-2 transition-colors",
    active: "text-ink md:border-accent",
    idle: "text-muted hover:text-ink md:border-transparent",
  },
  museum: {
    header: "hdr hdr-museum",
    logo: "hdr-logo",
    panel: "hdr-panel",
    link: "hdr-link",
    active: "is-active",
    idle: "",
  },
  backroom: {
    header: "hdr hdr-backroom",
    logo: "hdr-logo",
    panel: "hdr-panel",
    link: "hdr-link",
    active: "is-active",
    idle: "",
  },
  board: {
    header: "hdr hdr-board",
    logo: "hdr-logo",
    panel: "hdr-panel",
    link: "hdr-link",
    active: "is-active",
    idle: "",
  },
  arcade: {
    header: "hdr hdr-arcade",
    logo: "hdr-logo",
    panel: "hdr-panel",
    link: "hdr-link",
    active: "is-active",
    idle: "",
  },
};

export default function Header({ logoLabel, logoHref = "/", navItems, variant = "plain" }: HeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const s = STYLES[variant];

  return (
    <header className={`sticky top-0 z-10 ${s.header}`}>
      <div className="relative mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <Link href={logoHref} className={s.logo}>
          {logoLabel}
        </Link>
        {navItems && navItems.length > 0 && (
          <>
            <button
              className="hdr-burger flex flex-col gap-1 p-2 md:hidden"
              aria-label="メニューを開閉"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((open) => !open)}
            >
              <span className="h-0.5 w-5.5 bg-current" />
              <span className="h-0.5 w-5.5 bg-current" />
              <span className="h-0.5 w-5.5 bg-current" />
            </button>
            <nav
              className={`${isOpen ? "flex" : "hidden"} ${s.panel} absolute inset-x-0 top-16 flex-col gap-0 md:static md:flex md:flex-row md:gap-6`}
            >
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`${s.link} px-6 py-4 text-sm no-underline md:px-0 md:py-1.5 ${isActive ? s.active : s.idle}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
