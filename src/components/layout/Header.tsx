"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Hem" },
  { href: "/bilar", label: "Lager" },
  { href: "/finansiering", label: "Tjänster" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleNavClick = () => setMobileMenuOpen(false);

  // "/" matches exactly; other routes match themselves and their sub-pages
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="bg-black text-white sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="logo-icon-wrap">
          <div className="w-10 h-10 logo-icon rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Car Dealer logo">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              {/* Headlight — front-right of car, amber/warm-white */}
              <circle className="logo-headlight" cx="19.2" cy="14.3" r="2" fill="#ffd27a" aria-hidden="true" />
              {/* Taillight — rear-left of car, red */}
              <circle className="logo-taillight" cx="4.8" cy="14.3" r="2" fill="#ff3b30" aria-hidden="true" />
            </svg>
          </div>
          </div>
          <span className="text-xl sm:text-2xl md:text-3xl logo-text-main">Car Dealer</span>
          {/* Two road-lane stripes — decorative, flows like a moving road */}
          <svg
            className="logo-road shrink-0 ml-0.5"
            width="14"
            height="44"
            viewBox="0 0 14 44"
            fill="none"
            aria-hidden="true"
          >
            <line x1="4" y1="1" x2="4" y2="43" stroke="#ff6535" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" />
            <line x1="10" y1="1" x2="10" y2="43" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" />
          </svg>
        </Link>

        {/* Desktop Menu — active page in coral + animated underline */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} className="group relative py-1 text-sm font-medium">
                <span
                  className={`transition-colors duration-200 ${
                    active ? "text-accent" : "text-white"
                  }`}
                >
                  {label}
                </span>
                {/* underline: coral only when active; subtle white on hover */}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300 ease-out ${
                    active ? "w-full bg-accent" : "w-0 bg-white/55 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right Action — Admin (moved here from the nav) */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/admin"
            className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors duration-200 ${
              isActive("/admin")
                ? "bg-accent border-accent text-white"
                : "border-white/30 text-white hover:border-white/70 hover:bg-white/10"
            }`}
          >
            Admin
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Stäng meny" : "Öppna meny"}
          className="md:hidden text-white hover:text-accent transition-colors duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <nav className="flex flex-col py-4">
            {NAV_ITEMS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={handleNavClick}
                className={`px-4 py-3 font-medium border-l-2 transition-colors ${
                  isActive(href)
                    ? "text-accent border-accent bg-gray-800/60"
                    : "text-white border-transparent hover:bg-gray-800"
                }`}
              >
                {label}
              </Link>
            ))}
            {/* Admin kept in the mobile drawer too */}
            <Link
              href="/admin"
              onClick={handleNavClick}
              className={`px-4 py-3 font-medium border-l-2 transition-colors ${
                isActive("/admin")
                  ? "text-accent border-accent bg-gray-800/60"
                  : "text-white border-transparent hover:bg-gray-800"
              }`}
            >
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
