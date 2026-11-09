"use client";

import { useSyncExternalStore } from "react";
import { BUILD_DATE } from "./buildDate";
import { todayIso } from "./dates";

const noSubscribe = () => () => {};

/**
 * Today's date. The static HTML (and the first client render) uses the build date, so they
 * match; right after hydration React re-renders with the visitor's real date.
 */
export function useToday(): string {
  return useSyncExternalStore(noSubscribe, () => todayIso(), () => BUILD_DATE);
}
