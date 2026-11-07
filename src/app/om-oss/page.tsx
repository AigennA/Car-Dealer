import Link from "next/link";
import PersonPhoto from "@/components/people/PersonPhoto";
import { FeatureGrid, type Feature } from "@/components/ui/Features";
import { SITE, TEAM } from "@/lib/site";
import {
  TargetIcon,
  ShieldCheckIcon,
  DiamondIcon,
  StarOutlineIcon,
} from "@/components/ui/icons";
import { ROUTES } from "@/config/navigation";

const VALUES: Feature[] = [
  { Icon: TargetIcon, title: "Kvalitet", text: "Alla våra bilar genomgår noggrann kontroll och uppfyller högsta kvalitetsstandarder" },
  { Icon: ShieldCheckIcon, title: "Trygghet", text: "Vi erbjuder garanti, försäkring och öppet köp för din trygghet" },
  { Icon: DiamondIcon, title: "Transparens", text: "Öppen och ärlig kommunikation i alla våra affärer" },
  { Icon: StarOutlineIcon, title: "Service", text: "Professionell service och support under hela din kundresa" },
];

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
            {SITE.legalName} grundades {SITE.foundedYear} med en vision om att göra bilaffärer enklare, tryggare och mer transparent. 
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
        <section aria-labelledby="values" className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <h2 id="values" className="text-2xl font-bold text-navy mb-6">Våra värderingar</h2>
          <FeatureGrid items={VALUES} columns={4} />
        </section>

        {/* Team */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-navy mb-6 text-center">Vårt team</h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Vi är ett dedikerat team av bilexperter som brinner för att hjälpa våra kunder 
            hitta rätt bil och skapa långsiktiga relationer.
          </p>
          <ul className="grid md:grid-cols-3 gap-8">
            {TEAM.map((p) => (
              <li key={p.name} className="text-center">
                <PersonPhoto src={p.photo} name={p.name} size={128} className="mx-auto mb-4" />
                <h3 className="font-semibold text-navy mb-1">{p.name}</h3>
                <p className="text-sm text-primary mb-2">{p.role}</p>
                <p className="text-sm text-gray-700">{p.bio}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Section */}
        <div className="bg-brand rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Redo att hitta din nästa bil?
          </h2>
          <p className="mb-6 opacity-90 max-w-2xl mx-auto">
            Besök oss idag eller kontakta vårt team så hjälper vi dig att hitta den perfekta bilen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={ROUTES.cars}
              className="inline-block bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
            >
              Se våra bilar
            </Link>
            <Link
              href={ROUTES.contact}
              className="inline-block bg-black/20 text-white px-8 py-3 rounded-lg hover:bg-black/30 transition font-medium border border-white/30"
            >
              Kontakta oss
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
