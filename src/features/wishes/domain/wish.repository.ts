import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { wish } from "@/lib/db/schema";
import type { NewWish } from "./wish.types";

/**
 * Repository pour les opérations de base de données sur les souhaits
 */
export const wishRepository = {
  /**
   * Crée un nouveau souhait en base de données
   * @param data - Données du souhait à créer
   * @returns Le souhait créé
   */
  async create(data: NewWish) {
    const [newWish] = await db
      .insert(wish)
      .values({
        orderId: data.orderId,
        userId: data.userId,
        gameName: data.gameName,
        philibertReference: data.philibertReference,
        philibertUrl: data.philibertUrl,
        status: "submitted",
      })
      .returning();

    return newWish;
  },

  /**
   * Récupère tous les souhaits d'une commande
   * @param orderId - L'ID de la commande
   * @returns Liste des souhaits de la commande
   */
  async findByOrderId(orderId: string) {
    return db.select().from(wish).where(eq(wish.orderId, orderId));
  },

  /**
   * Récupère tous les souhaits d'un utilisateur
   * @param userId - L'ID de l'utilisateur
   * @returns Liste des souhaits de l'utilisateur
   */
  async findByUserId(userId: string) {
    return db.select().from(wish).where(eq(wish.userId, userId));
  },
};
