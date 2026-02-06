import { cars } from "@/lib/cars";
import Badge from "@/components/ui/Badge";
import PrimaryButtonLink from "@/components/ui/PrimaryButtonLink";
import Link from "next/link";

export default async function CarDetailPage({
  params,
}: {
   params: { slug: string };
}) {
  const { slug } = await params;
  const car = cars.find((c) => c.id === slug);

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
            ← Tillbaka
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-8">
          {/* Left: Gallery */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="aspect-[16/10] bg-gray-100">
              <img
                src={car.images[0]}
                alt={car.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 border-t">
              <div className="flex gap-3 overflow-x-auto">
                {car.images.map((img) => (
                  <img
                    key={img}
                    src={img}
                    alt={car.title}
                    className="h-20 w-32 object-cover rounded-xl border bg-gray-50"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sticky summary */}
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
                <PrimaryButtonLink href={`/boka/${car.id}`}>
                  Boka provkörning
                </PrimaryButtonLink>

                <button
                  type="button"
                  className="w-full border border-primary text-primary px-5 py-3 rounded-xl hover:bg-primary hover:text-white transition font-medium"
                >
                  Spara som favorit
                </button>

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

        {/* Details section */}
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
                  <span className="text-primary mt-0.5">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Similar cars */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-navy mb-4">Liknande bilar</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {cars
              .filter((c) => c.id !== car.id)
              .map((c) => (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
                    <img src={c.images[0]} alt={c.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="mt-4">
                    <div className="font-semibold text-navy">{c.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {c.year} • {c.mileage.toLocaleString()} mil
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-primary font-bold">
                        {c.price.toLocaleString()} kr
                      </div>
                      <Link href={`/bilar/${c.id}`} className="text-primary hover:underline text-sm">
                        Visa
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
