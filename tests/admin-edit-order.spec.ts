import { expect, test } from "@playwright/test";
import { cleanupTestUser, createTestAdmin } from "./helpers/test-admin";

test.describe("Admin - Éditer une commande", () => {
  let adminEmail: string;
  let adminPassword: string;
  let adminUserId: string;

  test.beforeAll(async () => {
    const admin = await createTestAdmin();
    adminEmail = admin.email;
    adminPassword = admin.password;
    adminUserId = admin.userId;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("textbox", { name: "Email" }).fill(adminEmail);
    await page.getByLabel("Mot de passe").fill(adminPassword);
    await page
      .getByRole("button", { name: "Se connecter", exact: true })
      .click();
    await page.waitForURL("**/admin/dashboard");
  });

  test.afterAll(async () => {
    await cleanupTestUser(adminUserId);
  });

  test("devrait pouvoir modifier une commande existante", async ({ page }) => {
    // Créer une commande
    await page.goto("/admin/orders/new");

    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Mensuelle" }).click();

    await page.getByLabel("Date cible").click();
    await page.locator('[role="grid"]').waitFor({ state: "visible" });
    await page
      .locator(
        '[role="gridcell"]:not([data-disabled="true"]):not([data-outside="true"])',
      )
      .first()
      .click();

    await page.getByLabel("Description").fill("Description initiale");
    await page.getByRole("button", { name: "Créer la commande" }).click();

    // Attendre la redirection vers la page de détail
    await page.waitForURL("**/admin/orders/*");

    // Cliquer sur le bouton Éditer
    await page.getByRole("link", { name: /Éditer/i }).click();

    // Vérifier qu'on est sur la page d'édition
    await page.waitForURL("**/admin/orders/*/edit");
    await expect(
      page.getByText("Modifier la commande", { exact: true }),
    ).toBeVisible();

    // Modifier la description
    await page.getByLabel("Description").fill("Description modifiée");

    // Enregistrer
    await page.getByRole("button", { name: "Enregistrer" }).click();

    // Vérifier qu'on est redirigé vers la page de détail
    await page.waitForURL(/\/admin\/orders\/[^/]+$/);

    // Vérifier que la modification a été appliquée
    await expect(page.getByText("Description modifiée")).toBeVisible();
  });

  test("devrait pouvoir changer le type de commande", async ({ page }) => {
    // Créer une commande
    await page.goto("/admin/orders/new");

    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Mensuelle" }).click();

    await page.getByLabel("Date cible").click();
    await page.locator('[role="grid"]').waitFor({ state: "visible" });
    await page
      .locator(
        '[role="gridcell"]:not([data-disabled="true"]):not([data-outside="true"])',
      )
      .first()
      .click();

    await page.getByRole("button", { name: "Créer la commande" }).click();
    await page.waitForURL("**/admin/orders/*");

    // Aller sur la page d'édition
    await page.getByRole("link", { name: /Éditer/i }).click();
    await page.waitForURL("**/admin/orders/*/edit");

    // Changer le type
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Spéciale" }).click();

    // Enregistrer
    await page.getByRole("button", { name: "Enregistrer" }).click();
    await page.waitForURL(/\/admin\/orders\/[^/]+$/);

    // Vérifier que le type a changé (badge Spéciale visible)
    await expect(page.getByText("Spéciale", { exact: true })).toBeVisible();
  });

  test("devrait pouvoir annuler l'édition", async ({ page }) => {
    // Créer une commande
    await page.goto("/admin/orders/new");

    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Vente privée" }).click();

    await page.getByLabel("Date cible").click();
    await page.locator('[role="grid"]').waitFor({ state: "visible" });
    await page
      .locator(
        '[role="gridcell"]:not([data-disabled="true"]):not([data-outside="true"])',
      )
      .first()
      .click();

    await page.getByRole("button", { name: "Créer la commande" }).click();
    await page.waitForURL("**/admin/orders/*");

    // Aller sur la page d'édition
    await page.getByRole("link", { name: /Éditer/i }).click();
    await page.waitForURL("**/admin/orders/*/edit");

    // Cliquer sur Annuler
    await page.getByRole("button", { name: "Annuler" }).click();

    // Vérifier qu'on est retourné sur la page de détail
    await page.waitForURL(/\/admin\/orders\/[^/]+$/);
  });
});
