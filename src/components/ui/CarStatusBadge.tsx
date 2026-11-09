import { STATUS_LABEL, statusOf } from "@/lib/carStatus";
import type { Car } from "@/lib/cars";

/**
 * "SÅLD" / "RESERVERAD" label for a car; nothing for a free car. It is real text (not only
 * colour), so it works in high-contrast mode and, where the label sits inside an aria-hidden
 * image link, callers also add the state to the car's accessible name (see StatusSrText).
 * Navy = gone, coral = on hold — the same two roles the rest of the site uses.
 */
export default function CarStatusBadge({ car, className = "" }: { car: Car; className?: string }) {
  const status = statusOf(car);
  if (status === "Available") return null;
  const tone = status === "Sold" ? "bg-navy" : "bg-accent-dark";
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md ${tone} ${className}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/**
 * Screen-reader text appended to a car's name in headings and links: " – såld", " – reserverad",
 * or nothing. The space sits outside the hidden span so the accessible name reads "Volvo V90 – såld".
 */
export function StatusSrText({ car }: { car: Car }) {
  const status = statusOf(car);
  if (status === "Available") return null;
  return (
    <>
      {" "}
      <span className="sr-only">– {STATUS_LABEL[status].toLowerCase()}</span>
    </>
  );
}
