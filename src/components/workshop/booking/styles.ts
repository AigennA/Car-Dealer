/** Shared Tailwind classes for the booking steps (one place to restyle). */
export const STEP = "rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";
export const LEGEND = "font-heading text-lg font-semibold text-navy float-left w-full";
export const OPTION =
  "flex cursor-pointer items-start gap-3 rounded-xl border-2 border-gray-300 p-4 transition-colors hover:border-primary/60 " +
  "has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary " +
  "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60";
export const RADIO = "mt-1 h-5 w-5 shrink-0 accent-[var(--color-primary)]";
export const FIELD_ERROR = "mt-2 text-sm text-red-700";
export const SECONDARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-lg border-2 border-primary bg-white px-5 py-2 font-semibold " +
  "text-primary hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
export const DANGER_BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-lg border-2 border-red-700 bg-white px-5 py-2 font-semibold " +
  "text-red-800 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2";
