import type { Car } from "./cars";

/**
 * Cars to suggest next to `car`: same body type counts most, then same fuel, then the closest
 * price. Only pass cars the dealer still has (see inStock); the car itself is left out.
 */
export function similarCars(car: Car, pool: readonly Car[], limit = 3): Car[] {
  const score = (c: Car) => (c.bodyType === car.bodyType ? 2 : 0) + (c.fuel === car.fuel ? 1 : 0);
  return pool
    .filter((c) => c.id !== car.id)
    .sort((a, b) => score(b) - score(a) || Math.abs(a.price - car.price) - Math.abs(b.price - car.price))
    .slice(0, limit);
}
