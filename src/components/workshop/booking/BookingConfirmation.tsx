"use client";

import { forwardRef } from "react";
import { formatDay, formatDuration } from "@/lib/workshop";
import type { BookingConfirmation as Confirmation } from "@/lib/booking/repository";

/** Shown after booking; receives focus so screen readers announce it. */
export const BookingConfirmation = forwardRef<HTMLDivElement, { confirmation: Confirmation; onBookAnother: () => void }>(
  function BookingConfirmation({ confirmation: c, onBookAnother }, ref) {
    return (
      <div ref={ref} tabIndex={-1} role="status" className="rounded-2xl border-2 border-green-600 bg-green-50 p-6 focus:outline-none">
        <p className="font-heading text-xl font-bold text-green-900">
          {c.demo ? "Så här ser en bokningsbekräftelse ut" : "Tack! Din tid är bokad."}
        </p>
        <dl className="mt-4 grid gap-x-6 gap-y-2 text-green-900 sm:grid-cols-2">
          <div><dt className="text-sm">Tjänst</dt><dd className="font-semibold">{c.serviceName}</dd></div>
          <div><dt className="text-sm">Tid</dt><dd className="font-semibold">{formatDay(c.date)} kl. {c.time}</dd></div>
          <div><dt className="text-sm">Beräknad tid</dt><dd className="font-semibold">{formatDuration(c.durationMinutes)}</dd></div>
          {!c.demo && <div><dt className="text-sm">Bokningsnummer</dt><dd className="font-semibold tracking-wider">{c.reference}</dd></div>}
        </dl>
        {c.demo ? (
          <p className="mt-4 rounded-lg bg-white px-3 py-2 text-sm text-gray-800">
            <strong>Demoläge:</strong> den här webbplatsen är inte kopplad till bokningssystemet ännu, så ingen tid har
            reserverats. Ring oss för att boka.
          </p>
        ) : (
          <p className="mt-4 text-sm text-green-900">Lämna bilen i verkstadsreceptionen. Vi ringer om något behöver göras utöver det du bokat.</p>
        )}
        <button type="button" onClick={onBookAnother} className="mt-4 text-primary underline underline-offset-4">
          Boka en till tid
        </button>
      </div>
    );
  },
);
