import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { order, user } from "@/lib/db/schema";

// Délai entre les créations pour éviter le rate limiting
let lastCreationTime = 0;
const MIN_DELAY_BETWEEN_CREATIONS = 3000; // 3 secondes

/**
 * Crée un utilisateur admin de test unique pour les tests E2E
 *
 * @returns Les credentials de l'admin créé
 */
export async function createTestAdmin() {
  // Attendre si nécessaire pour éviter le rate limiting
  const now = Date.now();
  const timeSinceLastCreation = now - lastCreationTime;
  if (timeSinceLastCreation < MIN_DELAY_BETWEEN_CREATIONS) {
    const delay = MIN_DELAY_BETWEEN_CREATIONS - timeSinceLastCreation;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  lastCreationTime = Date.now();

  const timestamp = Date.now();
  const email = `test-admin-${timestamp}@example.com`;
  const password = "TestAdmin123!";
  const name = `Test Admin ${timestamp}`;

  const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  // 1. Créer l'utilisateur via l'API Better Auth avec retry en cas de rate limiting
  let response: Response | null = null;
  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    response = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name,
      }),
    });

    // Si succès, sortir de la boucle
    if (response.ok) break;

    // Si rate limiting (429), attendre et réessayer
    if (response.status === 429 && attempt < maxAttempts - 1) {
      const waitTime = (attempt + 1) * 3000; // 3s, 6s, 9s
      console.log(`⏳ Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}/${maxAttempts - 1}...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      attempt++;
      continue;
    }

    // Autre erreur, lever l'exception
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to create test admin: ${response.status} ${response.statusText}\n${JSON.stringify(errorData, null, 2)}`,
    );
  }

  if (!response || !response.ok) {
    const errorData = response ? await response.json().catch(() => ({})) : {};
    throw new Error(
      `Failed to create test admin after ${maxAttempts} attempts: ${response?.status || 'unknown'} ${response?.statusText || ''}\n${JSON.stringify(errorData, null, 2)}`,
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
