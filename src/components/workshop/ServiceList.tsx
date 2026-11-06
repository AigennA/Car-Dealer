import { type ServiceCategory, catalog, formatDuration, servicesIn } from "@/lib/workshop";
import HoursList from "@/components/ui/HoursList";

/** Price list for one category, from the shared catalogue (data/workshop.json). */
export default function ServiceList({ category, headingLevel = "h3" }: { category: ServiceCategory; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {servicesIn(category).map((s) => (
        <li key={s.code} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
          <H className="font-heading text-lg font-semibold text-navy">{s.name}</H>
          <p className="mt-2 flex-1 text-gray-700">{s.description}</p>
          <p className="mt-4 flex items-baseline justify-between border-t border-gray-100 pt-3 text-sm">
            <span className="text-gray-700">Ca {formatDuration(s.minutes)}</span>
            <span className="font-heading text-lg font-bold text-navy tabular-nums">
              från {s.priceFrom.toLocaleString("sv-SE")} kr
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}

export function OpeningHours() {
  return (
    <HoursList week={catalog.openingHours} />
  );
}
