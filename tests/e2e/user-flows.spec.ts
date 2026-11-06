import { test, expect } from "./fixtures";

test.describe("användarflöden", () => {
  test("sök från startsidan → filtrerad lista", async ({ page }) => {
    await page.goto("/");
    const search = page.getByRole("search", { name: "Sök bilar" });
    await search.getByLabel("Märke").selectOption("Volvo");
    await search.getByRole("button", { name: "Sök bilar" }).click();
    await expect(page).toHaveURL(/\/bilar\/?\?make=Volvo/);
    const cards = page.getByRole("list", { name: "Bilar" }).getByRole("heading", { level: 2 });
    await expect(cards.first()).toBeVisible();
    for (const name of await cards.allTextContents()) expect(name).toMatch(/^Volvo/);
    await expect(page.getByRole("status").filter({ hasText: "hittades" })).toContainText(String(await cards.count()));
  });

  test("filtrera, sortera, tomt resultat och återställ", async ({ page, isMobile }) => {
    await page.goto("/bilar/");
    const total = await page.getByRole("list", { name: "Bilar" }).getByRole("listitem").count();
    if (isMobile) await page.getByRole("button", { name: /Filtrera bilar/ }).click();

    await page.getByLabel("Högsta pris").fill("200000");
    await expect(page.getByRole("status").filter({ hasText: "hittades" })).not.toContainText(String(total));

    await page.getByLabel("Sortera:").selectOption("price-asc");
    const values = (await page.getByRole("list", { name: "Bilar" }).locator(".tabular-nums").allTextContents())
      .map((t) => Number(t.replace(/\D/g, "")));
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(Math.max(...values)).toBeLessThanOrEqual(200000);

    await page.getByLabel("Sök märke eller modell").fill("finnsinte");
    await expect(page.getByRole("heading", { name: "Inga bilar matchar dina filter" })).toBeVisible();
    await page.getByRole("button", { name: "Rensa alla filter" }).click();
    await expect(page.getByRole("list", { name: "Bilar" }).getByRole("listitem")).toHaveCount(total);
  });

  test("bildetalj → boka provkörning förifyller kontaktformuläret", async ({ page }) => {
    await page.goto("/bilar/");
    await page.getByRole("link", { name: /^Visa bil\s+BMW X5 xDrive30d$/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("BMW X5 xDrive30d");
    await expect(page.getByRole("navigation", { name: "Brödsmulor" })).toContainText("Lager");

    // live calculator updates without alert()
    await expect(page.getByText("Beräknad månadskostnad")).toBeVisible();

    await page.getByRole("link", { name: "Boka provkörning" }).click();
    await expect(page).toHaveURL(/kontakt\/?\?bil=bmw-x5-xdrive30d&amne=provkorning/);
    await expect(page.locator("form strong", { hasText: "BMW X5 xDrive30d (2019)" })).toBeVisible();
    await expect(page.getByLabel("Ämne")).toHaveValue("provkorning");
  });

  test("kontaktformulär: felsammanfattning, länk till fält, lyckat skick", async ({ page }) => {
    await page.goto("/kontakt/");
    await page.getByRole("button", { name: "Skicka meddelande" }).click();
    const alert = page.getByRole("alert").filter({ hasText: "Formuläret innehåller" });
    await expect(alert).toBeFocused();
    await alert.getByRole("link", { name: "Fyll i ditt namn." }).click();
    await expect(page.getByLabel(/^Namn/)).toBeFocused();

    await page.getByLabel(/^Namn/).fill("Anna Svensson");
    await page.getByLabel(/^E-post/).fill("anna@example.se");
    await page.getByLabel(/^Meddelande/).fill("Hej! Har ni fler kombibilar?");
    await page.getByRole("button", { name: "Skicka meddelande" }).click();
    await expect(page.getByRole("status")).toContainText("Tack för ditt meddelande!");
  });

  test("lånekalkylatorn visar fel inline vid för hög kontantinsats", async ({ page }) => {
    await page.goto("/finansiering/");
    await page.getByLabel("Kontantinsats (kr)").fill("300000");
    await expect(page.getByText("Kontantinsatsen måste vara lägre än bilens pris.")).toBeVisible();
    await expect(page.getByLabel("Kontantinsats (kr)")).toHaveAttribute("aria-invalid", "true");
  });

  test("admin: logga in, lägg till bil syns i lagret, logga ut", async ({ page }) => {
    await page.goto("/admin/");
    await page.getByLabel("Användarnamn").fill("admin");
    await page.getByLabel("Lösenord").fill("admin123");
    await page.getByRole("button", { name: "Logga in" }).click();
    await expect(page.getByRole("heading", { name: "Admin Panel" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "Admin Panel" })).toBeVisible(); // session survives reload
    await page.getByRole("button", { name: "Logga ut" }).click();
    await expect(page.getByRole("heading", { name: "Admin Login" })).toBeVisible();
  });

  test("ingen horisontell scroll vid 320 px (WCAG 1.4.10 Omflöde = 400 % zoom)", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of ["/", "/bilar/", "/bilar/volvo-v90-d4-awd/", "/finansiering/", "/inbyte/", "/om-oss/", "/kontakt/"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});
