import { expect, test } from "@playwright/test";
import { cleanupTestUser, createTestAdmin } from "./helpers/test-admin";

test.describe("Authentication", () => {
  let testEmail: string;
  let testPassword: string;
  let testUserId: string;

  // Créer un seul utilisateur pour tous les tests d'authentification
  test.beforeAll(async () => {
    const admin = await createTestAdmin();
    testEmail = admin.email;
    testPassword = admin.password;
    testUserId = admin.userId;
  });

  // Nettoyer une fois après tous les tests
  test.afterAll(async () => {
    await cleanupTestUser(testUserId);
  });

  test("user can sign up", async ({ page }) => {
    const timestamp = Date.now();
    const email = `test-signup-${timestamp}@example.com`;
    const password = "TestPassword123!";
    let userId: string | undefined;

    try {
      await page.goto("/auth/sign-up");

      await page.getByRole("textbox", { name: "Nom" }).fill("Test User");
      await page.getByRole("textbox", { name: "Email" }).fill(email);
      await page.getByLabel("Mot de passe").fill(password);
      await page.getByRole("button", { name: "Créer un compte" }).click();

      console.log("🔍 Clicked signup button, waiting for redirect...");

      // Attendre la redirection vers /orders (membre par défaut)
      await page.waitForURL("**/orders", { timeout: 10000 });

      console.log("📍 Current URL:", page.url());

      // Vérifier qu'on est bien sur la page des commandes
      await expect(
        page.getByRole("heading", { name: "Commandes" }),
      ).toBeVisible();

      // Récupérer l'ID utilisateur pour cleanup
      const { db } = await import("@/lib/db");
      const { user } = await import("@/lib/db/schema");
      const { eq } = await import("drizzle-orm");
      const [createdUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);
      userId = createdUser?.id;
    } finally {
      // Nettoyer l'utilisateur créé
      if (userId) {
        await cleanupTestUser(userId);
      }
    }
  });

  test("user can sign in @smoke", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("textbox", { name: "Email" }).fill(testEmail);
    await page.getByLabel("Mot de passe").fill(testPassword);
    await page
      .getByRole("button", { name: "Se connecter", exact: true })
      .click();

    console.log("🔍 Clicked login button, waiting for redirect...");

    // L'utilisateur de test est un admin, donc redirection vers /admin/dashboard
    await page.waitForURL("**/admin/dashboard", { timeout: 10000 });

    console.log("📍 Current URL:", page.url());

    // Vérifier qu'on est bien sur le dashboard admin
    await expect(
      page.getByRole("heading", { name: "Dashboard Admin" }),
    ).toBeVisible();
  });
});
