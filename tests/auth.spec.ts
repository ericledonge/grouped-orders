import { expect, test } from "@playwright/test";
import { cleanupTestUser, createTestAdmin } from "./helpers/test-admin";

test.describe("Authentication", () => {
  test("user can sign up", async ({ page }) => {
    const timestamp = Date.now();
    const email = `test-signup-${timestamp}@example.com`;
    const password = "TestPassword123!";
    let userId: string;

    try {
      await page.goto("/auth/sign-up");

      await page.getByRole("textbox", { name: "Nom" }).fill("Test User");
      await page.getByRole("textbox", { name: "Email" }).fill(email);
      await page.getByLabel("Mot de passe").fill(password);
      await page.getByRole("button", { name: "Créer un compte" }).click();

      console.log("🔍 Clicked signup button, waiting for redirect...");

      // Attendre la redirection (peut varier selon votre implémentation)
      await page.waitForURL("**/", { timeout: 10000 });

      console.log("📍 Current URL:", page.url());

      await expect(page.getByText("Bienvenue")).toBeVisible();

      // Récupérer l'ID utilisateur pour cleanup
      // On pourrait aussi le récupérer depuis la DB via l'email
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
    // Créer un utilisateur de test
    const { email, password, userId } = await createTestAdmin();

    try {
      await page.goto("/");

      await page.getByRole("textbox", { name: "Email" }).fill(email);
      await page.getByLabel("Mot de passe").fill(password);
      await page
        .getByRole("button", { name: "Se connecter", exact: true })
        .click();

      console.log("🔍 Clicked login button, waiting for redirect...");

      await page.waitForURL("**/", { timeout: 10000 });

      console.log("📍 Current URL:", page.url());

      await expect(page.getByText("Bienvenue")).toBeVisible();
    } finally {
      // Nettoyer l'utilisateur de test
      await cleanupTestUser(userId);
    }
  });
});
