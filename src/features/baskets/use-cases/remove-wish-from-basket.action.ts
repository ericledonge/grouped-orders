"use server";

import { revalidatePath } from "next/cache";
import { basketRepository } from "../domain/basket.repository";
import { wishRepository } from "@/features/wishes/domain/wish.repository";

export interface RemoveWishFromBasketState {
  success: boolean;
  error?: string;
}

/**
 * Retire un souhait d'un panier
 * - Le souhait repasse en status "submitted"
 * - Ses prix et parts sont réinitialisés
 */
export async function removeWishFromBasketAction(
  wishId: string,
  basketId: string,
): Promise<RemoveWishFromBasketState> {
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
        error: "Impossible de modifier un panier qui n'est pas en brouillon",
      };
    }

    // Vérifier que le souhait existe et appartient au panier
    const wish = await wishRepository.findById(wishId);

    if (!wish) {
      return {
        success: false,
        error: "Souhait non trouvé",
      };
    }

    if (wish.basketId !== basketId) {
      return {
        success: false,
        error: "Ce souhait n'appartient pas à ce panier",
      };
    }

    // Retirer le souhait du panier
    await wishRepository.update(wishId, {
      basketId: null,
      status: "submitted",
      unitPrice: null,
      shippingShare: null,
      customsShare: null,
      amountDue: null,
      amountPaid: null,
    });

    // Revalider les pages concernées
    revalidatePath(`/admin/baskets/${basketId}`);
    revalidatePath(`/admin/baskets/${basketId}/edit`);
    revalidatePath(`/admin/orders/${basket.orderId}`);

    return { success: true };
  } catch (error) {
    console.error("Erreur lors du retrait du souhait:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors du retrait du souhait",
    };
  }
}
