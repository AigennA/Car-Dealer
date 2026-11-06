import type { Metadata } from "next";
import Link from "next/link";
import BookingWizard from "@/components/workshop/BookingWizard";
import ServiceList from "@/components/workshop/ServiceList";
import { ShieldCheckIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Besiktning – förbesiktning och kontrollbesiktning",
  description:
    "Vi förbesiktar bilen, åtgärdar fel och kör den till kontrollbesiktning hos vår besiktningspartner. Boka tid online.",
};

const STEPS = [
  { title: "Boka tid", text: "Välj förbesiktning eller kontrollbesiktning via partner och en tid som passar dig." },
  { title: "Vi förbesiktar", text: "Vi går igenom bilen enligt besiktningsprotokollet och ringer innan vi åtgärdar något." },
  { title: "Vi kör till besiktningen", text: "Vi bokar tid hos vår ackrediterade besiktningspartner och kör dit bilen åt dig." },
  { title: "Du hämtar bilen", text: "Besiktningsprotokollet får du med bilen. Blir det ombesiktning ordnar vi det." },
];

export default function BesiktningPage() {
  return (
    <div className="bg-surface">
      <section className="bg-linear-to-br from-[#00507a] to-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em]">
            <ShieldCheckIcon className="h-5 w-5" /> Besiktning
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-5xl">Besiktning utan krångel</h1>
          <p className="mt-4 max-w-2xl text-lg">
            Vi förbesiktar bilen, åtgärdar det som behövs och kör den till kontrollbesiktning hos vår
            besiktningspartner. Du behöver bara lämna och hämta.
          </p>
          <a href="#boka" className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-primary-dark hover:bg-gray-100 transition-colors">
            Boka besiktning
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-12 pb-20">
        <section aria-labelledby="sa-funkar" className="mb-14">
          <h2 id="sa-funkar" className="mb-6 text-3xl font-bold text-navy">Så går det till</h2>
          <ol className="grid gap-4 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <span aria-hidden="true" className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="font-heading text-lg font-semibold text-navy">{s.title}</h3>
                <p className="mt-2 text-gray-700">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="besiktning-priser" className="mb-14">
          <h2 id="besiktning-priser" className="mb-6 text-3xl font-bold text-navy">Tjänster och priser</h2>
          <ServiceList category="besiktning" />
          <p className="mt-4 text-sm text-gray-700">
            Besiktningsavgiften betalas enligt besiktningspartnerns prislista. Hittar vi fel vid förbesiktningen får du
            ett prisförslag innan vi gör något. Behöver bilen service samtidigt?{" "}
            <Link href="/verkstad" className="text-primary underline underline-offset-4">Boka verkstadstid</Link>.
          </p>
        </section>

        <section aria-labelledby="boka-besiktning" id="boka" className="max-w-4xl">
          <h2 id="boka-besiktning" className="mb-6 text-3xl font-bold text-navy">Boka besiktning</h2>
          <BookingWizard category="besiktning" />
        </section>
      </div>
    </div>
  );
}
