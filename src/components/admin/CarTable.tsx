"use client";

import Image from "next/image";
import Link from "next/link";
import type { Car } from "@/lib/cars";
import { formatSek } from "@/config/business";
import { ROUTES } from "@/config/navigation";

type Props = {
  cars: Car[];
  onEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
};

const COLUMNS = ["Bil", "År", "Miltal", "Pris", "Bränsle"] as const;
const TH = "px-6 py-4 text-left text-sm font-semibold text-gray-900";
const TD = "px-6 py-4 text-sm text-gray-900";

/** Staff inventory table; every row has named actions ("Redigera Volvo V90 …"). */
export default function CarTable({ cars, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <caption className="sr-only">Bilar i lager, {cars.length} st. Varje rad har knappar för att redigera och ta bort.</caption>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {COLUMNS.map((c) => <th key={c} scope="col" className={TH}>{c}</th>)}
              <th scope="col" className={`${TH} text-right`}>Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cars.map((car) => (
              <tr key={car.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`${ROUTES.cars}/${car.slug}`} className="flex items-center gap-3 group">
                    <Image src={car.images[0]} alt="" width={64} height={48} className="w-16 h-12 object-cover rounded" />
                    <span>
                      <span className="block font-medium text-gray-900 group-hover:text-primary transition-colors">{car.title}</span>
                      <span className="block text-sm text-gray-600">{car.color}</span>
                    </span>
                  </Link>
                </td>
                <td className={TD}>{car.year}</td>
                <td className={TD}>{car.mileage.toLocaleString("sv-SE")} mil</td>
                <td className={TD}>{formatSek(car.price)}</td>
                <td className={TD}>{car.fuel}</td>
                <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                  <button type="button" onClick={() => onEdit(car)} aria-label={`Redigera ${car.title}`}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium mr-3">
                    Redigera
                  </button>
                  <button type="button" onClick={() => onDelete(car)} aria-label={`Ta bort ${car.title}`}
                    className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors font-medium">
                    Ta bort
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
