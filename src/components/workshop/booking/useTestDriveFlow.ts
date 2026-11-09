"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import { MESSAGES } from "@/lib/messages";
import { createBookingRepository, type BookableDay, type BookingConfirmation, type BookingRepository } from "@/lib/booking/repository";
import { validateTestDrive, type TestDriveDetails, type TestDriveErrors } from "@/lib/validation";

export type TestDriveOutcome = "done" | "invalid" | "conflict" | "error";

/**
 * State and side effects of "Boka provkörning" for one car: day -> time -> details. The step
 * components only render. The repository is injected (API or demo), like useBookingFlow.
 */
export function useTestDriveFlow(carSlug: string, repository?: BookingRepository) {
  const repo = useMemo(() => repository ?? createBookingRepository(), [repository]);
  const [days, setDays] = useState<BookableDay[] | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<TestDriveErrors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    let cancelled = false;
    repo
      .loadTestDriveDays(carSlug)
      .then((d) => !cancelled && setDays(d))
      .catch((err) => !cancelled && (setDays([]), setServerError(messageFor(err, MESSAGES.testDrive.loadDaysFailed))));
    return () => {
      cancelled = true;
    };
  }, [repo, carSlug]);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    repo
      .loadTestDriveSlots(carSlug, date)
      .then((s) => !cancelled && setSlots(s))
      .catch(() => !cancelled && setServerError(MESSAGES.testDrive.loadSlotsFailed));
    return () => {
      cancelled = true;
    };
  }, [repo, carSlug, date]);

  const chooseDate = (d: string) => {
    setDate(d);
    setSlots(null);
    setTime("");
  };

  async function submit(details: TestDriveDetails): Promise<TestDriveOutcome> {
    setServerError("");
    const found = validateTestDrive({ date, time }, details);
    setErrors(found);
    if (Object.keys(found).length > 0) return "invalid";

    setSubmitting(true);
    try {
      setConfirmation(await repo.createTestDrive({ carSlug, date, time, ...details }));
      return "done";
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && !isCarProblem(err)) {
        // Someone took the time: refresh the times and let the visitor pick again.
        setTime("");
        setSlots(await repo.loadTestDriveSlots(carSlug, date).catch(() => []));
        setServerError(err.message);
        return "conflict";
      }
      setServerError(messageFor(err, MESSAGES.testDrive.sendFailed));
      return "error";
    } finally {
      setSubmitting(false);
    }
  }

  const bookAnother = () => {
    setConfirmation(null);
    setTime("");
  };

  return { days, date, slots, time, errors, serverError, submitting, confirmation, chooseDate, chooseTime: setTime, submit, bookAnother };
}

/** The car was sold or reserved meanwhile: not a "slot taken" conflict. */
const isCarProblem = (err: ApiError) => err.message === MESSAGES.testDrive.notBookable || err.message === MESSAGES.testDrive.notBookableDetail;

function messageFor(err: unknown, fallback: string): string {
  if (err instanceof ApiError && (err.status === 409 || err.status === 404)) return MESSAGES.testDrive.notBookableDetail;
  if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) return Object.values(err.fieldErrors).flat().join(" ");
  return fallback;
}
