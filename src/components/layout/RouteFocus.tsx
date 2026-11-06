"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * After client-side navigation, move focus to <main> so keyboard and
 * screen-reader users start at the new page's content instead of being left
 * on the link they clicked (or on <body>). Next.js' route announcer reads the
 * new page title. Skipped on first load and for in-page #anchors.
 */
export default function RouteFocus() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.location.hash) return;
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
