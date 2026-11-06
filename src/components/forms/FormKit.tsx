"use client";

import { forwardRef } from "react";

/**
 * Accessible form building blocks shared by the contact and trade-in forms:
 * visible labels, required/optional marking, aria-invalid + aria-describedby
 * for errors and hints, an error summary that receives focus, and a success
 * message that receives focus (WCAG 1.3.1, 3.3.1, 3.3.2, 3.3.3, 4.1.3).
 */

const FIELD =
  "w-full border rounded-lg px-3 py-2.5 text-gray-900 bg-white focus:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-primary";

type FieldProps = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  as?: "input" | "textarea";
  rows?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "required">;

export function Field({ name, label, error, hint, required, as = "input", rows = 5, className, ...rest }: FieldProps) {
  const describedBy = [hint ? `${name}-hint` : null, error ? `${name}-error` : null].filter(Boolean).join(" ") || undefined;
  const common = {
    id: name,
    name,
    required,
    "aria-required": required || undefined,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: `${FIELD} ${error ? "border-red-600" : "border-gray-400"} ${className ?? ""}`,
  };
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-800 mb-1.5">
        {label}{" "}
        {required ? <span aria-hidden="true">*</span> : <span className="font-normal text-gray-700">(valfritt)</span>}
      </label>
      {hint && (
        <p id={`${name}-hint`} className="text-sm text-gray-700 mb-1.5">
          {hint}
        </p>
      )}
      {as === "textarea" ? (
        <textarea {...common} rows={rows} defaultValue={rest.defaultValue as string | undefined} />
      ) : (
        <input {...common} {...rest} />
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-700">
          <span className="sr-only">Fel:</span>{" "}
          {error}
        </p>
      )}
    </div>
  );
}

export function RequiredHint({ id = "form-required-hint" }: { id?: string }) {
  return (
    <p id={id} className="text-sm text-gray-700">
      Fält markerade med <span aria-hidden="true">*</span>
      <span className="sr-only">stjärna</span> är obligatoriska.
    </p>
  );
}

export const ErrorSummary = forwardRef<HTMLDivElement, { errors: [string, string][] }>(function ErrorSummary(
  { errors },
  ref,
) {
  if (errors.length === 0) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert" className="border-2 border-red-600 bg-red-50 rounded-lg p-4 focus:outline-none">
      <p className="font-semibold text-red-800">Formuläret innehåller {errors.length} fel:</p>
      <ul className="mt-2 list-disc pl-5 text-sm text-red-800 space-y-1">
        {errors.map(([field, msg]) => (
          <li key={field}>
            <a href={`#${field}`} className="inline-block py-1 underline">
              {msg}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});

export const SuccessMessage = forwardRef<
  HTMLDivElement,
  { title: string; text: string; again: string; onAgain: () => void }
>(function SuccessMessage({ title, text, again, onAgain }, ref) {
  return (
    <div ref={ref} tabIndex={-1} role="status" className="bg-green-50 border border-green-300 rounded-lg p-6 text-center focus:outline-none">
      <p className="text-green-900 font-semibold mb-2">{title}</p>
      <p className="text-green-900 text-sm">{text}</p>
      <button type="button" onClick={onAgain} className="mt-4 text-primary underline underline-offset-4 text-sm">
        {again}
      </button>
    </div>
  );
});

export const SUBMIT_CLASS =
  "w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold";
export const SELECT_CLASS = `${FIELD} border-gray-400`;
