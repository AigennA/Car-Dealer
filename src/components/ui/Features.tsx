import { CheckIcon } from "@/components/ui/icons";

/**
 * Reusable content blocks. Pages describe *what* to show as data
 * (title/text/icon arrays); these components decide *how* — one place to
 * change the look of every feature grid, check list and step list.
 */
type IconComponent = (props: { className?: string }) => React.ReactElement;
type HeadingLevel = "h2" | "h3";

export type Feature = { title: string; text: React.ReactNode; Icon?: IconComponent; bullets?: React.ReactNode[] };

const COLS = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" } as const;

/** Icon + title + text, either centred tiles or white cards (optionally with a bullet list). */
export function FeatureGrid({
  items,
  columns = 3,
  variant = "tile",
  headingLevel = "h3",
}: {
  items: Feature[];
  columns?: keyof typeof COLS;
  variant?: "tile" | "card";
  headingLevel?: HeadingLevel;
}) {
  const H = headingLevel;
  const card = variant === "card";
  return (
    <ul className={`grid gap-8 ${COLS[columns]}`}>
      {items.map(({ title, text, Icon, bullets }) => (
        <li key={title} className={card ? "bg-white rounded-xl p-8 shadow-sm" : "text-center"}>
          {Icon && (
            <div className={`${card ? "mb-6 w-16 h-16" : "mx-auto mb-4 w-14 h-14"} bg-primary/10 rounded-lg flex items-center justify-center`}>
              <Icon className={`${card ? "w-8 h-8" : "w-7 h-7"} text-primary`} />
            </div>
          )}
          <H className={`${card ? "text-2xl mb-4" : "text-lg mb-2"} font-bold text-navy`}>{title}</H>
          <p className="text-gray-700">{text}</p>
          {bullets && <CheckList className="mt-4 text-sm" items={bullets.map((b, i) => ({ key: String(i), text: b }))} />}
        </li>
      ))}
    </ul>
  );
}

export type CheckItem = { key?: string; title?: string; text: React.ReactNode };

/** Check-marked list; items with a title render as small headed blocks. */
export function CheckList({
  items,
  columns = 1,
  className = "",
  headingLevel = "h3",
}: {
  items: CheckItem[];
  columns?: 1 | 2;
  className?: string;
  headingLevel?: HeadingLevel;
}) {
  const H = headingLevel;
  return (
    <ul className={`grid gap-x-8 ${columns === 2 ? "md:grid-cols-2 gap-y-8" : "gap-y-2"} ${className}`}>
      {items.map((item) => (
        <li key={item.key ?? item.title} className={`flex items-start ${item.title ? "gap-4" : "gap-2"}`}>
          <CheckIcon className={`${item.title ? "w-6 h-6" : "w-5 h-5 mt-0.5"} shrink-0 text-primary`} />
          {item.title ? (
            <div>
              <H className="font-semibold text-lg text-navy mb-1">{item.title}</H>
              <p className="text-gray-700">{item.text}</p>
            </div>
          ) : (
            <span className="text-gray-700">{item.text}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Numbered process steps ("Så går det till"). */
export function StepList({ steps, headingLevel = "h3" }: { steps: { title: string; text: React.ReactNode }[]; headingLevel?: HeadingLevel }) {
  const H = headingLevel;
  return (
    <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.title} className="text-center">
          <span aria-hidden="true" className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            {i + 1}
          </span>
          <H className="font-semibold text-navy mb-2">{s.title}</H>
          <p className="text-sm text-gray-700">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** Frequently asked questions as a definition list (question = dt, answer = dd). */
export function Faq({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-6 md:grid-cols-2">
      {items.map(({ q, a }) => (
        <div key={q}>
          <dt className="font-semibold text-navy mb-2">{q}</dt>
          <dd className="text-gray-700 text-sm">{a}</dd>
        </div>
      ))}
    </dl>
  );
}
