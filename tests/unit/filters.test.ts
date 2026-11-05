import { describe, expect, it } from "vitest";
import { cars, type Car } from "@/lib/cars";
import { filterCars, sortCars, initialFilters, countActiveFilters } from "@/lib/filters";

const f = (over: Partial<typeof initialFilters>) => ({ ...initialFilters, ...over });

describe("filterCars", () => {
  it("returns everything with default filters", () => {
    expect(filterCars(cars, initialFilters)).toHaveLength(cars.length);
  });

  it("filters by make, fuel and body type (the home-page search params)", () => {
    const result = filterCars(cars, f({ make: "Volvo" }));
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => c.make === "Volvo")).toBe(true);

    const diesel = filterCars(cars, f({ fuel: "Diesel" }));
    expect(diesel.every((c) => c.fuel === "Diesel")).toBe(true);

    const suv = filterCars(cars, f({ bodyType: "SUV" }));
    expect(suv.every((c) => c.bodyType === "SUV")).toBe(true);
  });

  it("free-text search is case-insensitive and trims whitespace", () => {
    const result = filterCars(cars, f({ search: "  volvo v90 " }));
    expect(result.map((c) => c.slug)).toContain("volvo-v90-d4-awd");
  });

  it("applies price, year and mileage ranges inclusively", () => {
    const result = filterCars(cars, f({ priceMin: 200_000, priceMax: 300_000, yearMin: 2018, mileageMax: 10_000 }));
    for (const c of result) {
      expect(c.price).toBeGreaterThanOrEqual(200_000);
      expect(c.price).toBeLessThanOrEqual(300_000);
      expect(c.year).toBeGreaterThanOrEqual(2018);
      expect(c.mileage).toBeLessThanOrEqual(10_000);
    }
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterCars(cars, f({ make: "Lada" }))).toEqual([]);
  });
});

describe("sortCars", () => {
  const sample = cars.slice(0, 8);
  const isSorted = (list: Car[], key: (c: Car) => number, dir: 1 | -1) =>
    list.every((c, i) => i === 0 || dir * (key(c) - key(list[i - 1])) >= 0);

  it.each([
    ["price-asc", (c: Car) => c.price, 1],
    ["price-desc", (c: Car) => c.price, -1],
    ["year-desc", (c: Car) => c.year, -1],
    ["mileage-asc", (c: Car) => c.mileage, 1],
  ] as const)("%s", (key, getter, dir) => {
    expect(isSorted(sortCars(sample, key), getter, dir)).toBe(true);
  });

  it("does not mutate the input array", () => {
    const copy = [...sample];
    sortCars(sample, "price-desc");
    expect(sample).toEqual(copy);
  });

  it("'relevant' puts featured cars first", () => {
    const sorted = sortCars(cars, "relevant");
    const firstNonFeatured = sorted.findIndex((c) => !c.featured);
    expect(sorted.slice(firstNonFeatured).some((c) => c.featured)).toBe(false);
  });

  it("'newest' puts admin-added cars (custom-<timestamp>) first", () => {
    const custom = { ...cars[0], id: "custom-1700000000000", slug: "x" };
    expect(sortCars([...cars, custom], "newest")[0].id).toBe(custom.id);
  });
});

describe("countActiveFilters", () => {
  it("counts only non-default values", () => {
    expect(countActiveFilters(initialFilters)).toBe(0);
    expect(countActiveFilters(f({ make: "BMW", priceMax: 300_000 }))).toBe(2);
  });
});
