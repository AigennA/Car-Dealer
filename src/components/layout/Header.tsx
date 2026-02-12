"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    <header className="bg-black text-white sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 logo-icon rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Car Dealer logo">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <span className="text-2xl logo-text-main">Car Dealer</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="hover:text-primary transition font-medium">
            Hem
          </Link>
          <Link href="/bilar" className="hover:text-primary transition font-medium">
            Lager
          </Link>
          <Link href="/finansiering" className="hover:text-primary transition font-medium">
            Tjänster
          </Link>
          <Link href="/kontakt" className="hover:text-primary transition font-medium">
            Kontakt
          </Link>
          <Link href="/admin" className="hover:text-primary transition font-medium">
            Admin
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/bilar"
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:brightness-90 transition font-medium"
          >
            Visa lager
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden text-white hover:text-primary transition-colors duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <nav className="flex flex-col py-4">
            <Link href="/" className="px-4 py-3 hover:bg-gray-800 font-medium" onClick={handleNavClick}>
              Hem
            </Link>
            <Link href="/bilar" className="px-4 py-3 hover:bg-gray-800 font-medium" onClick={handleNavClick}>
              Lager
            </Link>
            <Link href="/finansiering" className="px-4 py-3 hover:bg-gray-800 font-medium" onClick={handleNavClick}>
              Tjänster
            </Link>
            <Link href="/kontakt" className="px-4 py-3 hover:bg-gray-800 font-medium" onClick={handleNavClick}>
              Kontakt
            </Link>
            <Link href="/admin" className="px-4 py-3 hover:bg-gray-800 font-medium" onClick={handleNavClick}>
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
