import Link from "next/link";

export default function OmOssPage() {
  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Om oss
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Din pålitliga partner för bilaffärer sedan 2020
          </p>
        </div>

        {/* Company Story */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-navy mb-4">Vår historia</h2>
          <p className="text-gray-600 mb-4">
            Car Dealer AB grundades 2020 med en vision om att göra bilaffärer enklare, tryggare och mer transparent. 
            Vi är en modern bilhandel som kombinerar traditionell service med digital innovation för att ge våra kunder 
            den bästa upplevelsen.
          </p>
          <p className="text-gray-600 mb-4">
            Med många års erfarenhet inom bilbranschen har vi byggt upp ett förtroende hos våra kunder genom att 
            alltid sätta kvalitet och kundnöjdhet i första rummet. Varje bil i vårt lager genomgår en noggrann 
            kvalitetskontroll innan den erbjuds till försäljning.
          </p>
          <p className="text-gray-600">
            Idag är vi stolta över att vara en av de ledande bilhandlarna i regionen med hundratals nöjda kunder 
            och ett ständigt växande utbud av kvalitetsbilar.
          </p>
        </div>

        {/* Values */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-navy mb-6">Våra värderingar</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl">🎯</span>
              </div>
              <h3 className="font-semibold text-navy mb-2">Kvalitet</h3>
              <p className="text-sm text-gray-600">
                Alla våra bilar genomgår noggrann kontroll och uppfyller högsta kvalitetsstandarder
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl">🤝</span>
              </div>
              <h3 className="font-semibold text-navy mb-2">Trygghet</h3>
              <p className="text-sm text-gray-600">
                Vi erbjuder garanti, försäkring och öppet köp för din trygghet
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl">💎</span>
              </div>
              <h3 className="font-semibold text-navy mb-2">Transparens</h3>
              <p className="text-sm text-gray-600">
                Öppen och ärlig kommunikation i alla våra affärer
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl">⭐</span>
              </div>
              <h3 className="font-semibold text-navy mb-2">Service</h3>
              <p className="text-sm text-gray-600">
                Professionell service och support under hela din kundresa
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-navy mb-6 text-center">Vårt team</h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Vi är ett dedikerat team av bilexperter som brinner för att hjälpa våra kunder 
            hitta rätt bil och skapa långsiktiga relationer.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold text-navy mb-1">Erik Andersson</h3>
              <p className="text-sm text-primary mb-2">VD & Grundare</p>
              <p className="text-sm text-gray-600">
                Med 15 års erfarenhet inom bilbranschen leder Erik företaget med passion och vision
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold text-navy mb-1">Maria Svensson</h3>
              <p className="text-sm text-primary mb-2">Försäljningschef</p>
              <p className="text-sm text-gray-600">
                Maria hjälper våra kunder att hitta drömvagnen med expertis och engagemang
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold text-navy mb-1">Johan Karlsson</h3>
              <p className="text-sm text-primary mb-2">Finansieringsrådgivare</p>
              <p className="text-sm text-gray-600">
                Johan ser till att varje kund får den bästa finansieringslösningen för sina behov
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-primary to-[#0099CC] rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Redo att hitta din nästa bil?
          </h2>
          <p className="mb-6 opacity-90 max-w-2xl mx-auto">
            Besök oss idag eller kontakta vårt team så hjälper vi dig att hitta den perfekta bilen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/bilar"
              className="inline-block bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
            >
              Se våra bilar
            </Link>
            <Link
              href="/kontakt"
              className="inline-block bg-white/10 text-white px-8 py-3 rounded-lg hover:bg-white/20 transition font-medium border border-white/30"
            >
              Kontakta oss
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
