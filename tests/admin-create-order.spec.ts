import { expect, test } from "@playwright/test";
import { cleanupTestUser, createTestAdmin } from "./helpers/test-admin";

test.describe("Admin - Créer une commande", () => {
  let adminEmail: string;
  let adminPassword: string;
  let adminUserId: string;

  test.beforeEach(async ({ page }) => {
    // Créer un admin de test
    const admin = await createTestAdmin();
    adminEmail = admin.email;
    adminPassword = admin.password;
    adminUserId = admin.userId;

    // Se connecter en tant qu'admin
    await page.goto("/");
    await page.getByRole("textbox", { name: "Email" }).fill(adminEmail);
    await page.getByLabel("Mot de passe").fill(adminPassword);
    await page
      .getByRole("button", { name: "Se connecter", exact: true })
      .click();

    // Attendre la redirection après login
    await page.waitForURL("**/");
  });

  test.afterEach(async () => {
    // Nettoyer l'utilisateur de test
    await cleanupTestUser(adminUserId);
  });

  test("devrait créer une commande avec succès @smoke", async ({ page }) => {
    console.log("🚀 Starting order creation test...");

    // Naviguer vers la page de création
    await page.goto("/admin/orders/new");

    console.log("📍 On page:", page.url());

    // Vérifier qu'on est sur la bonne page
    await expect(page.getByText("Créer une commande")).toBeVisible();

    // Remplir le formulaire
    console.log("📝 Filling form...");

    // Sélectionner le type de commande
    // Le Select de shadcn utilise role="combobox"
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "Mensuelle" }).click();

    // Choisir une date (cliquer sur le bouton date picker)
    // Utiliser getByLabel qui correspond au FormLabel "Date cible"
    await page.getByLabel("Date cible").click();

    // Sélectionner un jour dans le calendrier
    // Attendre que le calendrier soit visible
    await page.locator('[role="grid"]').waitFor({ state: "visible" });

    // Cliquer sur le premier jour disponible (non disabled et non outside)
    // Le calendrier utilise data-disabled et data-outside, pas aria-disabled
    await page
      .locator('[role="gridcell"]:not([data-disabled="true"]):not([data-outside="true"])')
      .first()
      .click();

    // Remplir la description
    await page
      .getByPlaceholder("Ajouter une description")
      .fill("Commande de test E2E");

    console.log("✅ Form filled, submitting...");

    // Soumettre le formulaire
    await page.getByRole("button", { name: "Créer la commande" }).click();

    console.log("⏳ Waiting for success...");

    // Attendre un peu pour le toast
    await page.waitForTimeout(2000);

    // Debug: capturer des infos sur la page
    console.log("📄 Current URL:", page.url());

    // Vérifier s'il y a des toasts Sonner visibles
    const toasts = await page.locator('[data-sonner-toast]').all();
    console.log("🍞 Number of toasts:", toasts.length);
    for (const toast of toasts) {
      const text = await toast.textContent();
      console.log("🍞 Toast content:", text);
    }

    // Attendre le toast de succès
    await expect(page.getByText("Commande créée avec succès")).toBeVisible();

    console.log("✅ Success toast visible");

    // Attendre la redirection vers la page de détail
    await page.waitForURL("**/admin/orders/*", { timeout: 5000 });

    console.log("📍 Redirected to:", page.url());

    // Vérifier que la page de détail affiche les bonnes données
    await expect(page.getByText("Commande Mensuelle")).toBeVisible();
    await expect(page.getByText("Commande de test E2E")).toBeVisible();
    await expect(page.getByText("open")).toBeVisible(); // Statut

    console.log("✅ Order created successfully!");
  });

  test("devrait afficher une erreur si la date est invalide", async ({
    page,
  }) => {
    await page.goto("/admin/orders/new");

    // Remplir uniquement le type (pas de date)
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Vente privée" }).click();

    // Soumettre sans date
    await page.getByRole("button", { name: "Créer la commande" }).click();

    // Vérifier que le message d'erreur de validation s'affiche
    await expect(page.getByText("La date cible est requise")).toBeVisible();
  });

  test("devrait afficher une erreur si le type n'est pas sélectionné", async ({
    page,
  }) => {
    await page.goto("/admin/orders/new");

    // Sélectionner uniquement une date (pas de type)
    await page.getByLabel("Date cible").click();
    await page.locator('[role="grid"]').waitFor({ state: "visible" });

    // Cliquer sur le premier jour disponible (non disabled et non outside)
    await page
      .locator('[role="gridcell"]:not([data-disabled="true"]):not([data-outside="true"])')
      .first()
      .click();

    // Soumettre sans type
    await page.getByRole("button", { name: "Créer la commande" }).click();

    // Vérifier que le message d'erreur de validation s'affiche
    await expect(
      page.getByText("Le type de commande est requis"),
    ).toBeVisible();
  });

  test("devrait permettre d'annuler la création", async ({ page }) => {
    await page.goto("/admin/orders/new");

    // Cliquer sur Annuler
    await page.getByRole("button", { name: "Annuler" }).click();

    // Vérifier qu'on est redirigé vers la page d'accueil
    await page.waitForURL("**/", { timeout: 5000 });
    await expect(page).toHaveURL(/\/$/);
  });
});
