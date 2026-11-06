"use client";

import { SITE } from "@/lib/site";
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCars } from "@/lib/clientStorage";
import {
  type Filters,
  initialFilters,
  filterCars,
  sortCars,
  countActiveFilters,
  SORT_OPTIONS,
} from "@/lib/filters";
import Image from "next/image";
import CarCard from "@/components/ui/CarCard";
import FilterPanel from "@/components/FilterPanel";
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
    text: `Upp till ${SITE.policies.warrantyMonths} månaders garanti på alla bilar.`,
    img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=500&fit=crop",
  },
  {
    Icon: HandshakeIcon,
    title: "Säker affär",
    text: "Kvalitetskontroll, ångerrätt och transparent pris.",
    img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=500&fit=crop",
  },
];

type UrlFilters = Pick<Filters, "make" | "bodyType" | "fuel">;
const NO_URL_FILTERS: UrlFilters = { make: "", bodyType: "", fuel: "" };

export default function CarsPage() {
  // useSearchParams() opts out of static rendering up to the nearest Suspense
  // boundary. The fallback renders the full, unfiltered listing so the
  // exported HTML contains every car (good for LCP, SEO and no-JS users).
  return (
    <Suspense fallback={<CarsListing urlFilters={NO_URL_FILTERS} />}>
      <CarsPageWithParams />
    </Suspense>
  );
}

function CarsPageWithParams() {
  const searchParams = useSearchParams();
  const urlFilters: UrlFilters = {
    make: searchParams.get("make") || "",
    bodyType: searchParams.get("bodyType") || "",
    fuel: searchParams.get("fuel") || "",
  };
  return <CarsListing key={searchParams.toString()} urlFilters={urlFilters} />;
}

function CarsListing({ urlFilters }: { urlFilters: UrlFilters }) {
  const cars = useCars();
  const [filters, setFilters] = useState<Filters>(() => ({ ...initialFilters, ...urlFilters }));
  const [sortBy, setSortBy] = useState("relevant");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sortedCars = useMemo(
    () => sortCars(filterCars(cars, filters), sortBy),
    [cars, filters, sortBy],
  );
  const activeCount = countActiveFilters(filters);

  const handleReset = () => setFilters(initialFilters);

  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-navy mb-8">Våra bilar</h1>

        {/* Value-prop highlights band — home delivery, warranty, trust */}
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10" aria-label="Därför köper du bil hos oss">
          {VALUE_PROPS.map(({ Icon, title, text, img }) => (
            <li
              key={title}
              className="group relative h-32 sm:h-40 rounded-2xl overflow-hidden shadow-sm"
            >
              <Image
                src={img}
                alt=""
                fill
                sizes="(max-width: 640px) 92vw, 400px"
                quality={60}
                preload
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/55 to-black/10" />
              <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                <span className="text-accent mb-1.5">
                  <Icon className="w-7 h-7" />
                </span>
                <h2 className="font-heading font-semibold text-lg leading-tight">
                  {title}
                </h2>
                <p className="text-sm text-white leading-snug">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <aside aria-label="Filter">
            {/* Mobile: filters collapse behind a toggle so results are visible first */}
            <button
              type="button"
              className="lg:hidden w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm font-semibold text-navy"
              aria-expanded={filtersOpen}
              aria-controls="filter-panel"
              onClick={() => setFiltersOpen((o) => !o)}
            >
              <span>
                Filtrera bilar
                {activeCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary text-white text-xs min-w-6 h-6 px-2">
                    {activeCount}
                    <span className="sr-only"> aktiva filter</span>
                  </span>
                )}
              </span>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div id="filter-panel" className={`${filtersOpen ? "block mt-4" : "hidden"} lg:block lg:mt-0`}>
              <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
                onReset={handleReset}
                resultCount={sortedCars.length}
              />
            </div>
          </aside>

          <div>
            <div className="bg-white rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              {/* Polite live region: screen readers hear the new count when filters change (WCAG 4.1.3) */}
              <p className="text-sm text-gray-700" role="status" aria-live="polite">
                <span className="font-semibold text-navy">{sortedCars.length}</span>{" "}
                {sortedCars.length === 1 ? "bil" : "bilar"} hittades
              </p>

              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-sm text-gray-700">
                  Sortera:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {sortedCars.length > 0 ? (
              <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6" aria-label="Bilar">
                {sortedCars.map((car) => (
                  <li key={car.id} className="flex">
                    <CarCard car={car} headingLevel="h2" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <h2 className="text-lg font-semibold text-navy">Inga bilar matchar dina filter</h2>
                <p className="text-gray-600 mt-2">
                  Prova att ta bort något filter eller vidga prisintervallet.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-6 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                >
                  Rensa alla filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
