import { describe, expect, it } from "vitest";
import { DemoBookingRepository } from "@/lib/booking/repository";
import { validateBooking } from "@/lib/validation";
import { MESSAGES } from "@/lib/messages";

const NOW = new Date("2026-11-09T06:00:00Z"); // Monday 07:00 Stockholm
const repo = new DemoBookingRepository(() => NOW);

describe("DemoBookingRepository (injected clock)", () => {
  it("lists open days only, starting today", async () => {
    const days = await repo.loadDays("dackbyte");
    expect(days[0].date).toBe("2026-11-09");
    expect(days.map((d) => d.date)).not.toContain("2026-11-14"); // Saturday
  });

  it("returns the same slots as the scheduling rules", async () => {
    const slots = await repo.loadSlots("service-stor", "2026-11-10");
    expect(slots[0]).toBe("08:00");
    expect(slots.at(-1)).toBe("15:00");
  });

  it("confirms in demo mode without a reference", async () => {
    const c = await repo.create({
      serviceCode: "dackbyte", date: "2026-11-10", time: "08:00",
      name: "A", email: "a@b.se", phone: "0701234567", regNumber: "ABC123", message: "",
    });
    expect(c).toMatchObject({ demo: true, serviceName: "Däckbyte", durationMinutes: 30, reference: "" });
  });

  it("unknown service yields no days", async () => {
    expect(await repo.loadDays("finns-inte")).toEqual([]);
  });
});

describe("validateBooking", () => {
  const ok = { name: "Anna", email: "anna@example.se", phone: "070-123 45 67", regNumber: "ABC 12D", message: "" };

  it("accepts a complete booking", () => {
    expect(validateBooking({ service: "dackbyte", date: "2026-11-10", time: "08:00" }, ok)).toEqual({});
  });

  it("requires a slot, a phone and a valid registration number", () => {
    const errors = validateBooking({ service: "", date: "", time: "" }, { ...ok, phone: "", regNumber: "1234" });
    expect(errors).toEqual({
      service: MESSAGES.booking.serviceRequired,
      date: MESSAGES.booking.dateRequired,
      time: MESSAGES.booking.timeRequired,
      phone: MESSAGES.contact.phoneRequiredForWorkshop,
      regNumber: MESSAGES.booking.regInvalid,
    });
  });
});
