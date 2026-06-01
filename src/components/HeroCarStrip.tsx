import { cars } from "@/lib/cars";

/*
  Slowly auto-scrolling car thumbnail strip for the hero.
  Pure-CSS infinite marquee (.hero-strip in globals.css) — no JS, pauses on
  hover, and stops under prefers-reduced-motion. Decorative (aria-hidden):
  it sets the "gallery" mood; real browsing happens in the cards below.
*/
export default function HeroCarStrip() {
  // A curated subset, requesting small image variants for performance.
  const thumbs = cars.slice(0, 12).map((c) => ({
    id: c.id,
    src: c.images[0]
      .replace(/([?&]w=)\d+/, "$1280")
      .replace(/([?&]h=)\d+/, "$1168"),
  }));
  // Duplicate the set so the marquee loops seamlessly (track scrolls -50%).
  const loop = [...thumbs, ...thumbs];

  return (
    <div className="hero-strip" aria-hidden="true">
      <div className="hero-strip-track">
        {loop.map((t, i) => (
          <div key={`${t.id}-${i}`} className="hero-strip-item">
            {/* plain img: tiny decorative thumbnail, not worth next/image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.src} alt="" loading="lazy" decoding="async" />
          </div>
        ))}
      </div>
    </div>
  );
}
