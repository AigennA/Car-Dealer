# Lighthouse-rapport

## Sammanfattning

| Sida (mobil) | Prestanda före | Prestanda efter | Tillgänglighet före → efter | LCP före → efter | FCP före → efter | Sidvikt före → efter |
|---|---|---|---|---|---|---|
| `/` | 96* | 93 | 91 → **100** | 1,7 s* → 3,2 s | 1,7 s → **0,8 s** | 597 KB → **410 KB** |
| `/bilar/` | 79 | **91** | 95 → **100** | 5,2 s → **3,4 s** | 1,7 s → **0,8 s** | 1 239 KB → **557 KB** |
| `/bilar/volvo-v90-d4-awd/` | 84 | **98** | 86 → **100** | 4,1 s → **2,4 s** | 1,7 s → **0,8 s** | 600 KB → **431 KB** |
| `/finansiering/` | 98 | **100** | 91 → **100** | 1,7 s → **0,8 s** | | |
| `/kontakt/` | 99 | **100** | 96 → **100** | 1,6 s → **0,8 s** | | |
| `/inbyte/` | 98 | **100** | 96 → **100** | 1,6 s → **0,8 s** | | |
| `/om-oss/` | 98 | **100** | 95 → **100** | 1,9 s → **0,8 s** | | |

Bästa praxis: 100 på alla sidor. SEO: 100 på alla sidor. CLS: 0 på alla sidor.

\* **Startsidans "före"-LCP är missvisande låg.** Hero-bilden tonades in från `opacity: 0`
med en CSS-animation, och Chrome räknar inte element som blir synliga på det sättet som
LCP-kandidat. LCP mättes därför på logotypens text – bilden som användaren faktiskt väntar på
syntes senare än så. Efter ändringen är hero-bilden en riktig LCP-kandidat (förladdad,
`fetchpriority="high"`), och siffran visar nu sanningen. Speed Index – när sidan *ser*
färdig ut – gick från **4,7 s till 0,8 s**.

### Varför stod det 58?

Det uppmätta 58-resultatet kom från den publicerade sajten med riktiga Unsplash-bilder på
ett mobilnät. Huvudorsakerna, i ordning:

1. **Ooptimerade bilder** – `images.unoptimized: true` gjorde att varje bild laddades som en
   fast 800 px JPEG, oavsett skärmstorlek, och utan WebP/AVIF. `/bilar` laddade ~950 KB bilder.
2. **Render-blockerande Google Fonts** – `@import url(fonts.googleapis.com…)` i CSS:en
   blockerade första renderingen (~300–990 ms enligt Lighthouse) och laddade 3 familjer i
   upp till 5 vikter.
3. **Tom statisk HTML** – `/bilar` och alla bilsidor renderade bara "Laddar…" i HTML:en;
   bilarna dök upp först när JavaScript hade körts (`useEffect` + `setState`). Det försenade
   LCP och gjorde sidorna osynliga för sökmotorer.
4. **Hero-animationer** på H1, ingress och bild försenade det som syns först.

## Mätmetod

- Lighthouse 12 (samma motor som PageSpeed Insights), standardinställningar = mobil med
  simulerad 4G-strypning och 4× CPU-strypning. Kört lokalt mot `next build`-exporten.
- Båda versionerna (commit `fd96c46` före, denna gren efter) byggdes och mättes under
  identiska förhållanden.
- **Bilder:** sandlådan som mätningarna gjordes i får inte nå `images.unsplash.com`. För
  en rättvis jämförelse användes en lokal ersättare som beter sig som Unsplash/imgix-CDN:et
  (respekterar `w`, `h`, `ar`, `q`, `auto=format` → WebP). Absoluta tider kan därför skilja
  sig något från PageSpeed Insights mot den riktiga sajten, men skillnaden mellan före och
  efter är rättvis.
- **Verifiera på riktigt** efter driftsättning: kör
  [PageSpeed Insights](https://pagespeed.web.dev/) mot `https://aigenna.github.io/Car-Dealer/`.
  Lighthouse CI körs också automatiskt i GitHub Actions på varje PR (se nedan).

## Ändringar som påverkar prestanda

| Ändring | Fil | Effekt |
|---|---|---|
| Egen bild-loader för Unsplash (imgix): responsiv `srcset`, `auto=format` (AVIF/WebP), `q=70`, bevarat bildförhållande | `src/lib/imageLoader.ts`, `next.config.ts` | Bildvikt `/bilar` 949 KB → 252 KB |
| Korrekta `sizes` på alla bilder | `CarCard`, `ImageGallery`, `bilar/page.tsx` | Mobilen hämtar inte desktopbilder |
| Hero-/galleribild förladdas med `fetchpriority="high"`; övriga bilder lazy | `page.tsx`, `ImageGallery.tsx` | LCP-bilden startar direkt |
| `preconnect` till `images.unsplash.com` | `app/layout.tsx` | Sparar DNS+TCP+TLS för LCP-bilden |
| Typsnitt via `next/font` (självhostade, bara latin, variabla, storleksjusterad fallback) | `app/layout.tsx`, `globals.css` | Ingen render-blockerande extern CSS; FCP 1,7 s → 0,8 s |
| Statisk HTML innehåller hela lagret (`useSyncExternalStore` med server-snapshot) | `src/lib/clientStorage.ts`, `bilar/page.tsx`, `CarDetailClient.tsx` | Innehåll syns utan JS; bättre LCP & SEO |
| Ingen entréanimation på H1/ingress/hero-bild | `page.tsx` | LCP-element ritas direkt |
| Miniatyrer i hero-bandet hämtas i 280 px, q=55 | `HeroCarStrip.tsx` | Mindre bytes ovanför vecket |

## Budgetar i CI (Lighthouse CI)

`lighthouserc.json` – körs i `.github/workflows/ci.yml` på varje PR:

| Mått | Gräns | Nivå |
|---|---|---|
| Tillgänglighet | = 100 | fel (blockerar) |
| SEO | = 100 | fel |
| Bästa praxis | ≥ 95 | fel |
| CLS | ≤ 0,1 | fel |
| Prestanda | ≥ 90 | varning |
| LCP | ≤ 2,5 s | varning |
| TBT | ≤ 200 ms | varning |
| JS-storlek | ≤ 250 KB | varning |

Prestanda är en *varning* och inte ett fel eftersom resultatet varierar mellan körningar på
delade CI-maskiner och beror på ett externt bild-CDN.

## Kvarstående förbättringar

- **Självhosta bilderna.** Den största kvarvarande kostnaden är att LCP-bilden kommer från en
  annan domän (extra anslutning). Bilder i `public/` (eller via ett eget CDN) i AVIF skulle
  sannolikt ge LCP < 2,5 s även på startsidan.
- **Mindre JavaScript.** Ramverket (React + Next-runtime) står för ~150 KB. Startsidans
  egna komponenter är redan små; att göra `MiniCreditCalculator` till en ö som laddas när
  den syns är nästa steg.
