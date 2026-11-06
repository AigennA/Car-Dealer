import { useSyncExternalStore } from "react";

/**
 * Consent for optional third-party content (currently only the Google Maps
 * embed, which sets cookies). Nothing optional loads without it — so no
 * site-wide cookie banner is needed: necessary storage (admin demo data,
 * this choice itself) is exempt under LEK 9 kap. 28 § / ePrivacy art. 5.3.
 */
export type ConsentKey = "maps";
export type Consent = Record<ConsentKey, boolean>;

export const CONSENT_KEY = "car_dealer_consent";
const EVENT = "car-dealer:consent-changed";
const NONE: Consent = { maps: false };

export function readConsent(raw: string | null): Consent {
  if (!raw) return NONE;
  try {
    const parsed = JSON.parse(raw) as Partial<Consent>;
    return { maps: parsed.maps === true };
  } catch {
    return NONE;
  }
}

export function setConsent(key: ConsentKey, value: boolean): void {
  const next = { ...readConsent(localStorage.getItem(CONSENT_KEY)), [key]: value };
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...next, updatedAt: new Date().toISOString() }));
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

let cacheRaw: string | null | undefined;
let cache: Consent = NONE;
function snapshot(): Consent {
  const raw = localStorage.getItem(CONSENT_KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cache = readConsent(raw);
  }
  return cache;
}

export function useConsent(): Consent {
  return useSyncExternalStore(subscribe, snapshot, () => NONE);
}
