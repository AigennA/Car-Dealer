# Kvalitetsdokumentation – Car Dealer

Granskningar och mätningar som gjordes när sajten lyftes från ett Lighthouse-resultat
på 58 till produktionskvalitet.

| Dokument | Innehåll |
|---|---|
| [lighthouse-rapport.md](lighthouse-rapport.md) | Prestanda före/efter, mätmetod, vad som ändrades och varför |
| [wcag-granskning.md](wcag-granskning.md) | WCAG 2.2 nivå AA – automatiska resultat + manuell checklista per kriterium |
| [heuristisk-utvardering.md](heuristisk-utvardering.md) | Heuristisk utvärdering enligt Nielsens 10 heuristiker, med allvarlighetsgrad |
| [kodgranskning.md](kodgranskning.md) | Kodgranskning: buggar, arkitektur, säkerhet, rekommendationer |
| [teststrategi.md](teststrategi.md) | Testpyramid, vad som testas, hur man kör testerna, CI |

Snabbstart:

```bash
npm ci
npm run check        # lint + typer + enhetstester + bygge + E2E/WCAG
npm run lighthouse   # Lighthouse CI med budgetar (kräver npm run build:test först)
```
