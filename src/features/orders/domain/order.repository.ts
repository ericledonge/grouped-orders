import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { order } from "@/lib/db/schema";

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
   * @returns Toutes les commandes, triées par date de création décroissante
   */
  async findAll() {
    return db.select().from(order).orderBy(desc(order.createdAt));
  },
};
