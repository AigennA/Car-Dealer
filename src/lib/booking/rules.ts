import { catalog, zonedToUtc, type Catalog } from "@/lib/workshop";
import type { BookingStatus } from "./types";

/**
 * Self-service rules — the same as backend Services/BookingManagementService.cs.
 */
const CHANGEABLE: BookingStatus[] = ["Booked", "Confirmed"];

export function changeDeadline(date: string, time: string, cat: Catalog = catalog): Date {
  return new Date(zonedToUtc(date, time, cat.timeZone).getTime() - cat.changeCutoffHours * 3_600_000);
}

export function canChange(status: BookingStatus, date: string, time: string, now: Date, cat: Catalog = catalog): boolean {
  return CHANGEABLE.includes(status) && now.getTime() <= changeDeadline(date, time, cat).getTime();
}

/** "cd-7k3 pqx" → "CD-7K3PQX" */
export const normalizeReference = (reference: string) => reference.trim().toUpperCase().replace(/\s+/g, "");

export const STATUS_LABEL: Record<BookingStatus, string> = {
  Booked: "Bokad",
  Confirmed: "Bekräftad",
  Arrived: "Incheckad",
  Completed: "Klar",
  Cancelled: "Avbokad",
};
