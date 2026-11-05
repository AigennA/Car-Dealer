"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { cars } from "@/lib/cars";
import { validateContact, type ContactErrors, type ContactInput } from "@/lib/validation";

const SUBJECTS = [
  { value: "provkorning", label: "Boka provkörning" },
  { value: "kopa", label: "Jag vill köpa en bil" },
  { value: "salja", label: "Jag vill sälja / byta in min bil" },
  { value: "finansiering", label: "Frågor om finansiering" },
  { value: "service", label: "Service och reservdelar" },
  { value: "annat", label: "Annat" },
];

const FIELD =
  "w-full border rounded-lg px-3 py-2.5 text-gray-900 bg-white focus:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-primary";
const LABEL = "block text-sm font-medium text-gray-800 mb-1.5";

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

  const describedBy = (field: keyof ContactInput, hint?: string) =>
    [hint, errors[field] ? `${field}-error` : undefined].filter(Boolean).join(" ") || undefined;

  const fieldClass = (field: keyof ContactInput) =>
    `${FIELD} ${errors[field] ? "border-red-600" : "border-gray-400"}`;

  if (submitted) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="bg-green-50 border border-green-300 rounded-lg p-6 text-center focus:outline-none"
      >
        <p className="text-green-900 font-semibold mb-2">Tack för ditt meddelande!</p>
        <p className="text-green-900 text-sm">Vi återkommer till dig inom 24 timmar på vardagar.</p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-primary underline underline-offset-4 text-sm"
        >
          Skicka ett nytt meddelande
        </button>
      </div>
    );
  }

  const errorList = Object.entries(errors) as [keyof ContactInput, string][];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-describedby="form-required-hint">
      <p id="form-required-hint" className="text-sm text-gray-700">
        Fält markerade med <span aria-hidden="true">*</span>
        <span className="sr-only">stjärna</span> är obligatoriska.
      </p>

      {errorList.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="border-2 border-red-600 bg-red-50 rounded-lg p-4 focus:outline-none"
        >
          <p className="font-semibold text-red-800">
            Formuläret innehåller {errorList.length} fel:
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-red-800 space-y-1">
            {errorList.map(([field, msg]) => (
              <li key={field}>
                <a href={`#${field}`} className="inline-block py-1 underline">{msg}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {car && (
        <p className="text-sm bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-gray-800">
          Gäller: <strong className="text-navy">{car.title} ({car.year})</strong>
          <input type="hidden" name="car" value={car.slug} />
        </p>
      )}

      <div>
        <label htmlFor="name" className={LABEL}>
          Namn <span aria-hidden="true">*</span>
        </label>
        <input type="text" id="name" name="name" required aria-required="true" autoComplete="name"
          aria-invalid={!!errors.name} aria-describedby={describedBy("name")} className={fieldClass("name")} />
        {errors.name && <p id="name-error" className="mt-1 text-sm text-red-700">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className={LABEL}>
          E-post <span aria-hidden="true">*</span>
        </label>
        <input type="email" id="email" name="email" required aria-required="true" autoComplete="email"
          inputMode="email" aria-invalid={!!errors.email} aria-describedby={describedBy("email")}
          className={fieldClass("email")} />
        {errors.email && <p id="email-error" className="mt-1 text-sm text-red-700">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className={LABEL}>
          Telefon <span className="font-normal text-gray-700">(valfritt)</span>
        </label>
        <input type="tel" id="phone" name="phone" autoComplete="tel" inputMode="tel"
          aria-invalid={!!errors.phone} aria-describedby={describedBy("phone")} className={fieldClass("phone")} />
        {errors.phone && <p id="phone-error" className="mt-1 text-sm text-red-700">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="subject" className={LABEL}>Ämne</label>
        <select id="subject" name="subject" defaultValue={defaultSubject} className={`${FIELD} border-gray-400`}>
          <option value="">Välj ämne</option>
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={LABEL}>
          Meddelande <span aria-hidden="true">*</span>
        </label>
        <textarea id="message" name="message" required aria-required="true" rows={5} defaultValue={defaultMessage}
          aria-invalid={!!errors.message} aria-describedby={describedBy("message")} className={fieldClass("message")} />
        {errors.message && <p id="message-error" className="mt-1 text-sm text-red-700">{errors.message}</p>}
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
      >
        Skicka meddelande
      </button>
      <p className="text-xs text-gray-700">
        Vi behandlar dina uppgifter enligt vår{" "}
        <Link href="/integritet" className="text-primary underline">integritetspolicy</Link>.
      </p>
    </form>
  );
}
