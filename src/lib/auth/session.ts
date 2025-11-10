import { headers } from "next/headers";
import { auth } from "./index";

/**
 * Vérifie qu'un utilisateur est authentifié
 * @throws Error si pas de session
 * @returns La session de l'utilisateur
 */
export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Non authentifié");
  }

  return session;
}

/**
 * Vérifie qu'un utilisateur est authentifié ET a le rôle admin
 * @throws Error si pas de session ou pas admin
 * @returns La session de l'utilisateur admin
 */
export async function requireAdmin() {
  const session = await requireSession();

  if (session.user.role !== "admin") {
    throw new Error("Accès refusé : rôle admin requis");
  }

  return session;
}
