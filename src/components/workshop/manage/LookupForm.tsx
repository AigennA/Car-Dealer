"use client";

import { useRef, useState } from "react";
import { ErrorSummary, Field, RequiredHint, SUBMIT_CLASS } from "@/components/forms/FormKit";
import { MESSAGES } from "@/lib/messages";
import type { BookingAccess } from "@/lib/booking/repository";

type Errors = Partial<Record<"reference" | "contact", string>>;

/** Booking number + e-mail or registration number — for when the personal link is lost. */
export function LookupForm({ initialReference, busy, onFind }: {
  initialReference: string;
  busy: boolean;
  onFind: (access: BookingAccess) => void;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const summaryRef = useRef<HTMLDivElement>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const reference = String(form.get("reference") ?? "").trim();
    const contact = String(form.get("contact") ?? "").trim();
    const found: Errors = {};
    if (!reference) found.reference = MESSAGES.myBooking.referenceRequired;
    if (!contact) found.contact = MESSAGES.myBooking.contactRequired;
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    onFind({ reference, contact });
  };

  return (
    <form onSubmit={submit} noValidate aria-labelledby="hitta-bokning" aria-describedby="hitta-req"
      className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 id="hitta-bokning" className="font-heading text-2xl font-bold text-navy">Hitta din bokning</h2>
      <RequiredHint id="hitta-req" />
      <ErrorSummary ref={summaryRef} errors={Object.entries(errors) as [string, string][]} />
      <Field name="reference" label="Bokningsnummer" required defaultValue={initialReference} autoCapitalize="characters"
        autoComplete="off" spellCheck={false} hint="Står i bekräftelsen, t.ex. CD-7K3PQX." error={errors.reference} />
      <Field name="contact" label="E-post eller registreringsnummer" required autoComplete="email" spellCheck={false}
        hint="Samma som när du bokade." error={errors.contact} />
      <button type="submit" disabled={busy} className={`${SUBMIT_CLASS} sm:w-auto sm:px-10`}>
        {busy ? "Söker…" : "Visa bokningen"}
      </button>
    </form>
  );
}
