import Link from "next/link";
import Image from "next/image";
import { Car } from "@/lib/cars";

type Props = {
  car: Car;
};

export default function CarCard({ car }: Props) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary/20">
      <Link href={`/bilar/${car.slug}`} className="block aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden cursor-pointer">
        <Image
          src={car.images[0]}
          alt={`${car.make} ${car.model}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          priority={car.featured}
        />
        {car.featured && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-primary to-[#00BFFF] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
            <span aria-hidden="true">⭐</span> Utvald
          </div>
        )}
      </Link>

      <div className="p-6">
        <Link href={`/bilar/${car.slug}`} className="block group/title">
          <h3 className="font-bold text-xl text-navy mb-2 group-hover/title:text-primary transition-colors cursor-pointer line-clamp-1">
            {car.make} {car.model}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true" className="text-gray-400">📅</span> {car.year}
          </span>
          <span className="text-gray-300">•</span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true" className="text-gray-400">🛣️</span> {car.mileage.toLocaleString("sv-SE")} mil
          </span>
          <span className="text-gray-300">•</span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true" className="text-gray-400">⛽</span> {car.fuel}
          </span>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Pris</p>
            <span className="text-primary font-bold text-2xl">
              {car.price.toLocaleString("sv-SE")} kr
            </span>
          </div>

          <Link
            href={`/bilar/${car.slug}`}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm shadow-sm hover:shadow-md"
          >
            <span>Visa</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
