import { useSyncExternalStore } from "react";

/** Demo staff session in sessionStorage, exposed as an external store (no setState-in-effect). */
const AUTH_KEY = "admin_auth";
const USER_KEY = "admin_user";
const EVENT = "car-dealer:admin-session";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

function currentUser(): string {
  return sessionStorage.getItem(AUTH_KEY) === "true" ? (sessionStorage.getItem(USER_KEY) ?? "") : "";
}

export function signIn(username: string) {
  sessionStorage.setItem(AUTH_KEY, "true");
  sessionStorage.setItem(USER_KEY, username);
  window.dispatchEvent(new Event(EVENT));
}

export function signOut() {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(EVENT));
}

/** "" when signed out. */
export function useStaffUser(): string {
  return useSyncExternalStore(subscribe, currentUser, () => "");
}
