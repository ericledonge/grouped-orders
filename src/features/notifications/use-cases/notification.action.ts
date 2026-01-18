"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { notificationRepository } from "../domain/notification.repository";
import { notificationService } from "../domain/notification.service";

export interface NotificationActionState {
  success: boolean;
  error?: string;
}

/**
 * Récupère les notifications de l'utilisateur connecté
 */
export async function getNotificationsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { notifications: [], unreadCount: 0 };
    }

    return notificationService.getNotificationsWithCount(session.user.id);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationAsReadAction(
  notificationId: string,
): Promise<NotificationActionState> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Vous devez être connecté",
      };
    }

    await notificationRepository.markAsRead(notificationId, session.user.id);

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors du marquage comme lu:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}

/**
 * Marque toutes les notifications comme lues
 */
export async function markAllNotificationsAsReadAction(): Promise<NotificationActionState> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Vous devez être connecté",
      };
    }

    await notificationRepository.markAllAsRead(session.user.id);

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors du marquage de toutes comme lues:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}
