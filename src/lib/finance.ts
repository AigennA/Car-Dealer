import { BUSINESS } from "@/config/business";
import { MESSAGES } from "@/lib/messages";

/** Financing terms come from data/business.json — never hard-coded here. */
export const DEFAULT_ANNUAL_RATE = BUSINESS.financing.annualRate;
export const LOAN_TERMS: readonly number[] = BUSINESS.financing.loanTermsMonths;
export const DEFAULT_TERM_MONTHS = BUSINESS.financing.defaultTermMonths;
export const DEFAULT_DOWN_PAYMENT_SHARE = BUSINESS.financing.defaultDownPaymentShare;

/** Annuity formula. Returns a whole-krona monthly payment (0 for invalid input). */
export function calculateMonthlyPayment(
  loanAmount: number,
  months: number,
  annualRate: number = DEFAULT_ANNUAL_RATE
): number {
  if (!Number.isFinite(loanAmount) || !Number.isFinite(months)) return 0;
  if (loanAmount <= 0 || months <= 0) return 0;
  if (annualRate <= 0) return Math.round(loanAmount / months);
  const monthlyRate = annualRate / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((loanAmount * monthlyRate * factor) / (factor - 1));
}

export type LoanQuote = {
  loanAmount: number;
  monthlyPayment: number;
  totalCost: number;
  interestCost: number;
};

export type LoanResult = { ok: true; quote: LoanQuote } | { ok: false; error: string };

/** Validates the user's input and returns either a quote or a Swedish error message. */
export function quoteLoan(
  price: number,
  downPayment: number,
  months: number,
  annualRate: number = DEFAULT_ANNUAL_RATE
): LoanResult {
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, error: MESSAGES.loan.priceRequired };
  }
  if (!Number.isFinite(downPayment) || downPayment < 0) {
    return { ok: false, error: MESSAGES.loan.downPaymentNegative };
  }
  const loanAmount = price - downPayment;
  if (loanAmount <= 0) {
    return { ok: false, error: MESSAGES.loan.downPaymentTooHigh };
  }
  const monthlyPayment = calculateMonthlyPayment(loanAmount, months, annualRate);
  const totalCost = monthlyPayment * months;
  return {
    ok: true,
    quote: { loanAmount, monthlyPayment, totalCost, interestCost: totalCost - loanAmount },
  };
}
