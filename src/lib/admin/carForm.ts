import type { Car } from "@/lib/cars";
import { PLACEHOLDER_CAR_IMAGE, VEHICLE_DEFAULTS, VEHICLE_LIMITS } from "@/config/vehicle";
import { slugify } from "@/lib/slug";
import { MESSAGES } from "@/lib/messages";

/** What the staff form edits — strings, as they come from inputs. */
export type CarFormValues = {
  make: string; model: string; year: string; mileage: string; price: string; color: string;
  fuel: string; transmission: string; drivetrain: string; bodyType: string;
  description: string; features: string; images: string; featured: boolean;
};
export type CarFormErrors = Partial<Record<keyof CarFormValues, string>>;

const M = MESSAGES.car;

const LIST_SEPARATOR = ",";
const toList = (s: string) => s.split(LIST_SEPARATOR).map((x) => x.trim()).filter(Boolean);
const fromList = (items: string[]) => items.join(`${LIST_SEPARATOR} `);

export function toFormValues(car: Car | null): CarFormValues {
  return {
    make: car?.make ?? "", model: car?.model ?? "", year: car ? String(car.year) : "",
    mileage: car ? String(car.mileage) : "", price: car ? String(car.price) : "", color: car?.color ?? "",
    fuel: car?.fuel ?? VEHICLE_DEFAULTS.fuel, transmission: car?.transmission ?? VEHICLE_DEFAULTS.transmission,
    drivetrain: car?.drivetrain ?? VEHICLE_DEFAULTS.drivetrain, bodyType: car?.bodyType ?? VEHICLE_DEFAULTS.bodyType,
    description: car?.description ?? "", features: fromList(car?.features ?? []), images: fromList(car?.images ?? []),
    featured: car?.featured ?? false,
  };
}

const inRange = (v: string, min: number, max: number) => {
  const n = Number(v);
  return v.trim() !== "" && Number.isInteger(n) && n >= min && n <= max;
};

export function validateCarForm(v: CarFormValues): CarFormErrors {
  const e: CarFormErrors = {};
  if (!v.make.trim()) e.make = M.make;
  if (!v.model.trim()) e.model = M.model;
  if (!inRange(v.year, VEHICLE_LIMITS.minYear, VEHICLE_LIMITS.maxYear)) e.year = M.yearRange(VEHICLE_LIMITS.minYear, VEHICLE_LIMITS.maxYear);
  if (!inRange(v.mileage, 0, VEHICLE_LIMITS.maxMileage)) e.mileage = M.mileageRange(VEHICLE_LIMITS.maxMileage);
  if (!inRange(v.price, 1, VEHICLE_LIMITS.maxPrice)) e.price = M.price;
  if (!v.color.trim()) e.color = M.color;
  return e;
}

/** Builds the Car to save; keeps id and slug when editing. */
export function toCar(v: CarFormValues, existing: Car | null, newId: () => string): Car {
  const make = v.make.trim();
  const model = v.model.trim();
  const images = toList(v.images);
  return {
    id: existing?.id ?? newId(),
    slug: existing?.slug ?? slugify(`${make} ${model} ${v.year}`),
    make, model, title: `${make} ${model}`,
    year: Number(v.year), mileage: Number(v.mileage), price: Number(v.price), color: v.color.trim(),
    fuel: v.fuel, transmission: v.transmission, drivetrain: v.drivetrain, bodyType: v.bodyType,
    description: v.description.trim(), features: toList(v.features),
    images: images.length > 0 ? images : [PLACEHOLDER_CAR_IMAGE],
    featured: v.featured,
  };
}

export const newCustomCarId = () => `custom-${Date.now()}`;
