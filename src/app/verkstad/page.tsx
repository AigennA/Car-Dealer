import type { Metadata } from "next";
import Link from "next/link";
import BookingWizard from "@/components/workshop/BookingWizard";
import ServiceList, { OpeningHours } from "@/components/workshop/ServiceList";
import { CheckIcon, WrenchIcon } from "@/components/ui/icons";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Verkstad – boka service online",
  description:
    `Service, däckbyte, bromsar, AC och felsökning för alla bilmärken. Se priser och boka verkstadstid online hos ${SITE.name} i ${SITE.address.city}.`,
};

const PROMISES = [
  "Service enligt tillverkarens program – nybilsgarantin gäller",
  "Fast pris eller offert innan vi gör något extra",
  "Alla bilmärken, även elbilar och laddhybrider",
  "Vi ringer när bilen är klar",
];

export default function VerkstadPage() {
  return (
    <div className="bg-surface">
      <section className="bg-linear-to-br from-[#00507a] to-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em]">
            <WrenchIcon className="h-5 w-5" /> Verkstad
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-5xl">Service och reparationer – boka tid online</h1>
          <p className="mt-4 max-w-2xl text-lg">
            Välj tjänst, dag och tid nedan. Det tar under en minut, och du får ett bokningsnummer direkt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#boka" className="rounded-xl bg-white px-6 py-3 font-semibold text-primary-dark hover:bg-gray-100 transition-colors">
              Boka verkstadstid
            </a>
            <Link href="/besiktning" className="rounded-xl border border-white/80 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors">
              Besiktning
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-12 pb-20">
        <section aria-labelledby="priser" className="mb-14">
          <h2 id="priser" className="mb-6 text-3xl font-bold text-navy">Tjänster och priser</h2>
          <ServiceList category="verkstad" />
        </section>

        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <section aria-labelledby="boka-verkstad" id="boka">
            <h2 id="boka-verkstad" className="mb-6 text-3xl font-bold text-navy">Boka verkstadstid</h2>
            <BookingWizard category="verkstad" />
          </section>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start" aria-label="Om verkstaden">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-heading text-lg font-semibold text-navy">Därför vår verkstad</h2>
              <ul className="space-y-2 text-gray-800">
                {PROMISES.map((p) => (
                  <li key={p} className="flex gap-2">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-heading text-lg font-semibold text-navy">Öppettider verkstad</h2>
              <OpeningHours />
              <p className="mt-4 text-sm text-gray-700">
                {SITE.address.street}, {SITE.address.postalCode} {SITE.address.city}
                <br />
                Frågor? Ring <a href={SITE.phoneHref} className="text-primary underline underline-offset-4">{SITE.phone}</a>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
