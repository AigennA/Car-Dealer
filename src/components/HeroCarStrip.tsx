"use client";

import { useState } from "react";
import { cars } from "@/lib/cars";
import { unsplashUrl } from "@/lib/imageLoader";

/*
  Slowly auto-scrolling car thumbnail strip for the hero.
  Pure-CSS infinite marquee (.hero-strip in globals.css). The thumbnails are
  decorative (aria-hidden); real browsing happens in the cards below.
  WCAG 2.2.2 (Pause, Stop, Hide): moving content that lasts > 5 s needs a
  control, so a pause/play button is provided. Stops under reduced motion.
*/
const THUMBS = cars.slice(0, 12).map((c) => ({
  id: c.id,
  src: c.images[0].startsWith("https://images.unsplash.com/")
    ? unsplashUrl(c.images[0].replace(/([?&]h=)\d+/, "$1300").replace(/([?&]w=)\d+/, "$1500"), 280, 55)
    : c.images[0],
}));
// Duplicate the set so the marquee loops seamlessly (track scrolls -50%).
const LOOP = [...THUMBS, ...THUMBS];

export default function HeroCarStrip() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="relative">
      <div className={`hero-strip${paused ? " is-paused" : ""}`} aria-hidden="true">
        <div className="hero-strip-track">
          {LOOP.map((t, i) => (
            <div key={`${t.id}-${i}`} className="hero-strip-item">
              {/* plain img: tiny decorative thumbnail, already CDN-resized */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.src} alt="" width={140} height={84} loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        className="hero-strip-toggle"
      >
        <span className="sr-only">{paused ? "Starta bildspelet" : "Pausa bildspelet"}</span>
        {paused ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          </svg>
        )}
      </button>
    </div>
  );
}
