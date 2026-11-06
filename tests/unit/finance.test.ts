import { describe, expect, it } from "vitest";
import { calculateMonthlyPayment, quoteLoan, DEFAULT_ANNUAL_RATE } from "@/lib/finance";

describe("calculateMonthlyPayment", () => {
  it("matches the annuity formula for a known case", () => {
    // 200 000 kr over 60 months at 3,95 % → ≈ 3 679 kr/month
    expect(calculateMonthlyPayment(200_000, 60)).toBe(3679);
  });

  it("returns 0 for invalid input instead of NaN/Infinity", () => {
    expect(calculateMonthlyPayment(0, 60)).toBe(0);
    expect(calculateMonthlyPayment(-1000, 60)).toBe(0);
    expect(calculateMonthlyPayment(100_000, 0)).toBe(0);
    expect(calculateMonthlyPayment(Number.NaN, 60)).toBe(0);
  });

  it("handles a 0 % rate as a straight split", () => {
    expect(calculateMonthlyPayment(120_000, 60, 0)).toBe(2000);
  });

  it("a longer term gives a lower monthly payment", () => {
    expect(calculateMonthlyPayment(200_000, 84)).toBeLessThan(calculateMonthlyPayment(200_000, 36));
  });

  it("uses 3,95 % as the default rate", () => {
    expect(DEFAULT_ANNUAL_RATE).toBe(0.0395);
  });
});

describe("quoteLoan", () => {
  it("returns totals that add up", () => {
    const r = quoteLoan(250_000, 50_000, 60);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.quote.loanAmount).toBe(200_000);
    expect(r.quote.totalCost).toBe(r.quote.monthlyPayment * 60);
    expect(r.quote.interestCost).toBe(r.quote.totalCost - 200_000);
    expect(r.quote.interestCost).toBeGreaterThan(0);
  });

  it.each([
    [0, 0, "Ange bilens pris."],
    [100_000, -1, "Kontantinsatsen kan inte vara negativ."],
    [100_000, 100_000, "Kontantinsatsen måste vara lägre än bilens pris."],
    [100_000, 150_000, "Kontantinsatsen måste vara lägre än bilens pris."],
  ])("price %d / down %d → error", (price, down, message) => {
    const r = quoteLoan(price, down, 60);
    expect(r).toEqual({ ok: false, error: message });
  });
});
