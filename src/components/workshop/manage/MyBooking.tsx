"use client";

import { useEffect, useRef, useState } from "react";
import type { BookingRepository } from "@/lib/booking/repository";
import { apiEnabled } from "@/lib/api";
import { useMyBooking } from "./useMyBooking";
import { LookupForm } from "./LookupForm";
import { BookingCard } from "./BookingCard";
import { RescheduleForm } from "./RescheduleForm";

/**
 * "Min bokning" without an account: open the personal link (or scan the QR
 * code), or type the booking number plus e-mail / registration number.
 */
export default function MyBooking({ repository }: { repository?: BookingRepository }) {
  const my = useMyBooking(repository);
  const [moving, setMoving] = useState(false);
  const cardRef = useRef<HTMLHeadingElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLParagraphElement>(null);

  // Move focus to whatever just appeared, so keyboard and screen-reader users follow along.
  useEffect(() => { if (my.problem) problemRef.current?.focus(); }, [my.problem]);
  useEffect(() => { if (my.notice) noticeRef.current?.focus(); }, [my.notice]);
  useEffect(() => { if (my.booking && !my.notice && !moving) cardRef.current?.focus(); }, [my.booking, my.notice, moving]);

  if (my.openingLink) return <p role="status" className="text-gray-700">Hämtar din bokning…</p>;

  return (
    <div className="space-y-6">
      {!apiEnabled && (
        <p className="rounded-lg bg-white px-4 py-3 text-sm text-gray-800 shadow-sm">
          <strong>Demoläge:</strong> bokningar finns bara i den webbläsare där de gjordes.
        </p>
      )}

      {my.problem && (
        <div ref={problemRef} tabIndex={-1} role="alert" className="rounded-lg border-2 border-red-600 bg-red-50 p-4 focus:outline-none">
          <p className="font-semibold text-red-800">{my.problem.title}</p>
          {my.problem.detail && <p className="mt-1 text-sm text-red-800">{my.problem.detail}</p>}
        </div>
      )}

      {my.notice && (
        <p ref={noticeRef} tabIndex={-1} role="status" className="rounded-lg border-2 border-green-600 bg-green-50 p-4 font-semibold text-green-900 focus:outline-none">
          {my.notice}
        </p>
      )}

      {!my.booking ? (
        <LookupForm initialReference={my.initialReference} busy={my.busy} onFind={my.find} />
      ) : moving ? (
        <RescheduleForm booking={my.booking} repo={my.repo} busy={my.busy} onCancel={() => setMoving(false)}
          onSave={async (date, time) => {
            const outcome = await my.reschedule(date, time);
            if (outcome === "ok") setMoving(false);
            return outcome;
          }} />
      ) : (
        <>
          <BookingCard ref={cardRef} booking={my.booking} token={my.token} busy={my.busy}
            onReschedule={() => { my.clearProblem(); setMoving(true); }} onCancel={my.cancel} />
          <button type="button" onClick={my.reset} className="text-primary underline underline-offset-4">
            Sök en annan bokning
          </button>
        </>
      )}
    </div>
  );
}
