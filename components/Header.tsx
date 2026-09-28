"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export type NavItem = {
  href: string;
  label: string;
};

type HeaderProps = {
  logoLabel: string;
  logoHref?: string;
  navItems?: NavItem[];
};

export default function Header({ logoLabel, logoHref = "/", navItems }: HeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-[960px] items-center justify-between px-6">
        <Link href={logoHref} className="text-lg font-bold text-ink no-underline">
          {logoLabel}
        </Link>
        {navItems && navItems.length > 0 && (
          <>
            <button
              className="flex flex-col gap-1 p-2 md:hidden"
              aria-label="メニューを開閉"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((open) => !open)}
            >
              <span className="h-0.5 w-5.5 bg-ink" />
              <span className="h-0.5 w-5.5 bg-ink" />
              <span className="h-0.5 w-5.5 bg-ink" />
            </button>
            <nav
              className={`${isOpen ? "flex" : "hidden"} absolute inset-x-0 top-16 flex-col gap-0 border-b border-line bg-bg md:static md:flex md:flex-row md:gap-6 md:border-none md:bg-transparent`}
            >
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`border-b border-line px-6 py-4 text-sm no-underline transition-colors md:border-b-2 md:px-0 md:py-1.5 ${
                      isActive ? "text-ink md:border-accent" : "text-muted hover:text-ink md:border-transparent"
                    }`}
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
