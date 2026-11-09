"use client";

import { useId, useRef } from "react";
import Link from "next/link";
import { formatDay } from "@/lib/workshop";
import { ROUTES } from "@/config/navigation";
import { testDriveService } from "@/lib/testDrive";
import type { Car } from "@/lib/cars";
import type { BookingRepository } from "@/lib/booking/repository";
import type { TestDriveDetails } from "@/lib/validation";
import { ErrorSummary, RequiredHint, SUBMIT_CLASS } from "@/components/forms/FormKit";
import { useTestDriveFlow } from "./booking/useTestDriveFlow";
import { DayStep, DetailsStep, TimeStep } from "./booking/Steps";
import { BookingConfirmation } from "./booking/BookingConfirmation";

const DETAIL_FIELDS: (keyof TestDriveDetails)[] = ["name", "email", "phone", "message"];
const ERROR_ORDER = ["date", "time", "name", "email", "phone"] as const;

/**
 * "Boka provkörning" for one car: day -> time -> details. Composition only: the state lives in
 * useTestDriveFlow and the markup in the shared step components (the same as the workshop booking).
 */
export default function TestDriveWizard({ car, repository }: { car: Pick<Car, "slug" | "title">; repository?: BookingRepository }) {
  const id = useId();
  const flow = useTestDriveFlow(car.slug, repository);
  const summaryRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLFieldSetElement>(null);
  const anchor = (step: string) => `${id}-${step}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const details = Object.fromEntries(DETAIL_FIELDS.map((f) => [f, String(form.get(f) ?? "")])) as TestDriveDetails;
    const outcome = await flow.submit(details);
    const focusTarget = {
      done: () => confirmationRef.current?.focus(),
      invalid: () => summaryRef.current?.focus(),
      conflict: () => timeRef.current?.querySelector<HTMLInputElement>("input")?.focus(),
      error: () => undefined,
    }[outcome];
    requestAnimationFrame(focusTarget);
  };

  if (flow.confirmation) {
    return <BookingConfirmation ref={confirmationRef} confirmation={flow.confirmation} onBookAnother={flow.bookAnother} />;
  }

  const errorList = ERROR_ORDER.filter((k) => flow.errors[k]).map(
    (k) => [k === "date" || k === "time" ? anchor(k) : k, flow.errors[k]!] as [string, string],
  );
  const ready = Boolean(flow.date && flow.time);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-describedby={anchor("req")}>
      <RequiredHint id={anchor("req")} />
      <p className="text-gray-700">
        Provkörningen tar ca {testDriveService.minutes} minuter. Ta med giltigt körkort.
      </p>
      <ErrorSummary ref={summaryRef} errors={errorList} />

      <DayStep anchorId={anchor("date")} legend="1. Välj dag" error={flow.errors.date} days={flow.days} value={flow.date}
        onChange={flow.chooseDate} />

      {flow.date && (
        <TimeStep ref={timeRef} anchorId={anchor("time")} legend="2. Välj tid" error={flow.errors.time} date={flow.date}
          service={testDriveService} slots={flow.slots} value={flow.time} onChange={flow.chooseTime} />
      )}

      {ready && (
        <DetailsStep errors={flow.errors} legend="3. Dina uppgifter" withRegNumber={false} messageLabel="Meddelande"
          messageHint="Berätta gärna om du vill veta något särskilt om bilen." />
      )}

      {flow.serverError && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800">{flow.serverError}</p>
      )}

      {ready && (
        <>
          <p className="text-sm text-gray-700">
            Du bokar provkörning av <strong className="text-navy">{car.title}</strong> {formatDay(flow.date)} kl.{" "}
            <strong className="text-navy">{flow.time}</strong>. Vi behandlar dina uppgifter enligt vår{" "}
            <Link href={ROUTES.privacy} className="text-primary underline">integritetspolicy</Link>.
          </p>
          <button type="submit" disabled={flow.submitting} className={`${SUBMIT_CLASS} sm:w-auto sm:px-10`}>
            {flow.submitting ? "Bokar…" : "Boka provkörning"}
          </button>
        </>
      )}
    </form>
  );
}
