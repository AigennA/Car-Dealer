import { test, expect, PAGES } from "./fixtures";

test.describe("sidstruktur & SEO", () => {
  for (const { path, h1 } of PAGES) {
    test(`${path}: språk, titel, beskrivning, exakt en h1, landmärken`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", "sv");
      await expect(page).toHaveTitle(/Car Dealer/);
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description?.length ?? 0).toBeGreaterThan(30);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);
    });
  }

  test("sidtitlar är unika", async ({ page }) => {
    const titles = new Set<string>();
    for (const { path } of PAGES) {
      await page.goto(path);
      titles.add(await page.title());
    }
    expect(titles.size).toBe(PAGES.length);
  });

  test("bilsidor har strukturerad data (schema.org/Car)", async ({ page }) => {
    await page.goto("/bilar/volvo-v90-d4-awd/");
    const json = await page.locator('script[type="application/ld+json"]').allTextContents();
    const car = json.map((j) => JSON.parse(j)).find((d) => d["@type"] === "Car");
    expect(car).toMatchObject({ name: "Volvo V90 D4 AWD", offers: { priceCurrency: "SEK" } });
  });

  test("sitemap och robots finns", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain("/bilar/volvo-v90-d4-awd/");
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Disallow: /admin/");
  });

  test("okänd sida visar en hjälpsam 404", async ({ page }) => {
    await page.goto("/finns-inte/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sidan hittades inte");
    await expect(page.getByRole("link", { name: "Se alla bilar" })).toBeVisible();
  });

  test("statisk HTML innehåller bilarna (fungerar utan JavaScript)", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/bilar/");
    await expect(page.getByRole("heading", { level: 2, name: "Volvo V90 D4 AWD" })).toBeVisible();
    await ctx.close();
  });
});
