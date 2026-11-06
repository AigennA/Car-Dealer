"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ApiError } from "@/lib/api";
import { MESSAGES } from "@/lib/messages";
import { formatDay } from "@/lib/workshop";
import { parseManageLink } from "@/lib/booking/links";
import { createBookingRepository, type BookingAccess, type BookingRepository, type ManagedBooking } from "@/lib/booking/repository";

export type Problem = { title: string; detail?: string };
export type Outcome = "ok" | "failed";

const noSubscribe = () => () => {};
const readAddress = () => `${window.location.search}${window.location.hash}`;
const splitAddress = (a: string): [string, string] => {
  const i = a.indexOf("#");
  return i === -1 ? [a, ""] : [a.slice(0, i), a.slice(i)];
};

function toProblem(err: unknown): Problem {
  if (err instanceof ApiError && err.status === 404) return { title: MESSAGES.myBooking.notFound, detail: MESSAGES.myBooking.notFoundDetail };
  if (err instanceof ApiError && err.status === 409) return { title: err.message };
  return { title: MESSAGES.myBooking.failed };
}

/**
 * State for "Min bokning": find the booking (from the personal link or the
 * lookup form), then cancel or move it. The repository is injectable.
 */
export function useMyBooking(repository?: BookingRepository) {
  const repo = useMemo(() => repository ?? createBookingRepository(), [repository]);
  const [access, setAccess] = useState<BookingAccess | null>(null);
  const [booking, setBooking] = useState<ManagedBooking | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  // The address is read through useSyncExternalStore: the static HTML renders
  // the lookup form, the browser then switches to the personal link if present.
  const address = useSyncExternalStore(noSubscribe, readAddress, () => "");
  const link = useMemo(() => (address ? parseManageLink(...splitAddress(address)) : null), [address]);
  const [linkSettled, setLinkSettled] = useState(false);

  async function run(action: () => Promise<ManagedBooking>, next: BookingAccess, success = ""): Promise<Outcome> {
    setBusy(true);
    setProblem(null);
    setNotice("");
    try {
      const b = await action();
      setAccess(next);
      setBooking(b);
      setNotice(success);
      return "ok";
    } catch (err) {
      setProblem(toProblem(err));
      return "failed";
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!link?.token) return;
    let cancelled = false;
    repo.find(link).then(
      (b) => { if (!cancelled) { setAccess(link); setBooking(b); setLinkSettled(true); } },
      (err) => { if (!cancelled) { setProblem(toProblem(err)); setLinkSettled(true); } },
    );
    return () => { cancelled = true; };
  }, [repo, link]);

  /** True while a personal link (?ref=…#t=…) is being opened, so the form doesn't flash. */
  const openingLink = Boolean(link?.token) && !linkSettled;

  return {
    repo, booking, problem, notice, busy, openingLink, initialReference: link?.reference ?? "", token: access?.token,
    find: (a: BookingAccess) => run(() => repo.find(a), a),
    cancel: () => run(() => repo.cancel(access!), access!, MESSAGES.myBooking.cancelled),
    reschedule: (date: string, time: string) =>
      run(() => repo.reschedule(access!, date, time), access!, MESSAGES.myBooking.moved(`${formatDay(date)} kl. ${time}`)),
    reset: () => { setBooking(null); setAccess(null); setProblem(null); setNotice(""); },
    clearProblem: () => setProblem(null),
  };
}
