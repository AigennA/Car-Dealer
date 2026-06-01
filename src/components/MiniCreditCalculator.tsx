"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { calculateMonthlyPayment } from "@/lib/finance";

/* ── Inline SVG icons (Heroicons outline style, stroke-width 1.75) ── */

function CalculatorIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="10" y2="10" />
      <line x1="14" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="10" y2="14" />
      <line x1="14" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="10" y2="18" />
      <line x1="14" y1="18" x2="16" y2="18" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const LOAN_TERMS = [24, 36, 48, 60, 72, 84] as const;

export default function MiniCreditCalculator() {
  const [price, setPrice] = useState<string>("250000");
  const [downPayment, setDownPayment] = useState<string>("50000");
  const [loanTerm, setLoanTerm] = useState<number>(60);

  /* Derive result and error without useEffect — no setState inside effects */
  const { result, error } = useMemo(() => {
    const priceNum = Number(price);
    const downNum = Number(downPayment);

    if (!price || !priceNum) {
      return { result: null, error: null };
    }

    const loanAmount = priceNum - downNum;

    if (downNum >= priceNum || loanAmount <= 0) {
      return {
        result: null,
        error: "Kontantinsatsen måste vara lägre än bilens pris.",
      };
    }

    return {
      result: calculateMonthlyPayment(loanAmount, loanTerm),
      error: null,
    };
  }, [price, downPayment, loanTerm]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col gap-5 w-full">

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <span className="shrink-0 text-primary">
          <CalculatorIcon />
        </span>
        <h3 className="font-heading font-semibold text-lg leading-tight text-navy">
          Snabbkalkyl – billån
        </h3>
      </div>

      {/* Inputs */}
      <div className="grid sm:grid-cols-3 gap-3">

        {/* Bilens pris */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="mini-calc-price"
            className="text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Bilens pris (kr)
          </label>
          <input
            id="mini-calc-price"
            type="number"
            inputMode="numeric"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="250 000"
            className="
              w-full border border-gray-200 rounded-lg px-3 py-2.5
              text-navy text-sm font-medium
              placeholder:text-gray-300
              bg-gray-50 hover:bg-white
              transition-colors duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
              cursor-pointer
            "
          />
        </div>

        {/* Kontantinsats */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="mini-calc-down"
            className="text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Kontantinsats (kr)
          </label>
          <input
            id="mini-calc-down"
            type="number"
            inputMode="numeric"
            min={0}
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            placeholder="50 000"
            className="
              w-full border border-gray-200 rounded-lg px-3 py-2.5
              text-navy text-sm font-medium
              placeholder:text-gray-300
              bg-gray-50 hover:bg-white
              transition-colors duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
              cursor-pointer
            "
          />
        </div>

        {/* Lånetid */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="mini-calc-term"
            className="text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Lånetid
          </label>
          <select
            id="mini-calc-term"
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="
              w-full border border-gray-200 rounded-lg px-3 py-2.5
              text-navy text-sm font-medium
              bg-gray-50 hover:bg-white
              transition-colors duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
              cursor-pointer
            "
          >
            {LOAN_TERMS.map((t) => (
              <option key={t} value={t}>
                {t} månader
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inline error */}
      {error && (
        <p
          role="alert"
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
        >
          {error}
        </p>
      )}

      {/* Result row — live, no button needed */}
      {result !== null && !error && (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Ca. månadskostnad
          </span>
          <span className="font-heading font-bold text-3xl text-primary tabular-nums leading-none">
            {result.toLocaleString("sv-SE")}
            <span className="text-base font-semibold text-gray-500 ml-1">kr/mån</span>
          </span>
        </div>
      )}

      {/* Footer: disclaimer + CTA link */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 leading-snug max-w-xs">
          * Indikativ beräkning med 3,95% årsränta. Exakta villkor fastställs vid ansökan.
        </p>
        <Link
          href="/finansiering"
          className="
            inline-flex items-center gap-1.5
            text-sm font-semibold text-primary
            hover:text-primary-dark underline-offset-2 hover:underline
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-sm
            cursor-pointer
            whitespace-nowrap
          "
        >
          Fullständig kalkyl
          <ArrowRightIcon />
        </Link>
      </div>
    </div>
  );
}
