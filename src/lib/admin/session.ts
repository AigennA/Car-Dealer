import { useSyncExternalStore } from "react";

/** Demo staff session in sessionStorage, exposed as an external store (no setState-in-effect). */
export const ADMIN_AUTH_KEY = "admin_auth";
export const ADMIN_USER_KEY = "admin_user";
export const ADMIN_SESSION_EVENT = "car-dealer:admin-session";

function subscribe(cb: () => void) {
  window.addEventListener(ADMIN_SESSION_EVENT, cb);
  return () => window.removeEventListener(ADMIN_SESSION_EVENT, cb);
}

function currentUser(): string {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true" ? (sessionStorage.getItem(ADMIN_USER_KEY) ?? "") : "";
}

export function signIn(username: string) {
  sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
  sessionStorage.setItem(ADMIN_USER_KEY, username);
  window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
}

export function signOut() {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
  sessionStorage.removeItem(ADMIN_USER_KEY);
  window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
}

/** "" when signed out. */
export function useStaffUser(): string {
  return useSyncExternalStore(subscribe, currentUser, () => "");
}
