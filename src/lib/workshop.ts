import catalogJson from "../../data/workshop.json";

/**
 * Workshop ("Verkstad") & inspection ("Besiktning") catalogue and booking.
 * data/workshop.json is shared with the API, so prices, durations and opening
 * hours are identical. The scheduling rules below mirror
 * backend/src/CarDealer.Api/Workshop/Availability.cs (used by the demo
 * repository in src/lib/booking/repository.ts).
 */
export type ServiceCategory = "verkstad" | "besiktning";
export type WorkshopService = {
  code: string;
  category: ServiceCategory;
  name: string;
  description: string;
  minutes: number;
  priceFrom: number;
};
export type Catalog = {
  timeZone: string;
  slotMinutes: number;
  bays: number;
  minLeadMinutes: number;
  bookingHorizonDays: number;
  /** Customers can move or cancel online until this many hours before the appointment. */
  changeCutoffHours: number;
  openingHours: Record<string, [string, string]>;
  services: WorkshopService[];
};

export const catalog = catalogJson as unknown as Catalog;
export const servicesIn = (category: ServiceCategory) => catalog.services.filter((s) => s.category === category);
export const findService = (code: string) => catalog.services.find((s) => s.code === code);

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** ISO date string (YYYY-MM-DD) → ISO weekday 1 (Mon) … 7 (Sun). */
export function isoWeekday(date: string): number {
  const d = new Date(`${date}T12:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Current date and minutes-since-midnight in the workshop's time zone. */
export function zonedNow(now: Date = new Date(), timeZone = catalog.timeZone): { date: string; minutes: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(now).map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

/** Local workshop date + "HH:MM" → the UTC instant (handles summer/winter time). */
export function zonedToUtc(date: string, time: string, timeZone = catalog.timeZone): Date {
  const guess = Date.parse(`${date}T${time}:00Z`);
  const offsetAt = (ms: number) => {
    const z = zonedNow(new Date(ms), timeZone);
    return Date.parse(`${z.date}T${toHHMM(z.minutes)}:00Z`) - ms;
  };
  const first = guess - offsetAt(guess);
  return new Date(guess - offsetAt(first));
}

export type Occupied = { start: string; minutes: number };

/** Same rules as the API: opening hours, lead time, horizon, bay capacity. */
export function freeStarts(
  service: WorkshopService,
  date: string,
  now: Date = new Date(),
  taken: Occupied[] = [],
  cat: Catalog = catalog,
): string[] {
  const { date: today, minutes: nowMin } = zonedNow(now, cat.timeZone);
  if (date < today || date > addDays(today, cat.bookingHorizonDays)) return [];
  const hours = cat.openingHours[String(isoWeekday(date))];
  if (!hours) return [];
  const [open, close] = hours.map(toMin);
  // Minutes from today's midnight, so a lead time that spills past midnight works too.
  const dayOffset = Math.round((Date.parse(`${date}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86_400_000);
  const earliest = nowMin + cat.minLeadMinutes;

  const result: string[] = [];
  for (let m = open; m + service.minutes <= close; m += cat.slotMinutes) {
    if (dayOffset * 24 * 60 + m < earliest) continue;
    let fits = true;
    for (let t = 0; t < service.minutes && fits; t += cat.slotMinutes) {
      const at = m + t;
      const overlapping = taken.filter((b) => at >= toMin(b.start) && at < toMin(b.start) + b.minutes).length;
      if (overlapping >= cat.bays) fits = false;
    }
    if (fits) result.push(toHHMM(m));
  }
  return result;
}

/** "2026-11-10" → "tisdag 10 november". */
export function formatDay(date: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("sv-SE", { ...opts, timeZone: "UTC" });
}

export const formatDuration = (min: number) =>
  min < 60 ? `${min} min` : min % 60 === 0 ? `${min / 60} h` : `${Math.floor(min / 60)} h ${min % 60} min`;

export { REG_NUMBER_RE as REG_RE } from "./validation";
export const normalizeReg = (reg: string) => reg.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
