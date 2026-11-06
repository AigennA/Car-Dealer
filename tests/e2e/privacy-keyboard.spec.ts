import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

test.describe("karta, samtycke & policysidor", () => {
  test("Google Maps laddas inte utan samtycke; samtycke sparas och kan återkallas", async ({ page }) => {
    const mapRequests: string[] = [];
    page.on("request", (r) => r.url().includes("google.com/maps") && mapRequests.push(r.url()));

    await page.goto("/kontakt/");
    await expect(page.locator("iframe")).toHaveCount(0);
    expect(mapRequests).toEqual([]); // nothing sent to Google before consent
    await expect(page.getByRole("link", { name: /Vägbeskrivning/ })).toHaveAttribute("target", "_blank");

    await page.getByRole("button", { name: "Visa karta (Google Maps)" }).click();
    await expect(page.locator("iframe")).toHaveAttribute("title", /Karta/);

    await page.reload(); // remembered
    await expect(page.locator("iframe")).toHaveCount(1);

    await page.goto("/cookies/");
    const sw = page.getByRole("switch", { name: "Visa Google Maps-karta" });
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await sw.press("Space"); // keyboard-operable
    await expect(sw).toHaveAttribute("aria-checked", "false");
    await expect(page.getByRole("status").filter({ hasText: "återkallat" })).toBeVisible();

    await page.goto("/kontakt/");
    await expect(page.locator("iframe")).toHaveCount(0);
  });

  test("sidfoten länkar till kontakt och alla policysidor", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Kontakta oss" })).toHaveAttribute("href", /\/kontakt\/?$/);
    const info = footer.getByRole("navigation", { name: "Information" });
    for (const name of ["Allmänna villkor", "Integritetspolicy", "Cookies och lagring", "Tillgänglighetsredogörelse"]) {
      await expect(info.getByRole("link", { name })).toBeVisible();
    }
  });

  test("policysidor har innehållsförteckning med fungerande ankarlänkar", async ({ page }) => {
    await page.goto("/integritet/");
    const toc = page.getByRole("navigation", { name: "Innehåll" });
    await toc.getByRole("link", { name: "Dina rättigheter" }).click();
    await expect(page).toHaveURL(/#rattigheter$/);
    await expect(page.getByRole("heading", { level: 2, name: /Dina rättigheter/ })).toBeInViewport();
    await expect(page.getByRole("table", { name: "Behandlingar av personuppgifter" })).toBeVisible();
  });

  test("tillgänglighetsredogörelsen anger kontaktväg och tillsyn", async ({ page }) => {
    await page.goto("/tillganglighet/");
    await expect(page.getByRole("heading", { name: /Kända brister/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "pts.se" })).toBeVisible();
  });
});

test.describe("tangentbord & skärmläsare – formulär och dialoger", () => {
  test("inbytesformulär: felsammanfattning tar fokus, fält grupperade", async ({ page }) => {
    await page.goto("/inbyte/");
    await expect(page.getByRole("group", { name: "Din bil" })).toBeVisible();
    await page.getByRole("button", { name: "Skicka förfrågan" }).click();
    const alert = page.getByRole("alert").filter({ hasText: "Formuläret innehåller" });
    await expect(alert).toBeFocused();
    await alert.getByRole("link", { name: /märke/ }).click();
    await expect(page.getByLabel(/^Märke/)).toBeFocused();
    await expect(page.getByLabel(/^Märke/)).toHaveAttribute("aria-invalid", "true");
  });

  test("admin: dialog öppnas, fokus fångas, Escape stänger och fokus återgår", async ({ page, isMobile }) => {
    test.skip(isMobile, "admin är desktop");
    await page.goto("/admin/");
    await page.getByLabel("Användarnamn").fill("admin");
    await page.getByLabel("Lösenord").fill("admin123");
    await page.keyboard.press("Enter");

    const add = page.getByRole("button", { name: "+ Lägg till bil" }).first();
    await add.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Lägg till ny bil" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel(/Märke/)).toBeFocused();

    // Tab many times — focus must stay inside the modal
    for (let i = 0; i < 25; i++) await page.keyboard.press("Tab");
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(add).toBeFocused();

    // table actions are named per car
    await expect(page.getByRole("button", { name: "Redigera Volvo V90 D4 AWD" })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  test("efter navigering hamnar fokus i huvudinnehållet", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktopmeny");
    await page.goto("/");
    await page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("link", { name: "Lager" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Våra bilar");
    await expect(page.locator("main")).toBeFocused();
  });
});
