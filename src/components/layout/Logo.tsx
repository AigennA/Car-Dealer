import { SITE } from "@/lib/site";

const CAR_PATH =
  "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z";

type Props = {
  /** "header": large 3-D chip with blinking lights and road stripes; "footer": small and flat. */
  variant: "header" | "footer";
};

/** The brand mark + name. Decorative for assistive tech: the surrounding link/landmark names it. */
export default function Logo({ variant }: Props) {
  const header = variant === "header";
  const chip = (
    <div className={`${header ? "w-10 h-10" : "w-8 h-8"} logo-icon rounded-lg flex items-center justify-center`}>
      <svg className={`${header ? "w-6 h-6" : "w-5 h-5"} text-white`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d={CAR_PATH} />
        {header && (
          <>
            <circle className="logo-headlight" cx="19.2" cy="14.3" r="2" fill="#ffd27a" />
            <circle className="logo-taillight" cx="4.8" cy="14.3" r="2" fill="#ff3b30" />
          </>
        )}
      </svg>
    </div>
  );

  return (
    <>
      {header ? <div className="logo-icon-wrap">{chip}</div> : chip}
      <span className={`${header ? "text-xl sm:text-2xl md:text-3xl" : "text-xl font-bold"} logo-text-main`} aria-hidden="true">
        {SITE.name}
      </span>
      {header && (
        <svg className="logo-road shrink-0 ml-0.5 hidden sm:block" width="14" height="44" viewBox="0 0 14 44" fill="none" aria-hidden="true" focusable="false">
          <line x1="4" y1="1" x2="4" y2="43" stroke="#ff6535" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" />
          <line x1="10" y1="1" x2="10" y2="43" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" />
        </svg>
      )}
    </>
  );
}
