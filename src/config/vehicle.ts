/**
 * Allowed vehicle attributes for the staff form (the public filters derive
 * their options from the inventory itself). Labels are what staff see.
 */
type Option = { value: string; label: string };

export const VEHICLE_OPTIONS = {
  fuel: [
    { value: "Bensin", label: "Bensin" },
    { value: "Diesel", label: "Diesel" },
    { value: "El", label: "El" },
    { value: "Hybrid", label: "Hybrid" },
  ],
  transmission: [
    { value: "Automat", label: "Automat" },
    { value: "Manuell", label: "Manuell" },
  ],
  drivetrain: [
    { value: "FWD", label: "FWD (framhjulsdrift)" },
    { value: "RWD", label: "RWD (bakhjulsdrift)" },
    { value: "AWD", label: "AWD (fyrhjulsdrift)" },
  ],
  bodyType: [
    { value: "Sedan", label: "Sedan" },
    { value: "SUV", label: "SUV" },
    { value: "Kombi", label: "Kombi" },
    { value: "Halvkombi", label: "Halvkombi" },
    { value: "Coupé", label: "Coupé" },
  ],
} satisfies Record<string, Option[]>;

export type VehicleOptionKey = keyof typeof VEHICLE_OPTIONS;

/** Pre-selected values for a new car: the first option of each list. */
export const VEHICLE_DEFAULTS = Object.fromEntries(
  Object.entries(VEHICLE_OPTIONS).map(([k, opts]) => [k, opts[0].value]),
) as Record<VehicleOptionKey, string>;

/** Shown when a car is saved without photos. */
export const PLACEHOLDER_CAR_IMAGE =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop";

export const VEHICLE_LIMITS = { minYear: 1950, maxYear: 2100, maxMileage: 100_000, maxPrice: 20_000_000 } as const;
