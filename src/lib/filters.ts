import type { Car } from "./cars";

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

export const initialFilters: Filters = {
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

export const SORT_OPTIONS = [
  { value: "relevant", label: "Mest relevant" },
  { value: "newest", label: "Nyast inlagda" },
  { value: "price-asc", label: "Pris: lägst först" },
  { value: "price-desc", label: "Pris: högst först" },
  { value: "year-desc", label: "Årsmodell: nyast först" },
  { value: "year-asc", label: "Årsmodell: äldst först" },
  { value: "mileage-asc", label: "Miltal: lägst först" },
  { value: "mileage-desc", label: "Miltal: högst först" },
  { value: "name-asc", label: "Namn: A–Ö" },
  { value: "name-desc", label: "Namn: Ö–A" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export function filterCars(cars: Car[], filters: Filters): Car[] {
  const search = filters.search.trim().toLowerCase();
  return cars.filter((car) => {
    if (search) {
      const haystack = `${car.make} ${car.model}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (filters.make && car.make !== filters.make) return false;
    if (filters.fuel && car.fuel !== filters.fuel) return false;
    if (filters.transmission && car.transmission !== filters.transmission) return false;
    if (filters.bodyType && car.bodyType !== filters.bodyType) return false;
    if (filters.priceMin && car.price < filters.priceMin) return false;
    if (filters.priceMax && car.price > filters.priceMax) return false;
    if (filters.yearMin && car.year < filters.yearMin) return false;
    if (filters.yearMax && car.year > filters.yearMax) return false;
    if (filters.mileageMax && car.mileage > filters.mileageMax) return false;
    return true;
  });
}

/** Numeric part of an id ("12" or "custom-1700000000000"); used for "newest". */
function idOrder(id: string): number {
  const n = Number(id.replace("custom-", ""));
  return Number.isFinite(n) ? n : 0;
}

export function sortCars(cars: Car[], sortBy: string): Car[] {
  const sorted = [...cars];
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
      return sorted.sort((a, b) => idOrder(b.id) - idOrder(a.id));
    default:
      // stable: featured first, otherwise keep inventory order
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

/** Number of filters that differ from their default — shown as a badge. */
export function countActiveFilters(filters: Filters): number {
  return (Object.keys(initialFilters) as (keyof Filters)[]).filter(
    (k) => filters[k] !== initialFilters[k],
  ).length;
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString("sv-SE")} kr`;
}
