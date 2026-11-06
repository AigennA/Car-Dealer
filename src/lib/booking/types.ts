/** Booking data shapes shared by the API and demo repositories and the UI. */

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
  /** Secret for the personal "Hantera bokning" link (and QR code). */
  manageToken: string;
  /** True when the booking only lives in this browser (no API configured). */
  demo: boolean;
};

/** Same values as the API's BookingStatus enum. */
export type BookingStatus = "Booked" | "Confirmed" | "Arrived" | "Completed" | "Cancelled";

/** What "Min bokning" shows. Deliberately without e-mail and phone. */
export type ManagedBooking = {
  reference: string;
  serviceCode: string;
  serviceName: string;
  category: string;
  date: string;
  time: string;
  durationMinutes: number;
  regNumber: string;
  status: BookingStatus;
  canChange: boolean;
  changeDeadlineUtc: string;
};

/**
 * Proof that the visitor owns a booking: the booking number plus either the
 * secret from their link, or the e-mail / registration number they booked with.
 */
export type BookingAccess = { reference: string; token?: string; contact?: string };

/**
 * Where bookings come from and go to. The UI depends on this interface only
 * (Dependency Inversion); the concrete source is chosen in repository.ts.
 */
export interface BookingRepository {
  loadDays(serviceCode: string): Promise<BookableDay[]>;
  loadSlots(serviceCode: string, date: string): Promise<string[]>;
  create(request: BookingRequest): Promise<BookingConfirmation>;
  find(access: BookingAccess): Promise<ManagedBooking>;
  cancel(access: BookingAccess): Promise<ManagedBooking>;
  reschedule(access: BookingAccess, date: string, time: string): Promise<ManagedBooking>;
}
