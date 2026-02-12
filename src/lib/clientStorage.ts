import { cars as staticCars, type Car } from "./cars";

const STORAGE_KEY = "car_dealer_custom_cars";

function getCustomCars(): Car[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCustomCars(cars: Car[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
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
  if (index !== -1) {
    custom[index] = updatedCar;
    saveCustomCars(custom);
    return true;
  }
  return false;
}

export function deleteCar(id: string): boolean {
  const custom = getCustomCars();
  const index = custom.findIndex((c) => c.id === id);
  if (index !== -1) {
    custom.splice(index, 1);
    saveCustomCars(custom);
    return true;
  }
  return false;
}
