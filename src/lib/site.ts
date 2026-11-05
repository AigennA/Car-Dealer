/** Central site constants — used by metadata, sitemap, JSON-LD and UI. */
export const SITE = {
  name: "Car Dealer",
  legalName: "Car Dealer AB",
  url: "https://aigenna.github.io/Car-Dealer",
  description:
    "Kvalitetskontrollerade begagnade bilar med garanti, finansiering och inbyte. Hitta din nästa bil hos Car Dealer i Stockholm.",
  phone: "070-000 00 00",
  phoneHref: "tel:+46700000000",
  email: "info@cardealer.se",
  address: { street: "Bilvägen 123", postalCode: "123 45", city: "Stockholm", country: "SE" },
  openingHours: "Mån–Fre 09–18, Lör 10–15",
} as const;
