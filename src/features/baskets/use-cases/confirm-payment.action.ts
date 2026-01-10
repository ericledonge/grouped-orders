"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { wish } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";

export interface ConfirmPaymentState {
  success: boolean;
  error?: string;
}

/**
 * Confirme la réception d'un paiement complet pour un membre dans un panier
 */
export async function confirmPaymentReceivedAction(
  basketId: string,
  userId: string,
): Promise<ConfirmPaymentState> {
  try {
    await requireAdmin();

    // Récupérer les souhaits du membre avec paiement envoyé
    const memberWishes = await db
      .select()
      .from(wish)
      .where(
        and(
          eq(wish.basketId, basketId),
          eq(wish.userId, userId),
          eq(wish.paymentStatus, "sent"),
        ),
      );

    if (memberWishes.length === 0) {
      return {
        success: false,
        error: "Aucun paiement en attente de confirmation pour ce membre",
      };
    }

    // Marquer tous les souhaits comme payés
    const now = new Date();
    for (const w of memberWishes) {
      const amountDue = w.amountDue ? Number.parseFloat(w.amountDue) : 0;
      await db
        .update(wish)
        .set({
          paymentStatus: "received",
          paymentReceivedAt: now,
          amountPaid: amountDue.toFixed(2),
        })
        .where(eq(wish.id, w.id));
    }

    // Revalider les pages
    revalidatePath(`/admin/baskets/${basketId}`);
    revalidatePath(`/admin/baskets/${basketId}/payments`);
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la confirmation du paiement:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}

/**
 * Enregistre un paiement partiel pour un membre dans un panier
 */
export async function recordPartialPaymentAction(
  basketId: string,
  userId: string,
  amountReceived: number,
): Promise<ConfirmPaymentState> {
  try {
    await requireAdmin();

    // Récupérer les souhaits du membre avec paiement envoyé
    const memberWishes = await db
      .select()
      .from(wish)
      .where(
        and(
          eq(wish.basketId, basketId),
          eq(wish.userId, userId),
          eq(wish.paymentStatus, "sent"),
        ),
      );

    if (memberWishes.length === 0) {
      return {
        success: false,
        error: "Aucun paiement en attente pour ce membre",
      };
    }

    // Calculer le montant total dû
    const totalDue = memberWishes.reduce(
      (sum, w) => sum + (w.amountDue ? Number.parseFloat(w.amountDue) : 0),
      0,
    );

    if (amountReceived >= totalDue) {
      // Paiement complet, utiliser l'autre action
      return confirmPaymentReceivedAction(basketId, userId);
    }

    // Paiement partiel - répartir sur les souhaits
    const now = new Date();
    let remainingPayment = amountReceived;

    for (const w of memberWishes) {
      const wishDue = w.amountDue ? Number.parseFloat(w.amountDue) : 0;
      const paymentForThisWish = Math.min(remainingPayment, wishDue);

      await db
        .update(wish)
        .set({
          paymentStatus: paymentForThisWish >= wishDue ? "received" : "partial",
          paymentReceivedAt: now,
          amountPaid: paymentForThisWish.toFixed(2),
        })
        .where(eq(wish.id, w.id));

      remainingPayment -= paymentForThisWish;
      if (remainingPayment <= 0) break;
    }

    // Revalider les pages
    revalidatePath(`/admin/baskets/${basketId}`);
    revalidatePath(`/admin/baskets/${basketId}/payments`);
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du paiement partiel:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}
