import Link from "next/link";
import TradeInForm from "@/components/contact/TradeInForm";
import { BoltIcon, BanknotesIcon, WrenchIcon, PhoneIcon } from "@/components/ui/icons";
import { CheckList, Faq, FeatureGrid, StepList, type Feature } from "@/components/ui/Features";
import { SITE } from "@/lib/site";
import { ROUTES } from "@/config/navigation";

const hours = SITE.policies.responseHours;

const BENEFITS: Feature[] = [
  { Icon: BoltIcon, title: "Snabb värdering", text: `Få en kostnadsfri värdering av din bil inom ${hours} timmar. Enkelt och smidigt online eller på plats.` },
  { Icon: BanknotesIcon, title: "Rättvisa priser", text: "Vi erbjuder marknadsmässiga priser baserat på bilens skick, årsmodell och utrustning." },
  { Icon: WrenchIcon, title: "Alla märken", text: "Vi tar emot alla bilmärken och modeller, oavsett ålder eller skick. Kontakta oss för mer information." },
];

const STEPS = [
  { title: "Fyll i uppgifter", text: "Ange information om din bil i vårt formulär" },
  { title: "Få värdering", text: `Vi återkommer med ett prisförslag inom ${hours} timmar` },
  { title: "Besiktning", text: "Boka tid för besiktning av bilen på plats" },
  { title: "Klart!", text: "Pengarna sätts in direkt eller används som inbyte" },
];

const WHY_US = [
  { title: "Snabb och enkel värdering", text: `Få svar inom ${hours} timmar och boka tid för besiktning som passar dig` },
  { title: "Rättvisa priser", text: "Vi ger dig ett marknadsmässigt pris baserat på bilens faktiska värde" },
  { title: "Vi köper alla märken", text: "Oavsett märke, modell eller ålder – vi är intresserade av din bil" },
  { title: "Smidig avveckling", text: "Vi tar hand om allt pappersarbete och gör processen så enkel som möjligt" },
];

const FAQ = [
  { q: "Hur snabbt får jag en värdering?", a: `Vi återkommer normalt inom ${hours} timmar med ett prisförslag baserat på din information.` },
  { q: "Måste jag köpa en bil hos er?", a: "Nej, du kan sälja din bil till oss även om du inte köper en ny bil. Vi köper in bilar direkt." },
  { q: "Tar ni emot alla bilmärken?", a: "Ja, vi köper alla bilmärken och modeller oavsett ålder eller miltal." },
  { q: "Hur betalas pengarna ut?", a: "Pengarna sätts in direkt på ditt konto eller kan användas som inbyte mot en ny bil." },
  { q: "Vad händer om jag har lån på bilen?", a: "Vi hjälper dig att lösa lånet och tar hand om kontakten med din bank." },
  { q: "Kostar värderingen något?", a: "Nej, värderingen är helt kostnadsfri och utan förpliktelser." },
];

const CARD = "bg-white rounded-xl p-8 shadow-sm";

export default function InbytePage() {
  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-20 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">Inbyte av din bil</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Byt in din gamla bil hos oss och få en rättvis värdering. Vi köper alla bilmärken och modeller.
          </p>
        </header>

        <FeatureGrid items={BENEFITS} variant="card" headingLevel="h2" />

        <section aria-labelledby="how" className={CARD}>
          <h2 id="how" className="text-2xl font-bold text-navy mb-8 text-center">Så fungerar inbytet</h2>
          <StepList steps={STEPS} />
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          <section aria-labelledby="valuation" className={CARD}>
            <h2 id="valuation" className="text-2xl font-bold text-navy mb-6">Begär värdering</h2>
            <TradeInForm />
          </section>

          <div className="space-y-6">
            <section aria-labelledby="why" className={CARD}>
              <h2 id="why" className="text-2xl font-bold text-navy mb-6">Varför välja oss?</h2>
              <CheckList items={WHY_US} />
            </section>

            <section aria-labelledby="call" className="bg-brand rounded-xl p-8 text-white">
              <h2 id="call" className="text-xl font-bold mb-4">Vill du ha råd direkt?</h2>
              <p className="mb-6">Ring oss så hjälper vi dig med en snabb värdering över telefon</p>
              <p className="font-semibold flex items-center gap-2">
                <PhoneIcon className="w-5 h-5 shrink-0" />
                <a href={SITE.phoneHref} className="underline underline-offset-4">{SITE.phone}</a>
              </p>
              <p className="text-sm mt-2">{SITE.openingHours}</p>
            </section>

            <section aria-labelledby="discover" className={CARD}>
              <h2 id="discover" className="text-lg font-bold text-navy mb-4">Upptäck våra bilar</h2>
              <p className="text-gray-700 mb-4">Kanske finns din nästa bil redan i vårt lager?</p>
              <Link href={ROUTES.cars} className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                Se vårt lager
              </Link>
            </section>
          </div>
        </div>

        <section aria-labelledby="faq" className={CARD}>
          <h2 id="faq" className="text-2xl font-bold text-navy mb-6">Vanliga frågor</h2>
          <Faq items={FAQ} />
        </section>
      </div>
    </section>
  );
}
