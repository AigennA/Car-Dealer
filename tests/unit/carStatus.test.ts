import { describe, expect, it } from "vitest";
import { cars, type Car } from "@/lib/cars";
import { inStock, isBookable, isListed, isReserved, isSold, listedCars, soldLast, statusOf } from "@/lib/carStatus";
import { similarCars } from "@/lib/similarCars";
import { addDaysIso, daysBetween, todayIso } from "@/lib/dates";
import { toCar, toFormValues } from "@/lib/admin/carForm";
import { BUSINESS } from "@/config/business";

const base = cars.find((c) => c.slug === "volvo-v90-d4-awd")!;
const car = (over: Partial<Car>): Car => ({ ...base, ...over });
const DAYS = BUSINESS.policies.soldVisibleDays;
const TODAY = "2026-11-09";

describe("dates", () => {
  it("adds days across months and counts days between", () => {
    expect(addDaysIso("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDaysIso("2026-03-01", -1)).toBe("2026-02-28");
    expect(daysBetween("2026-11-01", "2026-11-09")).toBe(8);
    expect(daysBetween("2026-11-09", "2026-11-01")).toBe(-8);
    expect(todayIso(new Date("2026-11-09T23:30:00Z"))).toBe("2026-11-09");
  });
});

describe("car status", () => {
  it("a car without a status is available and can be booked", () => {
    const c = car({ status: undefined });
    expect(statusOf(c)).toBe("Available");
    expect(isBookable(c)).toBe(true);
    expect(isSold(c) || isReserved(c)).toBe(false);
  });

  it("reserved and sold cars cannot be booked", () => {
    expect(isBookable(car({ status: "Reserved" }))).toBe(false);
    expect(isBookable(car({ status: "Sold", soldAt: TODAY }))).toBe(false);
  });

  it("a sold car stays listed for the configured number of days, then drops out", () => {
    const soldOn = (date: string) => car({ status: "Sold", soldAt: date });
    expect(isListed(soldOn(TODAY), TODAY)).toBe(true);
    expect(isListed(soldOn(addDaysIso(TODAY, -DAYS)), TODAY)).toBe(true);        // last day inside
    expect(isListed(soldOn(addDaysIso(TODAY, -DAYS - 1)), TODAY)).toBe(false);   // one day too old
  });

  it("a sold car without a sale date, or dated in the future, is not listed", () => {
    expect(isListed(car({ status: "Sold" }), TODAY)).toBe(false);
    expect(isListed(car({ status: "Sold", soldAt: addDaysIso(TODAY, 3) }), TODAY)).toBe(false);
  });

  it("free and reserved cars are always listed", () => {
    expect(isListed(car({}), TODAY)).toBe(true);
    expect(isListed(car({ status: "Reserved" }), "2099-01-01")).toBe(true);
  });

  it("sold cars move to the end and keep their order inside each group", () => {
    const a = car({ id: "a" }), b = car({ id: "b", status: "Sold", soldAt: TODAY }), c = car({ id: "c", status: "Reserved" });
    const d = car({ id: "d", status: "Sold", soldAt: TODAY }), e = car({ id: "e" });
    expect(soldLast([a, b, c, d, e]).map((x) => x.id)).toEqual(["a", "c", "e", "b", "d"]);
  });

  it("stock = cars the dealer still has (available + reserved)", () => {
    const list = [car({ id: "1" }), car({ id: "2", status: "Reserved" }), car({ id: "3", status: "Sold", soldAt: TODAY })];
    expect(inStock(list).map((x) => x.id)).toEqual(["1", "2"]);
    expect(listedCars(list, TODAY)).toHaveLength(3);
  });

  it("the demo data shows one reserved and one recently sold car", () => {
    expect(cars.filter(isReserved)).toHaveLength(1);
    expect(cars.filter(isSold)).toHaveLength(1);
    expect(listedCars(cars, todayIso())).toHaveLength(cars.length);
    expect(inStock(cars).every((c) => c.status !== "Sold")).toBe(true);
  });
});

describe("similar cars", () => {
  it("never suggests the car itself and prefers the same body type", () => {
    const suggestions = similarCars(base, cars);
    expect(suggestions).toHaveLength(3);
    expect(suggestions.map((c) => c.id)).not.toContain(base.id);
    expect(suggestions[0].bodyType).toBe(base.bodyType);
  });

  it("among equally similar cars the closest price comes first", () => {
    const pool = [car({ id: "far", price: base.price + 200_000 }), car({ id: "near", price: base.price + 1_000 })];
    expect(similarCars(base, pool).map((c) => c.id)).toEqual(["near", "far"]);
  });
});

describe("staff form and the sale date", () => {
  const form = (existing: Car | null, status: "Available" | "Reserved" | "Sold") => ({ ...toFormValues(existing ?? base), status });

  it("marking a car as sold stamps today's date", () => {
    expect(toCar(form(base, "Sold"), base, () => "x", TODAY)).toMatchObject({ status: "Sold", soldAt: TODAY });
  });

  it("editing a car that is already sold keeps its original sale date", () => {
    const sold = car({ status: "Sold", soldAt: "2026-11-01" });
    expect(toCar(form(sold, "Sold"), sold, () => "x", TODAY).soldAt).toBe("2026-11-01");
  });

  it("putting a sold car back on sale clears the date; available leaves no status field", () => {
    const sold = car({ status: "Sold", soldAt: "2026-11-01" });
    const reserved = toCar(form(sold, "Reserved"), sold, () => "x", TODAY);
    expect(reserved.status).toBe("Reserved");
    expect(reserved.soldAt).toBeUndefined();
    const free = toCar(form(sold, "Available"), sold, () => "x", TODAY);
    expect("status" in free).toBe(false);
    expect("soldAt" in free).toBe(false);
  });
});
