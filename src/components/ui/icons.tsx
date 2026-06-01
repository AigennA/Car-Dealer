/**
 * Shared SVG icon components — Heroicons outline style.
 * viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
 * strokeLinecap="round" strokeLinejoin="round"
 *
 * Each component accepts an optional `className` prop so callers control
 * size and color via Tailwind (e.g. className="w-12 h-12 text-primary").
 * All icons are decorative by default and include aria-hidden="true".
 */

import React from "react";

type IconProps = {
  className?: string;
};

const baseProps = {
  "aria-hidden": true as const,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.75",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
};

/** Shield with a check-mark inside — quality, guarantee */
export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 2L3.5 6v6c0 5.25 3.7 10.15 8.5 11.35C16.8 22.15 20.5 17.25 20.5 12V6L12 2z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

/** Banknotes / money — financing, price */
export function BanknotesIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

/** Two arrows forming a cycle — trade-in, inbyte */
export function ArrowsRightLeftIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M7 16H3l4-4m0 4-4-4" />
      <path d="M17 8h4l-4 4m0-4 4 4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="M7 12h10" />
    </svg>
  );
}

/** Plain shield — insurance, försäkring */
export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M12 2L3.5 6v6c0 5.25 3.7 10.15 8.5 11.35C16.8 22.15 20.5 17.25 20.5 12V6L12 2z" />
    </svg>
  );
}

/** Wrench — service, workshop */
export function WrenchIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

/** Document / clipboard — terms, öppet köp */
export function DocumentTextIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

/** Simple check mark — bullet points, confirmations */
export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Car / automobile silhouette — privatleasing, vehicles */
export function CarIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h12l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

/** Lightning bolt — speed, fast valuation */
export function BoltIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

/** Target / bullseye — quality, precision */
export function TargetIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

/** Handshake — trust, partnership */
export function HandshakeIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M2 12h2l3-7 4 14 3-9 2 4 2-2h4" />
    </svg>
  );
}

/** Diamond / gem — value, premium */
export function DiamondIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <polygon points="12 2 22 9 18 20 6 20 2 9 12 2" />
      <line x1="12" y1="2" x2="12" y2="20" />
      <polyline points="2 9 12 14 22 9" />
    </svg>
  );
}

/** Star — service, ratings */
export function StarOutlineIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/** Phone — telephone contact */
export function PhoneIcon({ className }: IconProps) {
  return (
    <svg {...baseProps} className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.55a16 16 0 0 0 6.54 6.54l1.61-1.61a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
