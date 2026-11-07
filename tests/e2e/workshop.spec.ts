import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

// Monday 9 Nov 2026 07:00 Stockholm — same moment as the API and unit tests.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-09T06:00:00Z"));
});

const pickTime = (page: import("@playwright/test").Page, time: string) =>
  page.locator("label").filter({ hasText: new RegExp(`^${time}$`) }).click();

test.describe("verkstad & besiktning – bokning", () => {
  test("boka verkstadstid steg för steg (demoläge)", async ({ page }) => {
    await page.goto("/verkstad/");
    const form = page.locator("form").filter({ hasText: "1. Välj tjänst" });

    await form.getByRole("radio", { name: /Service stor/ }).check();
    const days = form.getByRole("group", { name: /2\. Välj dag/ });
    // Weekends are not offered
    await expect(days.getByRole("radio", { name: /lör|sön/i })).toHaveCount(0);
    await days.getByRole("radio", { name: /10 nov/i }).check();

    const times = form.getByRole("group", { name: /3\. Välj tid/ });
    await expect(times.getByRole("status")).toContainText("15 lediga tider tisdag 10 november");
    // a 2 h job must finish by 17:00 → last start 15:00
    await expect(times.getByRole("radio", { name: "15:00" })).toHaveCount(1);
    await expect(times.getByRole("radio", { name: "15:30" })).toHaveCount(0);
    await pickTime(page, "10:00");

    await form.getByLabel(/^Namn/).fill("Anna Svensson");
    await form.getByLabel(/^Telefon/).fill("070-123 45 67");
    await form.getByLabel(/^E-post/).fill("anna@example.se");
    await form.getByLabel(/^Registreringsnummer/).fill("abc 12d");
    await expect(form).toContainText("Du bokar Service stor tisdag 10 november kl. 10:00");
    await form.getByRole("button", { name: "Boka tid" }).click();

    const confirmation = page.getByRole("status").filter({ hasText: "Demobokning sparad" });
    await expect(confirmation).toBeFocused();
    await expect(confirmation).toContainText("tisdag 10 november kl. 10:00");
    await expect(confirmation).toContainText("Demoläge"); // honest: nothing was booked without the API
    await expect(confirmation).toContainText(/DEMO-[A-Z2-9]{6}/);
    await expect(confirmation.getByRole("img", { name: /QR-kod till din bokning/ })).toBeVisible();
  });

  test("Min bokning: öppna via länken, flytta och avboka", async ({ page }) => {
    await page.goto("/verkstad/");
    const form = page.locator("form").filter({ hasText: "1. Välj tjänst" });
    await form.getByRole("radio", { name: /Service liten/ }).check();
    await form.getByRole("group", { name: /2\. Välj dag/ }).getByRole("radio", { name: /17 nov/i }).check();
    await pickTime(page, "10:00");
    await form.getByLabel(/^Namn/).fill("Anna Svensson");
    await form.getByLabel(/^Telefon/).fill("070-123 45 67");
    await form.getByLabel(/^E-post/).fill("anna@example.se");
    await form.getByLabel(/^Registreringsnummer/).fill("abc 12d");
    await form.getByRole("button", { name: "Boka tid" }).click();

    const confirmation = page.getByRole("status").filter({ hasText: "Demobokning sparad" });
    const reference = (await confirmation.textContent())!.match(/DEMO-[A-Z2-9]{6}/)![0];
    const calendar = confirmation.getByRole("link", { name: "Lägg till i kalendern" });
    await expect(calendar).toHaveAttribute("download", `bokning-${reference}.ics`);

    await confirmation.getByRole("link", { name: "Hantera bokningen" }).click();
    await expect(page).toHaveURL(new RegExp(`/min-bokning/\\?ref=${reference}#t=`));
    const heading = page.getByRole("heading", { name: "Service liten" });
    await expect(heading).toBeFocused();
    await expect(page.getByRole("article")).toContainText("tisdag 17 november kl. 10:00");

    await page.getByRole("button", { name: "Ändra tid" }).click();
    await page.getByRole("radio", { name: /18 nov/i }).check();
    await pickTime(page, "14:00");
    await page.getByRole("button", { name: "Spara ny tid" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Din nya tid" })).toBeFocused();
    await expect(page.getByRole("article")).toContainText("onsdag 18 november kl. 14:00");

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);

    await page.getByRole("button", { name: "Avboka" }).click();
    await page.getByRole("button", { name: "Ja, avboka" }).click();
    await expect(page.getByRole("status").filter({ hasText: "avbokad" })).toBeFocused();
    await expect(page.getByRole("article")).toContainText("Avbokad");

    // Lost the link? Booking number + registration number finds it again.
    await page.goto("/min-bokning/");
    await page.getByLabel(/^Bokningsnummer/).fill(reference);
    await page.getByLabel(/^E-post eller registreringsnummer/).fill("ABC 12D");
    await page.getByRole("button", { name: "Visa bokningen" }).click();
    await expect(page.getByRole("article")).toContainText("Avbokad");
  });

  test("felsammanfattning för saknad tid och ogiltigt registreringsnummer", async ({ page }) => {
    await page.goto("/verkstad/");
    const form = page.locator("form").filter({ hasText: "1. Välj tjänst" });
    await form.getByRole("radio", { name: /Däckbyte/ }).check();
    await form.getByRole("group", { name: /2\. Välj dag/ }).getByRole("radio", { name: /10 nov/i }).check();
    await pickTime(page, "08:00");
    await form.getByLabel(/^Registreringsnummer/).fill("1234");
    await form.getByRole("button", { name: "Boka tid" }).click();

    const summary = page.getByRole("alert").filter({ hasText: "Formuläret innehåller" });
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("Registreringsnumret ska ha formatet ABC 123 eller ABC 12D.");
    await expect(form.getByLabel(/^Registreringsnummer/)).toHaveAttribute("aria-invalid", "true");
  });

  test("tangentbord: piltangenter väljer tjänst, Tab går vidare", async ({ page, isMobile }) => {
    test.skip(isMobile, "tangentbordstest körs på desktop");
    await page.goto("/verkstad/");
    const first = page.getByRole("radio", { name: /Service liten/ });
    await first.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("radio", { name: /Service stor/ })).toBeChecked();
    await expect(page.getByRole("group", { name: /2\. Välj dag/ })).toBeVisible();
  });

  test("besiktning erbjuder bara besiktningstjänster", async ({ page }) => {
    await page.goto("/besiktning/");
    const services = page.getByRole("group", { name: /1\. Välj tjänst/ }).getByRole("radio");
    await expect(services).toHaveCount(2);
    await expect(page.getByRole("radio", { name: /Kontrollbesiktning via partner/ })).toBeVisible();
    await expect(page.getByRole("radio", { name: /Däckbyte/ })).toHaveCount(0);
  });

  test("axe: bokningen utan fel när alla steg är öppna", async ({ page }) => {
    await page.goto("/verkstad/");
    await page.getByRole("radio", { name: /Bromsar/ }).check();
    await page.getByRole("group", { name: /2\. Välj dag/ }).getByRole("radio", { name: /10 nov/i }).check();
    await pickTime(page, "09:00");
    await page.getByRole("button", { name: "Boka tid" }).click();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
  });

  test("Verkstad och Besiktning finns i menyn, Min bokning i sidhuvudet", async ({ page, isMobile }) => {
    await page.goto("/");
    // Min bokning is always visible in the header, also without opening the menu.
    const myBooking = page.getByRole("banner").getByRole("link", { name: "Min bokning" });
    await expect(myBooking).toBeVisible();
    await expect(myBooking).toHaveAttribute("href", /\/min-bokning\/?$/);

    if (isMobile) await page.getByRole("button", { name: "Öppna meny" }).click();
    const nav = page.getByRole("navigation", { name: isMobile ? "Mobilmeny" : "Huvudmeny" });
    await expect(nav.getByRole("link", { name: "Verkstad" })).toHaveAttribute("href", /\/verkstad\/?$/);
    await expect(nav.getByRole("link", { name: "Besiktning" })).toHaveAttribute("href", /\/besiktning\/?$/);
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Besiktning" })).toBeVisible();

    await myBooking.click();
    await expect(page.getByRole("heading", { level: 1, name: "Min bokning" })).toBeVisible();
  });

  test("demo-banderollen talar om att webbplatsen är ett exempel", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("complementary", { name: "Om webbplatsen" })).toBeVisible();
  });
});
