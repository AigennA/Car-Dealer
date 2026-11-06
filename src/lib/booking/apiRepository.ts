import { apiFetch } from "@/lib/api";
import type { BookingAccess, BookingConfirmation, BookingRepository, BookingRequest, BookableDay, ManagedBooking } from "./types";

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
    const res = await apiFetch<Omit<BookingConfirmation, "demo">>("/api/workshop/bookings", json(request));
    return { ...res, demo: false };
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
