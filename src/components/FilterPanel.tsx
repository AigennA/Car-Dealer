"use client";

import {
  getUniqueMakes,
  getUniqueFuels,
  getUniqueTransmissions,
  getUniqueBodyTypes,
} from "@/lib/cars";
import type { Filters } from "@/lib/filters";

export type { Filters } from "@/lib/filters";

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onReset: () => void;
  resultCount?: number;
}

const FIELD =
  "w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary";
const LABEL = "block text-sm font-medium text-gray-800 mb-2";

const makes = getUniqueMakes();
const fuels = getUniqueFuels();
const transmissions = getUniqueTransmissions();
const bodyTypes = getUniqueBodyTypes();

/**
 * Filters apply instantly (no "submit" step) — the result count above the
 * list is a live region, so the change is announced to screen readers too.
 */
export default function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  resultCount,
}: FilterPanelProps) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };
  const num = (v: string) => (v === "" ? 0 : Math.max(0, Number(v)));

  const selects: { key: "make" | "fuel" | "transmission" | "bodyType"; label: string; all: string; options: string[] }[] = [
    { key: "make", label: "Märke", all: "Alla märken", options: makes },
    { key: "fuel", label: "Bränsle", all: "Alla bränslen", options: fuels },
    { key: "transmission", label: "Växellåda", all: "Alla växellådor", options: transmissions },
    { key: "bodyType", label: "Kaross", all: "Alla karosser", options: bodyTypes },
  ];

  return (
    <form
      className="bg-white rounded-xl p-6 shadow-sm lg:sticky lg:top-24"
      aria-labelledby="filter-heading"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 id="filter-heading" className="text-lg font-bold text-navy">Filtrera bilar</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-dark"
        >
          Rensa alla
        </button>
      </div>

      <div className="mb-6">
        <label htmlFor="filter-search" className={LABEL}>
          Sök märke eller modell
        </label>
        <input
          id="filter-search"
          type="search"
          autoComplete="off"
          placeholder="t.ex. Volvo XC60"
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className={FIELD}
        />
      </div>

      {selects.map(({ key, label, all, options }) => (
        <div className="mb-6" key={key}>
          <label htmlFor={`filter-${key}`} className={LABEL}>
            {label}
          </label>
          <select
            id={`filter-${key}`}
            value={filters[key]}
            onChange={(e) => update(key, e.target.value)}
            className={FIELD}
          >
            <option value="">{all}</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      ))}

      <fieldset className="mb-6">
        <legend className={LABEL}>Pris (kr)</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="filter-priceMin" className="sr-only">Lägsta pris</label>
            <input id="filter-priceMin" type="number" inputMode="numeric" min={0} step={10000} placeholder="Min"
              value={filters.priceMin || ""} onChange={(e) => update("priceMin", num(e.target.value))} className={FIELD} />
          </div>
          <div>
            <label htmlFor="filter-priceMax" className="sr-only">Högsta pris</label>
            <input id="filter-priceMax" type="number" inputMode="numeric" min={0} step={10000} placeholder="Max"
              value={filters.priceMax || ""} onChange={(e) => update("priceMax", num(e.target.value))} className={FIELD} />
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-6">
        <legend className={LABEL}>Årsmodell</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="filter-yearMin" className="sr-only">Årsmodell från</label>
            <input id="filter-yearMin" type="number" inputMode="numeric" min={1990} max={2030} placeholder="Från"
              value={filters.yearMin || ""} onChange={(e) => update("yearMin", num(e.target.value))} className={FIELD} />
          </div>
          <div>
            <label htmlFor="filter-yearMax" className="sr-only">Årsmodell till</label>
            <input id="filter-yearMax" type="number" inputMode="numeric" min={1990} max={2030} placeholder="Till"
              value={filters.yearMax || ""} onChange={(e) => update("yearMax", num(e.target.value))} className={FIELD} />
          </div>
        </div>
      </fieldset>

      <div className="mb-2">
        <label htmlFor="filter-mileageMax" className={LABEL}>
          Max miltal (mil)
        </label>
        <input
          id="filter-mileageMax"
          type="number"
          inputMode="numeric"
          min={0}
          step={1000}
          placeholder="t.ex. 10000"
          value={filters.mileageMax || ""}
          onChange={(e) => update("mileageMax", num(e.target.value))}
          className={FIELD}
        />
      </div>

      {typeof resultCount === "number" && (
        <p className="mt-6 text-sm text-gray-700 lg:hidden">
          Visar <strong className="text-navy">{resultCount}</strong> {resultCount === 1 ? "bil" : "bilar"}
        </p>
      )}
    </form>
  );
}
