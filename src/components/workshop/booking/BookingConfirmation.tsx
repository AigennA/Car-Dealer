"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { formatDay, formatDuration } from "@/lib/workshop";
import { manageHref, manageUrl } from "@/lib/booking/links";
import type { BookingConfirmation as Confirmation } from "@/lib/booking/repository";
import { QrCode } from "@/components/ui/QrCode";
import { AddToCalendar } from "./AddToCalendar";
import { SECONDARY_BUTTON } from "./styles";

/**
 * Shown after booking; receives focus so screen readers announce it.
 * Gives the customer three ways back to the booking: the booking number,
 * a personal link and a QR code with the same link.
 */
export const BookingConfirmation = forwardRef<HTMLDivElement, { confirmation: Confirmation; onBookAnother: () => void }>(
  function BookingConfirmation({ confirmation: c, onBookAnother }, ref) {
    const url = manageUrl(c.reference, c.manageToken);
    return (
      <div ref={ref} tabIndex={-1} role="status" className="rounded-2xl border-2 border-green-600 bg-green-50 p-6 focus:outline-none">
        <p className="font-heading text-xl font-bold text-green-900">
          {c.demo ? "Demobokning sparad" : "Tack! Din tid är bokad."}
        </p>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <dl className="grid flex-1 gap-x-6 gap-y-2 text-green-900 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm">Bokningsnummer</dt>
              <dd className="font-heading text-2xl font-bold tracking-wider">{c.reference}</dd>
            </div>
            <div><dt className="text-sm">{c.kind === "testdrive" ? "Bokning" : "Tjänst"}</dt><dd className="font-semibold">{c.serviceName}</dd></div>
            <div><dt className="text-sm">Tid</dt><dd className="font-semibold">{formatDay(c.date)} kl. {c.time}</dd></div>
            <div><dt className="text-sm">{c.kind === "testdrive" ? "Längd" : "Beräknad tid"}</dt><dd className="font-semibold">{formatDuration(c.durationMinutes)}</dd></div>
          </dl>
          <figure className="shrink-0 self-center text-center sm:self-start">
            <QrCode value={url} label={`QR-kod till din bokning ${c.reference}`} size={140} />
            <figcaption className="mt-1 max-w-[10rem] text-xs text-green-900">Skanna för att öppna bokningen i mobilen</figcaption>
          </figure>
        </div>

        <p className="mt-4 text-sm text-green-900">
          Spara bokningsnumret. Med det och din e-postadress{c.kind === "service" && " eller ditt registreringsnummer"} kan du alltid
          hitta, flytta eller avboka tiden under <strong>Min bokning</strong>.{" "}
          {c.kind === "testdrive"
            ? "Kom till showroomen, ta med giltigt körkort och visa gärna QR-koden i receptionen."
            : "Lämna bilen i verkstadsreceptionen och visa gärna QR-koden."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={manageHref(c.reference, c.manageToken)} className={SECONDARY_BUTTON}>Hantera bokningen</Link>
          <AddToCalendar className={SECONDARY_BUTTON}
            event={{ reference: c.reference, serviceName: c.serviceName, date: c.date, time: c.time, durationMinutes: c.durationMinutes, url }} />
        </div>

        {c.demo && (
          <p className="mt-4 rounded-lg bg-white px-3 py-2 text-sm text-gray-800">
            <strong>Demoläge:</strong> webbplatsen är inte kopplad till verkstadens bokningssystem ännu. Bokningen sparas bara
            i den här webbläsaren, så du kan prova Min bokning – men ingen tid är reserverad hos oss. Ring oss för att boka på riktigt.
          </p>
        )}
        <button type="button" onClick={onBookAnother} className="mt-4 text-primary underline underline-offset-4">
          Boka en till tid
        </button>
      </div>
    );
  },
);
