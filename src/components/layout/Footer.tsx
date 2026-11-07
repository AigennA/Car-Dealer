import Link from "next/link";
import { SITE } from "@/lib/site";
import { FOOTER_INFO_LINKS, FOOTER_QUICK_LINKS, ROUTES, STAFF_LINK, type NavLink } from "@/config/navigation";
import Logo from "./Logo";

const LINK = "block py-1 [overflow-wrap:anywhere] hyphens-auto hover:text-white hover:underline underline-offset-4 transition-colors";

function LinkColumn({ id, title, links }: { id: string; title: string; links: NavLink[] }) {
  return (
    <nav aria-labelledby={id}>
      <h2 id={id} className="text-white font-semibold mb-3">{title}</h2>
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
    <footer className="bg-navy text-gray-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-12">
        {/*
          Phones: brand on top, the two link lists side by side, contact below.
          Desktop: four columns. The DOM order is the visual order in both, so Tab
          order matches what you see (WCAG 1.3.2 / 2.4.3).
        */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Logo variant="footer" />
            </div>
            <p className="text-sm">{SITE.tagline}</p>
          </div>

          <LinkColumn id="footer-quick" title="Snabblänkar" links={FOOTER_QUICK_LINKS} />

          <LinkColumn id="footer-info" title="Information" links={FOOTER_INFO_LINKS} />

          {/* Contact — summary + clear route to the contact page */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-white font-semibold mb-3">Kontakt</h2>
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
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© {new Date().getFullYear()} {SITE.copyrightHolder}. Alla rättigheter förbehållna.</p>
          <Link href={STAFF_LINK.href} className="text-gray-400 hover:text-white underline-offset-4 hover:underline">
            {STAFF_LINK.label}
          </Link>
        </div>
      </div>
    </footer>
  );
}
