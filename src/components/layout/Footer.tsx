import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 logo-icon rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              <p className="text-white font-bold text-xl logo-text-main">Car Dealer</p>
            </div>
            <p className="text-sm">
              Säkra och enkla bilaffärer med kvalitetskontrollerade fordon.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-labelledby="footer-quick">
            <h2 id="footer-quick" className="text-white font-semibold mb-4">Snabblänkar</h2>
            <ul className="space-y-1 text-sm">
                <li><Link href="/bilar" className="block py-1 hover:text-white hover:underline underline-offset-4 transition-colors">Lager</Link></li>
                <li><Link href="/finansiering" className="block py-1 hover:text-white hover:underline underline-offset-4 transition-colors">Finansiering</Link></li>
                <li><Link href="/inbyte" className="block py-1 hover:text-white hover:underline underline-offset-4 transition-colors">Inbyte</Link></li>
                <li><Link href="/om-oss" className="block py-1 hover:text-white hover:underline underline-offset-4 transition-colors">Om oss</Link></li>
                <li><Link href="/kontakt" className="block py-1 hover:text-white hover:underline underline-offset-4 transition-colors">Kontakt</Link></li>
            </ul>
          </nav>

          {/* Contact — summary + clear route to the contact page */}
          <div>
            <h2 className="text-white font-semibold mb-4">Kontakt</h2>
            <address className="not-italic space-y-2 text-sm">
              <p>
                <span className="block text-gray-400 text-xs uppercase tracking-wider">Telefon</span>
                <a href={SITE.phoneHref} className="underline underline-offset-4 hover:text-white">{SITE.phone}</a>
              </p>
              <p>
                <span className="block text-gray-400 text-xs uppercase tracking-wider">E-post</span>
                <a href={`mailto:${SITE.email}`} className="underline underline-offset-4 hover:text-white">{SITE.email}</a>
              </p>
              <p>
                <span className="block text-gray-400 text-xs uppercase tracking-wider">Besöksadress</span>
                {SITE.address.street}, {SITE.address.postalCode} {SITE.address.city}
              </p>
              <p>
                <span className="block text-gray-400 text-xs uppercase tracking-wider">Öppettider</span>
                {SITE.openingHours}
              </p>
            </address>
            <Link
              href="/kontakt"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:border-white hover:bg-white/10 transition-colors"
            >
              Kontakta oss <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Information */}
          <nav aria-labelledby="footer-info">
            <h2 id="footer-info" className="text-white font-semibold mb-4">Information</h2>
            <ul className="space-y-1 text-sm">
                <li><Link href="/villkor" className="block py-1 hover:text-white hover:underline underline-offset-4 transition-colors">Allmänna villkor</Link></li>
                <li><Link href="/integritet" className="block py-1 hover:text-white hover:underline underline-offset-4 transition-colors">Integritetspolicy</Link></li>
                <li><Link href="/cookies" className="block py-1 hover:text-white hover:underline underline-offset-4 transition-colors">Cookies och lagring</Link></li>
                <li><Link href="/tillganglighet" className="block py-1 hover:text-white hover:underline underline-offset-4 transition-colors">Tillgänglighetsredogörelse</Link></li>
            </ul>
          </nav>

        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© {new Date().getFullYear()} {SITE.legalName}. Alla rättigheter förbehållna.</p>
          <Link href="/admin" className="text-gray-400 hover:text-white underline-offset-4 hover:underline">
            Personalinloggning
          </Link>
        </div>
      </div>
    </footer>
  );
}
