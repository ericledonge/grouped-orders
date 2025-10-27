import { expect, test } from "@playwright/test";

test("user can sign up", async ({ page }) => {
  await page.goto("/auth/sign-up");

  // Attendre que le formulaire soit chargé
  await page.waitForLoadState("networkidle");

  // Utiliser un email aléatoire pour éviter les conflits
  const randomEmail = `test-${Date.now()}@example.com`;

  // Remplir le formulaire de signup
  await page.fill('input[type="email"]', randomEmail);
  await page.fill('input[type="password"]', "TestPassword123!");

  // Cliquer sur submit
  await page.click('button[type="submit"]');

  // Attendre la navigation ou un message de succès
  await page.waitForLoadState("networkidle");

  // Vérifier qu'on est redirigé ou qu'on voit le contenu authentifié
  // Better Auth peut rediriger vers "/" après signup
  const isSuccess =
    page.url() === new URL("/", page.url()).href ||
    (await page.getByText(/Bienvenue|Welcome/i).isVisible().catch(() => false)) ||
    !page.url().includes("/sign-up");

  expect(isSuccess).toBeTruthy();
});

test("user can sign in @smoke", async ({ page }) => {
  await page.goto("/");

  // Attendre que le formulaire soit chargé (sera redirigé vers sign-in)
  await page.waitForLoadState("networkidle");

  // Remplir le formulaire avec l'utilisateur du seed
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[type="password"]', "TestPassword123!");

  // Cliquer sur submit
  await page.click('button[type="submit"]');

  // Attendre la navigation
  await page.waitForLoadState("networkidle");

  // Vérifier qu'on voit le contenu authentifié
  await expect(page.getByText(/Bienvenue sur l'application/i)).toBeVisible({ timeout: 10000 });
});
