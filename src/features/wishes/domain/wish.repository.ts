import { count, desc, eq } from "drizzle-orm";
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

  /**
   * Récupère tous les souhaits d'un utilisateur avec la commande associée
   * @param userId - L'ID de l'utilisateur
   * @returns Liste des souhaits avec les détails de la commande
   */
  async findByUserIdWithOrder(userId: string) {
    return db.query.wish.findMany({
      where: eq(wish.userId, userId),
      with: {
        order: true,
      },
      orderBy: [desc(wish.createdAt)],
    });
  },

  /**
   * Récupère un souhait par son ID
   * @param id - L'ID du souhait
   * @returns Le souhait ou undefined si non trouvé
   */
  async findById(id: string) {
    const [foundWish] = await db
      .select()
      .from(wish)
      .where(eq(wish.id, id))
      .limit(1);

    return foundWish;
  },

  /**
   * Supprime un souhait par son ID
   * @param id - L'ID du souhait à supprimer
   */
  async delete(id: string) {
    await db.delete(wish).where(eq(wish.id, id));
  },

  /**
   * Compte le nombre de souhaits en attente (status = 'submitted')
   * @returns Le nombre de souhaits soumis
   */
  async countSubmittedWishes() {
    const [result] = await db
      .select({ count: count() })
      .from(wish)
      .where(eq(wish.status, "submitted"));

    return result?.count ?? 0;
  },

  /**
   * Récupère les derniers souhaits soumis avec les informations utilisateur et commande
   * @param limit - Nombre de souhaits à récupérer (défaut: 5)
   * @returns Liste des derniers souhaits soumis
   */
  async findRecentSubmittedWithDetails(limit = 5) {
    return db.query.wish.findMany({
      where: eq(wish.status, "submitted"),
      with: {
        user: true,
        order: true,
      },
      orderBy: [desc(wish.createdAt)],
      limit,
    });
  },
};
