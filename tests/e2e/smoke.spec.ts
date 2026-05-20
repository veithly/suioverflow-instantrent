import { test, expect } from "@playwright/test";

test("InstantRent: landing page renders the hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "InstantRent" })).toBeVisible();
});

test("InstantRent: app page renders the demo console", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveTitle(/InstantRent/);
});
