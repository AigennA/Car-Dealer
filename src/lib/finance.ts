export const DEFAULT_ANNUAL_RATE = 0.0395;

export function calculateMonthlyPayment(
  loanAmount: number,
  months: number,
  annualRate: number = DEFAULT_ANNUAL_RATE
): number {
  if (loanAmount <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 12;
  const payment =
    loanAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(payment);
}
