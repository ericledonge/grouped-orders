import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

/**
 * Repository pour récupérer les admins (pour les notifications)
 */
export const adminRepository = {
  /**
   * Récupère les IDs de tous les administrateurs
   * @returns Liste des IDs des admins
   */
  async findAllAdminIds() {
    const admins = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.role, "admin"));

    return admins.map((admin) => admin.id);
  },
};
