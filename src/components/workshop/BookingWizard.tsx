"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  type BookableDay,
  type BookingConfirmation,
  type ServiceCategory,
  createBooking,
  formatDay,
  formatDuration,
  loadDays,
  loadSlots,
  REG_RE,
  servicesIn,
  findService,
} from "@/lib/workshop";
import { ApiError } from "@/lib/api";
import { validateContact } from "@/lib/validation";
import { ErrorSummary, Field, RequiredHint, SUBMIT_CLASS } from "@/components/forms/FormKit";

type Props = {
  category: ServiceCategory;
  /** Pre-selects a service (e.g. from a "Boka" button next to it). */
  initialService?: string;
};

type Details = { name: string; email: string; phone: string; regNumber: string; message: string };
type Errors = Partial<Record<keyof Details | "service" | "date" | "time", string>>;

const STEP = "rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";
const LEGEND = "font-heading text-lg font-semibold text-navy";
const OPTION =
  "flex cursor-pointer items-start gap-3 rounded-xl border-2 border-gray-300 p-4 transition-colors hover:border-primary/60 " +
  "has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary " +
  "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60";

/**
 * Accessible step-by-step booking: service → day → time → details.
 * Every step is a fieldset with a legend and native radio buttons, so it works
 * with keyboard (arrow keys inside a group) and screen readers out of the box.
 */
export default function BookingWizard({ category, initialService }: Props) {
  const id = useId();
  const services = servicesIn(category);
  const [service, setService] = useState(initialService ?? "");
  const [days, setDays] = useState<BookableDay[] | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState<BookingConfirmation | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLFieldSetElement>(null);

  // Load bookable days whenever the service changes (client-side: depends on "now").
  useEffect(() => {
    if (!service) return;
    let cancelled = false;
    loadDays(service)
      .then((d) => !cancelled && setDays(d))
      .catch(() => !cancelled && setServerError("Kunde inte hämta lediga dagar. Ring oss gärna i stället."));
    return () => {
      cancelled = true;
    };
  }, [service]);

  useEffect(() => {
    if (!service || !date) return;
    let cancelled = false;
    loadSlots(service, date)
      .then((s) => !cancelled && setSlots(s))
      .catch(() => !cancelled && setServerError("Kunde inte hämta lediga tider. Ring oss gärna i stället."));
    return () => {
      cancelled = true;
    };
  }, [service, date]);

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

  const selected = findService(service);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");
    const form = new FormData(e.currentTarget);
    const details: Details = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      regNumber: String(form.get("regNumber") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    const found: Errors = {};
    if (!service) found.service = "Välj en tjänst.";
    if (!date) found.date = "Välj en dag.";
    if (!time) found.time = "Välj en tid.";
    const contact = validateContact({ ...details, message: "x".repeat(10) });
    if (contact.name) found.name = contact.name;
    if (contact.email) found.email = contact.email;
    if (!details.phone.trim()) found.phone = "Fyll i ditt telefonnummer så att verkstaden kan nå dig.";
    else if (contact.phone) found.phone = contact.phone;
    if (!details.regNumber.trim()) found.regNumber = "Fyll i bilens registreringsnummer.";
    else if (!REG_RE.test(details.regNumber)) found.regNumber = "Registreringsnumret ska ha formatet ABC 123 eller ABC 12D.";

    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    try {
      const conf = await createBooking({ serviceCode: service, date, time, ...details });
      setDone(conf);
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Someone took the slot — refresh times and send the user back to that step.
        setTime("");
        setSlots(await loadSlots(service, date));
        setServerError(err.message);
        requestAnimationFrame(() => timeRef.current?.querySelector<HTMLInputElement>("input")?.focus());
      } else if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
        setServerError(Object.values(err.fieldErrors).flat().join(" "));
      } else {
        setServerError("Bokningen kunde inte skickas. Försök igen eller ring oss.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="rounded-2xl border-2 border-green-600 bg-green-50 p-6 focus:outline-none">
        <p className="font-heading text-xl font-bold text-green-900">
          {done.demo ? "Så här ser en bokningsbekräftelse ut" : "Tack! Din tid är bokad."}
        </p>
        <dl className="mt-4 grid gap-x-6 gap-y-2 text-green-900 sm:grid-cols-2">
          <div><dt className="text-sm">Tjänst</dt><dd className="font-semibold">{done.serviceName}</dd></div>
          <div><dt className="text-sm">Tid</dt><dd className="font-semibold">{formatDay(done.date)} kl. {done.time}</dd></div>
          <div><dt className="text-sm">Beräknad tid</dt><dd className="font-semibold">{formatDuration(done.durationMinutes)}</dd></div>
          {!done.demo && <div><dt className="text-sm">Bokningsnummer</dt><dd className="font-semibold tracking-wider">{done.reference}</dd></div>}
        </dl>
        {done.demo ? (
          <p className="mt-4 rounded-lg bg-white px-3 py-2 text-sm text-gray-800">
            <strong>Demoläge:</strong> den här webbplatsen är inte kopplad till bokningssystemet ännu, så ingen tid har
            reserverats. Ring oss för att boka.
          </p>
        ) : (
          <p className="mt-4 text-sm text-green-900">Lämna bilen i verkstadsreceptionen. Vi ringer om något behöver göras utöver det du bokat.</p>
        )}
        <button type="button" onClick={() => { setDone(null); setTime(""); }} className="mt-4 text-primary underline underline-offset-4">
          Boka en till tid
        </button>
      </div>
    );
  }

  const errorList = (["service", "date", "time", "name", "email", "phone", "regNumber"] as const)
    .filter((k) => errors[k])
    .map((k) => [k === "service" || k === "date" || k === "time" ? `${id}-${k}` : k, errors[k]!] as [string, string]);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-describedby={`${id}-req`}>
      <RequiredHint id={`${id}-req`} />
      <ErrorSummary ref={summaryRef} errors={errorList} />

      {/* 1. Service */}
      <fieldset className={STEP} aria-describedby={errors.service ? `${id}-service-err` : undefined}>
        <legend className={`${LEGEND} float-left w-full mb-4`}>1. Välj tjänst <span aria-hidden="true">*</span></legend>
        <div id={`${id}-service`} tabIndex={-1} className="clear-both grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <label key={s.code} className={OPTION}>
              <input
                type="radio"
                name="service"
                value={s.code}
                checked={service === s.code}
                onChange={() => chooseService(s.code)}
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-primary)]"
              />
              <span>
                <span className="block font-semibold text-navy">{s.name}</span>
                <span className="block text-sm text-gray-700">
                  från {s.priceFrom.toLocaleString("sv-SE")} kr · {formatDuration(s.minutes)}
                </span>
              </span>
            </label>
          ))}
        </div>
        {errors.service && <p id={`${id}-service-err`} className="mt-2 text-sm text-red-700">{errors.service}</p>}
      </fieldset>

      {/* 2. Day */}
      {service && (
        <fieldset className={STEP} aria-describedby={errors.date ? `${id}-date-err` : undefined}>
          <legend className={`${LEGEND} float-left w-full mb-4`}>2. Välj dag <span aria-hidden="true">*</span></legend>
          <div id={`${id}-date`} tabIndex={-1} className="clear-both">
            {days === null ? (
              <p className="text-gray-700" role="status">Hämtar lediga dagar…</p>
            ) : days.length === 0 ? (
              <p className="text-gray-700">Inga lediga dagar just nu. Ring oss så hittar vi en tid.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {days.map((d) => (
                  <label key={d.date} className={`${OPTION} p-3`}>
                    <input
                      type="radio"
                      name="date"
                      value={d.date}
                      checked={date === d.date}
                      disabled={d.freeSlots === 0}
                      onChange={() => chooseDate(d.date)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
                    />
                    <span>
                      <span className="block font-semibold text-navy first-letter:uppercase">
                        {formatDay(d.date, { weekday: "short", day: "numeric", month: "short" })}
                      </span>
                      <span className="block text-xs text-gray-700">
                        {d.freeSlots === 0 ? "Fullbokat" : `${d.freeSlots} lediga tider`}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {errors.date && <p id={`${id}-date-err`} className="mt-2 text-sm text-red-700">{errors.date}</p>}
        </fieldset>
      )}

      {/* 3. Time */}
      {service && date && (
        <fieldset ref={timeRef} className={STEP} aria-describedby={errors.time ? `${id}-time-err` : undefined}>
          <legend className={`${LEGEND} float-left w-full mb-1`}>3. Välj tid <span aria-hidden="true">*</span></legend>
          <p className="clear-both mb-4 text-sm text-gray-700" role="status" aria-live="polite">
            {slots === null
              ? "Hämtar lediga tider…"
              : `${slots.length} lediga tider ${formatDay(date)}${selected ? ` · ${selected.name} tar ca ${formatDuration(selected.minutes)}` : ""}`}
          </p>
          <div id={`${id}-time`} tabIndex={-1} className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
            {slots?.map((t) => (
              <label key={t} className={`${OPTION} justify-center p-2.5`}>
                <input
                  type="radio"
                  name="time"
                  value={t}
                  checked={time === t}
                  onChange={() => setTime(t)}
                  className="sr-only"
                />
                <span className="font-semibold tabular-nums text-navy">{t}</span>
              </label>
            ))}
          </div>
          {errors.time && <p id={`${id}-time-err`} className="mt-2 text-sm text-red-700">{errors.time}</p>}
        </fieldset>
      )}

      {/* 4. Details */}
      {service && date && time && (
        <fieldset className={`${STEP} space-y-4`}>
          <legend className={`${LEGEND} float-left w-full`}>4. Dina uppgifter</legend>
          <div className="clear-both grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Namn" required autoComplete="name" error={errors.name} />
            <Field name="phone" label="Telefon" type="tel" inputMode="tel" required autoComplete="tel" error={errors.phone} />
            <Field name="email" label="E-post" type="email" inputMode="email" required autoComplete="email" error={errors.email} />
            <Field
              name="regNumber"
              label="Registreringsnummer"
              required
              autoCapitalize="characters"
              hint="T.ex. ABC 123"
              error={errors.regNumber}
            />
          </div>
          <Field name="message" label="Meddelande till verkstaden" as="textarea" rows={3} hint="Beskriv gärna vad som behöver göras." />
        </fieldset>
      )}

      {serverError && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800">
          {serverError}
        </p>
      )}

      {service && date && time && (
        <>
          <p className="text-sm text-gray-700">
            Du bokar <strong className="text-navy">{selected?.name}</strong> {formatDay(date)} kl. <strong className="text-navy">{time}</strong>.
            Pris från {selected?.priceFrom.toLocaleString("sv-SE")} kr. Vi behandlar dina uppgifter enligt vår{" "}
            <Link href="/integritet" className="text-primary underline">integritetspolicy</Link>.
          </p>
          <button type="submit" disabled={submitting} className={`${SUBMIT_CLASS} sm:w-auto sm:px-10`}>
            {submitting ? "Bokar…" : "Boka tid"}
          </button>
        </>
      )}
    </form>
  );
}
