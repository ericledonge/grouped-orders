import { expect, test } from "@playwright/test";

/**
 * Tests E2E pour le flow d'authentification
 * Ces tests vérifient que l'auth Better Auth fonctionne correctement
 */

test.describe("Authentication Flow @smoke", () => {
  test("homepage redirects to sign-in when not authenticated", async ({
    page,
  }) => {
    // Aller à la page d'accueil
    await page.goto("/");

    // Attendre la navigation
    await page.waitForLoadState("networkidle");

    // Vérifier qu'on est redirigé vers sign-in
    expect(page.url()).toContain("/sign-in");
  });

  test("user can sign in with test credentials", async ({ page }) => {
    // Aller à la page de connexion
    await page.goto("/auth/sign-in");

    // Attendre que la page soit chargée
    await page.waitForLoadState("networkidle");

    // Better Auth UI utilise des inputs standards
    // Chercher les inputs par label ou placeholder
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

    // Attendre que les inputs soient visibles
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible();

    // Remplir le formulaire avec les credentials du seed
    await emailInput.fill("test@example.com");
    await passwordInput.fill("TestPassword123!");

    // Trouver et cliquer sur le bouton de submit
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign in"), button:has-text("Se connecter")',
    ).first();
    await submitButton.click();

    // Attendre la navigation après login
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    // Vérifier qu'on est bien connecté
    // Soit on voit le contenu authentifié, soit on n'est plus sur /sign-in
    const currentUrl = page.url();
    const isSignedIn =
      !currentUrl.includes("/sign-in") || (await page.locator("text=/Bienvenue|Welcome/i").isVisible().catch(() => false));

    expect(isSignedIn).toBeTruthy();
  });
});

test.describe("Full Authentication Flow", () => {
  test("complete sign-in flow and see authenticated content", async ({
    page,
  }) => {
    // Aller à la homepage (sera redirigé)
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Si déjà connecté (cookie existant), skip le test
    if (!page.url().includes("/sign-in")) {
      test.skip();
    }

    // Remplir le formulaire de login
    await page
      .locator('input[name="email"], input[type="email"]')
      .first()
      .fill("test@example.com");
    await page
      .locator('input[name="password"], input[type="password"]')
      .first()
      .fill("TestPassword123!");

    // Submit
    await page
      .locator(
        'button[type="submit"], button:has-text("Sign in"), button:has-text("Se connecter")',
      )
      .first()
      .click();

    // Attendre d'être redirigé vers la homepage
    await page.waitForURL("/", { timeout: 15000 });

    // Vérifier qu'on voit le contenu authentifié
    await expect(
      page.locator('text=/Bienvenue|Welcome|UserButton/i').first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
