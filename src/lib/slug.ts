/** "Volvo XC60 T8 2021" → "volvo-xc60-t8-2021". Same rules as the API (Domain/Slug.cs). */
export const SLUG_FALLBACK = "bil";

export function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/é/g, "e")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || SLUG_FALLBACK;
}
