"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import { MESSAGES } from "@/lib/messages";
import { createBookingRepository, type BookableDay, type BookingConfirmation, type BookingRepository } from "@/lib/booking/repository";
import { validateBooking, type BookingDetails, type BookingErrors } from "@/lib/validation";

export type SubmitOutcome = "done" | "invalid" | "conflict" | "error";

/**
 * All booking state and side effects; the step components only render.
 * The repository is injected (defaults to API or demo), which keeps this
 * hook independent of where data comes from.
 */
export function useBookingFlow(initialService = "", repository?: BookingRepository) {
  const repo = useMemo(() => repository ?? createBookingRepository(), [repository]);
  const [service, setService] = useState(initialService);
  const [days, setDays] = useState<BookableDay[] | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<BookingErrors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    if (!service) return;
    let cancelled = false;
    repo
      .loadDays(service)
      .then((d) => !cancelled && setDays(d))
      .catch(() => !cancelled && setServerError(MESSAGES.booking.loadDaysFailed));
    return () => {
      cancelled = true;
    };
  }, [repo, service]);

  useEffect(() => {
    if (!service || !date) return;
    let cancelled = false;
    repo
      .loadSlots(service, date)
      .then((s) => !cancelled && setSlots(s))
      .catch(() => !cancelled && setServerError(MESSAGES.booking.loadSlotsFailed));
    return () => {
      cancelled = true;
    };
  }, [repo, service, date]);

  const chooseService = (code: string) => {
    setService(code);
    setDays(null);
    setDate("");
    setSlots(null);
    setTime("");
  };

  const chooseDate = (d: string) => {
    setDate(d);
    setSlots(null);
    setTime("");
  };

  async function submit(details: BookingDetails): Promise<SubmitOutcome> {
    setServerError("");
    const found = validateBooking({ service, date, time }, details);
    setErrors(found);
    if (Object.keys(found).length > 0) return "invalid";

    setSubmitting(true);
    try {
      setConfirmation(await repo.create({ serviceCode: service, date, time, ...details }));
      return "done";
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Someone took the slot: refresh times and let the user pick again.
        setTime("");
        setSlots(await repo.loadSlots(service, date));
        setServerError(err.message);
        return "conflict";
      }
      setServerError(
        err instanceof ApiError && Object.keys(err.fieldErrors).length > 0
          ? Object.values(err.fieldErrors).flat().join(" ")
          : MESSAGES.booking.sendFailed,
      );
      return "error";
    } finally {
      setSubmitting(false);
    }
  }

  const bookAnother = () => {
    setConfirmation(null);
    setTime("");
  };

  return {
    service, days, date, slots, time, errors, serverError, submitting, confirmation,
    chooseService, chooseDate, chooseTime: setTime, submit, bookAnother,
  };
}
