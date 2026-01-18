import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

/**
 * Repository pour les opérations de base de données sur les utilisateurs
 */
export const userRepository = {
  /**
   * Récupère tous les utilisateurs actifs (non bannis)
   * @returns Liste des utilisateurs actifs triés par nom
   */
  async findAllActiveUsers() {
    return db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.banned, false))
      .orderBy(asc(user.name));
  },

  /**
   * Récupère un utilisateur par son ID
   * @param id - L'ID de l'utilisateur
   * @returns L'utilisateur ou undefined si non trouvé
   */
  async findById(id: string) {
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    return foundUser;
  },
};
