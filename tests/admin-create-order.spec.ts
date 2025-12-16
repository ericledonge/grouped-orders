import { expect, test } from "@playwright/test";
import { cleanupTestUser, createTestAdmin } from "./helpers/test-admin";

test.describe("Admin - Créer une commande", () => {
  let adminEmail: string;
  let adminPassword: string;
  let adminUserId: string;

  // Créer un seul admin pour tous les tests de cette suite
  test.beforeAll(async () => {
    const admin = await createTestAdmin();
    adminEmail = admin.email;
    adminPassword = admin.password;
    adminUserId = admin.userId;
  });

  // Se connecter avant chaque test
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("textbox", { name: "Email" }).fill(adminEmail);
    await page.getByLabel("Mot de passe").fill(adminPassword);
    await page
      .getByRole("button", { name: "Se connecter", exact: true })
      .click();

    // Attendre la redirection après login
    await page.waitForURL("**/");
  });

  // Nettoyer une seule fois après tous les tests
  test.afterAll(async () => {
    await cleanupTestUser(adminUserId);
  });

  test("devrait créer une commande avec succès @smoke", async ({ page }) => {
    // Naviguer vers la page de création
    await page.goto("/admin/orders/new");

    // Vérifier qu'on est sur la bonne page
    await expect(page.getByText("Créer une commande")).toBeVisible();

    // Sélectionner le type de commande
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Mensuelle" }).click();

    // Choisir une date
    await page.getByLabel("Date cible").click();
    await page.locator('[role="grid"]').waitFor({ state: "visible" });
    await page
      .locator(
        '[role="gridcell"]:not([data-disabled="true"]):not([data-outside="true"])',
      )
      .first()
      .click();

    // Remplir la description
    await page
      .getByPlaceholder("Ajouter une description")
      .fill("Commande de test E2E");

    // Soumettre le formulaire
    await page.getByRole("button", { name: "Créer la commande" }).click();

    // Attendre le toast de succès
    await expect(page.getByText("Commande créée avec succès")).toBeVisible();

    // Attendre la redirection vers la page de détail
    await page.waitForURL("**/admin/orders/*", { timeout: 5000 });

    // Vérifier que la page de détail affiche les bonnes données
    await expect(page.getByText("Commande Mensuelle")).toBeVisible();
    await expect(page.getByText("Commande de test E2E")).toBeVisible();
  });
});
