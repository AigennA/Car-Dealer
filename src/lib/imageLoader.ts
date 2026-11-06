/**
 * Custom next/image loader for the static export (GitHub Pages has no image
 * optimisation server). Unsplash is backed by imgix, so we let the CDN do the
 * work: every <Image> gets a responsive srcset, modern formats (AVIF/WebP via
 * `auto=format`) and a sensible quality — instead of one fixed 800px JPEG.
 */
type LoaderArgs = { src: string; width: number; quality?: number };

const UNSPLASH = "https://images.unsplash.com/";

export function unsplashUrl(src: string, width: number, quality = 70): string {
  const url = new URL(src);
  const w = Number(url.searchParams.get("w"));
  const h = Number(url.searchParams.get("h"));
  // Keep the original crop's aspect ratio while changing the width.
  if (w > 0 && h > 0) {
    url.searchParams.set("ar", `${w}:${h}`);
    url.searchParams.delete("h");
  }
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality));
  url.searchParams.set("auto", "format");
  if (!url.searchParams.has("fit")) url.searchParams.set("fit", "crop");
  return url.toString();
}

export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  if (src.startsWith(UNSPLASH)) return unsplashUrl(src, width, quality);
  return src;
}
