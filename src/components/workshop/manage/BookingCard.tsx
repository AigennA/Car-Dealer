"use client";

import Link from "next/link";
import { forwardRef, useEffect, useRef, useState } from "react";
import { catalog, formatDay, formatDuration } from "@/lib/workshop";
import { testDriveCatalog } from "@/lib/testDrive";
import { ROUTES } from "@/config/navigation";
import { manageUrl } from "@/lib/booking/links";
import { STATUS_LABEL } from "@/lib/booking/rules";
import type { ManagedBooking } from "@/lib/booking/repository";
import { SITE } from "@/lib/site";
import { QrCode } from "@/components/ui/QrCode";
import { AddToCalendar } from "../booking/AddToCalendar";
import { DANGER_BUTTON, SECONDARY_BUTTON } from "../booking/styles";

const STATUS_CLASS: Record<ManagedBooking["status"], string> = {
  Booked: "bg-green-100 text-green-900",
  Confirmed: "bg-green-100 text-green-900",
  Arrived: "bg-blue-100 text-blue-900",
  Completed: "bg-gray-100 text-gray-900",
  Cancelled: "bg-red-100 text-red-900",
};

/** The booking with its actions. The heading receives focus when it opens. */
export const BookingCard = forwardRef<HTMLHeadingElement, {
  booking: ManagedBooking;
  token?: string;
  busy: boolean;
  onReschedule: () => void;
  onCancel: () => void;
}>(function BookingCard({ booking: b, token, busy, onReschedule, onCancel }, headingRef) {
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef<HTMLParagraphElement>(null);
  const url = manageUrl(b.reference, token);
  const active = b.status !== "Cancelled" && b.status !== "Completed";
  const testDrive = Boolean(b.carSlug);
  const cutoffHours = (testDrive ? testDriveCatalog : catalog).changeCutoffHours;
  const calendarName = testDrive ? `${b.serviceName} – ${b.carTitle}` : b.serviceName;

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  return (
    <article aria-labelledby="bokning-rubrik" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 id="bokning-rubrik" ref={headingRef} tabIndex={-1} className="font-heading text-2xl font-bold text-navy focus:outline-none">
          {b.serviceName}
        </h2>
        <p className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_CLASS[b.status]}`}>
          <span className="sr-only">Status: </span>{STATUS_LABEL[b.status]}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:justify-between">
        <dl className="grid flex-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <div><dt className="text-sm text-gray-700">Tid</dt><dd className="font-semibold text-navy">{formatDay(b.date)} kl. {b.time}</dd></div>
          <div><dt className="text-sm text-gray-700">Beräknad tid</dt><dd className="font-semibold text-navy">{formatDuration(b.durationMinutes)}</dd></div>
          <div><dt className="text-sm text-gray-700">Bokningsnummer</dt><dd className="font-semibold tracking-wider text-navy">{b.reference}</dd></div>
          <div>
            <dt className="text-sm text-gray-700">Bil</dt>
            <dd className="font-semibold text-navy">
              {testDrive ? (
                <Link href={`${ROUTES.cars}/${b.carSlug}`} className="text-primary underline underline-offset-4">{b.carTitle}</Link>
              ) : b.regNumber}
            </dd>
          </div>
          <div className="sm:col-span-2"><dt className="text-sm text-gray-700">Adress</dt><dd className="font-semibold text-navy">{SITE.address.street}, {SITE.address.city}</dd></div>
        </dl>
        {active && (
          <figure className="shrink-0 self-center text-center sm:self-start">
            <QrCode value={url} label={`QR-kod för bokning ${b.reference}`} size={140} />
            <figcaption className="mt-1 max-w-[10rem] text-xs text-gray-700">Visa koden i {testDrive ? "receptionen" : "verkstadsreceptionen"}</figcaption>
          </figure>
        )}
      </div>

      {active && (
        <div className="mt-6 flex flex-wrap gap-3">
          <AddToCalendar className={SECONDARY_BUTTON}
            event={{ reference: b.reference, serviceName: calendarName, date: b.date, time: b.time, durationMinutes: b.durationMinutes, url }} />
          {b.canChange && !confirming && (
            <>
              <button type="button" onClick={onReschedule} className={SECONDARY_BUTTON}>Ändra tid</button>
              <button type="button" onClick={() => setConfirming(true)} className={DANGER_BUTTON}>Avboka</button>
            </>
          )}
        </div>
      )}

      {active && !b.canChange && (
        <p className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-gray-800">
          Bokningen kan inte längre ändras på webben (senast {cutoffHours} timmar före besöket). Ring oss på{" "}
          <a href={SITE.phoneHref} className="text-primary underline underline-offset-4">{SITE.phone}</a>, så hjälper vi dig.
        </p>
      )}

      {confirming && (
        <div className="mt-6 rounded-xl border-2 border-red-700 bg-red-50 p-4">
          <p ref={confirmRef} tabIndex={-1} className="font-semibold text-red-900 focus:outline-none">
            Vill du avboka {b.serviceName} {formatDay(b.date)} kl. {b.time}?
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" disabled={busy} onClick={onCancel} className={DANGER_BUTTON}>
              {busy ? "Avbokar…" : "Ja, avboka"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className={SECONDARY_BUTTON}>Nej, behåll tiden</button>
          </div>
        </div>
      )}
    </article>
  );
});
