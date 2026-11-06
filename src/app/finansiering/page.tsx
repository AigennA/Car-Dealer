import Link from "next/link";
import CreditCalculator from "@/components/CreditCalculator";
import {
  BanknotesIcon,
  CarIcon,
  ArrowsRightLeftIcon,
  ShieldIcon,
  WrenchIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from "@/components/ui/icons";
import { FeatureGrid, type Feature } from "@/components/ui/Features";
import { BUSINESS, formatPercent } from "@/config/business";
import { ROUTES } from "@/config/navigation";

const { financing, policies } = BUSINESS;
const [leaseMin, leaseMax] = financing.leasingTermMonths;
const LINK = "text-primary underline underline-offset-4";

const MAIN_SERVICES: Feature[] = [
  {
    Icon: BanknotesIcon,
    title: "Finansiering",
    text: "Vi hjälper dig att hitta den bästa finansieringslösningen för din situation. Flexibla villkor och konkurrenskraftiga räntor.",
    bullets: [
      `Ränta från ${formatPercent(financing.annualRate)}`,
      `Lånetid upp till ${Math.max(...financing.loanTermsMonths)} månader`,
      "Snabbt beslut",
      "Ingen kontantinsats krävs",
    ],
  },
  {
    Icon: CarIcon,
    title: "Privatleasing",
    text: "Kör en ny bil utan stora engångskostnader. Allt ingår i en fast månadskostnad med möjlighet att byta bil efter avtalstidens slut.",
    bullets: ["Fast månadskostnad", "Service och försäkring ingår", "Flexibel körsträcka", `Byt bil efter ${leaseMin}–${leaseMax} månader`],
  },
  {
    Icon: ArrowsRightLeftIcon,
    title: "Inbyte",
    text: <>Byt in din gamla bil hos oss och få en rättvis värdering. Vi köper alla bilmärken och modeller. <Link href={ROUTES.tradeIn} className={LINK}>Begär värdering</Link></>,
    bullets: ["Snabb och enkel värdering", "Rättvisa priser", "Vi köper alla märken", "Smidig avveckling"],
  },
];

const EXTRA_SERVICES: Feature[] = [
  { Icon: ShieldIcon, title: "Försäkring", text: "Vi hjälper dig hitta rätt försäkring för din bil" },
  { Icon: WrenchIcon, title: "Service & Verkstad", text: <>Professionell service och reparationer. <Link href={ROUTES.workshop} className={LINK}>Boka tid</Link></> },
  { Icon: ShieldCheckIcon, title: "Garanti", text: `Upp till ${policies.warrantyMonths} månaders garanti på alla bilar` },
  { Icon: DocumentTextIcon, title: "Öppet köp", text: `${policies.openPurchaseDays} dagars öppet köp på alla bilar` },
];

export default function FinansieringPage() {
  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-20 space-y-12">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">Våra Tjänster</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Vi erbjuder flexibla finansieringslösningar och tjänster för att göra ditt bilköp enkelt och tryggt
          </p>
        </header>

        <FeatureGrid items={MAIN_SERVICES} variant="card" headingLevel="h2" />

        <section aria-labelledby="extra" className="bg-white rounded-xl p-8 shadow-sm">
          <h2 id="extra" className="text-2xl font-bold text-navy mb-8 text-center">Ytterligare tjänster</h2>
          <FeatureGrid items={EXTRA_SERVICES} columns={4} />
        </section>

        <CreditCalculator />

        <section aria-labelledby="more" className="bg-white rounded-xl p-8 shadow-sm text-center">
          <h2 id="more" className="text-2xl font-bold text-navy mb-4">Vill du veta mer om våra finansieringsmöjligheter?</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">Kontakta oss idag så hjälper vi dig hitta den bästa lösningen för just dig</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={ROUTES.contact} className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium">
              Kontakta oss
            </Link>
            <Link href={ROUTES.cars} className="inline-block bg-gray-100 text-navy px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Se våra bilar
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}
