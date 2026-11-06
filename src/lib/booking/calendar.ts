import { BUSINESS, fullAddress } from "@/config/business";
import { zonedToUtc } from "@/lib/workshop";

export type CalendarEvent = {
  reference: string;
  serviceName: string;
  date: string;
  time: string;
  durationMinutes: number;
  /** Link back to "Min bokning". */
  url: string;
};

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** RFC 5545: lines longer than 75 octets are folded (CRLF + space). */
function fold(line: string): string {
  const bytes = new TextEncoder();
  const out: string[] = [];
  let current = "";
  for (const ch of line) {
    if (bytes.encode(current + ch).length > 75) {
      out.push(current);
      current = ` ${ch}`;
    } else current += ch;
  }
  out.push(current);
  return out.join("\r\n");
}

/** An .ics file ("Lägg till i kalendern") with a reminder the day before. */
export function bookingIcs(e: CalendarEvent, now: Date = new Date()): string {
  const start = zonedToUtc(e.date, e.time);
  const end = new Date(start.getTime() + e.durationMinutes * 60_000);
  const host = new URL(BUSINESS.url).host;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${escape(BUSINESS.name)}//Min bokning//SV`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.reference}@${host}`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(`${e.serviceName} – ${BUSINESS.name}`)}`,
    `LOCATION:${escape(fullAddress)}`,
    `DESCRIPTION:${escape(`Bokningsnummer ${e.reference}. Ändra eller avboka: ${e.url}`)}`,
    `URL:${e.url}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(`${e.serviceName} i morgon kl. ${e.time}`)}`,
    "TRIGGER:-P1D",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].map(fold).join("\r\n") + "\r\n";
}

/** data: URL so the download works without JavaScript blobs (and in tests). */
export const icsHref = (ics: string) => `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
