import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio, hexToRgb, blend, parseColor } from "@/lib/contrast";

/** Reads the real design tokens from globals.css so the test can't drift from the theme. */
const css = readFileSync("src/app/globals.css", "utf8");
const token = (name: string): string => {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,6})`));
  if (!m) throw new Error(`token --color-${name} saknas i globals.css`);
  return m[1];
};
const ratio = (fg: string, bg: string) => contrastRatio(hexToRgb(fg), hexToRgb(bg));

const WHITE = "#ffffff";
const BLACK = "#000000";

describe("contrast helpers", () => {
  it("matches known WCAG values", () => {
    expect(ratio(BLACK, WHITE)).toBeCloseTo(21, 5);
    expect(ratio(WHITE, WHITE)).toBeCloseTo(1, 5);
    expect(ratio("#767676", WHITE)).toBeGreaterThanOrEqual(4.5); // classic AA grey
    expect(ratio("#777777", WHITE)).toBeLessThan(4.5);
  });

  it("parses css colours and blends alpha", () => {
    expect(parseColor("rgb(255 0 0 / 50%)")).toEqual([255, 0, 0, 0.5]);
    expect(blend([0, 0, 0, 0.5], [255, 255, 255])).toEqual([127.5, 127.5, 127.5]);
  });
});

/**
 * Every colour pair the UI actually uses for text or meaningful UI.
 * min = 4.5 for normal text, 3 for large text / UI components (WCAG 1.4.3, 1.4.11).
 */
const PAIRS: { use: string; fg: string; bg: string; min: number }[] = [
  { use: "länktext / pris på vitt", fg: token("primary"), bg: WHITE, min: 4.5 },
  { use: "länktext på ljusgrå sida (surface)", fg: token("primary"), bg: token("surface"), min: 4.5 },
  { use: "vit text på primärknapp", fg: WHITE, bg: token("primary"), min: 4.5 },
  { use: "vit text på primärknapp (hover)", fg: WHITE, bg: token("primary-dark"), min: 4.5 },
  { use: "vit text på korallknapp (hero-CTA)", fg: WHITE, bg: token("accent-dark"), min: 4.5 },
  { use: "vit text på korallknapp (hover)", fg: WHITE, bg: token("accent-darker"), min: 4.5 },
  { use: "korall text på vitt (kalkylator)", fg: token("accent-dark"), bg: WHITE, min: 4.5 },
  { use: "rubriker (navy) på surface", fg: token("navy"), bg: token("surface"), min: 4.5 },
  { use: "aktiv menypunkt (korall) på svart header", fg: token("accent"), bg: BLACK, min: 4.5 },
  { use: "fokusring (primär) mot vitt – UI-komponent", fg: token("primary"), bg: WHITE, min: 3 },
  { use: "fokusring (korall) mot svart header", fg: token("accent"), bg: BLACK, min: 3 },
];

describe("design tokens uppfyller WCAG AA", () => {
  it.each(PAIRS)("$use ≥ $min:1", ({ fg, bg, min }) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(min);
  });

  it("den ljusa varumärkesblå är bara dekor (klarar inte text på vitt)", () => {
    // Guard against someone "fixing" the palette back to the old #0099cc for text.
    expect(ratio(token("primary-bright"), WHITE)).toBeLessThan(4.5);
    expect(token("primary")).not.toBe(token("primary-bright"));
  });
});
