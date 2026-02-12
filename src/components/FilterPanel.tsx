"use client";

import {
  getUniqueMakes,
  getUniqueFuels,
  getUniqueTransmissions,
  getUniqueBodyTypes,
} from "@/lib/cars";

export interface Filters {
  search: string;
  make: string;
  fuel: string;
  transmission: string;
  bodyType: string;
  priceMin: number;
  priceMax: number;
  yearMin: number;
  yearMax: number;
  mileageMax: number;
}

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onReset: () => void;
}

export default function FilterPanel({
  filters,
  onFilterChange,
  onReset,
}: FilterPanelProps) {
  const makes = getUniqueMakes();
  const fuels = getUniqueFuels();
  const transmissions = getUniqueTransmissions();
  const bodyTypes = getUniqueBodyTypes();

  const updateFilter = (key: keyof Filters, value: string | number) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm sticky top-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-navy">Filtrera bilar</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-primary"
        >
          Rensa
        </button>
      </div>

      {/* Sök */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sök
        </label>
        <input
          type="text"
          placeholder="Märke, modell..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Märke */}
      <div className="mb-6">
        <label htmlFor="filter-make" className="block text-sm font-medium text-gray-700 mb-2">
          Märke
        </label>
        <select
          id="filter-make"
          value={filters.make}
          onChange={(e) => updateFilter("make", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Alla märken</option>
          {makes.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>
      </div>

      {/* Bränsle */}
      <div className="mb-6">
        <label htmlFor="filter-fuel" className="block text-sm font-medium text-gray-700 mb-2">
          Bränsle
        </label>
        <select
          id="filter-fuel"
          value={filters.fuel}
          onChange={(e) => updateFilter("fuel", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Alla bränslen</option>
          {fuels.map((fuel) => (
            <option key={fuel} value={fuel}>
              {fuel}
            </option>
          ))}
        </select>
      </div>

      {/* Växellåda */}
      <div className="mb-6">
        <label htmlFor="filter-transmission" className="block text-sm font-medium text-gray-700 mb-2">
          Växellåda
        </label>
        <select
          id="filter-transmission"
          value={filters.transmission}
          onChange={(e) => updateFilter("transmission", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Alla</option>
          {transmissions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Kaross */}
      <div className="mb-6">
        <label htmlFor="filter-bodyType" className="block text-sm font-medium text-gray-700 mb-2">
          Kaross
        </label>
        <select
          id="filter-bodyType"
          value={filters.bodyType}
          onChange={(e) => updateFilter("bodyType", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Alla karosser</option>
          {bodyTypes.map((bt) => (
            <option key={bt} value={bt}>
              {bt}
            </option>
          ))}
        </select>
      </div>

      {/* Pris */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pris (kr)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ""}
            onChange={(e) => updateFilter("priceMin", Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ""}
            onChange={(e) => updateFilter("priceMax", Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Årsmodell */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Årsmodell
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Från"
            value={filters.yearMin || ""}
            onChange={(e) => updateFilter("yearMin", Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            placeholder="Till"
            value={filters.yearMax || ""}
            onChange={(e) => updateFilter("yearMax", Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Miltal */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max miltal
        </label>
        <input
          type="number"
          placeholder="t.ex. 10000"
          value={filters.mileageMax || ""}
          onChange={(e) => updateFilter("mileageMax", Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}
