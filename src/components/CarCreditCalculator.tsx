"use client";

import { useId, useState } from "react";
import { LOAN_TERMS, quoteLoan } from "@/lib/finance";

interface CarCreditCalculatorProps {
  carPrice: number;
}

const FIELD =
  "w-full border border-gray-400 rounded-lg px-3 py-2 text-gray-900 bg-white " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

/** Live loan calculator for a specific car — updates as you type, no alert() dialogs. */
export default function CarCreditCalculator({ carPrice }: CarCreditCalculatorProps) {
  const id = useId();
  const [downPayment, setDownPayment] = useState<string>(String(Math.round(carPrice * 0.2)));
  const [loanTerm, setLoanTerm] = useState<number>(60);

  const result = quoteLoan(carPrice, Number(downPayment || 0), loanTerm);
  const errorId = `${id}-error`;

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="text-lg font-semibold text-navy mb-4">Beräkna finansiering</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">Bilens pris</p>
          <p className="text-lg font-bold text-navy tabular-nums">{carPrice.toLocaleString("sv-SE")} kr</p>
        </div>

        <div>
          <label htmlFor={`${id}-down`} className="block text-sm font-medium text-gray-700 mb-2">
            Kontantinsats (kr)
          </label>
          <input
            id={`${id}-down`}
            type="number"
            inputMode="numeric"
            min={0}
            step={5000}
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            aria-invalid={!result.ok}
            aria-describedby={!result.ok ? errorId : undefined}
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor={`${id}-term`} className="block text-sm font-medium text-gray-700 mb-2">
            Lånetid
          </label>
          <select
            id={`${id}-term`}
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className={FIELD}
          >
            {LOAN_TERMS.map((t) => (
              <option key={t} value={t}>{t} månader</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6" aria-live="polite">
        {result.ok ? (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
            <div className="text-center md:text-left md:pr-6 md:border-r md:border-gray-200">
              <p className="text-sm text-gray-700 mb-1">Beräknad månadskostnad</p>
              <p className="text-3xl font-bold text-primary tabular-nums">
                {result.quote.monthlyPayment.toLocaleString("sv-SE")} kr
              </p>
              <p className="text-sm text-gray-700">per månad i {loanTerm} månader</p>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-700">Totalt att låna</dt>
                <dd className="font-medium text-navy tabular-nums">{result.quote.loanAmount.toLocaleString("sv-SE")} kr</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-700">Total kostnad</dt>
                <dd className="font-medium text-navy tabular-nums">{result.quote.totalCost.toLocaleString("sv-SE")} kr</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-700">Räntekostnad</dt>
                <dd className="font-medium text-navy tabular-nums">{result.quote.interestCost.toLocaleString("sv-SE")} kr</dd>
              </div>
            </dl>
          </div>
        ) : (
          <p id={errorId} className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {result.error}
          </p>
        )}
      </div>

      <p className="text-xs text-gray-600 mt-4">
        * Beräkning med 3,95 % årsränta. Exakta villkor fastställs vid ansökan.
      </p>
    </section>
  );
}
