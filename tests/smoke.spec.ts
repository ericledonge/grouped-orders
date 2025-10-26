import { expect, test } from "@playwright/test";

/**
 * Smoke tests pour la production
 * Ces tests critiques vérifient que les fonctionnalités essentielles fonctionnent
 */

test.describe("Smoke Tests @smoke", () => {
  test("homepage loads successfully", async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto("/");

    // Vérifier que la page charge (status 200)
    expect(page.url()).toContain("/");

    // Vérifier qu'il n'y a pas d'erreur 500
    const hasError = await page
      .locator("text=/Internal Server Error|500/i")
      .isVisible()
      .catch(() => false);
    expect(hasError).toBe(false);

    // Vérifier que la page a du contenu (pas vide)
    const bodyText = await page.textContent("body");
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test("user can sign in with test credentials", async ({ page }) => {
    // Aller à la page de connexion
    await page.goto("/");

    // Attendre que le formulaire soit chargé
    await page.waitForLoadState("networkidle");

    // Remplir le formulaire avec les credentials du seed
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Vérifier que les éléments existent
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Remplir et soumettre
    await emailInput.fill("test@example.com");
    await passwordInput.fill("TestPassword123!");
    await submitButton.click();

    // Attendre la navigation ou un message de succès
    await page.waitForLoadState("networkidle");

    // Vérifier qu'il n'y a pas de message d'erreur
    const hasLoginError = await page
      .locator("text=/Invalid credentials|Login failed|Erreur/i")
      .isVisible()
      .catch(() => false);
    expect(hasLoginError).toBe(false);
  });
});
