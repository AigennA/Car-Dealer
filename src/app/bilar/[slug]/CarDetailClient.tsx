"use client";

import Image from "next/image";
import Link from "next/link";
import { useCars } from "@/lib/clientStorage";
import Badge from "@/components/ui/Badge";
import PrimaryButtonLink from "@/components/ui/PrimaryButtonLink";
import CarCreditCalculator from "@/components/CarCreditCalculator";
import ImageGallery from "@/components/ui/ImageGallery";
import { CheckIcon } from "@/components/ui/icons";
import { SITE } from "@/lib/site";
import AdvisorCard from "@/components/people/AdvisorCard";
import { ROUTES } from "@/config/navigation";

export default function CarDetailClient({ slug }: { slug: string }) {
  const cars = useCars();
  const car = cars.find((c) => c.slug === slug) ?? null;

  if (!car) {
    return (
      <section className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-2xl font-bold text-navy">Bilen hittades inte</h1>
          <p className="text-gray-700 mt-2">
            Bilen kan redan vara såld eller så har länken ändrats.
          </p>
          <Link href={ROUTES.cars} className="text-primary underline underline-offset-4 mt-6 inline-block">
            Se alla bilar i lager
          </Link>
        </div>
      </section>
    );
  }

  const similarCars = cars
    .filter((c) => c.id !== car.id && (c.bodyType === car.bodyType || c.fuel === car.fuel))
    .slice(0, 3);
  const contactHref = `${ROUTES.contact}?bil=${encodeURIComponent(car.slug)}`;

  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Breadcrumbs — WCAG 2.4.8 Location / heuristic "visibility of system status" */}
        <nav aria-label="Brödsmulor" className="mb-6 text-sm">
          <ol className="flex flex-wrap items-center gap-1.5 text-gray-700">
            <li>
              <Link href={ROUTES.home} className="text-primary underline-offset-4 hover:underline">Hem</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={ROUTES.cars} className="text-primary underline-offset-4 hover:underline">Lager</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-gray-800 font-medium truncate max-w-[60vw]">{car.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-8">
          <ImageGallery images={car.images} title={car.title} />

          <aside className="lg:sticky lg:top-24 h-fit" aria-labelledby="car-title">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h1 id="car-title" className="text-2xl font-bold text-navy">{car.title}</h1>

              <p className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary tabular-nums">
                  {car.price.toLocaleString("sv-SE")} kr
                </span>
                <span className="text-sm text-gray-600">inkl. moms</span>
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {[
                  ["Årsmodell", String(car.year)],
                  ["Miltal", `${car.mileage.toLocaleString("sv-SE")} mil`],
                  ["Bränsle", car.fuel],
                  ["Växellåda", car.transmission],
                  ["Drivning", car.drivetrain],
                  ["Kaross", car.bodyType],
                  ["Färg", car.color],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-gray-600">{k}</dt>
                    <dd className="font-semibold text-navy">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 space-y-3">
                <PrimaryButtonLink href={`${contactHref}&amne=provkorning`}>
                  Boka provkörning
                </PrimaryButtonLink>

                <a
                  href={SITE.phoneHref}
                  className="block w-full text-center border border-gray-400 rounded-xl px-5 py-3 font-medium text-navy hover:border-primary hover:text-primary transition-colors"
                >
                  Ring oss: {SITE.phone}
                </a>

                <Link
                  href={contactHref}
                  className="block text-center text-sm text-gray-700 underline underline-offset-4 hover:text-primary"
                >
                  Ställ en fråga om bilen
                </Link>
              </div>

              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Ingår vid köp">
                <li><Badge>{SITE.policies.warrantyMonths} mån garanti</Badge></li>
                <li><Badge>{SITE.policies.openPurchaseDays} dagars öppet köp</Badge></li>
                <li><Badge>Hemleverans</Badge></li>
              </ul>

              <p className="mt-6 text-xs text-gray-600">
                Vi reserverar oss för eventuella felskrivningar.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-navy mb-3">Beskrivning</h2>
            <p className="text-gray-700 leading-relaxed">{car.description}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-navy mb-3">Utrustning</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
              {car.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckIcon className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <CarCreditCalculator key={car.id} carPrice={car.price} />
          <AdvisorCard variant="compact" headingLevel="h2" />
        </div>

        {similarCars.length > 0 && (
          <section className="mt-12" aria-labelledby="similar-heading">
            <h2 id="similar-heading" className="text-xl font-bold text-navy mb-4">Liknande bilar</h2>
            <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {similarCars.map((c) => (
                <li key={c.id} className="group bg-white rounded-2xl shadow-sm p-5">
                  <Link
                    href={`${ROUTES.cars}/${c.slug}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="block relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden"
                  >
                    <Image
                      src={c.images[0]}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 92vw, (max-width: 1280px) 45vw, 380px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="mt-4">
                    <h3 className="font-semibold text-navy">
                      <Link href={`${ROUTES.cars}/${c.slug}`} className="hover:text-primary transition-colors">
                        {c.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {c.year} &bull; {c.mileage.toLocaleString("sv-SE")} mil
                    </p>
                    <p className="text-primary font-bold mt-3 tabular-nums">
                      {c.price.toLocaleString("sv-SE")} kr
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </section>
  );
}
