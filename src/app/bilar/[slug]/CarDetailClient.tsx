"use client";

import { useEffect, useState } from "react";
import { type Car } from "@/lib/cars";
import { getAllCars } from "@/lib/clientStorage";
import Badge from "@/components/ui/Badge";
import PrimaryButtonLink from "@/components/ui/PrimaryButtonLink";
import Link from "next/link";
import CarCreditCalculator from "@/components/CarCreditCalculator";
import ImageGallery from "@/components/ui/ImageGallery";

export default function CarDetailClient({ slug }: { slug: string }) {
  const [car, setCar] = useState<Car | null>(null);
  const [similarCars, setSimilarCars] = useState<Car[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const allCars = getAllCars();
    const found = allCars.find((c) => c.slug === slug) || null;
    setCar(found);
    if (found) {
      setSimilarCars(
        allCars
          .filter((c) => c.id !== found.id && (c.bodyType === found.bodyType || c.fuel === found.fuel))
          .slice(0, 3)
      );
    }
    setLoaded(true);
  }, [slug]);

  if (!loaded) {
    return (
      <section className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-600">
          Laddar...
        </div>
      </section>
    );
  }

  if (!car) {
    return (
      <section className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-2xl font-bold text-navy">Bilen hittades inte</h1>
          <p className="text-gray-600 mt-2">Den här sidan finns inte.</p>
          <Link href="/bilar" className="text-primary hover:underline mt-6 inline-block">
            Tillbaka till bilar
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link href="/bilar" className="text-sm text-primary hover:underline">
            &larr; Tillbaka
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-8">
          <ImageGallery images={car.images} title={car.title} />

          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h1 className="text-2xl font-bold text-navy">{car.title}</h1>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">
                  {car.price.toLocaleString()} kr
                </span>
                <span className="text-sm text-gray-500">inkl. moms</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{car.year}</Badge>
                <Badge>{car.mileage.toLocaleString()} mil</Badge>
                <Badge>{car.fuel}</Badge>
                <Badge>{car.transmission}</Badge>
                <Badge>{car.drivetrain}</Badge>
                <Badge>{car.bodyType}</Badge>
              </div>

              <div className="mt-6 space-y-3">
                <PrimaryButtonLink href="/kontakt">
                  Boka provkörning
                </PrimaryButtonLink>

                <Link
                  href="/kontakt"
                  className="block text-center text-sm text-gray-700 hover:text-primary"
                >
                  Kontakta oss
                </Link>
              </div>

              <div className="mt-6 text-xs text-gray-500">
                Vi reserverar oss för eventuella felskrivningar.
              </div>
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
                  <span className="text-primary mt-0.5">&bull;</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <CarCreditCalculator carPrice={car.price} />
        </div>

        {similarCars.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-navy mb-4">Liknande bilar</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {similarCars.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm p-5">
                  <Link href={`/bilar/${c.slug}`} className="block aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden cursor-pointer">
                    <img src={c.images[0]} alt={c.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </Link>

                  <div className="mt-4">
                    <Link href={`/bilar/${c.slug}`} className="block">
                      <div className="font-semibold text-navy hover:text-primary transition-colors cursor-pointer">{c.title}</div>
                    </Link>
                    <div className="text-sm text-gray-600 mt-1">
                      {c.year} &bull; {c.mileage.toLocaleString()} mil
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-primary font-bold">
                        {c.price.toLocaleString()} kr
                      </div>
                      <Link href={`/bilar/${c.slug}`} className="text-primary hover:underline text-sm">
                        Visa
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
