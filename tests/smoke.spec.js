import { test, expect } from "@playwright/test";

test.describe("landing page", () => {
  test("loads without console errors", async ({ page }) => {
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/", { waitUntil: "load" });

    await expect(page).toHaveTitle(/Nobelova Gradani/i);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test("shows the four services and inquiry tabs", async ({ page }) => {
    await page.goto("/");

    const serviceCards = page.locator("#services article.group");
    await expect(serviceCards).toHaveCount(4);
    await expect(serviceCards.nth(2)).toContainText("School Health Screening");
    await expect(serviceCards.nth(3)).toContainText("Training & Certification");

    const tabs = page.locator(".inq-tab");
    await expect(tabs).toHaveCount(4);
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");

    await tabs.nth(2).click();
    await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#panel-screening")).toBeVisible();
    await expect(page.locator("#panel-child-development")).toBeHidden();
  });

  test("renders the full team roster from script data", async ({ page }) => {
    await page.goto("/");

    const cards = page.locator("#teamTrack .team-marquee-group").first().locator(".team-card");
    await expect(cards).toHaveCount(95);
    await expect(page.locator("#teamTrack")).toHaveClass(/is-looping/);
  });

  test("validates an inquiry form and builds the email draft", async ({ page }) => {
    await page.goto("/");

    const panel = page.locator("#panel-child-development");
    await panel.locator("input[name=name]").fill("Test Parent");
    await panel.locator("input[name=phone]").fill("08031234567");
    await panel.locator("button[type=submit]").click();

    const success = panel.locator(".form-success");
    await expect(success).toBeVisible();
    await expect(success.locator("[data-email]")).toHaveAttribute("href", /^mailto:/);
    await expect(success.locator("[data-wa]")).toHaveAttribute("href", /wa\.me\/2349037854234/);
  });

  test("footer year is current", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#year")).toHaveText(String(new Date().getFullYear()));
  });
});
