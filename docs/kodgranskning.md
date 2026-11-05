# Kodgranskning

**Omfattning:** hela kodbasen på commit `fd96c46` (Next.js 16, React 19, Tailwind 4, statisk
export till GitHub Pages).
**Fokus:** korrekthet, prestanda, tillgänglighet, säkerhet, underhållbarhet, testbarhet.
**Allvar:** 🔴 blockerande · 🟠 bör åtgärdas · 🟡 mindre · ⚪ notering

## Åtgärdade fynd

| # | Allvar | Fynd | Var | Åtgärd |
|---|---|---|---|---|
| 1 | 🔴 | `npm run lint` misslyckades med **10 fel** – ingen kvalitetsgrind var möjlig i CI. `setState` anropades synkront i `useEffect` (3 sidor) och byggskripten använde `require()`. | `bilar/page.tsx`, `CarDetailClient.tsx`, `admin/page.tsx`, `scripts/*.js` | Ny `useCars()`-hook med `useSyncExternalStore`; admin-session som extern store; skripten ESM. **Lint: 0 fel, 0 varningar.** |
| 2 | 🔴 | **Tom statisk HTML.** Lagret och alla 24 bilsidor exporterades som "Laddar…" – innehållet kom först efter JS. Dålig LCP, osynligt för sökmotorer och för användare där JS fallerar. | `bilar/page.tsx`, `CarDetailClient.tsx` | Server-snapshot = statiskt lager; admin-tillagda bilar läggs till efter hydrering. Testat med JS avstängt. |
| 3 | 🟠 | **Risk för hydreringsfel:** `toLocaleString()` utan språk formaterar olika på servern (byggmaskinen, en-US → "249,900") och i klienten (sv-SE → "249 900"). | `CarDetailClient.tsx`, `admin/page.tsx` | Alltid `toLocaleString("sv-SE")`. |
| 4 | 🟠 | `images.unoptimized: true` + inga `sizes` → varje bild hämtas i 800 px JPEG på alla skärmar. | `next.config.ts` | Custom loader mot Unsplash/imgix (`src/lib/imageLoader.ts`). |
| 5 | 🟠 | Google Fonts via `@import` i CSS – render-blockerande kedja (CSS → CSS → font). | `globals.css` | `next/font` (självhostat). |
| 6 | 🟠 | `calculateMonthlyPayment` gav `NaN` vid 0 % ränta och `NaN`-indata. | `lib/finance.ts` | Hanteras; ny `quoteLoan()` med validering och felmeddelanden. 9 enhetstester. |
| 7 | 🟠 | `alert()` för valideringsfel i två kalkylatorer, `alert()` i admin vid borttagning. | `CreditCalculator`, `CarCreditCalculator`, admin | Inline-fel / statusmeddelanden. |
| 8 | 🟠 | Kontaktformuläret validerade bara `name`. | `kontakt/page.tsx` | `lib/validation.ts` + `ContactForm`-komponent. |
| 9 | 🟡 | Sortering "Nyast inlagda" gav `NaN` för id:n som inte är numeriska → instabil ordning. | `bilar/page.tsx` | `idOrder()` med fallback. |
| 10 | 🟡 | Filter- och sorteringslogik låg inuti en 250-raders komponent – inte testbar. | `bilar/page.tsx` | Utbruten till `lib/filters.ts` (rena funktioner, 13 tester). |
| 11 | 🟡 | Dubblerad formulär-/kalkylatorlogik (låneterminer, räntesats, felmeddelanden) på tre ställen. | kalkylatorer | `LOAN_TERMS`, `quoteLoan()` i `lib/finance.ts`. |
| 12 | 🟡 | Död kod: `src/lib/storage.ts` (oanvänd), `prepare-build`/`postbuild` som flyttar en `src/app/api`-mapp som inte finns. README beskrev API-endpoints som inte finns. | | Borttaget, README rättad. |
| 13 | 🟡 | Kontaktuppgifter hårdkodade på 5+ ställen. | header, footer, kontakt | `lib/site.ts`. |
| 14 | 🟡 | Ingen SEO-grund: samma `<title>` för alla bilar, ingen sitemap/robots, ingen Open Graph, ingen strukturerad data. | | `generateMetadata` per bil, `sitemap.ts`, `robots.ts`, OG, JSON-LD (`AutoDealer`, `Car`). |
| 15 | ⚪ | `<img>` i admin och "liknande bilar" (lint-varning). | | `next/image`. |

## Kvarstående fynd (inte åtgärdade)

| # | Allvar | Fynd | Rekommendation |
|---|---|---|---|
| A | 🔴 | **Admin-inloggningen är inte säker.** Användare och lösenord lagras i klartext i `localStorage`, standardkontot `admin/admin123` står på sidan, och "inloggad" är bara `sessionStorage.admin_auth = "true"` – vem som helst kan sätta den i devtools. Ändringar sparas bara i den egna webbläsaren. | OK som **demo**. För produktion: riktig backend med autentisering (t.ex. Supabase/Firebase Auth, NextAuth på Vercel) och server-side lagring. Använd aldrig lösenord som valideras i klienten. |
| B | 🔴 | **Formulären skickar inga data** (kontakt, inbyte). Användaren får ett "Tack!" men ingen tar emot meddelandet. | Koppla till Formspree/Resend/eget API, eller ändra texten tills det finns en mottagare. |
| C | 🟠 | Alla bilder hämtas från en extern tjänst (Unsplash). Om den är nere eller ändrar villkor försvinner bilderna; LCP-bilden kostar en extra anslutning. | Lagra egna bilder (riktiga bilder av bilarna!) i `public/` eller ett CDN, i AVIF/WebP. |
| D | 🟡 | `tailwind.config.ts` läses inte av Tailwind 4 (temat ligger i `@theme` i `globals.css`). Två källor för färger kan glida isär. | Ta bort filen eller lägg till `@config`. |
| E | 🟡 | `globals.css` är ~700 rader med mycket hero-specifik CSS. | Flytta hero-stilar till en CSS-modul bredvid komponenten. |
| F | 🟡 | `npm audit` rapporterar sårbarheter i utvecklingsberoenden. | Kör `npm audit` regelbundet, aktivera Dependabot. |

## Positiva observationer

- Tydlig mappstruktur, konsekvent namngivning, TypeScript `strict`.
- Ikonerna är redan samlade i `components/ui/icons.tsx` med `aria-hidden` som standard.
- `prefers-reduced-motion` respekterades redan för de flesta animationer.
- Kommentarer förklarar *varför*, inte bara *vad*.

## Verifiering

```
npm run lint        ✔ 0 fel, 0 varningar
npm run typecheck   ✔
npm test            ✔ 44 enhets-/komponenttester
npm run test:e2e    ✔ 72 E2E-/WCAG-tester (desktop + mobil)
npm run build       ✔ 38 statiska sidor
```
