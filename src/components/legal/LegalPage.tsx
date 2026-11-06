import Link from "next/link";
import { ROUTES } from "@/config/navigation";

export type LegalSection = { id: string; title: string; content: React.ReactNode };

type Props = {
  title: string;
  intro: React.ReactNode;
  updated: string; // ISO date
  sections: LegalSection[];
};

/**
 * Shared layout for policy pages: a table of contents (a named nav landmark,
 * so screen-reader users can jump straight to it) and numbered h2 sections
 * with stable ids that can be linked to.
 */
export default function LegalPage({ title, intro, updated, sections }: Props) {
  const date = new Date(updated).toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" });
  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-20">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">{title}</h1>
          <p className="text-sm text-gray-700">
            Senast uppdaterad: <time dateTime={updated}>{date}</time>
          </p>
          <div className="mt-6 text-lg text-gray-800 space-y-3">{intro}</div>
        </header>

        <nav aria-labelledby="toc-heading" className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 id="toc-heading" className="text-lg font-semibold text-navy mb-3">Innehåll</h2>
          <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1 list-decimal pl-5 text-gray-800">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="inline-block py-1 text-primary underline-offset-4 hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="bg-white rounded-xl p-6 md:p-10 shadow-sm space-y-10 legal-prose">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} tabIndex={-1} className="focus:outline-none">
              <h2 id={`${s.id}-h`} className="text-2xl font-bold text-navy mb-4">
                {i + 1}. {s.title}
              </h2>
              <div className="space-y-4 text-gray-800 leading-relaxed">{s.content}</div>
            </section>
          ))}
        </div>

        <p className="mt-8 text-center">
          <Link href={ROUTES.home} className="text-primary underline underline-offset-4">
            Tillbaka till startsidan
          </Link>
        </p>
      </div>
    </section>
  );
}

/** Small helpers so policy text stays readable in JSX. */
export function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-6 space-y-1.5 marker:text-primary">{children}</ul>;
}

export function Table({ caption, head, rows }: { caption: string; head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto" role="region" aria-label={caption} tabIndex={0}>
      <table className="w-full text-sm border-collapse min-w-[560px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-surface">
            {head.map((h) => (
              <th key={h} scope="col" className="text-left font-semibold text-navy p-3 border-b border-gray-300">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="align-top">
              {r.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="text-left font-medium text-navy p-3 border-b border-gray-200">
                    {c}
                  </th>
                ) : (
                  <td key={j} className="p-3 border-b border-gray-200">
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
