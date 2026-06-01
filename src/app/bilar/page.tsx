"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { type Car } from "@/lib/cars";
import { getAllCars } from "@/lib/clientStorage";
import Image from "next/image";
import CarCard from "@/components/ui/CarCard";
import FilterPanel, { Filters } from "@/components/FilterPanel";
import { CarIcon, ShieldCheckIcon, HandshakeIcon } from "@/components/ui/icons";

/* Value-prop highlights shown above the listing (photo + coral icon + copy) */
const VALUE_PROPS = [
  {
    Icon: CarIcon,
    title: "Hemleverans",
    text: "Vi kör hem din nya bil — var du än bor i Sverige.",
    img: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&h=500&fit=crop",
  },
  {
    Icon: ShieldCheckIcon,
    title: "Trygg garanti",
    text: "Upp till 24 månaders garanti på alla bilar.",
    img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=500&fit=crop",
  },
  {
    Icon: HandshakeIcon,
    title: "Säker affär",
    text: "Kvalitetskontroll, ångerrätt och transparent pris.",
    img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=500&fit=crop",
  },
];

const initialFilters: Filters = {
  search: "",
  make: "",
  fuel: "",
  transmission: "",
  bodyType: "",
  priceMin: 0,
  priceMax: 0,
  yearMin: 0,
  yearMax: 0,
  mileageMax: 0,
};

export default function CarsPage() {
  return (
    <Suspense fallback={
      <section className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-navy mb-8">Våra bilar</h1>
          <div className="text-center py-12 text-gray-600">Laddar bilar...</div>
        </div>
      </section>
    }>
      <CarsPageContent />
    </Suspense>
  );
}

function CarsPageContent() {
  const searchParams = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(() => ({
    ...initialFilters,
    make: searchParams.get("make") || "",
    bodyType: searchParams.get("bodyType") || "",
    fuel: searchParams.get("fuel") || "",
  }));
  const [sortBy, setSortBy] = useState("relevant");

  useEffect(() => {
    setCars(getAllCars());
    setLoading(false);
  }, []);

  // Filter cars
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          car.make.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      if (filters.make && car.make !== filters.make) return false;
      if (filters.fuel && car.fuel !== filters.fuel) return false;
      if (filters.transmission && car.transmission !== filters.transmission)
        return false;
      if (filters.bodyType && car.bodyType !== filters.bodyType) return false;
      if (filters.priceMin && car.price < filters.priceMin) return false;
      if (filters.priceMax && car.price > filters.priceMax) return false;
      if (filters.yearMin && car.year < filters.yearMin) return false;
      if (filters.yearMax && car.year > filters.yearMax) return false;
      if (filters.mileageMax && car.mileage > filters.mileageMax) return false;
      return true;
    });
  }, [cars, filters]);

  // Sort cars
  const sortedCars = useMemo(() => {
    const sorted = [...filteredCars];
    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "year-desc":
        return sorted.sort((a, b) => b.year - a.year);
      case "year-asc":
        return sorted.sort((a, b) => a.year - b.year);
      case "mileage-asc":
        return sorted.sort((a, b) => a.mileage - b.mileage);
      case "mileage-desc":
        return sorted.sort((a, b) => b.mileage - a.mileage);
      case "name-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title, "sv"));
      case "name-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title, "sv"));
      case "newest":
        return sorted.sort((a, b) => Number(b.id.replace("custom-", "")) - Number(a.id.replace("custom-", "")));
      default:
        return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [filteredCars, sortBy]);

  const handleReset = () => {
    setFilters(initialFilters);
  };

  if (loading) {
    return (
      <section className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-navy mb-8">Våra bilar</h1>
          <div className="text-center py-12 text-gray-600">Laddar bilar...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-navy mb-8">Våra bilar</h1>

        {/* Value-prop highlights band — home delivery, warranty, trust */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {VALUE_PROPS.map(({ Icon, title, text, img }) => (
            <article
              key={title}
              className="group relative h-40 rounded-2xl overflow-hidden shadow-sm"
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-transparent" />
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <span className="text-accent mb-1.5">
                  <Icon className="w-7 h-7" />
                </span>
                <h3 className="font-heading font-semibold text-lg leading-tight">
                  {title}
                </h3>
                <p className="text-sm text-white/85 leading-snug">{text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <aside>
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onReset={handleReset}
            />
          </aside>

          <div>
            <div className="bg-white rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-navy">
                  {sortedCars.length}
                </span>{" "}
                {sortedCars.length === 1 ? "bil" : "bilar"} hittades
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-sm text-gray-600">
                  Sortera:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="relevant">Mest relevant</option>
                  <option value="newest">Nyast inlagda</option>
                  <option value="price-asc">Pris: lägst först</option>
                  <option value="price-desc">Pris: högst först</option>
                  <option value="year-desc">Årsmodell: nyast först</option>
                  <option value="year-asc">Årsmodell: äldst först</option>
                  <option value="mileage-asc">Miltal: lägst först</option>
                  <option value="mileage-desc">Miltal: högst först</option>
                  <option value="name-asc">Namn: A-Ö</option>
                  <option value="name-desc">Namn: Ö-A</option>
                </select>
              </div>
            </div>

            {sortedCars.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <p className="text-gray-600">
                  Inga bilar hittades med dessa filter.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-4 text-primary hover:underline"
                >
                  Rensa filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
