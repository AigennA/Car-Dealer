"use client";

import { forwardRef } from "react";
import { formatDay, formatDuration, type WorkshopService } from "@/lib/workshop";
import { formatSek } from "@/config/business";
import type { BookableDay } from "@/lib/booking/repository";
import { Field } from "@/components/forms/FormKit";
import { FIELD_ERROR, LEGEND, OPTION, RADIO, STEP } from "./styles";

type StepProps = { anchorId: string; error?: string; /** Overrides the numbered heading (e.g. when moving a booking). */ legend?: string };

function StepError({ id, error }: { id: string; error?: string }) {
  return error ? <p id={id} className={FIELD_ERROR}>{error}</p> : null;
}

export function ServiceStep({ anchorId, error, services, value, onChange }: StepProps & {
  services: WorkshopService[];
  value: string;
  onChange: (code: string) => void;
}) {
  return (
    <fieldset className={STEP} aria-describedby={error ? `${anchorId}-err` : undefined}>
      <legend className={`${LEGEND} mb-4`}>1. Välj tjänst <span aria-hidden="true">*</span></legend>
      <div id={anchorId} tabIndex={-1} className="clear-both grid gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <label key={s.code} className={OPTION}>
            <input type="radio" name="service" value={s.code} checked={value === s.code} onChange={() => onChange(s.code)} className={RADIO} />
            <span>
              <span className="block font-semibold text-navy">{s.name}</span>
              <span className="block text-sm text-gray-700">från {formatSek(s.priceFrom)} · {formatDuration(s.minutes)}</span>
            </span>
          </label>
        ))}
      </div>
      <StepError id={`${anchorId}-err`} error={error} />
    </fieldset>
  );
}

export function DayStep({ anchorId, error, days, value, onChange, legend = "2. Välj dag" }: StepProps & {
  days: BookableDay[] | null;
  value: string;
  onChange: (date: string) => void;
}) {
  return (
    <fieldset className={STEP} aria-describedby={error ? `${anchorId}-err` : undefined}>
      <legend className={`${LEGEND} mb-4`}>{legend} <span aria-hidden="true">*</span></legend>
      <div id={anchorId} tabIndex={-1} className="clear-both">
        {days === null ? (
          <p className="text-gray-700" role="status">Hämtar lediga dagar…</p>
        ) : days.length === 0 ? (
          <p className="text-gray-700">Inga lediga dagar just nu. Ring oss så hittar vi en tid.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {days.map((d) => (
              <label key={d.date} className={`${OPTION} p-3`}>
                <input type="radio" name="date" value={d.date} checked={value === d.date} disabled={d.freeSlots === 0}
                  onChange={() => onChange(d.date)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary)]" />
                <span>
                  <span className="block font-semibold text-navy first-letter:uppercase">
                    {formatDay(d.date, { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <span className="block text-xs text-gray-700">{d.freeSlots === 0 ? "Fullbokat" : `${d.freeSlots} lediga tider`}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
      <StepError id={`${anchorId}-err`} error={error} />
    </fieldset>
  );
}

export const TimeStep = forwardRef<HTMLFieldSetElement, StepProps & {
  date: string;
  service?: WorkshopService;
  slots: string[] | null;
  value: string;
  onChange: (time: string) => void;
}>(function TimeStep({ anchorId, error, date, service, slots, value, onChange, legend = "3. Välj tid" }, ref) {
  return (
    <fieldset ref={ref} className={STEP} aria-describedby={error ? `${anchorId}-err` : undefined}>
      <legend className={`${LEGEND} mb-1`}>{legend} <span aria-hidden="true">*</span></legend>
      <p className="clear-both mb-4 text-sm text-gray-700" role="status" aria-live="polite">
        {slots === null
          ? "Hämtar lediga tider…"
          : `${slots.length} lediga tider ${formatDay(date)}${service ? ` · ${service.name} tar ca ${formatDuration(service.minutes)}` : ""}`}
      </p>
      <div id={anchorId} tabIndex={-1} className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
        {slots?.map((t) => (
          <label key={t} className={`${OPTION} justify-center p-2.5`}>
            <input type="radio" name="time" value={t} checked={value === t} onChange={() => onChange(t)} className="sr-only" />
            <span className="font-semibold tabular-nums text-navy">{t}</span>
          </label>
        ))}
      </div>
      <StepError id={`${anchorId}-err`} error={error} />
    </fieldset>
  );
});

export function DetailsStep({ errors }: { errors: Partial<Record<"name" | "email" | "phone" | "regNumber", string>> }) {
  return (
    <fieldset className={`${STEP} space-y-4`}>
      <legend className={LEGEND}>4. Dina uppgifter</legend>
      <div className="clear-both grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Namn" required autoComplete="name" error={errors.name} />
        <Field name="phone" label="Telefon" type="tel" inputMode="tel" required autoComplete="tel" error={errors.phone} />
        <Field name="email" label="E-post" type="email" inputMode="email" required autoComplete="email" error={errors.email} />
        <Field name="regNumber" label="Registreringsnummer" required autoCapitalize="characters" hint="T.ex. ABC 123" error={errors.regNumber} />
      </div>
      <Field name="message" label="Meddelande till verkstaden" as="textarea" rows={3} hint="Beskriv gärna vad som behöver göras." />
    </fieldset>
  );
}
