# WCAG 2.2 AA-granskning

**Omfattning:** alla publika sidor + admin (inloggning), desktop (1280 px) och mobil (390 px).
**Standard:** WCAG 2.2 nivå A och AA (krav enligt DOS-lagen / EN 301 549 för offentlig sektor,
och god praxis för privata e-handlare inför tillgänglighetsdirektivet, EAA, från juni 2025).
**Metod:**
1. Automatiskt: axe-core 4 (`@axe-core/playwright`) med taggarna `wcag2a, wcag2aa, wcag21a,
   wcag21aa, wcag22aa, best-practice`, på alla sidor i båda viewport-storlekarna. Körs i CI
   (`tests/e2e/a11y.spec.ts`).
2. Lighthouse tillgänglighetsrevision.
3. Manuell granskning mot checklistan nedan: tangentbord, fokus, rubrikstruktur, formulär,
   kontraster, rörelse, zoom/reflow. Delar av den manuella granskningen är automatiserad som
   Playwright-tester (`tests/e2e/keyboard.spec.ts`, `structure.spec.ts`).

> Automatiska verktyg hittar ungefär 30–40 % av alla tillgänglighetsproblem. Ett 0-resultat i
> axe betyder *inte* att sajten är fullt tillgänglig – därför den manuella delen.

## Resultat

| | Före | Efter |
|---|---|---|
| axe-fel (antal element, 10 sidor × 2 viewports) | **237** | **0** |
| axe-regler som bröts | 5 | 0 |
| Lighthouse tillgänglighet (lägsta sida) | 86 | 100 |

### Fel som hittades före åtgärd

| axe-regel | Allvar | Antal | WCAG | Orsak | Åtgärd |
|---|---|---|---|---|---|
| `color-contrast` | serious | 195 | 1.4.3 | Varumärkesblå `#0099cc` mot vitt = 3,3:1 (krav 4,5:1). Korall `#ff6535` med vit text = 2,9:1. `text-gray-400` = 2,5:1. | Primärfärg mörkad till `#0077a8` (5,0:1), knappar i korall använder `#c2410c` (5,2:1), grå texter höjda till gray-600/700. Den ljusa blå finns kvar som dekor i gradienter. |
| `label-content-name-mismatch` | serious | 26 | 2.5.3 | Bildlänken i bilkortet hade `aria-label="Se Volvo…"` som inte matchade synligt innehåll. | Bildlänken är nu en dubblett dold för hjälpmedel (`aria-hidden`, `tabIndex=-1`); kortet har en rubriklänk och en "Visa bil"-knapp med dold bilnamnstext. |
| `select-name` | critical | 10 | 1.3.1, 4.1.2 | Sökformuläret och kalkylatorerna hade `<select>` utan etikett. | Synliga `<label>` kopplade med `htmlFor`/`id`. |
| `heading-order` | moderate | 4 | 1.3.1 | `/bilar` hoppade från h1 till h3; admin likaså. | Rubriknivåer rättade; `CarCard` tar `headingLevel`-prop. |
| `label` | critical | 2 | 1.3.1, 3.3.2 | Inmatningsfält i bilsidans kalkylator saknade etikett. | Etiketter tillagda (`useId`). |

## Kontrasttest (utöver axe)

axe-core kan **inte** bedöma kontrast för text på gradienter, på bilder eller intill
pseudo-element – sådana element hamnar i "incomplete" och räknas inte som fel. På den här
sajten gällde det ~60 element (hela hero-sektionen, logotypen, kalkylatorerna, CTA-rutorna).
Därför finns två egna kontrasttester:

| Test | Fil | Hur |
|---|---|---|
| **Designtokens** | `tests/unit/contrast.test.ts` | Läser färgerna direkt ur `@theme` i `globals.css` och kontrollerar varje par som används för text/UI (vit på primär, primär på vitt/surface, korall på svart, hover-färger, fokusringar) mot 4,5:1 resp. 3:1. Ändrar någon en färg så att den inte klarar AA fallerar testet. |
| **Pixelbaserat** | `tests/e2e/contrast.spec.ts` | För varje element som axe inte kunde bedöma: all text görs genomskinlig, sidan fotograferas, och textfärgen (inkl. opacitet, eller varje färgstopp i gradienttext) blandas mot varje bakgrundspixel. Sämsta värdet (2:a percentilen) måste klara 4,5:1 (3:1 för stor text). Bilfoton ersätts med en **helt vit** bild – värsta fallet för vit text på foto. Körs på alla 10 sidor, desktop + mobil. |

### Fel som det pixelbaserade testet hittade (och axe missade)

| Element | Uppmätt | Krav | Åtgärd |
|---|---|---|---|
| Hero: ordet "BIL" (korall→gul gradient på blått) | **1,5:1** | 3:1 | Gradient i amber/crème (`#ffd27a`→`#fff1cf`), ≥ 3,5:1 |
| Hero: ingress, statistiketiketter, sekundärknapp (vit på ljusblå del av gradienten, mobil) | 2,5–3,9:1 | 4,5:1 | Hero-gradienten mörkad: ljusaste punkt `#0077a8` (vit text 5,0:1); glöd-lager dämpade; vit text utan opacitet |
| Hero: "Din nästa bil"-etikett | 4,47:1 | 4,5:1 | Korall-glöden bakom dämpad |
| Startsidan: länken "Fullständig kalkyl" på korallton | 4,46:1 | 4,5:1 | `accent-darker` (#9a3412) |
| Om oss: knapp med `bg-white/10` på blå gradient | 4,34:1 | 4,5:1 | `bg-black/20` |

Efter åtgärd: **0 fel** i båda testerna.

## Manuell checklista (WCAG 2.2 AA)

Status: ✅ uppfyllt · ⚠️ delvis / se kommentar · ➖ ej tillämpligt

### 1. Möjlig att uppfatta

| Kriterium | Status | Kommentar |
|---|---|---|
| 1.1.1 Icke-textinnehåll | ✅ | Informativa bilder har alt-text (bilnamn, "Sportig bil i studiomiljö"). Dekorativa bilder (värdekort, hero-band, ikoner) har `alt=""` / `aria-hidden`. Logotypens SVG är dold och länken har namnet "Car Dealer – till startsidan". |
| 1.3.1 Information och relationer | ✅ | Landmärken (`header`, `nav` ×2 med namn, `main`, `footer`), listor för kort/egenskaper, `dl` för fakta, `fieldset/legend` för pris- och årsintervall, brödsmulor som `nav > ol`. Exakt en `h1` per sida (testat). |
| 1.3.2 Meningsfull ordningsföljd | ✅ | DOM-ordning = visuell ordning. |
| 1.3.5 Identifiera inmatningens syfte | ✅ | `autocomplete="name/email/tel"` på kontakt- och inbytesformulär. |
| 1.4.1 Användning av färg | ✅ | Aktiv menypunkt markeras med understrykning + `aria-current`, inte bara färg. Felaktiga fält har text + röd ram. |
| 1.4.3 Kontrast (minimum) | ✅ | Se ovan: axe + token-test + pixelbaserat test av text på gradienter och bilder. |
| 1.4.4 Ändra textstorlek | ✅ | Relativa enheter (rem). Täcks av omflödestestet nedan (320 px ≈ 400 % zoom av 1280 px). |
| 1.4.10 Omflöde | ✅ | Ingen horisontell scroll vid 320 CSS-px på 7 sidor (automatiskt test). **Var ett fel före:** långa sammansatta ord i rubriker ("finansieringsmöjligheter") bröts inte – nu `hyphens: auto` + `overflow-wrap`. |
| 1.4.11 Kontrast för icke-text | ✅ | Formulärfält har `gray-400`-ram (3:1 mot vitt); fokusring 3 px i primärfärg. |
| 1.4.12 Textavstånd | ✅ | Inga fasta höjder på textcontainrar (utom `line-clamp-1` på kortrubrik – full titel finns på bilsidan). |
| 1.4.13 Innehåll vid hovring/fokus | ➖ | Inga tooltips. |

### 2. Hanterbar

| Kriterium | Status | Kommentar |
|---|---|---|
| 2.1.1 Tangentbord | ✅ | Alla funktioner nås med tangentbord. Mobilmenyn är en riktig `<button>`. |
| 2.1.2 Ingen tangentbordsfälla | ✅ | Escape stänger mobilmenyn och fokus återgår till knappen (testat). |
| 2.2.2 Pausa, stoppa, dölj | ✅ | Det auto-rullande bildbandet i hero har en paus/play-knapp (`aria-pressed`). Stoppas helt vid `prefers-reduced-motion`. **Var ett fel före:** bandet kunde bara pausas med muspekaren. |
| 2.3.1 Tre blinkningar | ✅ | Logotypens "lampor" pulserar 1 gång/s – under gränsen, och stängs av vid reducerad rörelse. |
| 2.4.1 Hoppa över block | ✅ | "Hoppa till huvudinnehållet" är första tabbstopp och flyttar fokus till `main` (testat). **Saknades före.** |
| 2.4.2 Sidan har titel | ✅ | Unika titlar, t.ex. "BMW X5 xDrive30d (2019) – 449 900 kr \| Car Dealer" (testat). |
| 2.4.3 Fokusordning | ✅ | Bilkort hade tre tabbstopp till samma mål; nu två. Felsammanfattning tar fokus vid fel; bekräftelse tar fokus vid lyckat skick. |
| 2.4.4 Länkens syfte | ✅ | "Visa bil" har dold text med bilnamnet. "Visa alla bilar →" pilen är `aria-hidden`. |
| 2.4.6 Rubriker och etiketter | ✅ | Beskrivande etiketter ("Sök märke eller modell", "Högsta pris"). |
| 2.4.7 Fokus synligt | ✅ | Global `:focus-visible` med 3 px kontur + offset; på svart bakgrund i korall. Testat på första 6 tabbstoppen. |
| 2.4.11 Fokus inte dolt (minimum) | ✅ | `scroll-padding-top: 6rem` så att den klistrade headern inte täcker fokuserat element. |
| 2.5.3 Etikett i namn | ✅ | Åtgärdat (se tabellen ovan). |
| 2.5.7 Dragrörelser | ➖ | Inga drag-gester. |
| 2.5.8 Målstorlek (minimum) | ✅ | Menyknapp 44×44 px; länkar i felsammanfattningen fick extra padding efter axe-anmärkning. |

### 3. Begriplig

| Kriterium | Status | Kommentar |
|---|---|---|
| 3.1.1 Sidans språk | ✅ | `<html lang="sv">`. |
| 3.2.1 / 3.2.2 Vid fokus / inmatning | ✅ | Filter uppdaterar listan direkt men flyttar inte fokus och byter inte sida. |
| 3.2.3 Konsekvent navigering | ✅ | Samma header/footer överallt. |
| 3.2.6 Konsekvent hjälp | ✅ | Telefonnummer på samma plats (header + footer) på alla sidor. |
| 3.3.1 Identifiering av fel | ✅ | Kontaktformuläret: felsammanfattning (`role="alert"`) med länkar till fälten, `aria-invalid`, felet kopplat via `aria-describedby`. Kalkylatorer visar fel inline – **före** användes `alert()`. |
| 3.3.2 Etiketter eller instruktioner | ✅ | Obligatoriska fält markerade och förklarade överst i formuläret; "(valfritt)" på telefon. |
| 3.3.3 Förslag vid fel | ✅ | Felmeddelanden säger hur man rättar ("Exempel: namn@exempel.se"). |
| 3.3.7 Redundant inmatning | ✅ | Från bilsidan förifylls bil och ämne i kontaktformuläret. |
| 3.3.8 Tillgänglig autentisering | ✅ | Admin-inloggningen tillåter inklistring och lösenordshanterare (vanliga `input`-fält). |

### 4. Robust

| Kriterium | Status | Kommentar |
|---|---|---|
| 4.1.2 Namn, roll, värde | ✅ | `aria-expanded`/`aria-controls` på menyknapp och mobilfilter, `aria-pressed` på galleriminiatyrer och paus-knapp, `aria-current="page"` i menyn och brödsmulor. |
| 4.1.3 Statusmeddelanden | ✅ | Antal träffar i listan är `role="status"` (läses upp när filter ändras). Kalkylatorresultat i `aria-live="polite"`. Admin-notiser i `role="status"`. |

## Inte testat / rekommenderas

- ⚠️ **Skärmläsartest med riktiga hjälpmedel** (NVDA + Firefox, VoiceOver + Safari på iOS)
  har inte genomförts i den här omgången. Rekommenderas före lansering – särskilt för
  filterpanelen och kontaktformuläret.
- ⚠️ **Användartest med personer med funktionsnedsättning.**
- ⚠️ Google Maps-iframen är tredjepartsinnehåll och undantas från axe. Adressen finns även
  som text, så informationen är tillgänglig utan kartan.
- ⚠️ Admin-tabellen (`/admin`) är gjord för desktop; den scrollar horisontellt på små skärmar
  (tillåtet för datatabeller enligt 1.4.10, men kan förbättras med kortlayout).
- En **tillgänglighetsredogörelse** (krävs för offentlig sektor, rekommenderas för EAA) bör
  publiceras på sajten.
