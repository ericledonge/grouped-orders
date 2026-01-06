import { expect, test } from "@playwright/test";
import { db } from "@/lib/db";
import { order } from "@/lib/db/schema";
import {
  cleanupTestUser,
  createTestAdmin,
  createTestMember,
} from "./helpers/test-admin";

test.describe("Membre - Mes souhaits", () => {
  let memberEmail: string;
  let memberPassword: string;
  let memberUserId: string;
  let adminUserId: string;
  let testOrderId: string;

  test.beforeAll(async () => {
    // Créer un admin pour créer une commande
    const admin = await createTestAdmin();
    adminUserId = admin.userId;

    // Créer une commande de test
    const [newOrder] = await db
      .insert(order)
      .values({
        type: "monthly",
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
        description: "Commande de test pour souhaits",
        createdBy: adminUserId,
        status: "open",
      })
      .returning({ id: order.id });
    testOrderId = newOrder.id;

    // Créer un membre pour les tests
    const member = await createTestMember();
    memberEmail = member.email;
    memberPassword = member.password;
    memberUserId = member.userId;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("textbox", { name: "Email" }).fill(memberEmail);
    await page.getByLabel("Mot de passe").fill(memberPassword);
    await page
      .getByRole("button", { name: "Se connecter", exact: true })
      .click();
    // Les membres sont redirigés vers /orders
    await page.waitForURL("**/orders");
  });

  test.afterAll(async () => {
    // Nettoyer dans l'ordre (souhaits supprimés via cascade avec l'utilisateur)
    await cleanupTestUser(memberUserId);
    await cleanupTestUser(adminUserId);
  });

  test("devrait voir le lien Mes souhaits dans la navigation", async ({
    page,
  }) => {
    // Vérifier que le lien "Mes souhaits" est visible dans la navigation
    await expect(
      page.getByRole("link", { name: "Mes souhaits" }),
    ).toBeVisible();
  });

  test("devrait afficher la page Mes souhaits vide", async ({ page }) => {
    await page.goto("/my-wishes");

    await expect(
      page.getByRole("heading", { name: "Mes souhaits" }),
    ).toBeVisible();

    // Vérifier le message quand il n'y a pas de souhaits
    await expect(
      page.getByText("Vous n'avez pas encore émis de souhaits"),
    ).toBeVisible();
  });

  test("devrait pouvoir créer et voir un souhait", async ({ page }) => {
    // Aller sur la page de création de souhait
    await page.goto(`/orders/${testOrderId}/wishes/new`);

    // Remplir le formulaire
    await page.getByLabel("Nom du jeu").fill("Wingspan");
    await page.getByLabel("Référence Philibert").fill("PH123456");
    await page
      .getByLabel("URL Philibert")
      .fill("https://www.philibert.com/wingspan");

    // Soumettre
    await page.getByRole("button", { name: /Ajouter le souhait/i }).click();

    // L'action redirige vers /orders
    await page.waitForURL("**/orders");

    // Aller sur "Mes souhaits" via la navigation
    await page.getByRole("link", { name: "Mes souhaits" }).click();
    await page.waitForURL("**/my-wishes");

    // Vérifier que le souhait est affiché
    await expect(page.getByText("Wingspan")).toBeVisible();
    await expect(page.getByText("PH123456")).toBeVisible();
  });

  test("devrait pouvoir supprimer un souhait en statut submitted", async ({
    page,
  }) => {
    // Créer un souhait
    await page.goto(`/orders/${testOrderId}/wishes/new`);
    await page.getByLabel("Nom du jeu").fill("Azul");
    await page.getByLabel("Référence Philibert").fill("PH789012");
    await page.getByRole("button", { name: /Ajouter le souhait/i }).click();
    // L'action redirige vers /orders et non vers /orders/${testOrderId}
    await page.waitForURL("**/orders");

    // Aller sur "Mes souhaits"
    await page.goto("/my-wishes");

    // Vérifier que le souhait est affiché
    await expect(page.getByText("Azul")).toBeVisible();

    // Cliquer sur le bouton de suppression dans la ligne du souhait "Azul"
    await page.getByRole("row", { name: /Azul/ }).getByRole("button").click();

    // Confirmer la suppression dans le dialog
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Supprimer" })
      .click();

    // Attendre que le dialog se ferme et vérifier que le souhait n'est plus dans la table
    await expect(page.getByRole("row", { name: /Azul/ })).not.toBeVisible();
  });
});
