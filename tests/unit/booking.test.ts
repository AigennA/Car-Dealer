import { describe, expect, it } from "vitest";
import { DemoBookingRepository } from "@/lib/booking/repository";
import { memoryStore } from "@/lib/booking/demoRepository";
import { canChange, changeDeadline, normalizeReference } from "@/lib/booking/rules";
import { manageHref, manageUrl, parseManageLink } from "@/lib/booking/links";
import { bookingIcs, icsHref } from "@/lib/booking/calendar";
import { zonedToUtc } from "@/lib/workshop";
import { ApiError } from "@/lib/api";
import { validateBooking } from "@/lib/validation";
import { MESSAGES } from "@/lib/messages";

const NOW = new Date("2026-11-09T06:00:00Z"); // Monday 07:00 Stockholm
const repo = new DemoBookingRepository(() => NOW, undefined, memoryStore());

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

  it("confirms in demo mode with a DEMO- reference and a secret", async () => {
    const c = await repo.create({
      serviceCode: "dackbyte", date: "2026-11-10", time: "08:00",
      name: "A", email: "a@b.se", phone: "0701234567", regNumber: "ABC123", message: "",
    });
    expect(c).toMatchObject({ demo: true, serviceName: "Däckbyte", durationMinutes: 30 });
    expect(c.reference).toMatch(/^DEMO-[A-HJ-NP-Z2-9]{6}$/);
    expect(c.manageToken.length).toBeGreaterThanOrEqual(32);
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

describe("Min bokning (demo repository)", () => {
  const request = (time: string, date = "2026-11-17") => ({
    serviceCode: "service-liten", date, time, name: "Anna", email: "Anna@Example.se", phone: "0701234567",
    regNumber: "abc 12d", message: "",
  });
  const fresh = () => new DemoBookingRepository(() => NOW, undefined, memoryStore());

  it("finds a booking with the link secret, the e-mail or the registration number", async () => {
    const r = fresh();
    const c = await r.create(request("10:00"));
    for (const access of [
      { reference: c.reference, token: c.manageToken },
      { reference: c.reference.toLowerCase(), contact: "anna@example.se" },
      { reference: ` ${c.reference} `, contact: "ABC 12D" },
    ]) {
      const b = await r.find(access);
      expect(b).toMatchObject({ reference: c.reference, time: "10:00", regNumber: "ABC12D", status: "Booked", canChange: true });
    }
  });

  it("answers 404 for every mismatch", async () => {
    const r = fresh();
    const c = await r.create(request("10:00"));
    for (const access of [
      { reference: c.reference, token: "wrong" },
      { reference: c.reference, contact: "other@example.se" },
      { reference: "DEMO-ZZZZZZ", contact: "anna@example.se" },
      { reference: c.reference },
    ]) {
      await expect(r.find(access)).rejects.toMatchObject({ status: 404 });
    }
  });

  it("cancelling frees the slot", async () => {
    const r = fresh();
    const a = await r.create(request("09:00"));
    await r.create(request("09:00"));
    expect(await r.loadSlots("service-liten", "2026-11-17")).not.toContain("09:00"); // both bays taken
    const b = await r.cancel({ reference: a.reference, token: a.manageToken });
    expect(b.status).toBe("Cancelled");
    expect(await r.loadSlots("service-liten", "2026-11-17")).toContain("09:00");
  });

  it("moves a booking; its own slot does not block it, a full slot does", async () => {
    const r = fresh();
    const mine = await r.create(request("10:00"));
    await r.create(request("13:00"));
    await r.create(request("13:00"));
    const access = { reference: mine.reference, token: mine.manageToken };
    expect((await r.reschedule(access, "2026-11-17", "10:30")).time).toBe("10:30");
    await expect(r.reschedule(access, "2026-11-17", "13:00")).rejects.toBeInstanceOf(ApiError);
  });

  it("locks changes inside the cut-off", async () => {
    const r = fresh();
    const c = await r.create(request("14:00", "2026-11-09")); // today
    const access = { reference: c.reference, token: c.manageToken };
    expect((await r.find(access)).canChange).toBe(false);
    await expect(r.cancel(access)).rejects.toMatchObject({ status: 409 });
  });
});

describe("booking rules", () => {
  it("converts Stockholm time to UTC in winter and summer", () => {
    expect(zonedToUtc("2026-11-10", "10:00").toISOString()).toBe("2026-11-10T09:00:00.000Z");
    expect(zonedToUtc("2026-07-01", "10:00").toISOString()).toBe("2026-07-01T08:00:00.000Z");
  });

  it("allows changes until 24 hours before", () => {
    expect(changeDeadline("2026-11-10", "10:00").toISOString()).toBe("2026-11-09T09:00:00.000Z");
    expect(canChange("Booked", "2026-11-10", "10:00", new Date("2026-11-09T09:00:00Z"))).toBe(true);
    expect(canChange("Booked", "2026-11-10", "10:00", new Date("2026-11-09T09:00:01Z"))).toBe(false);
    expect(canChange("Arrived", "2026-12-10", "10:00", NOW)).toBe(false);
  });

  it("normalises booking numbers", () => {
    expect(normalizeReference(" cd-7k3 pqx ")).toBe("CD-7K3PQX");
  });
});

describe("personal link", () => {
  it("keeps the secret in the fragment and parses back", () => {
    const href = manageHref("CD-ABC234", "s3cr+t");
    expect(href).toBe("/min-bokning/?ref=CD-ABC234#t=s3cr%2Bt");
    expect(manageUrl("CD-ABC234", undefined, "https://example.se")).toBe("https://example.se/min-bokning/?ref=CD-ABC234");
    expect(parseManageLink("?ref=CD-ABC234", "#t=s3cr%2Bt")).toEqual({ reference: "CD-ABC234", token: "s3cr+t" });
    expect(parseManageLink("", "")).toBeNull();
  });
});

describe("calendar file", () => {
  const ics = bookingIcs(
    { reference: "CD-ABC234", serviceName: "Service liten", date: "2026-11-10", time: "10:00", durationMinutes: 60,
      url: "https://example.se/min-bokning/?ref=CD-ABC234#t=a-very-long-secret-token-that-makes-this-line-longer-than-75" },
    new Date("2026-11-09T06:00:00Z"),
  );

  it("has the appointment in UTC and a reminder", () => {
    expect(ics).toContain("DTSTART:20261110T090000Z");
    expect(ics).toContain("DTEND:20261110T100000Z");
    expect(ics).toContain("UID:CD-ABC234@");
    expect(ics).toContain("TRIGGER:-P1D");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
  });

  it("escapes commas and folds long lines to 75 octets", () => {
    expect(ics).toMatch(/LOCATION:[^\r]*\\,/);
    for (const line of ics.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });

  it("is offered as a data: link", () => {
    expect(icsHref(ics)).toMatch(/^data:text\/calendar;charset=utf-8,BEGIN%3AVCALENDAR/);
  });
});
