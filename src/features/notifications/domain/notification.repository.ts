import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notification } from "@/lib/db/schema";
import type { NewNotification } from "./notification.types";

/**
 * Repository pour les opérations de base de données sur les notifications
 */
export const notificationRepository = {
  /**
   * Crée une nouvelle notification
   * @param data - Données de la notification à créer
   * @returns La notification créée
   */
  async create(data: NewNotification) {
    const [newNotification] = await db
      .insert(notification)
      .values(data)
      .returning();
    return newNotification;
  },

  /**
   * Crée plusieurs notifications en une fois
   * @param data - Liste des notifications à créer
   * @returns Les notifications créées
   */
  async createMany(data: NewNotification[]) {
    if (data.length === 0) return [];
    const newNotifications = await db
      .insert(notification)
      .values(data)
      .returning();
    return newNotifications;
  },

  /**
   * Récupère les notifications d'un utilisateur
   * @param userId - L'ID de l'utilisateur
   * @param limit - Nombre de notifications à récupérer
   * @returns Liste des notifications, triées par date décroissante
   */
  async findByUserId(userId: string, limit = 10) {
    return db
      .select()
      .from(notification)
      .where(eq(notification.userId, userId))
      .orderBy(desc(notification.createdAt))
      .limit(limit);
  },

  /**
   * Compte le nombre de notifications non lues pour un utilisateur
   * @param userId - L'ID de l'utilisateur
   * @returns Le nombre de notifications non lues
   */
  async countUnread(userId: string) {
    const [result] = await db
      .select({ count: count() })
      .from(notification)
      .where(
        and(eq(notification.userId, userId), eq(notification.read, false)),
      );

    return result?.count ?? 0;
  },

  /**
   * Marque une notification comme lue
   * @param id - L'ID de la notification
   * @param userId - L'ID de l'utilisateur (pour vérification)
   * @returns La notification mise à jour
   */
  async markAsRead(id: string, userId: string) {
    const [updated] = await db
      .update(notification)
      .set({ read: true })
      .where(and(eq(notification.id, id), eq(notification.userId, userId)))
      .returning();

    return updated;
  },

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   * @param userId - L'ID de l'utilisateur
   */
  async markAllAsRead(userId: string) {
    await db
      .update(notification)
      .set({ read: true })
      .where(eq(notification.userId, userId));
  },

  /**
   * Supprime les anciennes notifications (plus de 30 jours)
   */
  async deleteOld() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Utiliser une requête SQL directe pour la comparaison de date
    await db.delete(notification).where(eq(notification.read, true));
  },
};
