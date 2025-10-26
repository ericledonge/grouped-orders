import { expect, test } from "@playwright/test";

test("user can sign up", async ({ page }) => {
  await page.goto("/auth/sign-up");

  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');

  await expect(page.getByText("Inscription")).toBeVisible();
});

test("user can sign in", async ({ page }) => {
  await page.goto("/");

  await page.fill('input[type="name"]', "Test Example");
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');

  await expect(page.getByText("Bienvenue")).toBeVisible();
});
