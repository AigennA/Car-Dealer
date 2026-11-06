"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";

const NAV_ITEMS = [
  { href: "/", label: "Hem" },
  { href: "/bilar", label: "Lager" },
  { href: "/finansiering", label: "Finansiering" },
  { href: "/inbyte", label: "Inbyte" },
  { href: "/verkstad", label: "Verkstad" },
  { href: "/om-oss", label: "Om oss" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // usePathname() has no trailing slash even with trailingSlash: true,
  // but normalise defensively.
  const current = pathname.replace(/\/+$/, "") || "/";
  const isActive = (href: string) =>
    href === "/" ? current === "/" : current === href || current.startsWith(`${href}/`);

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
        <Link href="/" className="flex items-center gap-3 group rounded-lg" aria-label="Car Dealer – till startsidan">
          <div className="logo-icon-wrap">
          <div className="w-10 h-10 logo-icon rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              {/* Headlight — front-right of car, amber/warm-white */}
              <circle className="logo-headlight" cx="19.2" cy="14.3" r="2" fill="#ffd27a" />
              {/* Taillight — rear-left of car, red */}
              <circle className="logo-taillight" cx="4.8" cy="14.3" r="2" fill="#ff3b30" />
            </svg>
          </div>
          </div>
          <span className="text-xl sm:text-2xl md:text-3xl logo-text-main" aria-hidden="true">Car Dealer</span>
          {/* Two road-lane stripes — decorative, flows like a moving road */}
          <svg
            className="logo-road shrink-0 ml-0.5 hidden sm:block"
            width="14"
            height="44"
            viewBox="0 0 14 44"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <line x1="4" y1="1" x2="4" y2="43" stroke="#ff6535" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" />
            <line x1="10" y1="1" x2="10" y2="43" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" />
          </svg>
        </Link>

        {/* Desktop Menu — active page in coral + animated underline */}
        <nav aria-label="Huvudmeny" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV_ITEMS.map(({ href, label }) => {
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
            {NAV_ITEMS.map(({ href, label }) => {
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
                Ring oss: 070-000 00 00
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
