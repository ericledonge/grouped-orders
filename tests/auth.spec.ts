import { expect, test } from "@playwright/test";

test("user can sign in", async ({ page }) => {
  await page.goto("/");

  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');

  // Vérifier la redirection après connexion
  await expect(page).toHaveURL("/");
  await expect(page.getByText("Bienvenue")).toBeVisible();
});
