import { ApiError } from "@/lib/api";
import { MESSAGES } from "@/lib/messages";
import { addDays, catalog, findService, freeStarts, isoWeekday, normalizeReg, zonedNow, type Catalog } from "@/lib/workshop";
import { canChange, changeDeadline, normalizeReference } from "./rules";
import type {
  BookableDay, BookingAccess, BookingConfirmation, BookingRepository, BookingRequest, BookingStatus, ManagedBooking,
} from "./types";

/** A booking as the demo keeps it in the visitor's own browser. */
export type DemoBooking = {
  reference: string;
  token: string;
  serviceCode: string;
  date: string;
  time: string;
  durationMinutes: number;
  email: string;
  regNumber: string;
  status: BookingStatus;
};

export interface DemoBookingStore {
  load(): DemoBooking[];
  save(bookings: DemoBooking[]): void;
}

export const DEMO_BOOKINGS_KEY = "car_dealer_demo_bookings";

/** localStorage, so "Min bokning" works in the demo too. Nothing leaves the browser. */
export const browserStore: DemoBookingStore = {
  load() {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(DEMO_BOOKINGS_KEY) ?? "[]");
      return Array.isArray(parsed) ? (parsed as DemoBooking[]) : [];
    } catch {
      return [];
    }
  },
  save(bookings) {
    try {
      localStorage.setItem(DEMO_BOOKINGS_KEY, JSON.stringify(bookings));
    } catch {
      /* private mode / storage full: the demo still shows the confirmation */
    }
  },
};

export const memoryStore = (initial: DemoBooking[] = []): DemoBookingStore => {
  let data = [...initial];
  return { load: () => data, save: (b) => void (data = [...b]) };
};

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const randomCode = (length: number) => {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
};

/**
 * Demo mode for the static site: the same scheduling and self-service rules
 * as the API, computed in the browser. Clock, catalogue and storage are
 * injectable for tests. References start with DEMO- so they are never
 * mistaken for real bookings.
 */
export class DemoBookingRepository implements BookingRepository {
  constructor(
    private readonly now: () => Date = () => new Date(),
    private readonly cat: Catalog = catalog,
    private readonly store: DemoBookingStore = browserStore,
  ) {}

  private taken(date: string, except?: string) {
    return this.store.load()
      .filter((b) => b.date === date && b.status !== "Cancelled" && b.reference !== except)
      .map((b) => ({ start: b.time, minutes: b.durationMinutes }));
  }

  async loadDays(serviceCode: string) {
    const svc = findService(serviceCode);
    if (!svc) return [];
    const today = zonedNow(this.now(), this.cat.timeZone).date;
    const days: BookableDay[] = [];
    for (let i = 0; i <= this.cat.bookingHorizonDays; i++) {
      const date = addDays(today, i);
      if (!this.cat.openingHours[String(isoWeekday(date))]) continue;
      days.push({ date, freeSlots: freeStarts(svc, date, this.now(), this.taken(date), this.cat).length });
    }
    return days;
  }

  async loadSlots(serviceCode: string, date: string) {
    const svc = findService(serviceCode);
    return svc ? freeStarts(svc, date, this.now(), this.taken(date), this.cat) : [];
  }

  async create(request: BookingRequest): Promise<BookingConfirmation> {
    const svc = findService(request.serviceCode);
    if (!svc) throw new Error(`Unknown service ${request.serviceCode}`);
    if (!(await this.loadSlots(svc.code, request.date)).includes(request.time)) {
      throw new ApiError(409, MESSAGES.myBooking.slotTaken);
    }
    const booking: DemoBooking = {
      reference: `DEMO-${randomCode(6)}`, token: randomCode(32), serviceCode: svc.code, date: request.date, time: request.time,
      durationMinutes: svc.minutes, email: request.email.trim(), regNumber: normalizeReg(request.regNumber), status: "Booked",
    };
    this.store.save([...this.store.load(), booking]);
    return {
      reference: booking.reference, manageToken: booking.token, serviceName: svc.name, date: booking.date, time: booking.time,
      durationMinutes: booking.durationMinutes, demo: true,
    };
  }

  async find(access: BookingAccess) {
    return this.toManaged(this.authorize(access));
  }

  async cancel(access: BookingAccess) {
    const b = this.authorize(access);
    if (b.status !== "Cancelled") {
      this.assertChangeable(b);
      this.update({ ...b, status: "Cancelled" });
    }
    return this.find(access);
  }

  async reschedule(access: BookingAccess, date: string, time: string) {
    const b = this.authorize(access);
    this.assertChangeable(b);
    const svc = findService(b.serviceCode);
    if (!svc || !freeStarts(svc, date, this.now(), this.taken(date, b.reference), this.cat).includes(time)) {
      throw new ApiError(409, MESSAGES.myBooking.slotTaken);
    }
    this.update({ ...b, date, time });
    return this.find(access);
  }

  /** Same answer for every mismatch, like the API. */
  private authorize(access: BookingAccess): DemoBooking {
    const b = this.store.load().find((x) => x.reference === normalizeReference(access.reference));
    const contact = access.contact?.trim() ?? "";
    const ok = b && (
      (access.token && access.token === b.token) ||
      (contact && (contact.toLowerCase() === b.email.toLowerCase() || normalizeReg(contact) === b.regNumber))
    );
    if (!b || !ok) throw new ApiError(404, MESSAGES.myBooking.notFoundDetail);
    return b;
  }

  private assertChangeable(b: DemoBooking) {
    if (!canChange(b.status, b.date, b.time, this.now(), this.cat)) {
      throw new ApiError(409, MESSAGES.myBooking.locked(this.cat.changeCutoffHours));
    }
  }

  private update(b: DemoBooking) {
    this.store.save(this.store.load().map((x) => (x.reference === b.reference ? b : x)));
  }

  private toManaged(b: DemoBooking): ManagedBooking {
    const svc = findService(b.serviceCode);
    return {
      reference: b.reference, serviceCode: b.serviceCode, serviceName: svc?.name ?? b.serviceCode, category: svc?.category ?? "",
      date: b.date, time: b.time, durationMinutes: b.durationMinutes, regNumber: b.regNumber, status: b.status,
      canChange: canChange(b.status, b.date, b.time, this.now(), this.cat),
      changeDeadlineUtc: changeDeadline(b.date, b.time, this.cat).toISOString(),
    };
  }
}
