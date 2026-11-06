import { test, expect } from "./fixtures";

test.describe("tangentbord & fokus", () => {
  test("första Tab ger en synlig 'hoppa till innehåll'-länk som fungerar", async ({ page, isMobile }) => {
    test.skip(isMobile, "tangentbordstest körs på desktop");
    await page.goto("/bilar/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Hoppa till huvudinnehållet" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });

  test("fokus är alltid synligt (outline) på länkar och knappar", async ({ page, isMobile }) => {
    test.skip(isMobile, "tangentbordstest körs på desktop");
    await page.goto("/");
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      const outline = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const s = getComputedStyle(el);
        return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), shadow: s.boxShadow };
      });
      expect(outline.style !== "none" && outline.width >= 2 || outline.shadow !== "none").toBe(true);
    }
  });

  test("mobilmenyn: aria-expanded, Escape stänger och fokus återgår", async ({ page, isMobile }) => {
    test.skip(!isMobile, "bara mobil");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Öppna meny" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    const menu = page.getByRole("navigation", { name: "Mobilmeny" });
    await expect(menu).toBeVisible();
    await expect(page.getByRole("button", { name: "Stäng meny" })).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: "Öppna meny" })).toBeFocused();
  });

  test("mobilmenyn stängs när man trycker utanför den", async ({ page, isMobile }) => {
    test.skip(!isMobile, "bara mobil");
    await page.goto("/kontakt/");
    await page.getByRole("button", { name: "Öppna meny" }).click();
    const menu = page.getByRole("navigation", { name: "Mobilmeny" });
    await expect(menu).toBeVisible();
    await page.getByRole("heading", { level: 1 }).click();
    await expect(menu).toBeHidden();
  });

  test("aktiv sida markeras med aria-current", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktopmeny");
    await page.goto("/bilar/");
    await expect(
      page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("link", { name: "Lager" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("bildspelet i hero kan pausas (WCAG 2.2.2)", async ({ page }) => {
    await page.goto("/");
    const pause = page.getByRole("button", { name: "Pausa bildspelet" });
    await pause.click();
    await expect(page.getByRole("button", { name: "Starta bildspelet" })).toHaveAttribute("aria-pressed", "true");
  });
});

test("fokuserad felsammanfattning hamnar inte under den klistrade headern (WCAG 2.4.11)", async ({ page, isMobile }) => {
  // Without web fonts the layout differs (fallback font) — this is how CI
  // first exposed the bug, and how real users on slow connections see it.
  await page.route(/\.woff2/, (r) => r.abort());
  for (const path of ["/kontakt/", "/inbyte/"]) {
    await page.goto(path);
    // On mobile, leave the menu open (as the CI failure did) and then use the form.
    if (isMobile) await page.getByRole("button", { name: "Öppna meny" }).click();
    const submit = page.getByRole("button", { name: /Skicka (meddelande|förfrågan)/ });
    await submit.click();
    const summary = page.getByRole("alert").filter({ hasText: "Formuläret innehåller" });
    await expect(summary).toBeFocused();
    const headerBottom = await page.locator("header").first().evaluate((h) => h.getBoundingClientRect().bottom);
    const firstLink = summary.getByRole("link").first();
    const linkTop = await firstLink.evaluate((l) => l.getBoundingClientRect().top);
    expect(linkTop, `${path}: error link must be below the header`).toBeGreaterThanOrEqual(headerBottom);
  }
});
