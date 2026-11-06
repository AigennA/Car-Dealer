import { BUSINESS } from "./business";

/**
 * Every route and menu in one place. Header, footer and sitemap read from
 * here, so adding a page means adding it once.
 */
export const ROUTES = {
  home: "/",
  cars: "/bilar",
  financing: "/finansiering",
  tradeIn: "/inbyte",
  workshop: "/verkstad",
  inspection: "/besiktning",
  /** Shared with the API (data/business.json), which e-mails links to it. */
  myBooking: BUSINESS.manageBookingPath,
  about: "/om-oss",
  contact: "/kontakt",
  terms: "/villkor",
  privacy: "/integritet",
  cookies: "/cookies",
  accessibility: "/tillganglighet",
  staff: "/admin",
} as const;

export type NavLink = { href: string; label: string };

export const MAIN_NAV: NavLink[] = [
  { href: ROUTES.home, label: "Hem" },
  { href: ROUTES.cars, label: "Lager" },
  { href: ROUTES.financing, label: "Finansiering" },
  { href: ROUTES.tradeIn, label: "Inbyte" },
  { href: ROUTES.workshop, label: "Verkstad" },
  { href: ROUTES.about, label: "Om oss" },
  { href: ROUTES.contact, label: "Kontakt" },
];

export const FOOTER_QUICK_LINKS: NavLink[] = [
  { href: ROUTES.cars, label: "Lager" },
  { href: ROUTES.financing, label: "Finansiering" },
  { href: ROUTES.workshop, label: "Verkstad" },
  { href: ROUTES.inspection, label: "Besiktning" },
  { href: ROUTES.myBooking, label: "Min bokning" },
  { href: ROUTES.tradeIn, label: "Inbyte" },
  { href: ROUTES.about, label: "Om oss" },
  { href: ROUTES.contact, label: "Kontakt" },
];

export const FOOTER_INFO_LINKS: NavLink[] = [
  { href: ROUTES.terms, label: "Allmänna villkor" },
  { href: ROUTES.privacy, label: "Integritetspolicy" },
  { href: ROUTES.cookies, label: "Cookies och lagring" },
  { href: ROUTES.accessibility, label: "Tillgänglighetsredogörelse" },
];

export const STAFF_LINK: NavLink = { href: ROUTES.staff, label: "Personalinloggning" };

/** Public pages for the sitemap (staff pages are excluded and disallowed in robots). */
export const SITEMAP_PAGES: { path: string; priority: number }[] = [
  { path: ROUTES.home, priority: 1 },
  { path: ROUTES.cars, priority: 0.9 },
  ...[ROUTES.workshop, ROUTES.inspection, ROUTES.financing, ROUTES.tradeIn].map((path) => ({ path, priority: 0.7 })),
  ...[ROUTES.about, ROUTES.contact].map((path) => ({ path, priority: 0.5 })),
  ...[ROUTES.terms, ROUTES.privacy, ROUTES.cookies, ROUTES.accessibility].map((path) => ({ path, priority: 0.3 })),
];

/** "/" matches exactly; other routes match themselves and their sub-pages. */
export function isActiveRoute(current: string, href: string): boolean {
  const path = current.replace(/\/+$/, "") || "/";
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}
