import { describe, expect, it } from "vitest";
import { BUSINESS, formatPercent, hoursRows, hoursSummary, phoneHref, schemaOpeningHours } from "@/config/business";

describe("business configuration (data/business.json)", () => {
  it("groups opening hours into readable rows", () => {
    expect(hoursRows(BUSINESS.showroomHours)).toEqual([
      { days: "Måndag–fredag", hours: "09:00–18:00" },
      { days: "Lördag", hours: "10:00–15:00" },
      { days: "Söndag", hours: null },
    ]);
  });

  it("produces a compact summary and schema.org values from the same data", () => {
    expect(hoursSummary(BUSINESS.showroomHours)).toBe("Mån–fre 09–18, Lör 10–15");
    expect(schemaOpeningHours(BUSINESS.showroomHours)).toEqual(["Mo-Fr 09:00-18:00", "Sa 10:00-15:00"]);
  });

  it("handles a single open day and a gap in the week", () => {
    expect(hoursRows({ "1": ["08:00", "12:00"], "3": ["08:00", "12:00"] }, true)).toEqual([
      { days: "Mån", hours: "08:00–12:00" },
      { days: "Tis", hours: null },
      { days: "Ons", hours: "08:00–12:00" },
      { days: "Tor–sön", hours: null },
    ]);
  });

  it("formats rate and phone link", () => {
    expect(formatPercent(BUSINESS.financing.annualRate)).toBe("3,95 %");
    expect(phoneHref).toBe("tel:+46700000000");
  });

  it("financing defaults are consistent", () => {
    expect(BUSINESS.financing.loanTermsMonths).toContain(BUSINESS.financing.defaultTermMonths);
  });
});
