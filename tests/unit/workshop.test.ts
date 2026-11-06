import { describe, expect, it } from "vitest";
import { catalog, freeStarts, findService, zonedNow, isoWeekday, addDays, REG_RE, normalizeReg, servicesIn } from "@/lib/workshop";

// Same fixed moment as the API tests: Monday 9 Nov 2026 07:00 Stockholm (06:00 UTC)
const NOW = new Date("2026-11-09T06:00:00Z");
const hour = { code: "x", category: "verkstad" as const, name: "Test", description: "", minutes: 60, priceFrom: 100 };

describe("workshop scheduling rules (mirror of the API)", () => {
  it("knows Stockholm time", () => {
    expect(zonedNow(NOW)).toEqual({ date: "2026-11-09", minutes: 7 * 60 });
    expect(isoWeekday("2026-11-09")).toBe(1);
    expect(isoWeekday("2026-11-15")).toBe(7);
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
  });

  it("respects opening hours and the 2-hour lead time", () => {
    const slots = freeStarts(hour, "2026-11-09", NOW);
    expect(slots[0]).toBe("09:00");
    expect(slots.at(-1)).toBe("16:00");
  });

  it("closes earlier on Friday and is closed at weekends", () => {
    expect(freeStarts(hour, "2026-11-13", NOW).at(-1)).toBe("15:00");
    expect(freeStarts(hour, "2026-11-14", NOW)).toEqual([]);
    expect(freeStarts(hour, "2026-11-15", NOW)).toEqual([]);
  });

  it("blocks past days and days beyond the horizon", () => {
    expect(freeStarts(hour, "2026-11-02", NOW)).toEqual([]);
    expect(freeStarts(hour, addDays("2026-11-09", catalog.bookingHorizonDays + 1), NOW)).toEqual([]);
  });

  it("a lead time past midnight blocks early slots the next day", () => {
    const late = new Date("2026-11-09T22:30:00Z"); // 23:30 Stockholm → earliest 01:30 tomorrow
    expect(freeStarts(hour, "2026-11-10", late)[0]).toBe("08:00");
  });

  it("is full when both bays are taken at any point of the job", () => {
    const taken = [{ start: "10:00", minutes: 120 }, { start: "10:00", minutes: 120 }];
    const slots = freeStarts(hour, "2026-11-09", NOW, taken);
    expect(slots).not.toContain("09:30");
    expect(slots).not.toContain("11:00");
    expect(slots).toContain("09:00");
    expect(slots).toContain("12:00");
  });
});

describe("catalogue & registration numbers", () => {
  it("has workshop and inspection services, aligned to the slot size", () => {
    expect(servicesIn("verkstad").length).toBeGreaterThan(3);
    expect(servicesIn("besiktning").map((s) => s.code)).toContain("besiktning-partner");
    for (const s of catalog.services) expect(s.minutes % catalog.slotMinutes).toBe(0);
    expect(findService("dackbyte")?.name).toBe("Däckbyte");
  });

  it.each([
    ["ABC123", true],
    ["abc 12d", true],
    ["AB1234", false],
    ["ABCD12", false],
  ])("%s valid=%s", (reg, ok) => {
    expect(REG_RE.test(reg)).toBe(ok);
  });

  it("normalises like the API", () => {
    expect(normalizeReg(" abc 12d ")).toBe("ABC12D");
  });
});
