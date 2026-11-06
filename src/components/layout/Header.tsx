"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import { MAIN_NAV, ROUTES, isActiveRoute } from "@/config/navigation";
import Logo from "./Logo";


export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const isActive = (href: string) => isActiveRoute(pathname, href);

  // While the mobile menu is open:
  // - Escape closes it and returns focus to the toggle (WCAG 2.1.2 / 2.4.3)
  // - tapping or tabbing anywhere outside the header closes it, so the tall
  //   sticky menu never covers the content the user moved on to (WCAG 2.4.11)
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onOutside = (e: Event) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("focusin", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("focusin", onOutside);
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header ref={headerRef} className="bg-black text-white sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href={ROUTES.home} className="flex items-center gap-3 group rounded-lg" aria-label={`${SITE.name} – till startsidan`}>
          <Logo variant="header" />
        </Link>

        {/* Desktop Menu — active page in coral + animated underline */}
        <nav aria-label="Huvudmeny" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {MAIN_NAV.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className="group relative inline-block py-2 text-sm font-medium rounded-sm"
                  >
                    <span className={`transition-colors duration-200 ${active ? "text-accent" : "text-white"}`}>
                      {label}
                    </span>
                    {/* underline: coral only when active; subtle white on hover (transform only) */}
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0 left-0 h-0.5 w-full origin-left rounded-full transition-transform duration-300 ease-out ${
                        active ? "scale-x-100 bg-accent" : "scale-x-0 bg-white/70 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Primary action — always visible on desktop */}
        <a
          href={SITE.phoneHref}
          className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-white/40 text-white hover:border-white hover:bg-white/10 transition-colors"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {SITE.phone}
        </a>

        {/* Mobile Menu Button — 44×44 touch target (WCAG 2.5.8) */}
        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          className="lg:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-white hover:text-accent transition-colors duration-200"
          onClick={() => setMobileMenuOpen((o) => !o)}
        >
          <span className="sr-only">{mobileMenuOpen ? "Stäng meny" : "Öppna meny"}</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div id="mobile-menu" hidden={!mobileMenuOpen} className="lg:hidden bg-gray-900 border-t border-gray-800">
        <nav aria-label="Mobilmeny">
          <ul className="flex flex-col py-4">
            {MAIN_NAV.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeMenu}
                    aria-current={active ? "page" : undefined}
                    className={`block px-4 py-3 font-medium border-l-4 transition-colors ${
                      active
                        ? "text-accent border-accent bg-gray-800/60"
                        : "text-white border-transparent hover:bg-gray-800"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
            <li>
              <a href={SITE.phoneHref} className="block px-4 py-3 font-medium text-white border-l-4 border-transparent hover:bg-gray-800">
                Ring oss: {SITE.phone}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
