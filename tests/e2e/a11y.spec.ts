import AxeBuilder from "@axe-core/playwright";
import { test, expect, PAGES } from "./fixtures";

/**
 * Automated WCAG 2.2 A/AA audit with axe-core on every page, desktop + mobile.
 * Automated checks catch roughly a third of WCAG issues — see
 * docs/wcag-granskning.md for the manual checklist that complements this.
 */
for (const { path } of PAGES) {
  test(`axe: inga WCAG 2.2 AA-fel på ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .exclude("iframe") // third-party map
      .analyze();
    const summary = results.violations.map(
      (v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).slice(0, 5).join("\n  ")}`,
    );
    expect(summary, summary.join("\n")).toEqual([]);
  });
}

test("axe: öppen mobilmeny och felmeddelanden i formulär", async ({ page, isMobile }) => {
  await page.goto("/kontakt/");
  if (isMobile) await page.getByRole("button", { name: "Öppna meny" }).click();
  await page.getByRole("button", { name: "Skicka meddelande" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Formuläret innehåller" })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).exclude("iframe").analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
