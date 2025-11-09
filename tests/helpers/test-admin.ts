import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { order, user } from "@/lib/db/schema";

/**
 * Crée un utilisateur admin de test unique pour les tests E2E
 *
 * @returns Les credentials de l'admin créé
 */
export async function createTestAdmin() {
  const timestamp = Date.now();
  const email = `test-admin-${timestamp}@example.com`;
  const password = "TestAdmin123!";
  const name = `Test Admin ${timestamp}`;

  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  // 1. Créer l'utilisateur via l'API Better Auth
  const response = await fetch(`${baseURL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      name,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to create test admin: ${response.status} ${response.statusText}\n${JSON.stringify(errorData, null, 2)}`,
    );
  }

  const data = await response.json();
  const userId = data.user?.id;

  if (!userId) {
    throw new Error("No user ID returned from sign-up");
  }

  // 2. Mettre à jour le rôle en admin dans la base de données
  await db
    .update(user)
    .set({ role: "admin", emailVerified: true })
    .where(eq(user.id, userId));

  return {
    email,
    password,
    userId,
    name,
  };
}

/**
 * Supprime un utilisateur de test de la base de données
 *
 * @param userId - L'ID de l'utilisateur à supprimer
 */
export async function cleanupTestUser(userId: string) {
  // Supprimer d'abord les commandes créées par cet utilisateur
  // (les wishes sont supprimées en cascade grâce au FK order_id)
  await db.delete(order).where(eq(order.createdBy, userId));

  // Ensuite supprimer l'utilisateur
  // (account et session sont supprimées en cascade grâce aux FK)
  await db.delete(user).where(eq(user.id, userId));
}

/**
 * Se connecte avec les credentials fournis et retourne les cookies de session
 *
 * @param email - Email de l'utilisateur
 * @param password - Mot de passe de l'utilisateur
 * @returns Les cookies de session
 */
export async function loginTestUser(email: string, password: string) {
  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  const response = await fetch(`${baseURL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to login test user: ${response.status} ${response.statusText}`,
    );
  }

  // Récupérer les cookies de session
  const cookies = response.headers.get("set-cookie");

  return cookies;
}
