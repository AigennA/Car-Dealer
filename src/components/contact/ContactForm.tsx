"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { cars } from "@/lib/cars";
import { validateContact, type ContactErrors, type ContactInput } from "@/lib/validation";
import { ErrorSummary, Field, RequiredHint, SELECT_CLASS, SuccessMessage, SUBMIT_CLASS } from "@/components/forms/FormKit";

const SUBJECTS = [
  { value: "provkorning", label: "Boka provkörning" },
  { value: "kopa", label: "Jag vill köpa en bil" },
  { value: "salja", label: "Jag vill sälja / byta in min bil" },
  { value: "finansiering", label: "Frågor om finansiering" },
  { value: "service", label: "Service och reservdelar" },
  { value: "annat", label: "Annat" },
];


type Props = { carSlug?: string; subject?: string };

export default function ContactForm({ carSlug = "", subject = "" }: Props) {
  const car = cars.find((c) => c.slug === carSlug);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const defaultSubject = SUBJECTS.some((s) => s.value === subject) ? subject : car ? "kopa" : "";
  const defaultMessage = car
    ? `Hej! Jag är intresserad av ${car.title} (${car.year}). `
    : "";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const input: ContactInput = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      message: String(data.get("message") ?? ""),
    };
    const found = validateContact(input);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move focus to the error summary so keyboard / screen reader users find it.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSubmitted(true);
    form.reset();
    requestAnimationFrame(() => successRef.current?.focus());
  };

  if (submitted) {
    return (
      <SuccessMessage
        ref={successRef}
        title="Tack för ditt meddelande!"
        text="Vi återkommer till dig inom 24 timmar på vardagar."
        again="Skicka ett nytt meddelande"
        onAgain={() => setSubmitted(false)}
      />
    );
  }

  const order: (keyof ContactInput)[] = ["name", "email", "phone", "message"];
  const errorList = order.filter((f) => errors[f]).map((f) => [f, errors[f]!] as [string, string]);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-describedby="form-required-hint">
      <RequiredHint />
      <ErrorSummary ref={summaryRef} errors={errorList} />

      {car && (
        <p className="text-sm bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-gray-800">
          Gäller: <strong className="text-navy">{car.title} ({car.year})</strong>
          <input type="hidden" name="car" value={car.slug} />
        </p>
      )}

      <Field name="name" label="Namn" required autoComplete="name" error={errors.name} />
      <Field name="email" label="E-post" type="email" inputMode="email" required autoComplete="email" error={errors.email} />
      <Field name="phone" label="Telefon" type="tel" inputMode="tel" autoComplete="tel" error={errors.phone} />

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-800 mb-1.5">
          Ämne <span className="font-normal text-gray-700">(valfritt)</span>
        </label>
        <select id="subject" name="subject" defaultValue={defaultSubject} className={SELECT_CLASS}>
          <option value="">Välj ämne</option>
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <Field name="message" label="Meddelande" as="textarea" required defaultValue={defaultMessage} error={errors.message} />

      <button type="submit" className={SUBMIT_CLASS}>
        Skicka meddelande
      </button>
      <p className="text-xs text-gray-700">
        Vi behandlar dina uppgifter enligt vår{" "}
        <Link href="/integritet" className="text-primary underline">integritetspolicy</Link>.
      </p>
    </form>
  );
}
