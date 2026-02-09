import Link from "next/link";

export default function IntegritetPage() {
  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Integritetspolicy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vi värnar om din integritet och dina personuppgifter
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Senast uppdaterad: 9 februari 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-8 shadow-sm space-y-8">
          
          {/* Introduction */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">1. Introduktion</h2>
            <p className="text-gray-600 mb-4">
              Car Dealer AB (org.nr 556XXX-XXXX) värnar om din integritet och är engagerade i att skydda dina 
              personuppgifter. Denna integritetspolicy förklarar hur vi samlar in, använder, delar och skyddar 
              dina personuppgifter i enlighet med EU:s dataskyddsförordning (GDPR).
            </p>
            <p className="text-gray-600">
              Genom att använda vår webbplats eller våra tjänster samtycker du till att vi behandlar dina 
              personuppgifter enligt denna policy.
            </p>
          </div>

          {/* Personal Data Controller */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">2. Personuppgiftsansvarig</h2>
            <p className="text-gray-600 mb-4">
              Car Dealer AB är personuppgiftsansvarig för behandlingen av dina personuppgifter.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <p className="text-gray-700 mb-1"><strong>Car Dealer AB</strong></p>
              <p className="text-gray-600">Bilvägen 123</p>
              <p className="text-gray-600">123 45 Stockholm</p>
              <p className="text-gray-600">E-post: info@cardealer.se</p>
              <p className="text-gray-600">Telefon: 070-000 00 00</p>
            </div>
          </div>

          {/* What Data We Collect */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">3. Vilka personuppgifter vi samlar in</h2>
            <p className="text-gray-600 mb-4">
              Vi kan samla in följande typer av personuppgifter:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Kontaktuppgifter:</strong> Namn, e-postadress, telefonnummer och adress</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Identifikationsuppgifter:</strong> Personnummer (vid kreditansökan)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Ekonomisk information:</strong> Inkomst och kreditvärdighet (vid finansiering)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Fordonsinformation:</strong> Information om din nuvarande bil (vid inbyte)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Tekniska uppgifter:</strong> IP-adress, webbläsartyp och besöksstatistik</span>
              </li>
            </ul>
          </div>

          {/* How We Use Data */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">4. Hur vi använder dina personuppgifter</h2>
            <p className="text-gray-600 mb-4">
              Vi använder dina personuppgifter för följande ändamål:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Hantera din förfrågan eller beställning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Bearbeta finansieringsansökningar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Värdera din bil vid inbyte</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Kommunicera med dig om ditt köp eller våra tjänster</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Förbättra vår webbplats och våra tjänster</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Skicka marknadsföring (endast med ditt samtycke)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Uppfylla rättsliga skyldigheter</span>
              </li>
            </ul>
          </div>

          {/* Legal Basis */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">5. Rättslig grund för behandling</h2>
            <p className="text-gray-600 mb-4">
              Vi behandlar dina personuppgifter baserat på:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Avtal:</strong> För att fullgöra vårt avtal med dig</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Rättslig förpliktelse:</strong> För att uppfylla lagar och regler</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Berättigat intresse:</strong> För att utveckla och förbättra våra tjänster</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Samtycke:</strong> För marknadsföring och nyhetsbrev</span>
              </li>
            </ul>
          </div>

          {/* Data Sharing */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">6. Delning av personuppgifter</h2>
            <p className="text-gray-600 mb-4">
              Vi kan dela dina personuppgifter med:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Finansieringspartners:</strong> För att behandla kreditansökningar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Försäkringsbolag:</strong> För att tillhandahålla försäkringstjänster</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Leverantörer:</strong> Som hjälper oss driva vår verksamhet (IT-system, betalningar)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Myndigheter:</strong> När det krävs enligt lag</span>
              </li>
            </ul>
            <p className="text-gray-600 mt-4">
              Vi säkerställer att alla tredje parter behandlar dina uppgifter säkert och i enlighet med GDPR.
            </p>
          </div>

          {/* Data Storage */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">7. Lagring av personuppgifter</h2>
            <p className="text-gray-600 mb-4">
              Vi sparar dina personuppgifter endast så länge det är nödvändigt för de ändamål de samlades in för:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Kunduppgifter:</strong> Under avtalets giltighetstid plus 7 år (bokföringslag)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Marknadsföring:</strong> Tills du återkallar ditt samtycke</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Webbstatistik:</strong> Maximalt 24 månader</span>
              </li>
            </ul>
          </div>

          {/* Your Rights */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">8. Dina rättigheter</h2>
            <p className="text-gray-600 mb-4">
              Du har rätt att:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Få tillgång:</strong> Begära kopia av dina personuppgifter</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Rättelse:</strong> Korrigera felaktiga eller ofullständiga uppgifter</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Radering:</strong> Begära att vi raderar dina uppgifter (&quot;rätten att bli glömd&quot;)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Begränsning:</strong> Begränsa behandlingen av dina uppgifter</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Dataportabilitet:</strong> Få dina uppgifter i ett strukturerat format</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Invändning:</strong> Invända mot behandling baserad på berättigat intresse</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Återkalla samtycke:</strong> När som helst för marknadsföring</span>
              </li>
            </ul>
            <p className="text-gray-600 mt-4">
              För att utöva dina rättigheter, kontakta oss på info@cardealer.se.
            </p>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">9. Säkerhet</h2>
            <p className="text-gray-600">
              Vi använder tekniska och organisatoriska säkerhetsåtgärder för att skydda dina personuppgifter mot 
              obehörig åtkomst, förlust eller missbruk. Detta inkluderar kryptering, brandväggar, säkra servrar 
              och begränsad åtkomst till uppgifter.
            </p>
          </div>

          {/* Cookies */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">10. Cookies</h2>
            <p className="text-gray-600">
              Vi använder cookies för att förbättra din upplevelse på vår webbplats. Cookies är små textfiler 
              som lagras på din enhet. Du kan när som helst ändra dina cookie-inställningar i din webbläsare.
            </p>
          </div>

          {/* Changes to Policy */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">11. Ändringar av policyn</h2>
            <p className="text-gray-600">
              Vi kan uppdatera denna integritetspolicy från tid till annan. Eventuella ändringar publiceras på 
              denna sida med ett uppdaterat datum. Vi rekommenderar att du regelbundet läser igenom policyn.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-2xl font-bold text-navy mb-4">12. Kontakta oss</h2>
            <p className="text-gray-600 mb-4">
              Om du har frågor om hur vi behandlar dina personuppgifter eller vill utöva dina rättigheter, 
              kontakta oss:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <p className="text-gray-700 mb-2"><strong>E-post:</strong> info@cardealer.se</p>
              <p className="text-gray-700 mb-2"><strong>Telefon:</strong> 070-000 00 00</p>
              <p className="text-gray-700"><strong>Post:</strong> Car Dealer AB, Bilvägen 123, 123 45 Stockholm</p>
            </div>
            <p className="text-gray-600 mt-4">
              Du har också rätt att lämna in ett klagomål till Integritetsskyddsmyndigheten (IMY) om du anser 
              att vi behandlar dina personuppgifter på ett felaktigt sätt.
            </p>
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
