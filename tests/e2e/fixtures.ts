import { test as base, expect } from "@playwright/test";

// 1×1 transparent PNG — keeps tests hermetic and fast (no dependency on the
// Unsplash CDN or Google Maps being reachable from CI).
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/images\.unsplash\.com/, (route) =>
      route.fulfill({ status: 200, contentType: "image/png", body: PIXEL }),
    );
    await page.route(/google\.com\/maps/, (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<html lang=\"sv\"><head><title>Karta</title></head><body>Karta</body></html>" }),
    );
    await use(page);
  },
});

export { expect };

export const PAGES = [
  { path: "/", h1: /HITTA DIN\s*NÄSTA\s*BIL/i },
  { path: "/bilar/", h1: "Våra bilar" },
  { path: "/bilar/volvo-v90-d4-awd/", h1: "Volvo V90 D4 AWD" },
  { path: "/bilar/mini-cooper-se/", h1: /MINI Cooper SE Electric\s+– såld/ },      // sold (demo data)
  { path: "/bilar/mazda-mx-30-ev/", h1: /Mazda MX-30 EV\s+– reserverad/ },        // reserved (demo data)
  { path: "/finansiering/", h1: "Våra Tjänster" },
  { path: "/inbyte/", h1: /inbyte/i },
  { path: "/verkstad/", h1: "Service och reparationer – boka tid online" },
  { path: "/besiktning/", h1: "Besiktning utan krångel" },
  { path: "/min-bokning/", h1: "Min bokning" },
  { path: "/om-oss/", h1: /om oss/i },
  { path: "/kontakt/", h1: "Kontakta oss" },
  { path: "/villkor/", h1: /villkor/i },
  { path: "/integritet/", h1: /integritet/i },
  { path: "/cookies/", h1: "Cookies och lagring" },
  { path: "/tillganglighet/", h1: "Tillgänglighetsredogörelse" },
  { path: "/admin/", h1: "Admin Login" },
];
