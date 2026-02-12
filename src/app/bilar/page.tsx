"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { type Car } from "@/lib/cars";
import { getAllCars } from "@/lib/clientStorage";
import CarCard from "@/components/ui/CarCard";
import FilterPanel, { Filters } from "@/components/FilterPanel";

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
