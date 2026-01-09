import { count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { order, wish } from "@/lib/db/schema";

/**
 * Type pour les données de création d'une commande
 */
export type CreateOrderData = {
  type: "monthly" | "private_sale" | "special";
  targetDate: Date;
  description?: string;
  createdBy: string;
};

/**
 * Repository pour les opérations de base de données sur les commandes
 */
export const orderRepository = {
  /**
   * Crée une nouvelle commande en base de données
   * @param data - Données de la commande à créer
   * @returns L'ID de la commande créée
   */
  async create(data: CreateOrderData) {
    const [newOrder] = await db
      .insert(order)
      .values({
        type: data.type,
        targetDate: data.targetDate,
        description: data.description,
        createdBy: data.createdBy,
        status: "open",
      })
      .returning({ id: order.id });

    return newOrder.id;
  },

  /**
   * Récupère une commande par son ID
   * @param id - L'ID de la commande
   * @returns La commande ou undefined si non trouvée
   */
  async findById(id: string) {
    const [foundOrder] = await db
      .select()
      .from(order)
      .where(eq(order.id, id))
      .limit(1);

    return foundOrder;
  },

  /**
   * Liste toutes les commandes
   * @returns Toutes les commandes, triées par date cible décroissante
   */
  async findAll() {
    return db.select().from(order).orderBy(desc(order.targetDate));
  },

  /**
   * Liste toutes les commandes avec le nombre de souhaits
   * @returns Commandes avec wishCount, triées par date cible décroissante
   */
  async findAllWithWishCount() {
    const orders = await db
      .select()
      .from(order)
      .orderBy(desc(order.targetDate));

    // Pour chaque commande, compter les souhaits
    const ordersWithCount = await Promise.all(
      orders.map(async (o) => {
        const [result] = await db
          .select({ count: count() })
          .from(wish)
          .where(eq(wish.orderId, o.id));

        return {
          ...o,
          wishCount: result?.count ?? 0,
        };
      }),
    );

    return ordersWithCount;
  },

  /**
   * Liste les commandes ouvertes (status = "open")
   * @returns Commandes ouvertes, triées par date cible croissante
   */
  async findOpenOrders() {
    return db
      .select()
      .from(order)
      .where(eq(order.status, "open"))
      .orderBy(order.targetDate);
  },

  /**
   * Récupère une commande avec ses souhaits et les utilisateurs associés
   * @param id - L'ID de la commande
   * @returns La commande avec ses souhaits ou undefined si non trouvée
   */
  async findByIdWithWishes(id: string) {
    return db.query.order.findFirst({
      where: eq(order.id, id),
      with: {
        wishes: {
          with: {
            user: true,
          },
          orderBy: (wish, { desc }) => [desc(wish.createdAt)],
        },
      },
    });
  },

  /**
   * Met à jour une commande existante
   * @param id - L'ID de la commande à mettre à jour
   * @param data - Les données à mettre à jour
   * @returns La commande mise à jour ou undefined si non trouvée
   */
  async update(id: string, data: Partial<Omit<CreateOrderData, "createdBy">>) {
    const [updatedOrder] = await db
      .update(order)
      .set({
        type: data.type,
        targetDate: data.targetDate,
        description: data.description,
      })
      .where(eq(order.id, id))
      .returning();

    return updatedOrder;
  },
};
