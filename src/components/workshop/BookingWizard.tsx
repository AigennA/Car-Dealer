"use client";

import { useId, useRef } from "react";
import Link from "next/link";
import { findService, servicesIn, formatDay, type ServiceCategory } from "@/lib/workshop";
import { formatSek } from "@/config/business";
import type { BookingRepository } from "@/lib/booking/repository";
import type { BookingDetails } from "@/lib/validation";
import { ErrorSummary, RequiredHint, SUBMIT_CLASS } from "@/components/forms/FormKit";
import { useBookingFlow } from "./booking/useBookingFlow";
import { DayStep, DetailsStep, ServiceStep, TimeStep } from "./booking/Steps";
import { BookingConfirmation } from "./booking/BookingConfirmation";
import { ROUTES } from "@/config/navigation";

type Props = {
  category: ServiceCategory;
  /** Pre-selects a service (e.g. from a "Boka" button next to it). */
  initialService?: string;
  /** Optional data source (tests / storybook); defaults to API or demo. */
  repository?: BookingRepository;
};

const DETAIL_FIELDS: (keyof BookingDetails)[] = ["name", "email", "phone", "regNumber", "message"];
const ERROR_ORDER = ["service", "date", "time", "name", "email", "phone", "regNumber"] as const;

/**
 * Accessible step-by-step booking: service → day → time → details.
 * Composition only: state lives in useBookingFlow, markup in the step components.
 */
export default function BookingWizard({ category, initialService, repository }: Props) {
  const id = useId();
  const flow = useBookingFlow(initialService, repository);
  const summaryRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLFieldSetElement>(null);
  const selected = findService(flow.service);
  const anchor = (step: string) => `${id}-${step}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const details = Object.fromEntries(DETAIL_FIELDS.map((f) => [f, String(form.get(f) ?? "")])) as BookingDetails;
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
    (k) => [k === "service" || k === "date" || k === "time" ? anchor(k) : k, flow.errors[k]!] as [string, string],
  );
  const readyForDetails = Boolean(flow.service && flow.date && flow.time);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-describedby={anchor("req")}>
      <RequiredHint id={anchor("req")} />
      <ErrorSummary ref={summaryRef} errors={errorList} />

      <ServiceStep anchorId={anchor("service")} error={flow.errors.service} services={servicesIn(category)}
        value={flow.service} onChange={flow.chooseService} />

      {flow.service && (
        <DayStep anchorId={anchor("date")} error={flow.errors.date} days={flow.days} value={flow.date} onChange={flow.chooseDate} />
      )}

      {flow.service && flow.date && (
        <TimeStep ref={timeRef} anchorId={anchor("time")} error={flow.errors.time} date={flow.date} service={selected}
          slots={flow.slots} value={flow.time} onChange={flow.chooseTime} />
      )}

      {readyForDetails && <DetailsStep errors={flow.errors} />}

      {flow.serverError && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800">{flow.serverError}</p>
      )}

      {readyForDetails && selected && (
        <>
          <p className="text-sm text-gray-700">
            Du bokar <strong className="text-navy">{selected.name}</strong> {formatDay(flow.date)} kl.{" "}
            <strong className="text-navy">{flow.time}</strong>. Pris från {formatSek(selected.priceFrom)}. Vi behandlar
            dina uppgifter enligt vår <Link href={ROUTES.privacy} className="text-primary underline">integritetspolicy</Link>.
          </p>
          <button type="submit" disabled={flow.submitting} className={`${SUBMIT_CLASS} sm:w-auto sm:px-10`}>
            {flow.submitting ? "Bokar…" : "Boka tid"}
          </button>
        </>
      )}
    </form>
  );
}
