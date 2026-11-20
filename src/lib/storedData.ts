import { CONSENT_EVENT, CONSENT_KEY } from "./consent";
import { CARS_CHANGED_EVENT, STORAGE_KEY as CUSTOM_CARS_KEY } from "./clientStorage";
import { ACCOUNTS_KEY } from "./admin/accounts";
import { ADMIN_AUTH_KEY, ADMIN_SESSION_EVENT, ADMIN_USER_KEY } from "./admin/session";
import { DEMO_BOOKINGS_KEY } from "./booking/storageKey";

/**
 * Everything the site stores in the visitor's browser. "Rensa all sparad data" removes exactly these,
 * and the cookie page (src/app/cookies/page.tsx) must list exactly these (a test checks both), so
 * the promise "all data is removed" stays true when a new key is added.
 */
export const LOCAL_STORAGE_KEYS = [CONSENT_KEY, CUSTOM_CARS_KEY, ACCOUNTS_KEY, DEMO_BOOKINGS_KEY] as const;
export const SESSION_STORAGE_KEYS = [ADMIN_AUTH_KEY, ADMIN_USER_KEY] as const;

/** Removes all of it and tells the parts of the page that show it (consent, car list, staff login). */
export function clearAllStoredData(): void {
  for (const key of LOCAL_STORAGE_KEYS) localStorage.removeItem(key);
  for (const key of SESSION_STORAGE_KEYS) sessionStorage.removeItem(key);
  for (const event of [CONSENT_EVENT, CARS_CHANGED_EVENT, ADMIN_SESSION_EVENT]) window.dispatchEvent(new Event(event));
}
