"use client";

import { useEffect, useRef, useState } from "react";
import type { Car } from "@/lib/cars";
import { VEHICLE_OPTIONS, VEHICLE_LIMITS, type VehicleOptionKey } from "@/config/vehicle";
import { newCustomCarId, toCar, toFormValues, validateCarForm, type CarFormErrors, type CarFormValues } from "@/lib/admin/carForm";
import { ErrorSummary } from "@/components/forms/FormKit";

type Props = {
  car: Car | null;
  onSave: (car: Car, isNew: boolean) => void;
  onClose: () => void;
};

const INPUT = "w-full border rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";
const LABEL = "block text-sm font-medium text-gray-700 mb-1";

type TextField = { name: keyof CarFormValues; label: string; type?: "text" | "number"; min?: number; max?: number };
const TEXT_FIELDS: TextField[] = [
  { name: "make", label: "Märke" },
  { name: "model", label: "Modell" },
  { name: "year", label: "Årsmodell", type: "number", min: VEHICLE_LIMITS.minYear, max: VEHICLE_LIMITS.maxYear },
  { name: "mileage", label: "Miltal (mil)", type: "number", min: 0, max: VEHICLE_LIMITS.maxMileage },
  { name: "price", label: "Pris (kr)", type: "number", min: 1, max: VEHICLE_LIMITS.maxPrice },
  { name: "color", label: "Färg" },
];
const SELECT_FIELDS: { name: VehicleOptionKey; label: string }[] = [
  { name: "fuel", label: "Bränsle" },
  { name: "transmission", label: "Växellåda" },
  { name: "drivetrain", label: "Drivning" },
  { name: "bodyType", label: "Kaross" },
  { name: "status", label: "Status" },
];
const LIST_FIELDS: { name: "features" | "images"; label: string; hint: string }[] = [
  { name: "features", label: "Utrustning", hint: "Separera med kommatecken, t.ex. Navigation, Dragkrok" },
  { name: "images", label: "Bild-URL:er", hint: "Separera med kommatecken. Lämna tomt för en standardbild." },
];

/**
 * Add/edit a car in a native modal <dialog>: focus trap, inert background,
 * Escape closes, focus returns to the button that opened it.
 */
export default function CarFormDialog({ car, onSave, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<CarFormValues>(() => toFormValues(car));
  const [errors, setErrors] = useState<CarFormErrors>({});

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLInputElement>("input, select, textarea")?.focus();
    return () => {
      dialog?.close();
      opener?.focus();
    };
  }, []);

  const set = <K extends keyof CarFormValues>(name: K, value: CarFormValues[K]) =>
    setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateCarForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    onSave(toCar(values, car, newCustomCarId), car === null);
  };

  const errorList = TEXT_FIELDS.filter((f) => errors[f.name]).map((f) => [`car-${f.name}`, errors[f.name]!] as [string, string]);
  const title = car ? `Redigera ${car.title}` : "Lägg till ny bil";

  return (
    <dialog ref={dialogRef} aria-labelledby="car-form-title" className="backdrop:bg-black/50 bg-transparent p-4 m-auto max-w-3xl w-full"
      onCancel={(e) => { e.preventDefault(); onClose(); }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 id="car-form-title" className="text-2xl font-bold text-navy">{title}</h2>
          <button type="button" onClick={onClose}
            className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-gray-700 hover:text-navy hover:bg-gray-100 text-2xl">
            <span aria-hidden="true">&times;</span>
            <span className="sr-only">Stäng dialogen</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <ErrorSummary ref={summaryRef} errors={errorList} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEXT_FIELDS.map((f) => (
              <div key={f.name}>
                <label htmlFor={`car-${f.name}`} className={LABEL}>{f.label} <span aria-hidden="true">*</span></label>
                <input id={`car-${f.name}`} type={f.type ?? "text"} min={f.min} max={f.max} required
                  inputMode={f.type === "number" ? "numeric" : undefined}
                  value={values[f.name] as string} onChange={(e) => set(f.name, e.target.value)}
                  aria-invalid={errors[f.name] ? true : undefined} aria-describedby={errors[f.name] ? `car-${f.name}-err` : undefined}
                  className={`${INPUT} ${errors[f.name] ? "border-red-600" : "border-gray-400"}`} />
                {errors[f.name] && <p id={`car-${f.name}-err`} className="mt-1 text-sm text-red-700">{errors[f.name]}</p>}
              </div>
            ))}
            {SELECT_FIELDS.map((f) => (
              <div key={f.name}>
                <label htmlFor={`car-${f.name}`} className={LABEL}>{f.label}</label>
                <select id={`car-${f.name}`} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)}
                  className={`${INPUT} border-gray-400 bg-white`}>
                  {VEHICLE_OPTIONS[f.name].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="car-description" className={LABEL}>Beskrivning</label>
            <textarea id="car-description" rows={3} value={values.description} onChange={(e) => set("description", e.target.value)}
              className={`${INPUT} border-gray-400`} />
          </div>

          {LIST_FIELDS.map((f) => (
            <div key={f.name}>
              <label htmlFor={`car-${f.name}`} className={LABEL}>{f.label}</label>
              <p id={`car-${f.name}-hint`} className="text-xs text-gray-600 mb-1">{f.hint}</p>
              <textarea id={`car-${f.name}`} rows={2} value={values[f.name]} aria-describedby={`car-${f.name}-hint`}
                onChange={(e) => set(f.name, e.target.value)} className={`${INPUT} border-gray-400`} />
            </div>
          ))}

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)}
              className="w-5 h-5 accent-[var(--color-primary)]" />
            <span className="text-sm font-medium text-gray-700">Utvald bil (visas på startsidan)</span>
          </label>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors">
              Avbryt
            </button>
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold">{car ? "Uppdatera" : "Lägg till"}</button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
