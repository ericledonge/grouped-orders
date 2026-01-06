import { expect, test } from "@playwright/test";
import { cleanupTestUser, createTestAdmin } from "./helpers/test-admin";

test.describe("Admin - Liste des commandes", () => {
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
    await page.waitForURL("**/admin/dashboard");
  });

  // Nettoyer une seule fois après tous les tests
  test.afterAll(async () => {
    await cleanupTestUser(adminUserId);
  });

  test("devrait afficher la page de liste des commandes @smoke", async ({
    page,
  }) => {
    // Naviguer vers la page des commandes
    await page.goto("/admin/orders");

    // Vérifier le titre de la page
    await expect(
      page.getByRole("heading", { name: "Commandes" }),
    ).toBeVisible();

    // Vérifier la présence du bouton "Nouvelle commande"
    await expect(
      page.getByRole("link", { name: /nouvelle commande/i }),
    ).toBeVisible();
  });

  test("devrait naviguer vers la création de commande", async ({ page }) => {
    await page.goto("/admin/orders");

    // Cliquer sur le bouton "Nouvelle commande"
    await page.getByRole("link", { name: /nouvelle commande/i }).click();

    // Vérifier qu'on est sur la page de création
    await page.waitForURL("**/admin/orders/new");
    await expect(page.getByText("Créer une commande")).toBeVisible();
  });

  test("devrait afficher une commande créée dans la liste", async ({
    page,
  }) => {
    // D'abord créer une commande
    await page.goto("/admin/orders/new");

    // Sélectionner le type
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

    // Soumettre
    await page.getByRole("button", { name: "Créer la commande" }).click();

    // Attendre la redirection vers la page de détail
    await page.waitForURL("**/admin/orders/*");

    // Retourner à la liste
    await page.goto("/admin/orders");

    // Vérifier que la commande apparaît dans la liste (au moins une visible)
    await expect(page.getByText("Mensuelle").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Voir détails" }).first(),
    ).toBeVisible();
  });
});
