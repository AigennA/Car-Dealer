#!/usr/bin/env node
// Exports the built-in inventory (src/lib/cars.ts) as the backend's seed data,
// so the website and the database start from the same 24 cars.
// Usage: npm run seed:export
import { writeFileSync } from "node:fs";
import { cars } from "../src/lib/cars.ts";

const out = "backend/src/CarDealer.Api/Data/seed-cars.json";
writeFileSync(out, JSON.stringify(cars, null, 2) + "\n");
console.log(`Wrote ${cars.length} cars to ${out}`);
