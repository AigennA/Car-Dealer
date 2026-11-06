import { beforeEach, describe, expect, it } from "vitest";
import { authenticate, register, DEMO_ACCOUNT, ACCOUNT_MESSAGES, MIN_DEMO_PASSWORD_LENGTH } from "@/lib/admin/accounts";
import { toCar, toFormValues, validateCarForm } from "@/lib/admin/carForm";
import { PLACEHOLDER_CAR_IMAGE, VEHICLE_DEFAULTS, VEHICLE_LIMITS } from "@/config/vehicle";
import { slugify } from "@/lib/slug";
import { cars } from "@/lib/cars";
import { isActiveRoute, MAIN_NAV, ROUTES, SITEMAP_PAGES } from "@/config/navigation";

beforeEach(() => localStorage.clear());

describe("demo staff accounts", () => {
  it("the demo account from data/demo.json can sign in (case-insensitive user)", () => {
    expect(authenticate(DEMO_ACCOUNT.username.toUpperCase(), DEMO_ACCOUNT.password)).toEqual({ ok: true, username: DEMO_ACCOUNT.username.toUpperCase() });
    expect(authenticate(DEMO_ACCOUNT.username, "fel")).toEqual({ ok: false, error: ACCOUNT_MESSAGES.wrongCredentials });
  });

  it("registers new accounts with rules", () => {
    expect(register("", "x")).toEqual({ ok: false, error: ACCOUNT_MESSAGES.usernameRequired });
    expect(register("kim", "x".repeat(MIN_DEMO_PASSWORD_LENGTH - 1))).toEqual({ ok: false, error: ACCOUNT_MESSAGES.passwordTooShort });
    expect(register("kim", "hemligt")).toEqual({ ok: true, username: "kim" });
    expect(register("KIM", "hemligt")).toEqual({ ok: false, error: ACCOUNT_MESSAGES.usernameTaken });
    expect(authenticate("kim", "hemligt").ok).toBe(true);
  });
});

describe("staff car form model", () => {
  it("new cars get the configured defaults", () => {
    const v = toFormValues(null);
    expect(v.fuel).toBe(VEHICLE_DEFAULTS.fuel);
    expect(v.bodyType).toBe(VEHICLE_DEFAULTS.bodyType);
  });

  it("round-trips an existing car", () => {
    const car = cars[0];
    expect(toCar(toFormValues(car), car, () => "new")).toEqual(car);
  });

  it("validates against the configured limits", () => {
    const errors = validateCarForm({ ...toFormValues(null), year: String(VEHICLE_LIMITS.minYear - 1), price: "0" });
    expect(Object.keys(errors).sort()).toEqual(["color", "make", "mileage", "model", "price", "year"]);
  });

  it("creates slug, id and placeholder image for a new car", () => {
    const v = { ...toFormValues(null), make: "Škoda", model: "Octavia RS", year: "2022", mileage: "1000", price: "300000", color: "Grå" };
    const car = toCar(v, null, () => "custom-1");
    expect(car).toMatchObject({ id: "custom-1", slug: "koda-octavia-rs-2022", title: "Škoda Octavia RS", images: [PLACEHOLDER_CAR_IMAGE] });
  });

  it("slugify matches the API rules", () => {
    expect(slugify("Räv Öl Å")).toBe("rav-ol-a");
    expect(slugify("!!!")).toBe("bil");
  });
});

describe("navigation config", () => {
  it("marks the active route", () => {
    expect(isActiveRoute("/bilar/volvo/", ROUTES.cars)).toBe(true);
    expect(isActiveRoute("/bilar", ROUTES.home)).toBe(false);
    expect(isActiveRoute("/", ROUTES.home)).toBe(true);
  });

  it("every main menu page is in the sitemap; staff pages are not", () => {
    const paths = SITEMAP_PAGES.map((p) => p.path);
    for (const link of MAIN_NAV) expect(paths).toContain(link.href);
    expect(paths).not.toContain(ROUTES.staff);
  });
});
