import { expect, test } from "@playwright/test";
import { cleanupTestUser, createTestAdmin } from "./helpers/test-admin";

test.describe("Admin - Détails d'une commande", () => {
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

  test("devrait afficher les détails d'une commande avec la section souhaits", async ({
    page,
  }) => {
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

    // Attendre la redirection vers la page de détail
    await page.waitForURL("**/admin/orders/*");

    // Vérifier les éléments de la page de détail
    await expect(
      page.getByRole("heading", { name: /Commande Mensuelle/i }),
    ).toBeVisible();

    // Vérifier les badges (utiliser exact: true pour cibler le badge)
    await expect(page.getByText("Mensuelle", { exact: true })).toBeVisible();
    await expect(page.getByText("Ouverte", { exact: true })).toBeVisible();

    // Vérifier les statistiques
    await expect(page.getByText("Total souhaits")).toBeVisible();
    await expect(page.getByText("Soumis")).toBeVisible();
    await expect(page.getByText("Validés")).toBeVisible();
    await expect(page.getByText("Récupérés")).toBeVisible();

    // Vérifier la section souhaits (sans compteur car vide)
    await expect(
      page.getByText("Aucun souhait pour cette commande"),
    ).toBeVisible();

    // Vérifier le bouton retour
    await expect(
      page.getByRole("link", { name: /Retour aux commandes/i }),
    ).toBeVisible();

    // Vérifier le bouton éditer
    await expect(page.getByRole("link", { name: /Éditer/i })).toBeVisible();
  });

  test("devrait afficher le message 'Aucun souhait' quand la commande est vide", async ({
    page,
  }) => {
    // Créer une commande
    await page.goto("/admin/orders/new");

    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Spéciale" }).click();

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

    // Vérifier le message d'absence de souhaits
    await expect(
      page.getByText("Aucun souhait pour cette commande"),
    ).toBeVisible();
  });

  test("devrait pouvoir naviguer vers la liste des commandes", async ({
    page,
  }) => {
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

    // Cliquer sur le bouton retour
    await page.getByRole("link", { name: /Retour aux commandes/i }).click();

    // Vérifier qu'on est sur la liste
    await page.waitForURL("**/admin/orders");
    await expect(
      page.getByRole("heading", { name: "Commandes" }),
    ).toBeVisible();
  });
});
