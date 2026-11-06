"use client";

import { useState } from "react";
import { DEFAULT_ANNUAL_RATE, DEFAULT_TERM_MONTHS, LOAN_TERMS, quoteLoan } from "@/lib/finance";
import { formatPercent } from "@/config/business";

const FIELD =
  "w-full bg-white border border-white rounded-lg px-4 py-3 text-navy " +
  "focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60";

/** Full loan calculator on /finansiering — live result, inline validation. */
export default function CreditCalculator() {
  const [carPrice, setCarPrice] = useState<string>("250000");
  const [downPayment, setDownPayment] = useState<string>("50000");
  const [loanTerm, setLoanTerm] = useState<number>(DEFAULT_TERM_MONTHS);

  const result = quoteLoan(Number(carPrice || 0), Number(downPayment || 0), loanTerm);

  return (
    <section
      aria-labelledby="calc-heading"
      className="bg-linear-to-br from-primary-dark to-primary rounded-xl p-8 md:p-12 text-white mb-12"
    >
      <div className="max-w-3xl mx-auto">
        <h2 id="calc-heading" className="text-3xl font-bold mb-4 text-center">Räkna på ditt billån</h2>
        <p className="text-center mb-8">Beräkna din månadskostnad snabbt och enkelt</p>

        <div className="bg-black/15 rounded-xl p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="calc-price" className="block text-sm font-medium mb-2">Bilens pris (kr)</label>
              <input id="calc-price" type="number" inputMode="numeric" min={0} step={10000}
                value={carPrice} onChange={(e) => setCarPrice(e.target.value)}
                aria-invalid={!result.ok} aria-describedby={!result.ok ? "calc-error" : undefined}
                className={FIELD} />
            </div>
            <div>
              <label htmlFor="calc-down" className="block text-sm font-medium mb-2">Kontantinsats (kr)</label>
              <input id="calc-down" type="number" inputMode="numeric" min={0} step={5000}
                value={downPayment} onChange={(e) => setDownPayment(e.target.value)}
                aria-invalid={!result.ok} aria-describedby={!result.ok ? "calc-error" : undefined}
                className={FIELD} />
            </div>
            <div>
              <label htmlFor="calc-term" className="block text-sm font-medium mb-2">Lånetid</label>
              <select id="calc-term" value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))} className={FIELD}>
                {LOAN_TERMS.map((t) => (
                  <option key={t} value={t}>{t} månader</option>
                ))}
              </select>
            </div>
          </div>

          <div aria-live="polite">
            {result.ok ? (
              <div className="mt-2 bg-white text-navy rounded-lg p-6 text-center">
                <p className="text-sm mb-2 text-gray-700">Din beräknade månadskostnad</p>
                <p className="text-4xl font-bold mb-2 text-primary tabular-nums">
                  {result.quote.monthlyPayment.toLocaleString("sv-SE")} kr
                </p>
                <p className="text-sm text-gray-700">per månad i {loanTerm} månader</p>
                <dl className="mt-4 pt-4 border-t border-gray-200 text-left space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-700">Totalt att låna</dt>
                    <dd className="font-medium tabular-nums">{result.quote.loanAmount.toLocaleString("sv-SE")} kr</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-700">Total kostnad</dt>
                    <dd className="font-medium tabular-nums">{result.quote.totalCost.toLocaleString("sv-SE")} kr</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-700">Ränta ({formatPercent(DEFAULT_ANNUAL_RATE)} årsränta)</dt>
                    <dd className="font-medium tabular-nums">{result.quote.interestCost.toLocaleString("sv-SE")} kr</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p id="calc-error" className="mt-2 bg-white text-red-700 font-medium rounded-lg px-4 py-3">
                {result.error}
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-sm mt-6">
          * Detta är endast en indikativ beräkning med {formatPercent(DEFAULT_ANNUAL_RATE)} årsränta. Exakt pris och villkor fastställs vid ansökan.
        </p>
      </div>
    </section>
  );
}
