import Link from "next/link";
import { Car } from "@/lib/cars";

type Props = {
  car: Car;
};

export default function CarCard({ car }: Props) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition">
      <Link href={`/bilar/${car.slug}`} className="block aspect-[4/3] bg-gray-100 relative overflow-hidden cursor-pointer">
        <img
          src={car.images[0]}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-5">
        {car.featured && (
          <div className="inline-block bg-primary text-white text-xs px-2 py-1 rounded-full mb-2">
            Featured
          </div>
        )}

        <Link href={`/bilar/${car.slug}`} className="block">
          <h3 className="font-semibold text-lg text-navy mb-1 hover:text-primary transition-colors cursor-pointer">
            {car.make} {car.model}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 mb-3">
          {car.year} • {car.mileage.toLocaleString("sv-SE")} mil • {car.fuel} •{" "}
          {car.transmission}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-primary font-bold text-lg">
            {car.price.toLocaleString("sv-SE")} kr
          </span>

          <Link
            href={`/bilar/${car.slug}`}
            className="text-sm text-primary hover:underline"
          >
            View details →
          </Link>
        </div>
      </div>
    </div>
  );
}
