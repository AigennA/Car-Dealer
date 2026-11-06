/** Shared Tailwind classes for the booking steps (one place to restyle). */
export const STEP = "rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";
export const LEGEND = "font-heading text-lg font-semibold text-navy float-left w-full";
export const OPTION =
  "flex cursor-pointer items-start gap-3 rounded-xl border-2 border-gray-300 p-4 transition-colors hover:border-primary/60 " +
  "has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary " +
  "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60";
export const RADIO = "mt-1 h-5 w-5 shrink-0 accent-[var(--color-primary)]";
export const FIELD_ERROR = "mt-2 text-sm text-red-700";
