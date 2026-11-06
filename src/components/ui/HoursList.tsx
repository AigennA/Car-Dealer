import { hoursRows } from "@/config/business";

type Week = Parameters<typeof hoursRows>[0];

/** Opening hours as a definition list, grouped ("Måndag–fredag 09:00–18:00"). */
export default function HoursList({ week }: { week: Week }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-gray-800">
      {hoursRows(week).map((r) => (
        <div key={r.days} className="contents">
          <dt>{r.days}</dt>
          <dd className="tabular-nums">{r.hours ?? "Stängt"}</dd>
        </div>
      ))}
    </dl>
  );
}
