import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CookiesPage from "@/app/cookies/page";
import CookieSettings from "@/components/legal/CookieSettings";
import { CONSENT_EVENT } from "@/lib/consent";
import { CARS_CHANGED_EVENT } from "@/lib/clientStorage";
import { ADMIN_SESSION_EVENT } from "@/lib/admin/session";
import { DEMO_BOOKINGS_KEY } from "@/lib/booking/storageKey";
import { clearAllStoredData, LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from "@/lib/storedData";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

const fillEverything = () => {
  for (const key of LOCAL_STORAGE_KEYS) localStorage.setItem(key, "x");
  for (const key of SESSION_STORAGE_KEYS) sessionStorage.setItem(key, "x");
};

describe("clearAllStoredData", () => {
  it("removes every key the site stores, local and session, and nothing else", () => {
    fillEverything();
    localStorage.setItem("someone-elses-key", "keep");
    clearAllStoredData();
    for (const key of LOCAL_STORAGE_KEYS) expect(localStorage.getItem(key)).toBeNull();
    for (const key of SESSION_STORAGE_KEYS) expect(sessionStorage.getItem(key)).toBeNull();
    expect(localStorage.getItem("someone-elses-key")).toBe("keep");
  });

  it("tells consent, the car list and the staff login to refresh", () => {
    const seen: string[] = [];
    const listen = (name: string) => window.addEventListener(name, () => seen.push(name));
    [CONSENT_EVENT, CARS_CHANGED_EVENT, ADMIN_SESSION_EVENT].forEach(listen);
    clearAllStoredData();
    expect(seen.sort()).toEqual([ADMIN_SESSION_EVENT, CARS_CHANGED_EVENT, CONSENT_EVENT].sort());
  });

  it("includes the demo bookings (they hold an e-mail address)", () => {
    expect(LOCAL_STORAGE_KEYS).toContain(DEMO_BOOKINGS_KEY);
  });
});

describe("the cookie page tells the truth about what is stored", () => {
  it("lists every key that 'Rensa all sparad data' removes", () => {
    render(<CookiesPage />);
    const text = document.body.textContent ?? "";
    for (const key of [...LOCAL_STORAGE_KEYS, ...SESSION_STORAGE_KEYS]) {
      expect(text, `the cookie page does not mention ${key}`).toContain(key);
    }
  });

  it("describes the Google Maps cookies with purpose and lifetime", () => {
    render(<CookiesPage />);
    const table = screen.getByRole("table", { name: "Cookies från Google Maps" });
    expect(table).toHaveTextContent("NID");
    expect(table).toHaveTextContent("AEC");
    expect(table).toHaveTextContent(/6 månader/);
    expect(screen.getByRole("link", { name: "Googles egen sida" })).toHaveAttribute("href", "https://policies.google.com/technologies/types");
  });
});

describe("<CookieSettings> – Rensa all sparad data", () => {
  it("removes the demo bookings too and says so", async () => {
    fillEverything();
    render(<CookieSettings />);
    await userEvent.click(screen.getByRole("button", { name: "Rensa all sparad data" }));
    expect(localStorage.getItem(DEMO_BOOKINGS_KEY)).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("All data som webbplatsen sparat i din webbläsare är borttagen.");
  });
});
