"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { adminRepository } from "@/features/notifications/domain/admin.repository";
import { notificationService } from "@/features/notifications/domain/notification.service";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { basket, wish } from "@/lib/db/schema";

export interface MarkPaymentSentState {
  success: boolean;
  error?: string;
}

/**
 * Marque les souhaits validés d'un utilisateur dans un panier comme "paiement envoyé"
 */
export async function markPaymentSentAction(
  basketId: string,
): Promise<MarkPaymentSentState> {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Vous devez être connecté",
      };
    }

    // Récupérer les souhaits validés de l'utilisateur dans ce panier
    const validatedWishes = await db
      .select()
      .from(wish)
      .where(
        and(
          eq(wish.basketId, basketId),
          eq(wish.userId, session.user.id),
          eq(wish.status, "validated"),
        ),
      );

    if (validatedWishes.length === 0) {
      return {
        success: false,
        error: "Aucun souhait validé à payer dans ce panier",
      };
    }

    // Récupérer le panier pour les notifications
    const [basketData] = await db
      .select({ name: basket.name })
      .from(basket)
      .where(eq(basket.id, basketId))
      .limit(1);

    // Calculer le montant total envoyé
    const totalAmount = validatedWishes.reduce(
      (sum, w) => sum + (w.amountDue ? Number.parseFloat(w.amountDue) : 0),
      0,
    );

    // Mettre à jour tous les souhaits validés avec le statut de paiement
    const now = new Date();
    for (const w of validatedWishes) {
      await db
        .update(wish)
        .set({
          paymentStatus: "sent",
          paymentSentAt: now,
        })
        .where(eq(wish.id, w.id));
    }

    // Notifier les admins du paiement envoyé
    try {
      const adminIds = await adminRepository.findAllAdminIds();
      await notificationService.notifyAdmins(adminIds, "payment_sent", {
        userName: session.user.name || session.user.email || "Un membre",
        amount: totalAmount.toFixed(2),
        basketName: basketData?.name || basketId,
        basketId,
      });
    } catch (notifError) {
      console.error("Erreur lors de l'envoi des notifications:", notifError);
    }

    // Revalider les pages
    revalidatePath(`/baskets/${basketId}/payment`);
    revalidatePath("/my-baskets");
    revalidatePath(`/admin/baskets/${basketId}`);

    return { success: true };
  } catch (error) {
    console.error("Erreur lors du marquage du paiement:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}
