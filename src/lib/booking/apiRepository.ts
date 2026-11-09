import { apiFetch } from "@/lib/api";
import type {
  BookingAccess, BookingConfirmation, BookingRepository, BookingRequest, BookableDay, ManagedBooking, TestDriveRequest,
} from "./types";

const json = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });

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
    const res = await apiFetch<Omit<BookingConfirmation, "demo" | "kind">>("/api/workshop/bookings", json(request));
    return { ...res, demo: false, kind: "service" };
  }

  loadTestDriveDays(carSlug: string) {
    return apiFetch<BookableDay[]>(`/api/testdrive/days?car=${encodeURIComponent(carSlug)}`);
  }

  async loadTestDriveSlots(carSlug: string, date: string) {
    const res = await apiFetch<{ slots: string[] }>(
      `/api/testdrive/availability?car=${encodeURIComponent(carSlug)}&date=${date}`,
    );
    return res.slots;
  }

  async createTestDrive(request: TestDriveRequest): Promise<BookingConfirmation> {
    const res = await apiFetch<Omit<BookingConfirmation, "demo" | "kind">>("/api/testdrive/bookings", json(request));
    return { ...res, demo: false, kind: "testdrive" };
  }

  // POST, so the secret and contact details are never part of a URL.
  find(access: BookingAccess) {
    return apiFetch<ManagedBooking>("/api/workshop/bookings/manage", json(access));
  }

  cancel(access: BookingAccess) {
    return apiFetch<ManagedBooking>("/api/workshop/bookings/manage/cancel", json(access));
  }

  reschedule(access: BookingAccess, date: string, time: string) {
    return apiFetch<ManagedBooking>("/api/workshop/bookings/manage/reschedule", json({ ...access, date, time }));
  }
}
