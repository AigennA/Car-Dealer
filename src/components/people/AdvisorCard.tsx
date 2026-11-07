import Link from "next/link";
import PersonPhoto from "./PersonPhoto";
import { ADVISOR, SITE } from "@/lib/site";
import { PhoneIcon, MailIcon, ClockIcon } from "@/components/ui/icons";

type Props = {
  /** "section": full-width block (home page); "compact": sidebar card (car page, contact). */
  variant?: "section" | "compact";
  /** Pre-select the contact form subject / car when booking. */
  contactHref?: string;
  headingLevel?: "h2" | "h3";
};

/**
 * Customer-service block with a named advisor: a real person to contact
 * builds trust (heuristic: help & documentation, match with the real world).
 */
export default function AdvisorCard({ variant = "section", contactHref = "/kontakt?amne=kopa", headingLevel = "h2" }: Props) {
  const Heading = headingLevel;

  if (variant === "compact") {
    return (
      <section aria-labelledby="advisor-compact" className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4">
          <PersonPhoto src={ADVISOR.photo} name={ADVISOR.name} size={72} />
          <div>
            <Heading id="advisor-compact" className="text-sm font-semibold uppercase tracking-wider text-gray-700">
              Din rådgivare
            </Heading>
            <p className="text-lg font-bold text-navy leading-tight">{ADVISOR.name}</p>
            <p className="text-sm text-gray-700">{ADVISOR.role}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-700">
          Har du frågor om bilen, finansiering eller inbyte? Jag hjälper dig gärna.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <PhoneIcon className="w-4 h-4 text-primary" />
            <a href={SITE.phoneHref} className="text-primary font-medium underline underline-offset-4">
              {SITE.phone}
            </a>
          </li>
          <li className="flex items-center gap-2">
            <MailIcon className="w-4 h-4 text-primary" />
            <a href={`mailto:${SITE.email}`} className="text-primary font-medium underline underline-offset-4">
              {SITE.email}
            </a>
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <ClockIcon className="w-4 h-4 text-primary" />
            {SITE.openingHours}
          </li>
        </ul>
      </section>
    );
  }

  return (
    <section aria-labelledby="advisor-heading" className="bg-white py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-brand text-white p-8 md:p-12 shadow-xl">
          <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-center">
            <div className="flex flex-col items-center text-center">
              <PersonPhoto src={ADVISOR.photo} name={ADVISOR.name} size={176} className="ring-white/80" />
              <p className="mt-4 text-xl font-bold">{ADVISOR.name}</p>
              <p className="text-sm text-white">{ADVISOR.role}</p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white">Kundservice</p>
              <Heading id="advisor-heading" className="mt-2 text-3xl md:text-4xl font-bold text-white">
                Personlig hjälp hela vägen
              </Heading>
              <p className="mt-4 text-lg text-white max-w-xl">
                Osäker på vilken bil som passar, hur finansieringen fungerar eller vad din gamla bil är värd?
                Prata med en riktig människa – vi tar oss tid för dig.
              </p>

              <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
                <li className="flex items-center gap-2">
                  <PhoneIcon className="w-5 h-5" />
                  <a href={SITE.phoneHref} className="font-semibold underline underline-offset-4">
                    {SITE.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MailIcon className="w-5 h-5" />
                  <a href={`mailto:${SITE.email}`} className="font-semibold underline underline-offset-4">
                    {SITE.email}
                  </a>
                </li>
                <li className="flex items-center gap-2 sm:col-span-2">
                  <ClockIcon className="w-5 h-5" />
                  <span>{SITE.openingHours} · svar inom 24 timmar på mejl</span>
                </li>
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={contactHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-primary-dark hover:bg-gray-100 transition-colors"
                >
                  Boka rådgivning
                </Link>
                <a
                  href={SITE.phoneHref}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/80 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <PhoneIcon className="w-5 h-5" />
                  Ring {ADVISOR.name.split(" ")[0]}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
