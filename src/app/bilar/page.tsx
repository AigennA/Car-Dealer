"use client";

import { useState, useMemo } from "react";
import { cars } from "@/lib/cars";
import CarCard from "@/components/ui/CarCard";
import FilterPanel, { Filters } from "@/components/FilterPanel";

const initialFilters: Filters = {
  search: "",
  make: "",
  fuel: "",
  transmission: "",
  body: "",
  priceMin: 0,
  priceMax: 0,
  yearMin: 0,
  yearMax: 0,
  mileageMax: 0,
};

export default function CarsPage() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sortBy, setSortBy] = useState("relevant");

  // Filter cars
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // Search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          car.make.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Make
      if (filters.make && car.make !== filters.make) return false;

      // Fuel
      if (filters.fuel && car.fuel !== filters.fuel) return false;

      // Transmission
      if (filters.transmission && car.transmission !== filters.transmission)
        return false;

      // Body
      if (filters.body && car.body !== filters.body) return false;

      // Price
      if (filters.priceMin && car.price < filters.priceMin) return false;
      if (filters.priceMax && car.price > filters.priceMax) return false;

      // Year
      if (filters.yearMin && car.year < filters.yearMin) return false;
      if (filters.yearMax && car.year > filters.yearMax) return false;

      // Mileage
      if (filters.mileageMax && car.mileage > filters.mileageMax) return false;

      return true;
    });
  }, [filters]);

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
      case "mileage-asc":
        return sorted.sort((a, b) => a.mileage - b.mileage);
      default:
        return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [filteredCars, sortBy]);

  const handleReset = () => {
    setFilters(initialFilters);
  };

  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-navy mb-8">Våra bilar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Filter Panel */}
          <aside>
            <FilterPanel
              filters={filters}
              onFilterChange={setFilters}
              onReset={handleReset}
            />
          </aside>

          {/* Main Content */}
          <div>
            {/* Sort Bar */}
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
                  <option value="price-asc">Pris: lågt → högt</option>
                  <option value="price-desc">Pris: högt → lågt</option>
                  <option value="year-desc">Årsmodell: nyast först</option>
                  <option value="mileage-asc">Lägst miltal</option>
                </select>
              </div>
            </div>

            {/* Cars Grid */}
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
