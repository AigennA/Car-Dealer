# Arkitektur och kodprinciper

Mål: koden ska gå att **sälja och anpassa** till en ny handlare utan att leta efter
värden i komponenter, och varje del ska ha **ett ansvar** och gå att testa för sig.

## Ingen hårdkodning – en källa per fakta

| Vad | Var | Läses av |
|---|---|---|
| Företagsnamn, org.nr, kontakt, adress, öppettider, garanti, öppet köp, ränta, lånetider, karta | `data/business.json` | webbplatsen (`src/config/business.ts`) och API:t (`BusinessInfo`) |
| Verkstadstjänster, priser, tider, öppettider, platser, framförhållning | `data/workshop.json` | webbplatsen (`src/lib/workshop.ts`) och API:t (`WorkshopCatalog`) |
| Startlager (24 bilar) | `src/lib/cars.ts` → `npm run seed:export` | webbplatsen och API:ts databas |
| Svenska fel- och statusmeddelanden | `src/lib/messages.ts` · `Common/Messages.cs` | formulär respektive API-validering |
| Tekniska inställningar (databas, JWT, rate limits, lösenordspolicy, CORS, API-dokumentation, filvägar) | `appsettings.json` / miljövariabler (Options-mönstret) | API:t |

**Ny handlare = byt två JSON-filer och logotypen.** Öppettider visas, grupperas
("Måndag–fredag") och blir schema.org-data automatiskt från samma värden.

## SOLID i backend

```
Controllers  →  Services (interfaces)  →  AppDbContext / domänregler
  HTTP            användningsfall          data + rena funktioner
```

| Princip | Hur |
|---|---|
| **S** – ett ansvar | Controllers översätter bara HTTP (`ResultExtensions`). Användningsfall i `Services/` (`CarService`, `BookingService` …). Filter och sortering i egna klasser. Schemaläggning är en ren funktion (`Workshop/Availability`). Uppstart i `Infrastructure/` per område. |
| **O** – öppen för utbyggnad | Nytt filter = en rad i `CarFilters`. Ny notis (e-post, SMS) = ny `INotificationService` utan att röra resten. |
| **L** – utbytbarhet | `RandomReferenceGenerator` kan bytas mot vilken `IReferenceGenerator` som helst (t.ex. i tester). |
| **I** – små gränssnitt | Ett gränssnitt per område (`ILeadService`, `ITradeInService`, `IBookingService` …) i stället för ett stort. |
| **D** – beroenden mot abstraktioner | Controllers beror på interfaces; klockan är `TimeProvider` (fast klocka i tester); konfiguration via `IOptions<T>`. |

**Fel utan exceptions:** förväntade fel (hittades inte, tiden upptagen, ogiltigt) returneras som
`Result<T>` med ett `Error`; controllern gör om dem till ProblemDetails (404/409/400/401).
Tjänsterna vet inget om HTTP.

## SOLID på webbplatsen

| Princip | Hur |
|---|---|
| **S** | `BookingWizard` (98 rader) komponerar bara: tillstånd i `useBookingFlow`, varje steg en egen komponent, bekräftelsen en egen. Validering i `lib/validation.ts`, regler i `lib/workshop.ts`. |
| **D** | Bokningen beror på gränssnittet `BookingRepository`. `ApiBookingRepository` (riktig) och `DemoBookingRepository` (statisk sajt, klocka injicerbar) väljs på **ett** ställe: `createBookingRepository()`. |
| **O** | Ny datakälla = ny klass som implementerar `BookingRepository`. |

## Tester som skyddar principerna

- Konfigurationen: gruppering av öppettider, schema.org, procentformat (`business.test.ts`)
- Samma schemaläggningsregler testas i båda språken med samma fasta klocka (`workshop.test.ts`, `WorkshopTests.cs`)
- Demo-repositoryt med injicerad klocka (`booking.test.ts`)
- API:t läser den delade affärsfilen (`DomainRulesTests`)
