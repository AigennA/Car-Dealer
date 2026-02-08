import Link from "next/link";
import CreditCalculator from "@/components/CreditCalculator";

export default function FinansieringPage() {
  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Våra Tjänster
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vi erbjuder flexibla finansieringslösningar och tjänster för att göra ditt bilköp enkelt och tryggt
          </p>
        </div>

        {/* Main Services */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <span className="text-primary text-3xl">💰</span>
            </div>
            <h2 className="text-2xl font-bold text-navy mb-4">Finansiering</h2>
            <p className="text-gray-600 mb-4">
              Vi hjälper dig att hitta den bästa finansieringslösningen för din situation. 
              Flexibla villkor och konkurrensskraftiga räntor.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Ränta från 3,95%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Lånetid upp till 84 månader</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Snabbt beslut</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Ingen kontantinsats krävs</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <span className="text-primary text-3xl">🚗</span>
            </div>
            <h2 className="text-2xl font-bold text-navy mb-4">Privatleasing</h2>
            <p className="text-gray-600 mb-4">
              Kör en ny bil utan stora engångskostnader. Allt ingår i en fast månadskostnad 
              med möjlighet att byta bil efter avtalstidens slut.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Fast månadskostnad</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Service och försäkring ingår</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Flexibel körsträcka</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Byt bil efter 24-48 månader</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <span className="text-primary text-3xl">🔁</span>
            </div>
            <h2 className="text-2xl font-bold text-navy mb-4">Inbyte</h2>
            <p className="text-gray-600 mb-4">
              Byt in din gamla bil hos oss och få en rättvis värdering. 
              Vi köper alla bilmärken och modeller.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Snabb och enkel värdering</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Rättvisa priser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Vi köper alla märken</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Smidig avveckling</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Additional Services */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-navy mb-8 text-center">Ytterligare tjänster</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-navy mb-2">Försäkring</h3>
              <p className="text-sm text-gray-600">
                Vi hjälper dig hitta rätt försäkring för din bil
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-xl">🔧</span>
              </div>
              <h3 className="font-semibold text-navy mb-2">Service & Verkstad</h3>
              <p className="text-sm text-gray-600">
                Professionell service och reparationer
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-xl">✅</span>
              </div>
              <h3 className="font-semibold text-navy mb-2">Garanti</h3>
              <p className="text-sm text-gray-600">
                Upp till 24 månaders garanti på alla bilar
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-xl">📋</span>
              </div>
              <h3 className="font-semibold text-navy mb-2">Öppet Köp</h3>
              <p className="text-sm text-gray-600">
                14 dagars öppet köp på alla bilar
              </p>
            </div>
          </div>
        </div>

        {/* Financing Calculator */}
        <CreditCalculator />

        {/* CTA Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <h2 className="text-2xl font-bold text-navy mb-4">
            Vill du veta mer om våra finansieringsmöjligheter?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Kontakta oss idag så hjälper vi dig hitta den bästa lösningen för just dig
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kontakt"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition font-medium"
            >
              Kontakta oss
            </Link>
            <Link
              href="/bilar"
              className="inline-block bg-gray-100 text-navy px-8 py-3 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Se våra bilar
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
