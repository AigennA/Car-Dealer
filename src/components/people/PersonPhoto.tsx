"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  name: string;
  size: number; // rendered CSS px (square)
  className?: string;
  preload?: boolean;
};

/**
 * Round portrait. The photo is decorative next to the visible name (alt=""),
 * so screen readers don't hear the name twice. Falls back to initials if the
 * image cannot be loaded (offline, CDN down, blocked).
 */
export default function PersonPhoto({ src, name, size, className = "", preload = false }: Props) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-primary-dark ring-4 ring-white shadow-md ${className}`}
      style={{ width: size, height: size }}
    >
      {failed ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-heading font-bold text-white"
          style={{ fontSize: size * 0.36 }}
        >
          {initials}
        </span>
      ) : (
        <Image
          src={src}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
          preload={preload}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
