import { ApiError } from "@/lib/api";
import { MESSAGES } from "@/lib/messages";
import { isBookable } from "@/lib/carStatus";
import { getAllCars } from "@/lib/clientStorage";
import type { Car } from "@/lib/cars";
import { TEST_DRIVE_CODE, testDriveCatalog, testDriveService } from "@/lib/testDrive";
import { addDays, catalog, findService, freeStarts, isoWeekday, normalizeReg, zonedNow, type Catalog } from "@/lib/workshop";
import { canChange, changeDeadline, normalizeReference } from "./rules";
import { DEMO_BOOKINGS_KEY } from "./storageKey";
import type {
  BookableDay, BookingAccess, BookingConfirmation, BookingRepository, BookingRequest, BookingStatus, ManagedBooking,
  TestDriveRequest,
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
  /** Empty for test drives. */
  regNumber: string;
  status: BookingStatus;
  /** Test drives only: the car being driven. */
  carSlug?: string;
  carTitle?: string;
};

export interface DemoBookingStore {
  load(): DemoBooking[];
  save(bookings: DemoBooking[]): void;
}

export { DEMO_BOOKINGS_KEY };

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

const isTestDrive = (b: DemoBooking) => b.serviceCode === TEST_DRIVE_CODE;
const defaultFindCar = (slug: string): Car | undefined => getAllCars().find((c) => c.slug === slug);

type Job = { minutes: number };
type Occupied = { start: string; minutes: number };

/**
 * Demo mode for the static site: the same scheduling and self-service rules
 * as the API, computed in the browser. Clock, catalogues, storage and the car
 * lookup are injectable for tests. References start with DEMO- so they are
 * never mistaken for real bookings.
 */
export class DemoBookingRepository implements BookingRepository {
  constructor(
    private readonly now: () => Date = () => new Date(),
    private readonly cat: Catalog = catalog,
    private readonly store: DemoBookingStore = browserStore,
    private readonly findCar: (slug: string) => Car | undefined = defaultFindCar,
    private readonly driveCat: Catalog = testDriveCatalog,
  ) {}

  /** What is already booked on `date`: the car's test drives, or (no car) the workshop's bookings. */
  private taken(date: string, except?: string, carSlug?: string): Occupied[] {
    return this.store.load()
      .filter((b) => b.date === date && b.status !== "Cancelled" && b.reference !== except
        && (carSlug ? b.carSlug === carSlug : !isTestDrive(b)))
      .map((b) => ({ start: b.time, minutes: b.durationMinutes }));
  }

  private openDays(job: Job, cat: Catalog, taken: (date: string) => Occupied[]): BookableDay[] {
    const today = zonedNow(this.now(), cat.timeZone).date;
    const days: BookableDay[] = [];
    for (let i = 0; i <= cat.bookingHorizonDays; i++) {
      const date = addDays(today, i);
      if (!cat.openingHours[String(isoWeekday(date))]) continue;
      days.push({ date, freeSlots: freeStarts(job, date, this.now(), taken(date), cat).length });
    }
    return days;
  }

  async loadDays(serviceCode: string) {
    const svc = findService(serviceCode);
    return svc ? this.openDays(svc, this.cat, (d) => this.taken(d)) : [];
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
    const booking = this.add({
      serviceCode: svc.code, date: request.date, time: request.time, durationMinutes: svc.minutes,
      email: request.email, regNumber: normalizeReg(request.regNumber),
    });
    return this.confirmation(booking, svc.name, "service");
  }

  /** The car must exist and be free: sold, reserved or unknown cars cannot be test driven. */
  private bookableCar(carSlug: string): Car {
    const car = this.findCar(carSlug);
    if (!car) throw new ApiError(404, MESSAGES.testDrive.notBookable);
    if (!isBookable(car)) throw new ApiError(409, MESSAGES.testDrive.notBookableDetail);
    return car;
  }

  async loadTestDriveDays(carSlug: string) {
    this.bookableCar(carSlug);
    return this.openDays(testDriveService, this.driveCat, (d) => this.taken(d, undefined, carSlug));
  }

  async loadTestDriveSlots(carSlug: string, date: string) {
    this.bookableCar(carSlug);
    return freeStarts(testDriveService, date, this.now(), this.taken(date, undefined, carSlug), this.driveCat);
  }

  async createTestDrive(request: TestDriveRequest): Promise<BookingConfirmation> {
    const car = this.bookableCar(request.carSlug);
    if (!(await this.loadTestDriveSlots(car.slug, request.date)).includes(request.time)) {
      throw new ApiError(409, MESSAGES.myBooking.slotTaken);
    }
    const booking = this.add({
      serviceCode: TEST_DRIVE_CODE, date: request.date, time: request.time, durationMinutes: testDriveService.minutes,
      email: request.email, regNumber: "", carSlug: car.slug, carTitle: car.title,
    });
    return this.confirmation(booking, `${testDriveService.name} – ${car.title}`, "testdrive");
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
    const { cat, job } = this.scheduleFor(b);
    if (isTestDrive(b)) this.bookableCar(b.carSlug ?? ""); // not while the car is reserved or sold
    if (!job || !freeStarts(job, date, this.now(), this.taken(date, b.reference, b.carSlug), cat).includes(time)) {
      throw new ApiError(409, MESSAGES.myBooking.slotTaken);
    }
    this.update({ ...b, date, time });
    return this.find(access);
  }

  /** Test drives follow the showroom's schedule, everything else the workshop's. */
  private scheduleFor(b: DemoBooking): { cat: Catalog; job: Job | undefined; name: string } {
    return isTestDrive(b)
      ? { cat: this.driveCat, job: testDriveService, name: testDriveService.name }
      : { cat: this.cat, job: findService(b.serviceCode), name: findService(b.serviceCode)?.name ?? b.serviceCode };
  }

  private add(fields: Omit<DemoBooking, "reference" | "token" | "status">): DemoBooking {
    const booking: DemoBooking = { reference: `DEMO-${randomCode(6)}`, token: randomCode(32), status: "Booked", ...fields };
    this.store.save([...this.store.load(), booking]);
    return booking;
  }

  private confirmation(b: DemoBooking, serviceName: string, kind: BookingConfirmation["kind"]): BookingConfirmation {
    return {
      reference: b.reference, manageToken: b.token, serviceName, date: b.date, time: b.time,
      durationMinutes: b.durationMinutes, demo: true, kind,
    };
  }

  /** Same answer for every mismatch, like the API. A test drive has no registration number to match. */
  private authorize(access: BookingAccess): DemoBooking {
    const b = this.store.load().find((x) => x.reference === normalizeReference(access.reference));
    const contact = access.contact?.trim() ?? "";
    const ok = b && (
      (access.token && access.token === b.token) ||
      (contact && (contact.toLowerCase() === b.email.toLowerCase() || (b.regNumber !== "" && normalizeReg(contact) === b.regNumber)))
    );
    if (!b || !ok) throw new ApiError(404, MESSAGES.myBooking.notFoundDetail);
    return b;
  }

  private assertChangeable(b: DemoBooking) {
    const { cat } = this.scheduleFor(b);
    if (!canChange(b.status, b.date, b.time, this.now(), cat)) {
      throw new ApiError(409, MESSAGES.myBooking.locked(cat.changeCutoffHours));
    }
  }

  private update(b: DemoBooking) {
    this.store.save(this.store.load().map((x) => (x.reference === b.reference ? b : x)));
  }

  private toManaged(b: DemoBooking): ManagedBooking {
    const { cat, name } = this.scheduleFor(b);
    const category = isTestDrive(b) ? "provkorning" : (findService(b.serviceCode)?.category ?? "");
    return {
      reference: b.reference, serviceCode: b.serviceCode, serviceName: name, category,
      date: b.date, time: b.time, durationMinutes: b.durationMinutes, regNumber: b.regNumber, status: b.status,
      canChange: canChange(b.status, b.date, b.time, this.now(), cat),
      changeDeadlineUtc: changeDeadline(b.date, b.time, cat).toISOString(),
      carSlug: b.carSlug ?? null, carTitle: b.carTitle ?? null,
    };
  }
}
