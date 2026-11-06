import { BUSINESS } from "@/config/business";

/**
 * Tells visitors the site is a demo, so nobody mistakes it for a real dealer.
 * Controlled by `demoSite` in data/business.json. Static text, no link, so the
 * skip link stays the first thing keyboard users reach.
 */
export default function DemoBanner() {
  if (!BUSINESS.demoSite) return null;
  return (
    // <aside> = its own landmark, so screen-reader users can find (or skip) it.
    <aside aria-label="Om webbplatsen" className="bg-amber-300 px-4 py-1.5 text-center text-sm text-gray-950">
      <strong>Demowebbplats:</strong> {BUSINESS.name} är ett exempelprojekt. Bilar, priser och bokningar är inte på riktigt.
    </aside>
  );
}
