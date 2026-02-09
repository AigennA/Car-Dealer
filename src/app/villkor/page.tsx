import Link from "next/link";

export default function VillkorPage() {
  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Allmänna villkor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Villkor för köp och försäljning av fordon
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Senast uppdaterad: 9 februari 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-8 shadow-sm space-y-8">
          
          {/* Introduction */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">1. Allmänt</h2>
            <p className="text-gray-600 mb-4">
              Dessa allmänna villkor gäller för köp av fordon från Car Dealer AB (org.nr 556XXX-XXXX), 
              nedan kallat &quot;Säljaren&quot;. Genom att genomföra ett köp hos oss accepterar du dessa villkor.
            </p>
            <p className="text-gray-600">
              Villkoren kompletterar gällande svensk konsumentlagstiftning och kan inte inskränka de 
              rättigheter du har enligt lag.
            </p>
          </div>

          {/* Purchase Agreement */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">2. Köpeavtal</h2>
            <p className="text-gray-600 mb-4">
              Ett bindande avtal uppkommer när:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Köparen och säljaren har signerat ett köpeavtal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Eventuell handpenning har betalats</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Säljaren har bekräftat köpet skriftligen</span>
              </li>
            </ul>
          </div>

          {/* Price and Payment */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">3. Pris och betalning</h2>
            <p className="text-gray-600 mb-4">
              Alla priser anges i svenska kronor (SEK) och inkluderar moms där det är tillämpligt.
            </p>
            <ul className="space-y-2 text-gray-600 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Priset som anges vid köptillfället är bindande</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Eventuella extrakostnader (tillval, registrering, etc.) specificeras i köpeavtalet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Handpenning uppgår normalt till 10% av köpesumman</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Resterande belopp betalas vid leverans</span>
              </li>
            </ul>
            <p className="text-gray-600">
              <strong>Betalningssätt:</strong> Vi accepterar banköverföring, kortbetalning och finansiering 
              genom våra samarbetspartners.
            </p>
          </div>

          {/* Delivery */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">4. Leverans</h2>
            <p className="text-gray-600 mb-4">
              Fordonet levereras när full betalning har erlagts och eventuell finansiering är godkänd.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Leveranstid:</strong> Normalt inom 1-5 arbetsdagar efter full betalning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Leveransplats:</strong> Enligt överenskommelse, normalt från vår anläggning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Hemkörning:</strong> Kan ordnas mot extra kostnad</span>
              </li>
            </ul>
          </div>

          {/* Vehicle Inspection */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">5. Besiktning och reklamation</h2>
            <p className="text-gray-600 mb-4">
              Köparen ska inspektera fordonet vid leverans. Eventuella synliga fel eller brister ska 
              reklameras omedelbart.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Dolda fel ska reklameras inom skälig tid efter upptäckt</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Reklamation ska ske skriftligen till info@cardealer.se</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Vid befogad reklamation har köparen rätt till avhjälpande, prisavdrag eller hävning</span>
              </li>
            </ul>
          </div>

          {/* Warranty */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">6. Garanti</h2>
            <p className="text-gray-600 mb-4">
              Alla våra fordon säljs med garanti enligt följande:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700 mb-2"><strong>Grundgaranti:</strong></p>
              <ul className="space-y-1 text-sm text-gray-600 ml-4">
                <li>• 12 månaders garanti på motor och transmission</li>
                <li>• 24 månaders garanti vid tillval av utökad garanti</li>
                <li>• Garantin gäller vid normal användning och regelbunden service</li>
              </ul>
            </div>
            <p className="text-gray-600 mb-4">
              <strong>Garantin täcker inte:</strong>
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Förslitningsdelar (bromsar, däck, filter, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Skador orsakade av olycka, stöld eller felaktig hantering</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Skador som uppstått genom utebliven service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Reparationer utförda av obehörig verkstad utan vårt godkännande</span>
              </li>
            </ul>
          </div>

          {/* Right of Withdrawal */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">7. Öppet köp</h2>
            <p className="text-gray-600 mb-4">
              Vi erbjuder 14 dagars öppet köp på alla fordon:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Gäller från leveransdatum</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Fordonet får köras maximalt 100 mil</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Fordonet ska vara i samma skick som vid leverans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Administrativ avgift på 5 000 kr tillkommer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Återbetalning sker inom 14 dagar efter godkänd återlämning</span>
              </li>
            </ul>
          </div>

          {/* Trade-in */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">8. Inbyte</h2>
            <p className="text-gray-600 mb-4">
              Vi accepterar inbyte av begagnade fordon:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Inbytesvärderingen är giltig i 7 dagar från värderingsdatum</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Fordonet ska vara i det skick som angavs vid värdering</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Eventuella belåningar eller leasing ska regleras av köparen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Säljaren förbehåller sig rätten att justera inbytespriset om fordonets skick avviker</span>
              </li>
            </ul>
          </div>

          {/* Financing */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">9. Finansiering</h2>
            <p className="text-gray-600 mb-4">
              Vi förmedlar finansiering genom våra samarbetspartners:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Köpet är villkorat av godkänd kreditansökan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Ränta och villkor beslutas av finansieringsbolaget</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Eventuell kontantinsats betalas vid avtalstecknande</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Fordonet levereras när finansieringsbolaget har utbetalat lånet</span>
              </li>
            </ul>
          </div>

          {/* Liability */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">10. Ansvarsbegränsning</h2>
            <p className="text-gray-600 mb-4">
              Säljaren ansvarar för:
            </p>
            <ul className="space-y-2 text-gray-600 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Direkta skador orsakade av fel i fordonet enligt garantivillkoren</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Skador som uppkommit genom vårdslöshet eller uppsåt från säljarens sida</span>
              </li>
            </ul>
            <p className="text-gray-600">
              <strong>Säljaren ansvarar inte för:</strong>
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Indirekta skador eller följdskador</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Förlust av intäkt eller vinst</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Eventuella förseningar i leverans på grund av omständigheter utanför vår kontroll</span>
              </li>
            </ul>
          </div>

          {/* Force Majeure */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">11. Force majeure</h2>
            <p className="text-gray-600">
              Säljaren är befriad från sina åtaganden om fullgörandet hindras eller oskäligt försvåras av 
              omständigheter som ligger utanför säljarens kontroll, såsom krig, naturkatastrofer, strejk, 
              myndighetsbeslut eller liknande.
            </p>
          </div>

          {/* Personal Data */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">12. Personuppgifter</h2>
            <p className="text-gray-600">
              Vi behandlar dina personuppgifter i enlighet med vår{" "}
              <Link href="/integritet" className="text-primary hover:text-primary-dark underline">
                integritetspolicy
              </Link>
              . Genom att acceptera dessa villkor godkänner du behandlingen av dina personuppgifter 
              enligt beskrivningen i integritetspolicyn.
            </p>
          </div>

          {/* Disputes */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">13. Tvist och tillämplig lag</h2>
            <p className="text-gray-600 mb-4">
              På dessa villkor och eventuella köpeavtal tillämpas svensk rätt.
            </p>
            <p className="text-gray-600 mb-4">
              Vid tvist ska parterna i första hand försöka lösa denna genom förhandling. Om förhandling 
              inte leder till resultat kan konsumenter vända sig till Allmänna reklamationsnämnden (ARN) 
              för medling.
            </p>
            <p className="text-gray-600">
              Tvister som inte kan lösas i samförstånd ska avgöras av svensk domstol med Stockholms tingsrätt 
              som första instans.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">14. Kontaktinformation</h2>
            <p className="text-gray-600 mb-4">
              För frågor om dessa villkor, kontakta:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <p className="text-gray-700 mb-1"><strong>Car Dealer AB</strong></p>
              <p className="text-gray-600">Organisationsnummer: 556XXX-XXXX</p>
              <p className="text-gray-600">Bilvägen 123, 123 45 Stockholm</p>
              <p className="text-gray-600">E-post: info@cardealer.se</p>
              <p className="text-gray-600">Telefon: 070-000 00 00</p>
            </div>
          </div>

        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block text-primary hover:text-primary-dark transition"
          >
            ← Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </section>
  );
}
