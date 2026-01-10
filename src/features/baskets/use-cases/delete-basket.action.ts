"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { wish } from "@/lib/db/schema";
import { basketRepository } from "../domain/basket.repository";

export interface DeleteBasketState {
  success: boolean;
  error?: string;
  orderId?: string;
}

/**
 * Supprime un panier
 * - Tous les souhaits repassent en status "submitted"
 * - Le panier est supprimé
 */
export async function deleteBasketAction(
  basketId: string,
): Promise<DeleteBasketState> {
  try {
    // Vérifier que le panier existe et est en draft
    const basket = await basketRepository.findById(basketId);

    if (!basket) {
      return {
        success: false,
        error: "Panier non trouvé",
      };
    }

    if (basket.status !== "draft") {
      return {
        success: false,
        error: "Impossible de supprimer un panier qui n'est pas en brouillon",
      };
    }

    const orderId = basket.orderId;

    // Remettre tous les souhaits en status "submitted" et supprimer les informations de prix
    await db
      .update(wish)
      .set({
        basketId: null,
        status: "submitted",
        unitPrice: null,
        shippingShare: null,
        customsShare: null,
        amountDue: null,
        amountPaid: null,
      })
      .where(eq(wish.basketId, basketId));

    // Supprimer le panier
    await basketRepository.delete(basketId);

    // Revalider les pages concernées
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");

    return {
      success: true,
      orderId,
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du panier:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression du panier",
    };
  }
}
