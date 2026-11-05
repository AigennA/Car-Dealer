# Heuristisk utvärdering

**Metod:** Expertgranskning enligt Jakob Nielsens 10 användbarhetsheuristiker.
Varje problem har fått en allvarlighetsgrad enligt Nielsens skala:

| Grad | Betydelse |
|---|---|
| 0 | Inget användbarhetsproblem |
| 1 | Kosmetiskt – åtgärda om tid finns |
| 2 | Mindre problem – låg prioritet |
| 3 | Stort problem – hög prioritet |
| 4 | Katastrof – måste åtgärdas före lansering |

**Granskade flöden:**
1. Hitta en bil från startsidan (snabbsök → lista → bilsida)
2. Filtrera och sortera i lagret – på mobil och desktop
3. Räkna på billån
4. Boka provkörning / kontakta säljaren om en specifik bil
5. Begära inbytesvärdering

**Granskad version:** commit `fd96c46` (före) och denna gren (efter).
**Begränsning:** en granskare. Nielsen rekommenderar 3–5 oberoende granskare – resultatet bör
kompletteras med användartester (se sist).

---

## Resultat per heuristik

### H1 – Synlighet av systemstatus

| # | Problem (före) | Grad | Åtgärd | Status |
|---|---|---|---|---|
| 1.1 | Filtren uppdaterade listan direkt, men det fanns en "Sök"-knapp längst ner som inte gjorde något. Användaren vet inte om filtret har verkställts. | 3 | Knappen borttagen. Antal träffar visas överst och läses upp av skärmläsare (`role="status"`). På mobil visas "Visar X bilar" i panelen och ett märke med antal aktiva filter på filterknappen. | ✅ |
| 1.2 | Bilsidan saknade information om var man är; bara en "← Tillbaka"-länk. | 2 | Brödsmulor: Hem / Lager / *Bilnamn*. | ✅ |
| 1.3 | `/bilar` och bilsidor blinkade "Laddar…" vid varje sidladdning. | 2 | Innehållet finns i den statiska HTML:en – ingen laddningstext. | ✅ |
| 1.4 | Lånekalkylatorn visade resultat först efter klick på "Beräkna". | 1 | Resultatet uppdateras medan man skriver. | ✅ |
| 1.5 | Kontaktformuläret visar "Tack för ditt meddelande!" men **skickar inget** – det finns ingen backend. | **4** | Ej åtgärdat i kod (kräver backend/tjänst). Se rekommendationer. | ⚠️ |

### H2 – Överensstämmelse mellan systemet och verkligheten

| # | Problem (före) | Grad | Åtgärd | Status |
|---|---|---|---|---|
| 2.1 | Hero lovade "200+ bilar i lager", "hundratals handplockade bilar" och "5★ kundbetyg" – lagret har 24 bilar och betyget har ingen källa. Skadar förtroendet när användaren ser listan. | 3 | Siffrorna räknas från datan (`cars.length`). "5★" ersatt med verifierbara löften: 24 mån garanti, 14 dagars öppet köp. | ✅ |
| 2.2 | Menyvalet "Tjänster" ledde till en sida som i första hand handlar om finansiering; "Inbyte" och "Om oss" fanns bara i sidfoten. | 2 | Menyn: Hem · Lager · Finansiering · Inbyte · Om oss · Kontakt. | ✅ |
| 2.3 | "Admin" var en framträdande knapp i den publika headern. Kunder förstår inte vad den är till för. | 2 | Flyttad till sidfoten som "Personalinloggning". `/admin` är `noindex` och blockerad i `robots.txt`. | ✅ |

### H3 – Användarkontroll och frihet

| # | Problem (före) | Grad | Åtgärd | Status |
|---|---|---|---|---|
| 3.1 | Hero-bildbandet rullar oändligt och kunde bara pausas med muspekare – inte på mobil eller med tangentbord. | 2 | Paus/play-knapp. Stoppas vid "minska rörelse". | ✅ |
| 3.2 | Mobilmenyn: ikonen ändrades inte till ett kryss och menyn kunde inte stängas med Escape. | 2 | Kryssikon när öppen, Escape stänger, fokus återgår. | ✅ |
| 3.3 | "Rensa"-länken för filter var liten och grå. | 1 | "Rensa alla" understruken i primärfärg; tomt läge har en tydlig knapp "Rensa alla filter". | ✅ |

### H4 – Konsekvens och standarder

| # | Problem (före) | Grad | Åtgärd | Status |
|---|---|---|---|---|
| 4.1 | Två hero-knappar ("Utforska mer", "Se alla bilar") ledde till samma sida. | 2 | Primär: "Se alla bilar". Sekundär: "Räkna på billån" (annan uppgift). | ✅ |
| 4.2 | Kontaktsidan använde textetiketter som ikoner: "tel", "@", "adr", "TID". | 2 | Riktiga SVG-ikoner i samma stil som resten av sajten. | ✅ |
| 4.3 | Telefonnummer och e-post var inte klickbara. | 2 | `tel:`- och `mailto:`-länkar i header, sidfot, kontakt- och bilsida. | ✅ |
| 4.4 | Olika hover-effekter på primärknappar (`brightness-90` vs mörkare färg). | 1 | Enhetligt `hover:bg-primary-dark`. | ✅ |
| 4.5 | Bilsidans pris formaterades med webbläsarens språk (`toLocaleString()` utan `sv-SE`) – kunde bli "249,900". | 2 | Alltid `sv-SE`: "249 900 kr". | ✅ |

### H5 – Förebygga fel

| # | Problem (före) | Grad | Åtgärd | Status |
|---|---|---|---|---|
| 5.1 | Sifferfält tillät negativa värden (pris, år, miltal, kontantinsats). | 2 | `min`, `step`, `inputMode="numeric"` och värden < 0 klampas till 0. | ✅ |
| 5.2 | Kontaktformuläret validerade bara namnet; felaktig e-post gick igenom. | 3 | Validering av namn, e-post (format), telefon (format) och meddelande (minst 10 tecken). | ✅ |

### H6 – Känna igen hellre än att minnas

| # | Problem (före) | Grad | Åtgärd | Status |
|---|---|---|---|---|
| 6.1 | "Boka provkörning" på en bilsida ledde till ett tomt kontaktformulär – användaren måste komma ihåg och skriva in vilken bil det gällde. | 3 | Bil, ämne ("Boka provkörning") och ett startmeddelande förifylls (`/kontakt?bil=…&amne=provkorning`). | ✅ |
| 6.2 | Bilsidan visade fakta som lösa "badges" utan etiketter ("2017", "AWD", "Kombi"). | 2 | Faktaruta med etiketter: Årsmodell, Miltal, Bränsle, Växellåda, Drivning, Kaross, Färg. | ✅ |

### H7 – Flexibilitet och effektivitet

| # | Problem (före) | Grad | Åtgärd | Status |
|---|---|---|---|---|
| 7.1 | Ingen genväg till att ringa – vanligaste kontaktvägen vid bilköp. | 2 | Telefonnummer i headern (desktop) och mobilmenyn; "Ring oss" på bilsidan. | ✅ |
| 7.2 | Filter sparas inte i URL:en – en sökning kan inte delas eller bokmärkas, och försvinner vid "tillbaka". | 2 | Ej åtgärdat. | ⚠️ |
| 7.3 | Inga favoriter/jämförelse mellan bilar. | 1 | Ej åtgärdat (förslag). | ⚠️ |

### H8 – Estetisk och minimalistisk design

| # | Problem (före) | Grad | Åtgärd | Status |
|---|---|---|---|---|
| 8.1 | På mobil kom hela filterpanelen (9 fält, ~900 px) före första bilen. | 3 | Filtren fälls ihop bakom en knapp på mobil; bilarna syns direkt. | ✅ |
| 8.2 | Startsidan har två sektioner med överlappande budskap ("tjänster"-ikonerna och "Varför välja oss?" nämner båda garanti/trygghet/finansiering). | 1 | Sektionerna separerade visuellt (olika bakgrund). Sammanslagning rekommenderas. | ⚠️ |

### H9 – Hjälpa användare att känna igen, förstå och åtgärda fel

| # | Problem (före) | Grad | Åtgärd | Status |
|---|---|---|---|---|
| 9.1 | Kalkylatorerna använde `alert()` – blockerande dialog utan koppling till fältet. | 3 | Felet visas vid fältet, fältet markeras `aria-invalid`. | ✅ |
| 9.2 | Formulärfel visades bara via webbläsarens inbyggda bubblor (olika i varje webbläsare, försvinner). | 2 | Felsammanfattning överst med länkar till fälten + fel under varje fält, med konkret instruktion. | ✅ |
| 9.3 | 404-sidan var Next.js engelska standardsida. | 2 | Svensk 404 med förklaring ("bilen kan redan vara såld") och vägar vidare. | ✅ |
| 9.4 | Tomt sökresultat: "Inga bilar hittades med dessa filter." utan förslag. | 1 | Rubrik + förslag ("ta bort något filter eller vidga prisintervallet") + knapp. | ✅ |

### H10 – Hjälp och dokumentation

| # | Problem (före) | Grad | Åtgärd | Status |
|---|---|---|---|---|
| 10.1 | Ingen information om hur ett köp går till (provkörning → finansiering → leverans). | 2 | Ej åtgärdat. Förslag: "Så går köpet till" + FAQ. | ⚠️ |
| 10.2 | Det står inte vad "mil" betyder för internationella besökare / att räntan är indikativ. | 1 | Räntan är märkt "indikativ". "mil" behålls (svensk målgrupp). | ✅ |

---

## Sammanställning

| Grad | Hittade | Åtgärdade | Kvar |
|---|---|---|---|
| 4 – Katastrof | 1 | 0 | **1** (formulär skickar inget) |
| 3 – Stort | 6 | 6 | 0 |
| 2 – Mindre | 17 | 15 | 2 |
| 1 – Kosmetiskt | 7 | 5 | 2 |
| **Totalt** | **31** | **26** | **5** |

## Rekommendationer (prioriterad ordning)

1. **(Grad 4) Koppla formulären till en riktig mottagare** – t.ex. Formspree, Netlify Forms,
   en e-posttjänst eller ett eget API. Tills dess bör texten ändras från "Tack för ditt
   meddelande!" till att hänvisa till telefon/e-post, så att kunder inte tror att de fått kontakt.
2. Spara filter och sortering i URL:en (`?make=Volvo&priceMax=300000&sort=price-asc`).
3. Lägg till "Så går köpet till" + FAQ (garanti, öppet köp, leverans, inbyte).
4. Slå ihop startsidans två "varför oss"-sektioner.
5. **Användartest** med 5 personer på flöde 1, 2 och 4 (tänka högt), och minst en person som
   använder skärmläsare.
