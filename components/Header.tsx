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
    <header className="site-header">
      <div className="container header-inner">
        <Link href={logoHref} className="logo">
          {logoLabel}
        </Link>
        {navItems && navItems.length > 0 && (
          <>
            <button
              className="nav-toggle"
              aria-label="メニューを開閉"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((open) => !open)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <nav className={`site-nav${isOpen ? " is-open" : ""}`}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${pathname === item.href ? " is-active" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
