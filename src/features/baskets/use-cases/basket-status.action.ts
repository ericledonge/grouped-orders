"use server";

import { revalidatePath } from "next/cache";
import { basketRepository } from "../domain/basket.repository";
import { requireAdmin } from "@/lib/auth/session";
import type { BasketStatus } from "../domain/basket.types";

export interface BasketStatusActionState {
  success: boolean;
  error?: string;
}

/**
 * Marque un panier comme réceptionné (awaiting_reception -> awaiting_delivery)
 */
export async function markBasketAsReceivedAction(
  basketId: string,
): Promise<BasketStatusActionState> {
  try {
    await requireAdmin();

    const basket = await basketRepository.findById(basketId);

    if (!basket) {
      return {
        success: false,
        error: "Panier non trouvé",
      };
    }

    if (basket.status !== "awaiting_reception") {
      return {
        success: false,
        error: "Ce panier n'est pas en attente de réception",
      };
    }

    // Mettre à jour le statut et la date de réception
    await basketRepository.update(basketId, {
      status: "awaiting_delivery",
      receivedAt: new Date(),
    });

    // Revalider les pages
    revalidatePath(`/admin/baskets/${basketId}`);
    revalidatePath(`/admin/orders/${basket.orderId}`);
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors du marquage comme réceptionné:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}

/**
 * Marque un panier comme disponible au retrait (awaiting_delivery -> available_pickup)
 */
export async function markBasketAsAvailableAction(
  basketId: string,
): Promise<BasketStatusActionState> {
  try {
    await requireAdmin();

    const basket = await basketRepository.findById(basketId);

    if (!basket) {
      return {
        success: false,
        error: "Panier non trouvé",
      };
    }

    if (basket.status !== "awaiting_delivery") {
      return {
        success: false,
        error: "Ce panier n'est pas en attente de livraison",
      };
    }

    // Mettre à jour le statut et la date de disponibilité
    await basketRepository.update(basketId, {
      status: "available_pickup",
      availableAt: new Date(),
    });

    // Revalider les pages
    revalidatePath(`/admin/baskets/${basketId}`);
    revalidatePath(`/admin/orders/${basket.orderId}`);
    revalidatePath("/admin/dashboard");
    revalidatePath("/my-baskets");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors du marquage comme disponible:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}

/**
 * Transitions de statut valides pour les paniers
 */
export const BASKET_STATUS_TRANSITIONS: Record<BasketStatus, BasketStatus[]> = {
  draft: ["awaiting_validation"],
  awaiting_validation: ["validated", "awaiting_reception"],
  validated: ["awaiting_reception"],
  awaiting_customs: ["awaiting_reception"],
  awaiting_reception: ["awaiting_delivery"],
  awaiting_delivery: ["available_pickup"],
  available_pickup: [],
};
