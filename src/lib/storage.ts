import { cars as initialCars, type Car } from "./cars";

// Shared in-memory storage for demo purposes
// In production, this would be replaced with a database
class CarStorage {
  private cars: Car[] = [...initialCars];

  getAll(): Car[] {
    return [...this.cars];
  }

  getById(id: string): Car | undefined {
    return this.cars.find((c) => c.id === id);
  }

  create(car: Car): Car {
    this.cars.push(car);
    return car;
  }

  update(id: string, car: Car): Car | null {
    const index = this.cars.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.cars[index] = car;
    return car;
  }

  delete(id: string): Car | null {
    const index = this.cars.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const deletedCar = this.cars[index];
    this.cars.splice(index, 1);
    return deletedCar;
  }
}

// Singleton instance
export const carStorage = new CarStorage();
