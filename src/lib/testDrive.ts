import { BUSINESS } from "@/config/business";
import { catalog, type Catalog, type WorkshopService } from "./workshop";

/**
 * Test drives ("Boka provkörning") are booked like a workshop service, with two differences:
 * they follow the showroom's opening hours, and capacity is one car at a time (bays = 1), counted
 * per car. The rules mirror backend Workshop/TestDriveSchedule.cs, so the same freeStarts() serves both.
 */
export const TEST_DRIVE_CODE = "provkorning";

export const testDriveService: Pick<WorkshopService, "code" | "name" | "minutes"> = {
  code: TEST_DRIVE_CODE,
  name: "Provkörning",
  minutes: BUSINESS.testDrive.durationMinutes,
};

export const testDriveCatalog: Catalog = {
  timeZone: catalog.timeZone,
  slotMinutes: BUSINESS.testDrive.slotMinutes,
  bays: 1,
  minLeadMinutes: BUSINESS.testDrive.minLeadMinutes,
  bookingHorizonDays: BUSINESS.testDrive.bookingHorizonDays,
  changeCutoffHours: BUSINESS.testDrive.changeCutoffHours,
  openingHours: BUSINESS.showroomHours as Catalog["openingHours"],
  services: [],
};
