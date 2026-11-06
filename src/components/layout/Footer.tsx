import Link from "next/link";
import { SITE } from "@/lib/site";
import { FOOTER_INFO_LINKS, FOOTER_QUICK_LINKS, ROUTES, STAFF_LINK, type NavLink } from "@/config/navigation";
import Logo from "./Logo";

const LINK = "block py-1 hover:text-white hover:underline underline-offset-4 transition-colors";

function LinkColumn({ id, title, links }: { id: string; title: string; links: NavLink[] }) {
  return (
    <nav aria-labelledby={id}>
      <h2 id={id} className="text-white font-semibold mb-4">{title}</h2>
      <ul className="space-y-1 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={LINK}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ContactItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p>
      <span className="block text-gray-400 text-xs uppercase tracking-wider">{label}</span>
      {children}
    </p>
  );
}

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo variant="footer" />
            </div>
            <p className="text-sm">{SITE.tagline}</p>
          </div>

          <LinkColumn id="footer-quick" title="Snabblänkar" links={FOOTER_QUICK_LINKS} />

          {/* Contact — summary + clear route to the contact page */}
          <div>
            <h2 className="text-white font-semibold mb-4">Kontakt</h2>
            <address className="not-italic space-y-2 text-sm">
              <ContactItem label="Telefon">
                <a href={SITE.phoneHref} className="underline underline-offset-4 hover:text-white">{SITE.phone}</a>
              </ContactItem>
              <ContactItem label="E-post">
                <a href={`mailto:${SITE.email}`} className="underline underline-offset-4 hover:text-white">{SITE.email}</a>
              </ContactItem>
              <ContactItem label="Besöksadress">{SITE.fullAddress}</ContactItem>
              <ContactItem label="Öppettider">{SITE.openingHours}</ContactItem>
            </address>
            <Link
              href={ROUTES.contact}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:border-white hover:bg-white/10 transition-colors"
            >
              Kontakta oss <span aria-hidden="true">→</span>
            </Link>
          </div>

          <LinkColumn id="footer-info" title="Information" links={FOOTER_INFO_LINKS} />
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© {new Date().getFullYear()} {SITE.copyrightHolder}. Alla rättigheter förbehållna.</p>
          <Link href={STAFF_LINK.href} className="text-gray-400 hover:text-white underline-offset-4 hover:underline">
            {STAFF_LINK.label}
          </Link>
        </div>
      </div>
    </footer>
  );
}
