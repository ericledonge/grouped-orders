"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { wish } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
