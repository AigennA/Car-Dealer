import Link from "next/link";
import Image from "next/image";
import { Car } from "@/lib/cars";

type Props = {
  car: Car;
  /** Heading level for the car name, so pages keep a logical outline (WCAG 1.3.1). */
  headingLevel?: "h2" | "h3";
  /** Preload the image — only for cards that are likely above the fold. */
  preload?: boolean;
};

/* ── Inline SVG icons (Heroicons outline style, 16×16 viewport, stroke-width 1.75) ── */

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function OdometerIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  );
}

function FuelIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M3 11h12" />
      <path d="M15 6h2a2 2 0 0 1 2 2v3.5a1.5 1.5 0 0 0 3 0V8l-3-3" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────── */

export default function CarCard({ car, headingLevel = "h3", preload = false }: Props) {
  const Heading = headingLevel;
  const href = `/bilar/${car.slug}`;
  const name = `${car.make} ${car.model}`;

  return (
    <article className="group w-full bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-xl transition-[box-shadow,border-color] duration-300 flex flex-col">

      {/* ── Image ── (duplicate link: hidden from AT and tab order to avoid
           three identical tab stops per card) */}
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="block relative aspect-[16/10] bg-gray-100 overflow-hidden cursor-pointer"
      >
        <Image
          src={car.images[0]}
          alt=""
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1280px) 45vw, 380px"
          className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105"
          preload={preload}
        />

        {/* Subtle gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* "Utvald" badge — SVG icon only, no emoji */}
        {car.featured && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-primary text-white text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-md">
            <StarIcon />
            <span>Utvald</span>
          </div>
        )}
      </Link>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* Make + model */}
        <Heading className="font-heading font-semibold text-lg leading-snug text-navy line-clamp-1">
          <Link
            href={href}
            className="cursor-pointer rounded-sm group-hover:text-primary transition-colors duration-200"
          >
            {name}
          </Link>
        </Heading>

        {/* Meta row */}
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-600 list-none m-0 p-0">
          <li className="inline-flex items-center gap-1.5">
            <CalendarIcon />
            <span><span className="sr-only">Årsmodell </span>{car.year}</span>
          </li>
          <li className="inline-flex items-center gap-1.5">
            <OdometerIcon />
            <span><span className="sr-only">Miltal </span>{car.mileage.toLocaleString("sv-SE")} mil</span>
          </li>
          <li className="inline-flex items-center gap-1.5">
            <FuelIcon />
            <span><span className="sr-only">Bränsle </span>{car.fuel}</span>
          </li>
        </ul>

        {/* Divider */}
        <div className="border-t border-gray-100 mt-auto" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-widest">Pris</span>
            <span className="font-heading font-bold text-2xl leading-none text-navy tabular-nums">
              {car.price.toLocaleString("sv-SE")}
              <span className="text-base font-medium text-gray-600 ml-1">kr</span>
            </span>
          </div>

          <Link
            href={href}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <span>Visa bil{" "}<span className="sr-only">{name}</span></span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none">
              <ArrowRightIcon />
            </span>
          </Link>
        </div>

      </div>
    </article>
  );
}
