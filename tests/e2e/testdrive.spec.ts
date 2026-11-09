import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

// Monday 9 Nov 2026 07:00 Stockholm — the same moment as the API and the unit tests.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-09T06:00:00Z"));
});

const pickTime = (page: import("@playwright/test").Page, time: string) =>
  page.locator("label").filter({ hasText: new RegExp(`^${time}$`) }).click();

const section = (page: import("@playwright/test").Page) => page.getByRole("region", { name: "Boka provkörning" });

test.describe("boka provkörning", () => {
  test("på bilsidan: välj dag och tid, boka, hantera i Min bokning – en bil kan bara köras av en kund åt gången", async ({ page }) => {
    await page.goto("/bilar/volvo-v90-d4-awd/");
    await page.getByRole("link", { name: "Boka provkörning" }).click();
    const form = section(page).locator("form");
    await expect(form).toBeVisible();

    const days = form.getByRole("group", { name: /1\. Välj dag/ });
    await expect(days.getByRole("radio", { name: /sön/i })).toHaveCount(0);           // closed on Sunday
    await expect(days.getByRole("radio", { name: /lör/i }).first()).toBeVisible();     // open on Saturday
    await days.getByRole("radio", { name: /10 nov/i }).check();

    const times = form.getByRole("group", { name: /2\. Välj tid/ });
    await expect(times.getByRole("status")).toContainText("18 lediga tider tisdag 10 november");
    await expect(times.getByRole("radio", { name: "09:00" })).toHaveCount(1);
    await expect(times.getByRole("radio", { name: "17:30" })).toHaveCount(1);
    await expect(times.getByRole("radio", { name: "18:00" })).toHaveCount(0);          // must end by 18:00
    await pickTime(page, "10:00");

    // No registration number for a test drive
    await expect(form.getByLabel(/^Registreringsnummer/)).toHaveCount(0);
    await expect(form).toContainText("Du bokar provkörning av Volvo V90 D4 AWD tisdag 10 november kl. 10:00");

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);

    // Phone is required: the error summary gets the focus
    await form.getByLabel(/^Namn/).fill("Anna Svensson");
    await form.getByLabel(/^E-post/).fill("anna@example.se");
    await form.getByRole("button", { name: "Boka provkörning" }).click();
    const summary = page.getByRole("alert").filter({ hasText: "Formuläret innehåller" });
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("Fyll i ditt telefonnummer");

    await form.getByLabel(/^Telefon/).fill("070-123 45 67");
    await form.getByRole("button", { name: "Boka provkörning" }).click();
    const confirmation = page.getByRole("status").filter({ hasText: "Demobokning sparad" });
    await expect(confirmation).toBeFocused();
    await expect(confirmation).toContainText("Provkörning – Volvo V90 D4 AWD");
    await expect(confirmation).toContainText("tisdag 10 november kl. 10:00");
    await expect(confirmation.getByRole("img", { name: /QR-kod till din bokning/ })).toBeVisible();

    // Min bokning shows the car and moves the visit to a Saturday (showroom 10-15)
    await confirmation.getByRole("link", { name: "Hantera bokningen" }).click();
    await expect(page.getByRole("heading", { name: "Provkörning" })).toBeFocused();
    const card = page.getByRole("article");
    await expect(card.getByRole("link", { name: "Volvo V90 D4 AWD" })).toBeVisible();
    await card.getByRole("button", { name: "Ändra tid" }).click();
    await page.getByRole("radio", { name: /14 nov/i }).check();
    await expect(page.getByRole("radio", { name: "15:00" })).toHaveCount(0);
    await pickTime(page, "10:30");
    await page.getByRole("button", { name: "Spara ny tid" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Din nya tid" })).toBeFocused();
    await expect(page.getByRole("article")).toContainText("lördag 14 november kl. 10:30");

    // The same car is now taken Saturday 10:30; another car is not
    await page.goto("/bilar/volvo-v90-d4-awd/");
    await page.getByRole("link", { name: "Boka provkörning" }).click();
    await section(page).getByRole("radio", { name: /14 nov/i }).check();
    await expect(section(page).getByRole("radio", { name: "10:00" })).toHaveCount(1);
    await expect(section(page).getByRole("radio", { name: "10:30" })).toHaveCount(0);
    await page.goto("/bilar/bmw-x5-xdrive30d/");
    await page.getByRole("link", { name: "Boka provkörning" }).click();
    await section(page).getByRole("radio", { name: /14 nov/i }).check();
    await expect(section(page).getByRole("radio", { name: "10:30" })).toHaveCount(1);
  });

  test("tangentbord: länken i prisrutan hoppar till bokningen och formuläret går att nå med Tab", async ({ page, isMobile }) => {
    test.skip(isMobile, "tangentbordstest körs på desktop");
    await page.goto("/bilar/volvo-v90-d4-awd/");
    await page.getByRole("link", { name: "Boka provkörning" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#provkorning$/);
    // The focus moves to the section's heading, so one Tab reaches the form
    await expect(page.getByRole("heading", { level: 2, name: "Boka provkörning" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(section(page).getByRole("radio").first()).toBeFocused();
  });
});
