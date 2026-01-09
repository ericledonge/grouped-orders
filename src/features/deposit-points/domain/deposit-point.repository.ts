import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { depositPoint } from "@/lib/db/schema";
import type { NewDepositPoint } from "./deposit-point.types";

/**
 * Repository pour les opérations de base de données sur les points de dépôt
 */
export const depositPointRepository = {
  /**
   * Crée un nouveau point de dépôt
   * @param data - Données du point de dépôt à créer
   * @returns Le point de dépôt créé
   */
  async create(data: NewDepositPoint) {
    const [newPoint] = await db.insert(depositPoint).values(data).returning();
    return newPoint;
  },

  /**
   * Récupère un point de dépôt par son ID
   * @param id - L'ID du point de dépôt
   * @returns Le point de dépôt ou undefined si non trouvé
   */
  async findById(id: string) {
    const [found] = await db
      .select()
      .from(depositPoint)
      .where(eq(depositPoint.id, id))
      .limit(1);

    return found;
  },

  /**
   * Liste tous les points de dépôt
   * @returns Liste de tous les points de dépôt
   */
  async findAll() {
    return db.select().from(depositPoint);
  },

  /**
   * Récupère le point de dépôt par défaut
   * @returns Le point de dépôt par défaut ou undefined si aucun
   */
  async findDefault() {
    const [found] = await db
      .select()
      .from(depositPoint)
      .where(eq(depositPoint.isDefault, true))
      .limit(1);

    return found;
  },

  /**
   * Met à jour un point de dépôt
   * @param id - L'ID du point de dépôt
   * @param data - Les données à mettre à jour
   * @returns Le point de dépôt mis à jour
   */
  async update(
    id: string,
    data: Partial<Omit<NewDepositPoint, "createdAt" | "updatedAt">>,
  ) {
    const [updated] = await db
      .update(depositPoint)
      .set(data)
      .where(eq(depositPoint.id, id))
      .returning();

    return updated;
  },

  /**
   * Définit un point de dépôt comme défaut (et retire le flag des autres)
   * @param id - L'ID du point de dépôt à définir comme défaut
   */
  async setAsDefault(id: string) {
    // D'abord retirer isDefault de tous
    await db.update(depositPoint).set({ isDefault: false });

    // Puis définir le nouveau par défaut
    const [updated] = await db
      .update(depositPoint)
      .set({ isDefault: true })
      .where(eq(depositPoint.id, id))
      .returning();

    return updated;
  },

  /**
   * Supprime un point de dépôt
   * @param id - L'ID du point de dépôt à supprimer
   */
  async delete(id: string) {
    await db.delete(depositPoint).where(eq(depositPoint.id, id));
  },
};
