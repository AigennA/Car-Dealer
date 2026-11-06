import { apiEnabled, apiFetch } from "@/lib/api";
import { addDays, catalog, findService, freeStarts, isoWeekday, zonedNow, type Catalog } from "@/lib/workshop";

export type BookableDay = { date: string; freeSlots: number };

export type BookingRequest = {
  serviceCode: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  regNumber: string;
  message: string;
};

export type BookingConfirmation = {
  reference: string;
  serviceName: string;
  date: string;
  time: string;
  durationMinutes: number;
  /** True when nothing was actually booked (no API configured). */
  demo: boolean;
};

/**
 * Where bookings come from and go to. The wizard depends on this interface
 * only (Dependency Inversion); the concrete source is chosen once, below.
 */
export interface BookingRepository {
  loadDays(serviceCode: string): Promise<BookableDay[]>;
  loadSlots(serviceCode: string, date: string): Promise<string[]>;
  create(request: BookingRequest): Promise<BookingConfirmation>;
}

/** Real bookings through the dealer platform API (backend/). */
export class ApiBookingRepository implements BookingRepository {
  loadDays(serviceCode: string) {
    return apiFetch<BookableDay[]>(`/api/workshop/days?service=${encodeURIComponent(serviceCode)}`);
  }

  async loadSlots(serviceCode: string, date: string) {
    const res = await apiFetch<{ slots: string[] }>(
      `/api/workshop/availability?service=${encodeURIComponent(serviceCode)}&date=${date}`,
    );
    return res.slots;
  }

  async create(request: BookingRequest): Promise<BookingConfirmation> {
    const res = await apiFetch<Omit<BookingConfirmation, "demo">>("/api/workshop/bookings", {
      method: "POST",
      body: JSON.stringify(request),
    });
    return { ...res, demo: false };
  }
}

/**
 * Demo mode for the static site: same scheduling rules, computed in the
 * browser, nothing is stored. The clock and catalogue are injectable for tests.
 */
export class DemoBookingRepository implements BookingRepository {
  constructor(
    private readonly now: () => Date = () => new Date(),
    private readonly cat: Catalog = catalog,
  ) {}

  async loadDays(serviceCode: string) {
    const svc = findService(serviceCode);
    if (!svc) return [];
    const today = zonedNow(this.now(), this.cat.timeZone).date;
    const days: BookableDay[] = [];
    for (let i = 0; i <= this.cat.bookingHorizonDays; i++) {
      const date = addDays(today, i);
      if (!this.cat.openingHours[String(isoWeekday(date))]) continue;
      days.push({ date, freeSlots: freeStarts(svc, date, this.now(), [], this.cat).length });
    }
    return days;
  }

  async loadSlots(serviceCode: string, date: string) {
    const svc = findService(serviceCode);
    return svc ? freeStarts(svc, date, this.now(), [], this.cat) : [];
  }

  async create(request: BookingRequest): Promise<BookingConfirmation> {
    const svc = findService(request.serviceCode);
    if (!svc) throw new Error(`Unknown service ${request.serviceCode}`);
    return { reference: "", serviceName: svc.name, date: request.date, time: request.time, durationMinutes: svc.minutes, demo: true };
  }
}

/** The one place that decides which source the site uses. */
export function createBookingRepository(): BookingRepository {
  return apiEnabled ? new ApiBookingRepository() : new DemoBookingRepository();
}
