import { and, desc, eq, inArray } from "drizzle-orm";
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

  /**
   * Récupère les paniers en attente de validation contenant des souhaits d'un utilisateur
   * @param userId - L'ID de l'utilisateur
   * @returns Liste des paniers avec les souhaits de l'utilisateur
   */
  async findAwaitingValidationForUser(userId: string) {
    // Trouver les souhaits de l'utilisateur qui sont dans un panier en attente de validation
    const userWishes = await db
      .select()
      .from(wish)
      .where(
        and(
          eq(wish.userId, userId),
          eq(wish.status, "in_basket"),
        ),
      );

    if (userWishes.length === 0) {
      return [];
    }

    // Récupérer les IDs des paniers uniques
    const basketIds = [...new Set(userWishes.map((w) => w.basketId).filter(Boolean))] as string[];

    if (basketIds.length === 0) {
      return [];
    }

    // Récupérer les paniers en status awaiting_validation
    const baskets = await db.query.basket.findMany({
      where: and(
        inArray(basket.id, basketIds),
        eq(basket.status, "awaiting_validation"),
      ),
      with: {
        order: true,
        wishes: {
          where: eq(wish.userId, userId),
          with: {
            user: true,
          },
        },
      },
      orderBy: [desc(basket.createdAt)],
    });

    return baskets;
  },

  /**
   * Récupère un panier avec les souhaits d'un utilisateur spécifique
   * @param basketId - L'ID du panier
   * @param userId - L'ID de l'utilisateur
   * @returns Le panier avec les souhaits de l'utilisateur
   */
  async findByIdWithUserWishes(basketId: string, userId: string) {
    return db.query.basket.findFirst({
      where: eq(basket.id, basketId),
      with: {
        order: true,
        wishes: {
          where: eq(wish.userId, userId),
        },
      },
    });
  },

  /**
   * Récupère les paniers disponibles au retrait contenant des souhaits d'un utilisateur
   * @param userId - L'ID de l'utilisateur
   * @returns Liste des paniers avec les souhaits de l'utilisateur
   */
  async findAvailableForPickupByUser(userId: string) {
    // Trouver les souhaits validés/payés de l'utilisateur
    const userWishes = await db
      .select()
      .from(wish)
      .where(
        and(
          eq(wish.userId, userId),
          // Souhaits validés ou payés (pas encore récupérés)
          inArray(wish.status, ["validated", "paid"]),
        ),
      );

    if (userWishes.length === 0) {
      return [];
    }

    // Récupérer les IDs des paniers uniques
    const basketIds = [...new Set(userWishes.map((w) => w.basketId).filter(Boolean))] as string[];

    if (basketIds.length === 0) {
      return [];
    }

    // Récupérer les paniers en status available_pickup
    const baskets = await db.query.basket.findMany({
      where: and(
        inArray(basket.id, basketIds),
        eq(basket.status, "available_pickup"),
      ),
      with: {
        order: true,
        wishes: {
          where: and(
            eq(wish.userId, userId),
            inArray(wish.status, ["validated", "paid"]),
          ),
          with: {
            depositPoint: true,
          },
        },
      },
      orderBy: [desc(basket.availableAt)],
    });

    return baskets;
  },

  /**
   * Récupère un panier avec tous les souhaits groupés par membre (pour admin)
   * @param basketId - L'ID du panier
   * @returns Le panier avec les souhaits et leurs utilisateurs
   */
  async findByIdWithWishesGroupedByMember(basketId: string) {
    const basketData = await db.query.basket.findFirst({
      where: eq(basket.id, basketId),
      with: {
        order: true,
        wishes: {
          with: {
            user: true,
          },
          orderBy: (wish, { asc }) => [asc(wish.userId), asc(wish.createdAt)],
        },
      },
    });

    if (!basketData) return null;

    // Grouper les souhaits par membre
    const memberMap = new Map<
      string,
      {
        user: { id: string; name: string; email: string };
        wishes: typeof basketData.wishes;
        totalDue: number;
        totalPaid: number;
        paymentStatus: "pending" | "sent" | "received" | "partial" | "mixed";
      }
    >();

    for (const w of basketData.wishes) {
      if (!memberMap.has(w.userId)) {
        memberMap.set(w.userId, {
          user: {
            id: w.user.id,
            name: w.user.name,
            email: w.user.email,
          },
          wishes: [],
          totalDue: 0,
          totalPaid: 0,
          paymentStatus: "pending",
        });
      }

      const member = memberMap.get(w.userId)!;
      member.wishes.push(w);
      member.totalDue += w.amountDue ? Number.parseFloat(w.amountDue) : 0;
      member.totalPaid += w.amountPaid ? Number.parseFloat(w.amountPaid) : 0;
    }

    // Déterminer le statut de paiement global de chaque membre
    for (const member of memberMap.values()) {
      const statuses = member.wishes.map((w) => w.paymentStatus || "pending");
      const uniqueStatuses = [...new Set(statuses)];

      if (uniqueStatuses.length === 1) {
        member.paymentStatus = uniqueStatuses[0] as "pending" | "sent" | "received" | "partial";
      } else {
        member.paymentStatus = "mixed";
      }
    }

    return {
      ...basketData,
      memberPayments: Array.from(memberMap.values()),
    };
  },
};
