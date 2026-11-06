import { apiEnabled } from "@/lib/api";
import { ApiBookingRepository } from "./apiRepository";
import { DemoBookingRepository } from "./demoRepository";
import type { BookingRepository } from "./types";

export type * from "./types";
export { ApiBookingRepository } from "./apiRepository";
export { DemoBookingRepository } from "./demoRepository";

/** The one place that decides which source the site uses. */
export function createBookingRepository(): BookingRepository {
  return apiEnabled ? new ApiBookingRepository() : new DemoBookingRepository();
}
