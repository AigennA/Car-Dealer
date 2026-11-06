"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { validateTradeIn, type TradeInErrors, type TradeInInput } from "@/lib/validation";
import { ErrorSummary, Field, RequiredHint, SuccessMessage, SUBMIT_CLASS } from "@/components/forms/FormKit";
import { ROUTES } from "@/config/navigation";

const FIELDS: (keyof TradeInInput)[] = ["name", "email", "phone", "brand", "model", "year", "mileage", "message"];

export default function TradeInForm() {
  const [errors, setErrors] = useState<TradeInErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const input = Object.fromEntries(FIELDS.map((f) => [f, String(data.get(f) ?? "")])) as TradeInInput;
    const found = validateTradeIn(input);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSubmitted(true);
    requestAnimationFrame(() => successRef.current?.focus());
  };

  if (submitted) {
    return (
      <SuccessMessage
        ref={successRef}
        title="Tack för din förfrågan!"
        text="Vi återkommer med en värdering inom 24 timmar på vardagar."
        again="Skicka en ny förfrågan"
        onAgain={() => setSubmitted(false)}
      />
    );
  }

  // keep the summary in the same order as the fields
  const errorList = FIELDS.filter((f) => errors[f]).map((f) => [f, errors[f]!] as [string, string]);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-describedby="tradein-required-hint">
      <RequiredHint id="tradein-required-hint" />
      <ErrorSummary ref={summaryRef} errors={errorList} />

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-navy mb-1">Dina uppgifter</legend>
        <Field name="name" label="Namn" required autoComplete="name" error={errors.name} />
        <Field name="email" label="E-post" type="email" inputMode="email" required autoComplete="email" error={errors.email} />
        <Field name="phone" label="Telefon" type="tel" inputMode="tel" autoComplete="tel" error={errors.phone} />
      </fieldset>

      <fieldset className="space-y-4 pt-2">
        <legend className="text-lg font-semibold text-navy mb-1">Din bil</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field name="brand" label="Märke" required error={errors.brand} />
          <Field name="model" label="Modell" required error={errors.model} />
          <Field name="year" label="Årsmodell" required inputMode="numeric" maxLength={4} error={errors.year} />
          <Field
            name="mileage"
            label="Miltal (mil)"
            required
            inputMode="numeric"
            hint="1 mil = 10 km"
            error={errors.mileage}
          />
        </div>
        <Field
          name="message"
          label="Skick och utrustning"
          as="textarea"
          rows={4}
          hint="T.ex. servicehistorik, skador, vinterhjul."
          error={errors.message}
        />
      </fieldset>

      <button type="submit" className={SUBMIT_CLASS}>
        Skicka förfrågan
      </button>
      <p className="text-xs text-gray-700">
        Vi behandlar dina uppgifter enligt vår{" "}
        <Link href={ROUTES.privacy} className="text-primary underline">
          integritetspolicy
        </Link>
        .
      </p>
    </form>
  );
}
