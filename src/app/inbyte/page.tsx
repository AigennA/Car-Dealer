import Link from "next/link";
import TradeInForm from "@/components/contact/TradeInForm";
import {
  BoltIcon,
  BanknotesIcon,
  WrenchIcon,
  CheckIcon,
  PhoneIcon,
} from "@/components/ui/icons";

export default function InbytePage() {
  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Inbyte av din bil
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Byt in din gamla bil hos oss och få en rättvis värdering. Vi köper alla bilmärken och modeller.
          </p>
        </div>

        {/* Main Benefits */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
              <BoltIcon className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-navy mb-4">Snabb värdering</h2>
            <p className="text-gray-600">
              Få en kostnadsfri värdering av din bil inom 24 timmar. Enkelt och smidigt online eller på plats.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
              <BanknotesIcon className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-navy mb-4">Rättvisa priser</h2>
            <p className="text-gray-600">
              Vi erbjuder marknadsmässiga priser baserat på bilens skick, årsmodell och utrustning.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
              <WrenchIcon className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-navy mb-4">Alla märken</h2>
            <p className="text-gray-600">
              Vi tar emot alla bilmärken och modeller, oavsett ålder eller skick. Kontakta oss för mer information.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-navy mb-8 text-center">Så fungerar inbytet</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-navy mb-2">Fyll i uppgifter</h3>
              <p className="text-sm text-gray-600">
                Ange information om din bil i vårt formulär
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-navy mb-2">Få värdering</h3>
              <p className="text-sm text-gray-600">
                Vi återkommer med ett prisförslag inom 24 timmar
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-navy mb-2">Besiktning</h3>
              <p className="text-sm text-gray-600">
                Boka tid för besiktning av bilen på plats
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold text-navy mb-2">Klart!</h3>
              <p className="text-sm text-gray-600">
                Pengarna sätts in direkt eller används som inbyte
              </p>
            </div>
          </div>
        </div>

        {/* Trade-in Form */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-navy mb-6">Begär värdering</h2>

            <TradeInForm />
          </div>

          {/* Additional Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-navy mb-6">Varför välja oss?</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckIcon className="w-6 h-6 shrink-0 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Snabb och enkel värdering</h3>
                    <p className="text-gray-600 text-sm">
                      Få svar inom 24 timmar och boka tid för besiktning som passar dig
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckIcon className="w-6 h-6 shrink-0 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Rättvisa priser</h3>
                    <p className="text-gray-600 text-sm">
                      Vi ger dig ett marknadsmässigt pris baserat på bilens faktiska värde
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckIcon className="w-6 h-6 shrink-0 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Vi köper alla märken</h3>
                    <p className="text-gray-600 text-sm">
                      Oavsett märke, modell eller ålder - vi är intresserade av din bil
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckIcon className="w-6 h-6 shrink-0 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Smidig avveckling</h3>
                    <p className="text-gray-600 text-sm">
                      Vi tar hand om all pappersarbete och gör processen så enkel som möjligt
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-primary-dark to-primary rounded-xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Vill du ha råd direkt?</h3>
              <p className="mb-6 opacity-90">
                Ring oss så hjälper vi dig med en snabb värdering över telefon
              </p>
              <div className="space-y-2">
                <p className="font-semibold flex items-center gap-2">
                  <PhoneIcon className="w-5 h-5 shrink-0" />
                  <span>070-000 00 00</span>
                </p>
                <p className="text-sm opacity-90">Mån-Fre 09:00-18:00</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-navy mb-4">Upptäck våra bilar</h3>
              <p className="text-gray-600 mb-4">
                Kanske finns din nästa bil redan i vårt lager?
              </p>
              <Link
                href="/bilar"
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition font-medium"
              >
                Se vårt lager
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-navy mb-8 text-center">Vanliga frågor</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div>
              <h3 className="font-semibold text-navy mb-2">Hur snabbt får jag en värdering?</h3>
              <p className="text-gray-600 text-sm">
                Vi återkommer normalt inom 24 timmar med ett prisförslag baserat på din information.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-navy mb-2">Måste jag köpa en bil hos er?</h3>
              <p className="text-gray-600 text-sm">
                Nej, du kan sälja din bil till oss även om du inte köper en ny bil. Vi köper in bilar direkt.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-navy mb-2">Tar ni emot alla bilmärken?</h3>
              <p className="text-gray-600 text-sm">
                Ja, vi köper alla bilmärken och modeller oavsett ålder eller miltal.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-navy mb-2">Hur betalas pengarna ut?</h3>
              <p className="text-gray-600 text-sm">
                Pengarna sätts in direkt på ditt konto eller kan användas som inbyte mot en ny bil.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-navy mb-2">Vad händer om jag har lån på bilen?</h3>
              <p className="text-gray-600 text-sm">
                Vi hjälper dig att lösa lånet och tar hand om kontakten med din bank.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-navy mb-2">Kostar värderingen något?</h3>
              <p className="text-gray-600 text-sm">
                Nej, värderingen är helt kostnadsfri och utan förpliktelser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
