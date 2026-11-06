import { useSyncExternalStore } from "react";
import { cars as staticCars, type Car } from "./cars";

export const STORAGE_KEY = "car_dealer_custom_cars";
const CHANGE_EVENT = "car-dealer:cars-changed";

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function parseCustomCars(raw: string | null): Car[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Car[]) : [];
  } catch {
    return [];
  }
}

function getCustomCars(): Car[] {
  return parseCustomCars(readRaw());
}

function saveCustomCars(cars: Car[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getAllCars(): Car[] {
  return [...staticCars, ...getCustomCars()];
}

export function addCar(car: Car): void {
  const custom = getCustomCars();
  custom.push(car);
  saveCustomCars(custom);
}

export function updateCar(id: string, updatedCar: Car): boolean {
  const custom = getCustomCars();
  const index = custom.findIndex((c) => c.id === id);
  if (index === -1) return false;
  custom[index] = updatedCar;
  saveCustomCars(custom);
  return true;
}

export function deleteCar(id: string): boolean {
  const custom = getCustomCars();
  const index = custom.findIndex((c) => c.id === id);
  if (index === -1) return false;
  custom.splice(index, 1);
  saveCustomCars(custom);
  return true;
}

/* ── React binding ────────────────────────────────────────────────────────
   useSyncExternalStore lets the static HTML (server snapshot) contain the
   built-in inventory, so pages are crawlable and paint real content
   immediately, while admin-added cars from localStorage appear after
   hydration — without calling setState inside an effect. */

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

let cachedRaw: string | null = null;
let cachedCars: Car[] = staticCars;

function getSnapshot(): Car[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedCars = [...staticCars, ...parseCustomCars(raw)];
  }
  return cachedCars;
}

function getServerSnapshot(): Car[] {
  return staticCars;
}

export function useCars(): Car[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
