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
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl logo-text">C</span>
          </div>
          <span className="text-2xl font-bold logo-text">Car Dealer</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="hover:text-primary transition font-medium">
            Home
          </Link>
          <Link href="/bilar" className="hover:text-primary transition font-medium">
            Inventory
          </Link>
          <Link href="/finansiering" className="hover:text-primary transition font-medium">
            Services
          </Link>
          <Link href="/kontakt" className="hover:text-primary transition font-medium">
            Contact
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/bilar"
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark transition font-medium"
          >
            View Inventory
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden text-white hover:text-primary hover:bg-gray-800 active:bg-gray-700 focus-visible:ring-2 focus-visible:ring-primary transition-colors duration-200 p-2 rounded-lg"
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
              Home
            </Link>
            <Link href="/bilar" className="px-4 py-3 hover:bg-gray-800 font-medium" onClick={handleNavClick}>
              Inventory
            </Link>
            <Link href="/finansiering" className="px-4 py-3 hover:bg-gray-800 font-medium" onClick={handleNavClick}>
              Services
            </Link>
            <Link href="/kontakt" className="px-4 py-3 hover:bg-gray-800 font-medium" onClick={handleNavClick}>
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
