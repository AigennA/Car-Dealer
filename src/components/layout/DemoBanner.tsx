import { BUSINESS } from "@/config/business";

/**
 * Tells visitors the site is a demo, so nobody mistakes it for a real dealer.
 * One slim line in the brand azure; controlled by `demoSite` in data/business.json.
 */
export default function DemoBanner() {
  if (!BUSINESS.demoSite) return null;
  return (
    // <aside> = its own landmark, so screen-reader users can find (or skip) it.
    <aside aria-label="Om webbplatsen" className="bg-primary-dark px-4 py-1.5 text-center text-xs text-white sm:text-sm">
      <strong className="font-semibold">Demowebbplats</strong>
      <span className="sm:hidden"> – inte på riktigt</span>
      <span className="hidden sm:inline"> – {BUSINESS.name} är ett exempelprojekt. Bilar, priser och bokningar är inte på riktigt.</span>
    </aside>
  );
}
