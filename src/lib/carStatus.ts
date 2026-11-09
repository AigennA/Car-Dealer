import { BUSINESS } from "@/config/business";
import { daysBetween } from "./dates";
import type { Car, CarStatus } from "./cars";

/** Text shown on the cars: the one place that names the states. */
export const STATUS_LABEL: Record<Exclude<CarStatus, "Available">, string> = {
  Reserved: "Reserverad",
  Sold: "Såld",
};

export const statusOf = (car: Car): CarStatus => car.status ?? "Available";
export const isSold = (car: Car): boolean => statusOf(car) === "Sold";
export const isReserved = (car: Car): boolean => statusOf(car) === "Reserved";

/** Test drives, questions and booking are only offered for cars that are free. */
export const isBookable = (car: Car): boolean => statusOf(car) === "Available";

/** Cars the dealer still has: available or reserved (a sold car is gone). */
export const inStock = (cars: readonly Car[]): Car[] => cars.filter((c) => !isSold(c));

/**
 * Listed = shown in the stock listing. Free and reserved cars always are; a sold car only for
 * `visibleDays` after the sale. Without a sale date it is not listed (it cannot be timed).
 */
export function isListed(car: Car, today: string, visibleDays: number = BUSINESS.policies.soldVisibleDays): boolean {
  if (!isSold(car)) return true;
  if (!car.soldAt) return false;
  const age = daysBetween(car.soldAt, today);
  return age >= 0 && age <= visibleDays;
}

export const listedCars = (cars: readonly Car[], today: string, visibleDays?: number): Car[] =>
  cars.filter((c) => isListed(c, today, visibleDays));

/** Moves sold cars to the end, keeping the existing order inside both groups. */
export function soldLast(cars: readonly Car[]): Car[] {
  return [...cars.filter((c) => !isSold(c)), ...cars.filter(isSold)];
}
