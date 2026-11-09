import data from "../../data/business.json";

/**
 * Typed access to the dealer's business facts (data/business.json) plus
 * formatting helpers, so no component hard-codes a phone number, an
 * opening time, a warranty period or an interest rate.
 */
type DayHours = [string, string];
type WeekHours = Partial<Record<"1" | "2" | "3" | "4" | "5" | "6" | "7", DayHours>>;

export const BUSINESS = data as unknown as {
  name: string;
  legalName: string;
  orgNumber: string;
  foundedYear: number;
  copyrightHolder: string;
  url: string;
  /** Customer self-service page for bookings ("Min bokning"); the API builds links to it too. */
  manageBookingPath: string;
  /** Shows the "demo site" banner. Set to false when the site is used by a real dealer. */
  demoSite: boolean;
  /** "Boka provkörning": short visits in the showroom's opening hours, one car at a time (the API reads the same values). */
  testDrive: { durationMinutes: number; slotMinutes: number; minLeadMinutes: number; bookingHorizonDays: number; changeCutoffHours: number };
  description: string;
  tagline: string;
  contact: { phone: string; phoneE164: string; email: string };
  address: { street: string; postalCode: string; city: string; country: string };
  showroomHours: WeekHours;
  policies: { baseWarrantyMonths: number; warrantyMonths: number; openPurchaseDays: number; refundDays: number; responseHours: number;
    /** A sold car stays in the listing, marked "Såld", for this many days (the API reads the same value). */
    soldVisibleDays: number };
  financing: { annualRate: number; loanTermsMonths: number[]; defaultTermMonths: number; defaultDownPaymentShare: number; leasingTermMonths: [number, number] };
  maps: { embedUrl: string };
  dataRetention: { leadMonths: number; bookingMonths: number; tradeInMonths: number; bookkeepingYears: number };
};

export const phoneHref = `tel:${BUSINESS.contact.phoneE164}`;
export const emailHref = `mailto:${BUSINESS.contact.email}`;
export const fullAddress = `${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city}`;

const DAY_NAMES = ["", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
const DAY_SHORT = ["", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
const SCHEMA_DAYS = ["", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export type HoursRow = { days: string; hours: string | null };

/** Groups consecutive days with equal hours: [{days: "Måndag–fredag", hours: "09:00–18:00"}, …]. */
export function hoursRows(week: WeekHours, short = false): HoursRow[] {
  const names = short ? DAY_SHORT : DAY_NAMES;
  const label = (d: number) => names[d];
  const key = (d: number) => week[String(d) as keyof WeekHours]?.join("–") ?? null;
  const rows: HoursRow[] = [];
  let start = 1;
  for (let d = 2; d <= 8; d++) {
    if (d === 8 || key(d) !== key(start)) {
      const end = d - 1;
      const days = start === end ? label(start) : `${label(start)}–${label(end).toLowerCase()}`;
      rows.push({ days, hours: key(start) });
      start = d;
    }
  }
  return rows;
}

/** Compact one-liner, e.g. "Mån–fre 09–18, Lör 10–15". Closed days are omitted. */
export function hoursSummary(week: WeekHours): string {
  return hoursRows(week, true)
    .filter((r) => r.hours)
    .map((r) => `${r.days} ${r.hours!.replace(/:00/g, "")}`)
    .join(", ");
}

/** schema.org openingHours strings, e.g. ["Mo-Fr 09:00-18:00", "Sa 10:00-15:00"]. */
export function schemaOpeningHours(week: WeekHours): string[] {
  return hoursRows(week)
    .filter((r) => r.hours)
    .map((r) => {
      const [first, last] = r.days.split("–").map((n) => DAY_NAMES.findIndex((x) => x.toLowerCase() === n.toLowerCase()));
      const days = last > 0 ? `${SCHEMA_DAYS[first]}-${SCHEMA_DAYS[last]}` : SCHEMA_DAYS[first];
      return `${days} ${r.hours!.replace("–", "-")}`;
    });
}

/** 0.0395 → "3,95 %" (Swedish formatting). */
export const formatPercent = (rate: number) =>
  `${(rate * 100).toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;

export const formatSek = (amount: number) => `${amount.toLocaleString("sv-SE")} kr`;
