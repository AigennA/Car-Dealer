import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>C</span>
              </div>
              <span className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-montserrat)', letterSpacing: '-0.02em' }}>Car Dealer</span>
            </div>
            <p className="text-sm">
              Safe and simple car deals with quality-checked vehicles.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/bilar" className="block hover:text-primary transition">
                Inventory
              </Link>
              <Link href="/finansiering" className="block hover:text-primary transition">
                Financing
              </Link>
              <Link href="/inbyte" className="block hover:text-primary transition">
                Trade-in
              </Link>
              <Link href="/om-oss" className="block hover:text-primary transition">
                About Us
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-sm">
              <p>Phone: 070-000 00 00</p>
              <p>Email: info@cardealer.se</p>
              <p>Hours: Mon-Fri 09-18</p>
            </div>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-white font-semibold mb-4">Information</h3>
            <div className="space-y-2 text-sm">
              <Link href="/villkor" className="block hover:text-primary transition">
                Terms
              </Link>
              <Link href="/integritet" className="block hover:text-primary transition">
                Privacy Policy
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 text-center text-sm">
          <p>© 2026 Car Dealer AB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
