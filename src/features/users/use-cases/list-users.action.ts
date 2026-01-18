"use server";

import { requireAdmin } from "@/lib/auth/session";
import { userRepository } from "../domain/user.repository";

/**
 * Récupère la liste des utilisateurs actifs
 * Réservé aux administrateurs
 */
export async function listActiveUsers() {
  await requireAdmin();
  return userRepository.findAllActiveUsers();
}
