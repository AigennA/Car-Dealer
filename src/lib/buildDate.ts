import { todayIso } from "./dates.ts";

/** The day the static site was built (set in next.config.ts); today when running outside a build. */
export const BUILD_DATE: string = process.env.NEXT_PUBLIC_BUILD_DATE ?? todayIso();
