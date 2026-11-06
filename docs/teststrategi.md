# Teststrategi

```
            ┌───────────────┐
            │  Lighthouse   │  prestanda/SEO/bästa praxis-budgetar (CI)
            ├───────────────┤
            │  E2E + axe    │  118 tester · Playwright · desktop + mobil
            ├───────────────┤
            │ Komponenter   │  testing-library · tillgängliga namn, fel, flöden
            ├───────────────┤
            │ Enhetstester  │  69 tester totalt (Vitest) · ren logik i src/lib
            └───────────────┘
            Statisk analys: ESLint (next/core-web-vitals) + TypeScript strict
```

## Vad testas var

| Nivå | Verktyg | Filer | Vad |
|---|---|---|---|
| Statisk analys | ESLint, `tsc` | – | React-hooks-regler, Next-regler, typer |
| Enhet | Vitest | `tests/unit/finance.test.ts` | Annuitetsformel, kantfall (0 %, NaN, negativa tal), validering i `quoteLoan` |
| | | `filters.test.ts` | Filtrering (märke, bränsle, kaross, fritext, intervall), sortering, att indata inte muteras |
| | | `validation.test.ts` | Kontaktformulärets regler och felmeddelanden |
| | | `imageLoader.test.ts` | Unsplash-URL: bredd, format, kvalitet, bildförhållande |
| | | `clientStorage.test.ts` | Lägg till/ändra/ta bort bilar, korrupt `localStorage`, att `useCars()` reagerar |
| | | `contrast.test.ts` | Designtokens ur `globals.css` mot WCAG 4,5:1 / 3:1 |
| Komponent | Vitest + Testing Library (jsdom) | `components.test.tsx` | `CarCard` (länknamn, formatering), `SearchForm` (etiketter, navigering), `ContactForm` (felsammanfattning, `aria-invalid`, förifyllning), `CarCreditCalculator` (inline-fel), `FilterPanel` (alla fält har namn) |
| E2E | Playwright (Chromium) | `tests/e2e/user-flows.spec.ts` | Sök → lista, filter/sortering/tomt läge, bilsida → provkörning → förifyllt formulär, kontaktformulär, kalkylator, admin in/ut, omflöde vid 320 px |
| | | `keyboard.spec.ts` | Hoppa-till-innehåll, synligt fokus, mobilmeny (Escape, fokus åter), `aria-current`, paus av bildband |
| | | `structure.spec.ts` | `lang`, unika titlar, beskrivning, en `h1`, landmärken, JSON-LD, sitemap/robots, 404, fungerar utan JS |
| | | `privacy-keyboard.spec.ts` | Kartsamtycke (inga anrop till Google före samtycke), cookie-switch, sidfotslänkar, policyernas innehållsförteckning, inbytesformulär, admin-dialog (fokusfälla, Escape, fokus åter), fokus efter sidbyte |
| Tillgänglighet | axe-core via Playwright | `a11y.spec.ts` | WCAG 2.2 A/AA + best practice på alla 12 sidor × 2 viewports, plus öppen meny och formulärfel |
| Kontrast | Playwright + pngjs | `contrast.spec.ts` | Pixelbaserad kontrast för text på gradienter/bilder som axe inte kan bedöma (foton ersatta med vitt = värsta fall) |
| Prestanda | Lighthouse CI | `lighthouserc.json` | Budgetar per kategori, LCP, CLS, TBT, JS-storlek |

E2E-testerna ersätter Unsplash-bilder och Google Maps med lokala svar (`tests/e2e/fixtures.ts`)
så att de inte blir instabila när externa tjänster är långsamma.

## Köra testerna

```bash
npm test               # enhets- och komponenttester (snabbt, ~3 s)
npm run test:watch     # samma, i bevakningsläge
npm run test:coverage  # med täckningsrapport (coverage/index.html)

npm run build:test     # bygger för "/" i stället för "/Car-Dealer"
npm run test:e2e       # E2E + WCAG (startar en lokal server automatiskt)

npm run lighthouse     # Lighthouse CI (efter build:test)
npm run check          # allt ovan utom Lighthouse, i rätt ordning
```

Första gången: `npx playwright install chromium`.

## CI (GitHub Actions)

| Arbetsflöde | När | Steg |
|---|---|---|
| `ci.yml` → *quality* | varje PR och push till `main` | lint · typecheck · enhetstester med täckning |
| `ci.yml` → *e2e* | samma | bygge · Playwright + axe · rapport som artefakt |
| `ci.yml` → *lighthouse* | samma | bygge · Lighthouse CI med budgetar · länk till rapport |
| `deploy.yml` | push till `main` | lint · typecheck · enhetstester → bygge → GitHub Pages |

Driftsättningen stoppas alltså om lint, typer eller enhetstester fallerar.

## Täckning

`lib/` (affärslogik): 93–100 % rader. Layout-komponenter (`Header`, `Footer`) och sidor täcks
av E2E i stället för enhetstester. Målet är inte 100 % – det är att varje användarflöde och
varje regel som kan ge fel pris eller fel bil har ett test.
