# Car Dealer – plattform (ASP.NET Core API + SQL)

Backend för bilhandlarens plattform: lager, kundförfrågningar och personalkonton.
Webbplatsen (Next.js, i repots rot) är kundernas skyltfönster; den här API:n är
handlarens system bakom den.

```
[Webbplats (Next.js)]  →  [ASP.NET Core Web API (.NET 10)]  →  [SQL Server / Azure SQL]
   kunder                   regler, säkerhet, JWT                 lager, förfrågningar, konton
```

## Vad plattformen gör

| Område | Endpoints | Vem |
|---|---|---|
| **Lager** | `GET /api/cars` (filter, sortering, sidor) · `GET /api/cars/facets` · `GET /api/cars/{slug}` | Alla |
| | `GET /api/cars/all` · `POST /api/cars` · `PUT /api/cars/{id}` | Personal (Admin, Sales) |
| | `DELETE /api/cars/{id}` | Admin |
| **Kontaktförfrågningar** | `POST /api/leads` | Alla (rate-limit + honeypot) |
| | `GET /api/leads?status=New` · `PATCH /api/leads/{id}/status` | Personal |
| **Inbytesförfrågningar** | `POST /api/tradeins` | Alla (rate-limit + honeypot) |
| | `GET /api/tradeins` · `PATCH /api/tradeins/{id}/status` | Personal |
| **Verkstad & besiktning** | `GET /api/workshop/services` · `GET /api/workshop/days?service=` · `GET /api/workshop/availability?service=&date=` · `POST /api/workshop/bookings` | Alla (rate-limit + honeypot) |
| **Provkörning** | `GET /api/testdrive/days?car=` · `GET /api/testdrive/availability?car=&date=` · `POST /api/testdrive/bookings` | Alla (rate-limit + honeypot) |
| **Min bokning** (kund, utan konto) | `POST /api/workshop/bookings/manage` · `…/manage/cancel` · `…/manage/reschedule` | Alla med bokningsnummer + länkhemlighet, e-post eller regnr (rate-limit) |
| | `GET /api/workshop/bookings?from=&to=` · `PATCH /api/workshop/bookings/{id}/status` · `POST /api/workshop/bookings/check-in` | Personal |
| **Översikt** | `GET /api/dashboard` – bilar i lager/reserverade/sålda, nya förfrågningar, lagervärde | Personal |
| **Inloggning** | `POST /api/auth/login` → JWT · `GET /api/auth/me` | Personal |
| **Drift** | `GET /health` | Alla |

API-svaren för bilar har **samma form som webbplatsens `Car`-typ**, så webbplatsen kan
byta från statisk data till API:t utan ändringar i gränssnittet.

## Databas

| Tabell | Innehåll |
|---|---|
| `Cars` | märke, modell, år, miltal (mil), pris (SEK), bränsle, växellåda, kaross, status (`Available`, `Reserved`, `Sold`, `Draft`) |
| `CarImages`, `CarFeatures` | bilder (i ordning) och utrustning per bil |
| `Leads` | meddelanden från kontaktformuläret, kopplade till en bil när de kommer från "Boka provkörning" |
| `TradeIns` | inbytesförfrågningar |
| `Bookings` | verkstads- och besiktningstider: tjänst, datum, starttid, längd, regnr, bokningsnummer (`CD-XXXXXX`), status |
| `AspNet*` | personalkonton och roller (ASP.NET Core Identity) |

- Schemat hanteras med **EF Core-migreringar** (`src/CarDealer.Api/Data/Migrations`).
- [`sql/schema.sql`](sql/schema.sql) är samma schema som ett idempotent SQL-skript för den som vill köra det direkt i SQL Server.
- Startdata: webbplatsens 24 bilar (`Data/seed-cars.json`, genereras med `npm run seed:export` i repots rot).

## Bilstatus – tillgänglig, reserverad, såld

| Status | Lista och sök | Egen sida | Provkörning / frågor |
|---|---|---|---|
| `Available` | ja | ja | ja |
| `Reserved` | ja, märkt "Reserverad" | ja | bara frågor |
| `Sold` | ja i `soldVisibleDays` dagar (14), märkt "Såld", alltid sist | ja, alltid (gamla länkar fungerar) | nej, förslag på liknande bilar |
| `Draft` | nej | bara personal | – |

- `soldVisibleDays` ligger i `data/business.json` (policies) och används av både webbplatsen och API:t.
- Försäljningsdatumet (`SoldAt`) sätts en gång när bilen blir såld, behålls vid redigering och töms om bilen sätts tillbaka till till salu. Bilar som såldes innan datumet fanns saknar datum och visas inte i listan.
- Filter-alternativen (märke, bränsle …) räknas bara på bilar som är till salu.

## Verkstadsbokning – regler

Tjänster, priser, öppettider och kapacitet ligger i [`data/workshop.json`](../data/workshop.json), som
**både webbplatsen och API:t läser** – priserna kan inte skilja sig åt.

- Bara öppna dagar (mån–tor 08–17, fre 08–16) och jobbet måste vara klart före stängning
- Tidigast 2 timmar fram, högst 21 dagar fram (tidszon Europe/Stockholm)
- Högst så många bilar samtidigt som verkstaden har platser (`bays`: 2)
- Den sista platsen kan inte dubbelbokas: tiden kontrolleras igen i en serialiserbar transaktion (409 om någon hann före)
- Registreringsnummer valideras (ABC 123 / ABC 12D) och sparas normaliserat

## Provkörning – "Boka provkörning" på bilsidan

Samma bokningssystem som verkstaden (bokningsnummer, QR-kod, Min bokning), med egna regler:

- **Tider:** showroomens öppettider (`showroomHours` i `data/business.json`, t.ex. lör 10–15), inte verkstadens.
- **En bil åt gången:** en bil kan bara vara ute hos en kund i taget (`bays = 1`, räknas per bil). Två olika bilar kan provköras samtidigt.
- **Inga krockar med verkstaden:** provkörningar och verkstadsbokningar räknas aldrig mot varandra.
- **Bara bilar som är till salu:** sålda, reserverade och okända bilar kan inte bokas (409/404). En redan bokad provkörning kan avbokas men inte flyttas om bilen sedan blivit reserverad eller såld.
- **Längd, steg, framförhållning och ändringsfönster** ligger i `testDrive` i `data/business.json` (30 min, 2 h, 14 dagar, 24 h).
- Kunden anger namn, e-post och telefon, **inget registreringsnummer**. Bokningen hittas under Min bokning med bokningsnummer + e-post (inget regnr att matcha).
- En provkörning känns igen på `ServiceCode = "provkorning"` (och `CarId`), så den förblir en provkörning även om bilen raderas. Raderas bilen finns bokningen kvar för personalen.
- Personalens bokningslista visar bil (`carSlug`, `carTitle`). Check-in med QR fungerar som för verkstaden.

## Min bokning – kunden hanterar sin tid själv

Inget konto behövs. Bekräftelsen ger kunden tre vägar tillbaka till bokningen:

1. **Personlig länk** `…/min-bokning/?ref=CD-XXXXXX#t=<hemlighet>` (i bekräftelsen och e-posten).
   Hemligheten ligger efter `#`, så den skickas aldrig till någon server och hamnar inte i loggar.
2. **QR-kod** med samma länk – kunden öppnar bokningen i mobilen, personalen skannar den i receptionen (check-in).
3. **Bokningsnummer + e-post eller registreringsnummer** om länken har kommit bort.

Regler:

- Bara en SHA-256-hash av hemligheten sparas (`Bookings.ManageTokenHash`), jämförelsen är tidskonstant.
- Fel uppgifter och okända nummer ger exakt samma svar (404), och anropen är rate-limitade – det går inte att gissa sig fram.
- Svaret innehåller aldrig e-post eller telefon.
- Flytta/avboka går fram till `changeCutoffHours` (24 h) före besöket, sedan hänvisas kunden till telefon.
- Vid flytt räknas kundens egen gamla tid inte som upptagen, och den nya tiden kontrolleras i en serialiserbar transaktion.
- Kalenderfilen (.ics) skapas i webbläsaren.

## Kodstruktur

```
src/CarDealer.Api/
├── Controllers/      tunna HTTP-adaptrar (inga regler)
├── Services/         användningsfall bakom interfaces (Car, Lead, TradeIn, Booking, Auth, Dashboard)
├── Workshop/         katalog + ren schemaläggningsfunktion
├── Domain/           entiteter, RegistrationNumber, Slug
├── Common/           Result/Error, svenska meddelanden, valideringsgränser
├── Configuration/    Options-klasser, BusinessInfo (data/business.json)
├── Infrastructure/   uppstart per område (persistens, auth, skydd, delad data, tjänster)
└── Data/             DbContext, migreringar, DatabaseInitializer
```

Se [docs/arkitektur.md](../docs/arkitektur.md) för principerna.

## Säkerhet

- Lösenord hashas av ASP.NET Core Identity; minst 12 tecken; kontot låses 15 min efter 5 fel.
- Samma felmeddelande för fel lösenord och okänd användare (avslöjar inte vilka konton som finns).
- JWT med kort livslängd (2 h). Nyckeln sätts via miljövariabel – appen startar inte utan en nyckel på minst 32 byte.
- Första admin skapas från konfiguration (`Admin:Email`, `Admin:Password`) – inga lösenord i koden.
- Publika formulär: rate-limit per IP (5/min), honeypot-fält mot botar, validering med svenska felmeddelanden.
- CORS: bara webbplatsens egna adresser får anropa API:t från en webbläsare.
- Säkerhetsheaders, HTTPS/HSTS utanför utveckling. Inga personuppgifter skrivs till loggarna.
- API-dokumentationen (`/scalar`) är bara på i utveckling, eller med `ApiDocs:Enabled=true`.

## Kom igång lokalt

Kräver [.NET 10 SDK](https://dotnet.microsoft.com/download). Ingen databasserver behövs –
lokalt används SQLite (en fil, `cardealer.db`).

```bash
cd backend
dotnet run --project src/CarDealer.Api
```

Öppna sedan `http://localhost:5xxx/scalar` (porten skrivs ut i terminalen) för interaktiv
API-dokumentation. Utvecklingskontot är `admin@cardealer.local` / `Dev-Password-123`
(finns bara i `appsettings.Development.json`).

```bash
dotnet test        # 81 tester (integration, schemaläggning, domänregler) mot en riktig (temporär) databas
```

## Köra mot SQL Server / Azure SQL

Sätt konfiguration med miljövariabler (eller `dotnet user-secrets`) – aldrig i källkoden:

| Inställning | Exempel |
|---|---|
| `Database__Provider` | `SqlServer` |
| `ConnectionStrings__Default` | `Server=tcp:minserver.database.windows.net,1433;Database=CarDealer;...` |
| `Jwt__Key` | minst 32 slumpmässiga tecken |
| `Admin__Email`, `Admin__Password` | första administratören |
| `Cors__AllowedOrigins__0` | `https://aigenna.github.io` |

Vid start körs migreringarna automatiskt och databasen fylls med startdata.
`scripts/smoke-test.sh` startar API:t och provar det från början till slut; i CI körs det
mot en riktig SQL Server 2022-container.

## Driftsättning (förslag)

- **API:** Azure App Service (Linux, .NET 10)
- **Databas:** Azure SQL Database
- **Bilder:** Azure Blob Storage (nästa steg)

Studenter kan använda *Azure for Students* (gratis krediter).

## Nästa steg

1. Koppla webbplatsen till API:t (lager från databasen, formulären skickar på riktigt).
2. Ny personalpanel mot API:t (inloggning, bilar, förfrågningar, översikt).
3. Bilduppladdning till Blob Storage.
4. E-post: bekräftelse med personlig länk till kunden och notis till personalen
   (byt `LogNotificationService` mot en e-posttjänst – `BookingReceiptAsync` får länken). SMS-påminnelse därefter.
