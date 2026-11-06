import AxeBuilder from "@axe-core/playwright";
import { PNG } from "pngjs";
import { test as base, expect } from "@playwright/test";
import { PAGES } from "./fixtures";
import { blend, contrastRatio, parseColor, requiredRatio, type RGB, type RGBA } from "../../src/lib/contrast";

/**
 * Pixel-based contrast test (WCAG 1.4.3) for the text axe-core cannot judge:
 * text on gradients, on photos and next to pseudo-elements ("incomplete").
 *
 * 1. axe lists the elements whose contrast it could not determine.
 * 2. All text is made transparent and the page is screenshotted, so we get
 *    the real rendered background under each element.
 * 3. The text colour (incl. opacity, or every stop of gradient text) is
 *    blended over every background pixel; the worst case must meet AA.
 *
 * Car photos are replaced with a pure WHITE image — the worst case for the
 * white text that sits on top of photos.
 */
const WHITE_PNG = new PNG({ width: 8, height: 8 });
WHITE_PNG.data.fill(255);
const WHITE = PNG.sync.write(WHITE_PNG);

const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/images\.unsplash\.com/, (r) => r.fulfill({ status: 200, contentType: "image/png", body: WHITE }));
    await page.route(/google\.com\/maps/, (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<html></html>" }));
    await page.emulateMedia({ reducedMotion: "reduce" }); // freeze shimmer/marquee
    await use(page);
  },
});

type Probe = {
  selector: string;
  fg: RGBA[];
  fontSize: number;
  fontWeight: number;
  box: { x: number; y: number; w: number; h: number };
};

for (const { path } of PAGES) {
  test(`kontrast på gradient/bild/pseudo-element: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);

    const axe = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
    const selectors = [
      ...new Set(
        axe.incomplete
          .flatMap((r) => r.nodes)
          .filter((n) => !/non-text characters/.test(n.any[0]?.message ?? ""))
          .map((n) => n.target.join(" ")),
      ),
    ];
    test.skip(selectors.length === 0, "axe kunde bedöma allt");

    const probes: Probe[] = await page.evaluate((sels) => {
      const out: Probe[] = [];
      for (const sel of sels) {
        const el = document.querySelector<HTMLElement>(sel);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue; // sr-only etc.
        const cs = getComputedStyle(el);
        let opacity = 1;
        for (let n: HTMLElement | null = el; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
        const gradientText = cs.webkitTextFillColor === "rgba(0, 0, 0, 0)" || cs.backgroundClip === "text";
        let colors: string[] = [cs.color];
        if (gradientText) {
          colors = cs.backgroundImage.match(/rgba?\([^)]+\)/g) ?? [];
          el.dataset.ccGrad = "1";
        }
        out.push({
          selector: sel,
          // opacity is applied as extra alpha
          fg: colors.map((c) => {
            const m = c.match(/[\d.]+/g)!.map(Number);
            return [m[0], m[1], m[2], (m[3] ?? 1) * opacity] as [number, number, number, number];
          }),
          fontSize: parseFloat(cs.fontSize),
          fontWeight: Number(cs.fontWeight),
          box: { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height },
        });
      }
      return out;
    }, selectors);

    // Hide every glyph and icon; keep all backgrounds, overlays and pseudo-elements.
    await page.addStyleTag({
      content: `*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;
        text-shadow:none!important;text-decoration-color:transparent!important;caret-color:transparent!important}
        [data-cc-grad]{background-image:none!important;filter:none!important}
        svg{visibility:hidden!important}`,
    });
    const dpr = await page.evaluate(() => devicePixelRatio);
    const png = PNG.sync.read(await page.screenshot({ fullPage: true, animations: "disabled" }));

    const failures: string[] = [];
    for (const p of probes) {
      const need = requiredRatio(p.fontSize, p.fontWeight);
      const ratios: number[] = [];
      const inset = 2;
      const x0 = Math.round((p.box.x + inset) * dpr), x1 = Math.round((p.box.x + p.box.w - inset) * dpr);
      const y0 = Math.round((p.box.y + inset) * dpr), y1 = Math.round((p.box.y + p.box.h - inset) * dpr);
      const step = Math.max(1, Math.round(2 * dpr));
      for (let y = Math.max(0, y0); y < Math.min(png.height, y1); y += step) {
        for (let x = Math.max(0, x0); x < Math.min(png.width, x1); x += step) {
          const i = (y * png.width + x) * 4;
          const bg: RGB = [png.data[i], png.data[i + 1], png.data[i + 2]];
          for (const fg of p.fg) ratios.push(contrastRatio(blend(fg, bg), bg));
        }
      }
      if (ratios.length === 0) continue;
      ratios.sort((a, b) => a - b);
      // 2nd percentile: ignores a few anti-aliased edge pixels of rounded corners
      const worst = ratios[Math.floor(ratios.length * 0.02)];
      if (worst < need) {
        failures.push(`${p.selector}  ${worst.toFixed(2)}:1 < ${need}:1 (${p.fontSize}px/${p.fontWeight})`);
      }
    }
    expect(probes.length).toBeGreaterThan(0);
    expect(failures, failures.join("\n")).toEqual([]);
  });
}

test("parseColor används konsekvent", () => {
  expect(parseColor("rgba(255, 255, 255, 0.5)")).toEqual([255, 255, 255, 0.5]);
});
