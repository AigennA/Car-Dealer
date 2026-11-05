/**
 * WCAG 2.x contrast helpers (relative luminance, contrast ratio, alpha blending).
 * Used by the token test (tests/unit/contrast.test.ts) and the pixel-based
 * contrast test (tests/e2e/contrast.spec.ts).
 */
export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as RGB;
}

/** Parses "rgb(1, 2, 3)", "rgba(1, 2, 3, 0.5)", "rgb(1 2 3 / 50%)" or "#abc". */
export function parseColor(css: string): RGBA | null {
  const s = css.trim();
  if (s.startsWith("#")) return [...hexToRgb(s), 1];
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean);
  const [r, g, b] = parts.slice(0, 3).map(Number);
  let a = 1;
  if (parts[3] !== undefined) a = parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : Number(parts[3]);
  return [r, g, b, a];
}

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance([r, g, b]: RGB): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Composites a (possibly translucent) foreground over an opaque background. */
export function blend([r, g, b, a]: RGBA, [br, bg, bb]: RGB): RGB {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a)] as RGB;
}

/** WCAG "large text": ≥ 24 px, or ≥ 18.66 px (14 pt) and bold. */
export function isLargeText(fontSizePx: number, fontWeight: number): boolean {
  return fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700);
}

/** Required ratio for SC 1.4.3 (AA). */
export function requiredRatio(fontSizePx: number, fontWeight: number): number {
  return isLargeText(fontSizePx, fontWeight) ? 3 : 4.5;
}
