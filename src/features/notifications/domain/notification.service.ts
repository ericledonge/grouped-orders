import { notificationRepository } from "./notification.repository";
import type { NewNotification, NotificationType } from "./notification.types";

/**
 * Configuration des templates de notifications par type
 */
const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  {
    title: (data: Record<string, string>) => string;
    message: (data: Record<string, string>) => string;
    linkTemplate?: (data: Record<string, string>) => string;
  }
> = {
  // Pour les admins
  wish_submitted: {
    title: () => "Nouveau souhait",
    message: (data) =>
      `${data.userName} a émis un souhait pour "${data.gameName}" sur la commande ${data.orderDescription}`,
    linkTemplate: (data) => `/admin/orders/${data.orderId}`,
  },

  payment_sent: {
    title: () => "Paiement envoyé",
    message: (data) =>
      `${data.userName} a envoyé un paiement de ${data.amount} € pour le panier "${data.basketName}"`,
    linkTemplate: (data) => `/admin/baskets/${data.basketId}/payments`,
  },

  wish_picked_up: {
    title: () => "Jeu récupéré",
    message: (data) => `${data.userName} a récupéré "${data.gameName}"`,
    linkTemplate: (data) => `/admin/baskets/${data.basketId}`,
  },

  // Pour les membres
  basket_ready: {
    title: () => "Panier à valider",
    message: (data) =>
      `Le panier "${data.basketName}" est prêt pour validation. Validez vos souhaits et procédez au paiement.`,
    linkTemplate: (data) => `/baskets/${data.basketId}/validate`,
  },

  wish_validated: {
    title: () => "Souhait validé",
    message: (data) =>
      `Votre souhait "${data.gameName}" a été validé. Total à payer : ${data.amount} €`,
    linkTemplate: (data) => `/baskets/${data.basketId}/payment`,
  },

  wish_refused: {
    title: () => "Souhait refusé",
    message: (data) => `Votre souhait "${data.gameName}" a été refusé.`,
    linkTemplate: () => `/my-wishes`,
  },

  payment_received: {
    title: () => "Paiement confirmé",
    message: (data) =>
      `Votre paiement de ${data.amount} € pour le panier "${data.basketName}" a été confirmé.`,
    linkTemplate: (data) => `/baskets/${data.basketId}/payment`,
  },

  basket_received: {
    title: () => "Colis réceptionné",
    message: (data) =>
      `Le panier "${data.basketName}" a été réceptionné. Livraison prochaine !`,
    linkTemplate: () => `/my-baskets`,
  },

  pickup_available: {
    title: () => "Jeux disponibles !",
    message: (data) =>
      `Vos jeux du panier "${data.basketName}" sont disponibles au retrait.`,
    linkTemplate: () => `/my-pickups`,
  },
};

/**
 * Service de création de notifications
 */
export const notificationService = {
  /**
   * Crée une notification pour un utilisateur
   * @param userId - L'ID de l'utilisateur destinataire
   * @param type - Le type de notification
   * @param data - Les données pour générer le message
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, string>,
  ) {
    const template = NOTIFICATION_TEMPLATES[type];

    const notification: NewNotification = {
      userId,
      type,
      title: template.title(data),
      message: template.message(data),
      link: template.linkTemplate ? template.linkTemplate(data) : undefined,
    };

    return notificationRepository.create(notification);
  },

  /**
   * Crée des notifications pour plusieurs utilisateurs
   * @param userIds - Liste des IDs des utilisateurs destinataires
   * @param type - Le type de notification
   * @param data - Les données pour générer le message
   */
  async createNotificationsForUsers(
    userIds: string[],
    type: NotificationType,
    data: Record<string, string>,
  ) {
    if (userIds.length === 0) return [];

    const template = NOTIFICATION_TEMPLATES[type];

    const notifications: NewNotification[] = userIds.map((userId) => ({
      userId,
      type,
      title: template.title(data),
      message: template.message(data),
      link: template.linkTemplate ? template.linkTemplate(data) : undefined,
    }));

    return notificationRepository.createMany(notifications);
  },

  /**
   * Notifie les admins d'un événement
   * @param adminIds - Liste des IDs des admins
   * @param type - Le type de notification
   * @param data - Les données pour générer le message
   */
  async notifyAdmins(
    adminIds: string[],
    type: NotificationType,
    data: Record<string, string>,
  ) {
    return this.createNotificationsForUsers(adminIds, type, data);
  },

  /**
   * Récupère les notifications d'un utilisateur avec le compteur de non lues
   * @param userId - L'ID de l'utilisateur
   * @param limit - Nombre de notifications à récupérer
   */
  async getNotificationsWithCount(userId: string, limit = 10) {
    const [notifications, unreadCount] = await Promise.all([
      notificationRepository.findByUserId(userId, limit),
      notificationRepository.countUnread(userId),
    ]);

    return { notifications, unreadCount };
  },
};
