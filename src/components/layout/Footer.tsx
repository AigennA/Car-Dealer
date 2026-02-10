import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 logo-icon rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Car Dealer logo">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              <span className="text-white font-bold text-xl logo-text-main">Car Dealer</span>
            </div>
            <p className="text-sm">
              Säkra och enkla bilaffärer med kvalitetskontrollerade fordon.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Snabblänkar</h3>
            <div className="space-y-2 text-sm">
              <Link href="/bilar" className="block hover:text-primary transition">
                Lager
              </Link>
              <Link href="/finansiering" className="block hover:text-primary transition">
                Finansiering
              </Link>
              <Link href="/inbyte" className="block hover:text-primary transition">
                Inbyte
              </Link>
              <Link href="/om-oss" className="block hover:text-primary transition">
                Om oss
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kontakt</h3>
            <div className="space-y-2 text-sm">
              <p>Telefon: 070-000 00 00</p>
              <p>E-post: info@cardealer.se</p>
              <p>Öppettider: Mån-Fre 09-18</p>
            </div>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-white font-semibold mb-4">Information</h3>
            <div className="space-y-2 text-sm">
              <Link href="/villkor" className="block hover:text-primary transition">
                Villkor
              </Link>
              <Link href="/integritet" className="block hover:text-primary transition">
                Integritetspolicy
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 text-center text-sm">
          <p>© 2026 Car Dealer AB. Alla rättigheter förbehållna.</p>
        </div>
      </div>
    </footer>
  );
}
