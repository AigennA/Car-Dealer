import { ROUTES } from "@/config/navigation";
import type { BookingAccess } from "./types";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * The customer's personal link: /min-bokning/?ref=CD-XXXXXX#t=<secret>.
 * The secret sits in the #fragment, which browsers never send to a server,
 * so it does not end up in access logs or analytics.
 */
export function manageHref(reference: string, token?: string): string {
  const query = `?ref=${encodeURIComponent(reference)}`;
  return `${ROUTES.myBooking}/${query}${token ? `#t=${encodeURIComponent(token)}` : ""}`;
}

/** Absolute version of manageHref, for the QR code and the calendar file. */
export function manageUrl(reference: string, token?: string, origin = typeof window === "undefined" ? "" : window.location.origin) {
  return `${origin}${BASE_PATH}${manageHref(reference, token)}`;
}

/** Reads ?ref= and #t= from the current address. */
export function parseManageLink(search: string, hash: string): BookingAccess | null {
  const reference = new URLSearchParams(search).get("ref")?.trim();
  if (!reference) return null;
  const token = new URLSearchParams(hash.replace(/^#/, "")).get("t") ?? undefined;
  return { reference, token };
}
