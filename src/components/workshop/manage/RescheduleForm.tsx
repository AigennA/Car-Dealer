"use client";

import { useEffect, useRef, useState } from "react";
import { findService, formatDay } from "@/lib/workshop";
import { testDriveService } from "@/lib/testDrive";
import type { BookableDay, BookingRepository, ManagedBooking } from "@/lib/booking/repository";
import { SUBMIT_CLASS } from "@/components/forms/FormKit";
import { DayStep, TimeStep } from "../booking/Steps";
import { SECONDARY_BUTTON } from "../booking/styles";

/** Pick a new day and time for the same service. */
export function RescheduleForm({ booking, repo, busy, onSave, onCancel }: {
  booking: ManagedBooking;
  repo: BookingRepository;
  busy: boolean;
  onSave: (date: string, time: string) => Promise<"ok" | "failed">;
  onCancel: () => void;
}) {
  const [days, setDays] = useState<BookableDay[] | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    let cancelled = false;
    const load = booking.carSlug ? repo.loadTestDriveDays(booking.carSlug) : repo.loadDays(booking.serviceCode);
    load.then((d) => !cancelled && setDays(d), () => !cancelled && setDays([]));
    return () => { cancelled = true; };
  }, [repo, booking.serviceCode, booking.carSlug]);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    const load = booking.carSlug ? repo.loadTestDriveSlots(booking.carSlug, date) : repo.loadSlots(booking.serviceCode, date);
    load.then((s) => !cancelled && setSlots(s), () => !cancelled && setSlots([]));
    return () => { cancelled = true; };
  }, [repo, booking.serviceCode, booking.carSlug, date]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setError(!date ? "Välj en dag." : "Välj en tid.");
      return;
    }
    setError("");
    if ((await onSave(date, time)) === "failed") {
      // Most likely someone took the time: show fresh slots.
      setTime("");
      const fresh = booking.carSlug ? repo.loadTestDriveSlots(booking.carSlug, date) : repo.loadSlots(booking.serviceCode, date);
      setSlots(await fresh.catch(() => []));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5" aria-labelledby="ny-tid">
      <h2 id="ny-tid" ref={headingRef} tabIndex={-1} className="font-heading text-2xl font-bold text-navy focus:outline-none">
        Välj ny tid för {booking.serviceName}{booking.carTitle ? ` – ${booking.carTitle}` : ""}
      </h2>
      <p className="text-gray-700">Nuvarande tid: {formatDay(booking.date)} kl. {booking.time}.</p>
      <DayStep anchorId="ny-dag" legend="Välj dag" days={days} value={date}
        onChange={(d) => { setDate(d); setSlots(null); setTime(""); }} />
      {date && (
        <TimeStep anchorId="ny-tid-val" legend="Välj tid" date={date} service={booking.carSlug ? testDriveService : findService(booking.serviceCode)} slots={slots}
          value={time} onChange={setTime} />
      )}
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className={`${SUBMIT_CLASS} sm:w-auto sm:px-10`}>
          {busy ? "Sparar…" : "Spara ny tid"}
        </button>
        <button type="button" onClick={onCancel} className={SECONDARY_BUTTON}>Behåll nuvarande tid</button>
      </div>
    </form>
  );
}
