import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { basket, wish } from "@/lib/db/schema";
import type { NewBasket, BasketStatus } from "./basket.types";

/**
 * Repository pour les opérations de base de données sur les paniers
 */
export const basketRepository = {
  /**
   * Crée un nouveau panier en base de données
   * @param data - Données du panier à créer
   * @returns Le panier créé
   */
  async create(data: NewBasket) {
    const [newBasket] = await db.insert(basket).values(data).returning();
    return newBasket;
  },

  /**
   * Récupère un panier par son ID
   * @param id - L'ID du panier
   * @returns Le panier ou undefined si non trouvé
   */
  async findById(id: string) {
    const [foundBasket] = await db
      .select()
      .from(basket)
      .where(eq(basket.id, id))
      .limit(1);

    return foundBasket;
  },

  /**
   * Récupère un panier avec ses souhaits et les utilisateurs associés
   * @param id - L'ID du panier
   * @returns Le panier avec ses souhaits ou undefined si non trouvé
   */
  async findByIdWithWishes(id: string) {
    return db.query.basket.findFirst({
      where: eq(basket.id, id),
      with: {
        wishes: {
          with: {
            user: true,
          },
          orderBy: (wish, { desc }) => [desc(wish.createdAt)],
        },
        order: true,
      },
    });
  },

  /**
   * Liste tous les paniers d'une commande
   * @param orderId - L'ID de la commande
   * @returns Liste des paniers, triés par date de création décroissante
   */
  async findByOrderId(orderId: string) {
    return db
      .select()
      .from(basket)
      .where(eq(basket.orderId, orderId))
      .orderBy(desc(basket.createdAt));
  },

  /**
   * Liste les paniers d'une commande avec le nombre de souhaits
   * @param orderId - L'ID de la commande
   * @returns Paniers avec wishCount, triés par date de création décroissante
   */
  async findByOrderIdWithWishCount(orderId: string) {
    const baskets = await db
      .select()
      .from(basket)
      .where(eq(basket.orderId, orderId))
      .orderBy(desc(basket.createdAt));

    // Pour chaque panier, compter les souhaits
    const basketsWithCount = await Promise.all(
      baskets.map(async (b) => {
        const wishes = await db
          .select()
          .from(wish)
          .where(eq(wish.basketId, b.id));

        // Calculer le total estimé (somme des prix unitaires)
        const totalEstimated = wishes.reduce((sum, w) => {
          return sum + (w.unitPrice ? Number.parseFloat(w.unitPrice) : 0);
        }, 0);

        return {
          ...b,
          wishCount: wishes.length,
          totalEstimated,
        };
      }),
    );

    return basketsWithCount;
  },

  /**
   * Met à jour un panier
   * @param id - L'ID du panier
   * @param data - Les données à mettre à jour
   * @returns Le panier mis à jour ou undefined si non trouvé
   */
  async update(
    id: string,
    data: Partial<
      Omit<NewBasket, "createdBy" | "orderId" | "createdAt" | "updatedAt">
    >,
  ) {
    const [updatedBasket] = await db
      .update(basket)
      .set(data)
      .where(eq(basket.id, id))
      .returning();

    return updatedBasket;
  },

  /**
   * Met à jour le statut d'un panier
   * @param id - L'ID du panier
   * @param status - Le nouveau statut
   * @returns Le panier mis à jour ou undefined si non trouvé
   */
  async updateStatus(id: string, status: BasketStatus) {
    const [updatedBasket] = await db
      .update(basket)
      .set({ status })
      .where(eq(basket.id, id))
      .returning();

    return updatedBasket;
  },

  /**
   * Supprime un panier
   * @param id - L'ID du panier à supprimer
   */
  async delete(id: string) {
    await db.delete(basket).where(eq(basket.id, id));
  },

  /**
   * Met à jour les frais de port d'un panier
   * @param id - L'ID du panier
   * @param shippingCost - Les frais de port totaux
   * @returns Le panier mis à jour
   */
  async updateShippingCost(id: string, shippingCost: string) {
    const [updatedBasket] = await db
      .update(basket)
      .set({ shippingCost })
      .where(eq(basket.id, id))
      .returning();

    return updatedBasket;
  },

  /**
   * Met à jour les frais de douane d'un panier
   * @param id - L'ID du panier
   * @param customsCost - Les frais de douane totaux
   * @returns Le panier mis à jour
   */
  async updateCustomsCost(id: string, customsCost: string) {
    const [updatedBasket] = await db
      .update(basket)
      .set({ customsCost })
      .where(eq(basket.id, id))
      .returning();

    return updatedBasket;
  },
};
