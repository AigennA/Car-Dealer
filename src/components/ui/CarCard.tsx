import Link from "next/link";
import { Car } from "@/lib/cars";

type Props = {
  car: Car;
};

export default function CarCard({ car }: Props) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition">
      <div className="aspect-[4/3] bg-gray-100">
        <img
          src={car.images[0]}  
          alt={car.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg text-navy mb-1">
          {car.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3">
          {car.year} • {car.mileage.toLocaleString()} mil • {car.fuel} •{" "}
          {car.transmission}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-primary font-bold text-lg">
            {car.price.toLocaleString()} kr
          </span>

          <Link
            href={`/bilar/${car.id}`}
            className="text-sm text-primary hover:underline"
          >
            Visa detaljer
          </Link>
        </div>
      </div>
    </div>
  );
}
