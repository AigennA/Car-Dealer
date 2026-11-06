import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { cars } from "@/lib/cars";
import { addCar, deleteCar, getAllCars, parseCustomCars, updateCar, useCars, STORAGE_KEY } from "@/lib/clientStorage";

const custom = { ...cars[0], id: "custom-1", slug: "test-bil-2024", title: "Test Bil" };

describe("clientStorage", () => {
  it("starts with the static inventory", () => {
    expect(getAllCars()).toHaveLength(cars.length);
  });

  it("add / update / delete custom cars", () => {
    addCar(custom);
    expect(getAllCars()).toHaveLength(cars.length + 1);

    expect(updateCar("custom-1", { ...custom, price: 1 })).toBe(true);
    expect(getAllCars().find((c) => c.id === "custom-1")?.price).toBe(1);

    expect(deleteCar("custom-1")).toBe(true);
    expect(getAllCars()).toHaveLength(cars.length);
  });

  it("refuses to update or delete built-in cars", () => {
    expect(updateCar(cars[0].id, cars[0])).toBe(false);
    expect(deleteCar(cars[0].id)).toBe(false);
  });

  it("survives corrupt localStorage data", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(getAllCars()).toHaveLength(cars.length);
    expect(parseCustomCars('{"a":1}')).toEqual([]);
  });

  it("useCars() re-renders when a car is added", () => {
    const { result } = renderHook(() => useCars());
    expect(result.current).toHaveLength(cars.length);
    act(() => addCar(custom));
    expect(result.current).toHaveLength(cars.length + 1);
  });
});
