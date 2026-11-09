#!/usr/bin/env node
// Exports the built-in inventory (src/lib/cars.ts) as the backend's seed data,
// so the website and the database start from the same 24 cars.
// Usage: npm run seed:export
import { writeFileSync } from "node:fs";
import { cars } from "../src/lib/cars.ts";

const out = "backend/src/CarDealer.Api/Data/seed-cars.json";
// The website's demo marks a couple of cars as reserved/sold. The database starts with
// every car available, so those two fields are left out of the seed.
const seed = cars.map((car) => {
  const copy = { ...car };
  delete copy.status;
  delete copy.soldAt;
  return copy;
});
writeFileSync(out, JSON.stringify(seed, null, 2) + "\n");
console.log(`Wrote ${seed.length} cars to ${out}`);
