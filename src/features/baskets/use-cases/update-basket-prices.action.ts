"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { basket, wish } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import {
  calculateProrataShares,
  calculateAmountDue,
} from "../domain/basket.service";

export type UpdateBasketPricesState = {
  success: boolean;
  error?: string;
};

interface WishPriceInput {
  id: string;
  unitPrice: string;
}

/**
 * Server Action pour mettre à jour les prix d'un panier
 * Calcule automatiquement les parts de frais de port au prorata
 */
export async function updateBasketPricesAction(
  _prevState: UpdateBasketPricesState,
  formData: FormData,
): Promise<UpdateBasketPricesState> {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "Vous devez être administrateur pour modifier un panier",
      };
    }

    // Extraire les données du formulaire
    const basketId = formData.get("basketId") as string;
    const shippingCost = formData.get("shippingCost") as string;

    // Récupérer les prix des souhaits depuis le formulaire
    const wishPrices: WishPriceInput[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("wishPrice_")) {
        const wishId = key.replace("wishPrice_", "");
        wishPrices.push({ id: wishId, unitPrice: value as string });
      }
    }

    // Validation basique
    if (!basketId) {
      return { success: false, error: "ID du panier manquant" };
    }

    const shippingCostNum = Number.parseFloat(shippingCost || "0");
    if (Number.isNaN(shippingCostNum) || shippingCostNum < 0) {
      return { success: false, error: "Frais de port invalides" };
    }

    // Récupérer le panier
    const [existingBasket] = await db
      .select()
      .from(basket)
      .where(eq(basket.id, basketId))
      .limit(1);

    if (!existingBasket) {
      return { success: false, error: "Panier non trouvé" };
    }

    if (existingBasket.status !== "draft") {
      return {
        success: false,
        error: "Seuls les paniers en brouillon peuvent être modifiés",
      };
    }

    // Préparer les items pour le calcul au prorata
    const prorataItems = wishPrices
      .map((wp) => ({
        id: wp.id,
        price: Number.parseFloat(wp.unitPrice || "0"),
      }))
      .filter((item) => item.price > 0);

    // Calculer les parts de frais de port
    const shippingShares = calculateProrataShares(prorataItems, shippingCostNum);
    const sharesMap = new Map(shippingShares.map((s) => [s.id, s.share]));

    // Mettre à jour les frais de port du panier
    await db
      .update(basket)
      .set({ shippingCost: shippingCost || "0" })
      .where(eq(basket.id, basketId));

    // Mettre à jour chaque souhait
    for (const wishPrice of wishPrices) {
      const unitPriceNum = Number.parseFloat(wishPrice.unitPrice || "0");
      const shippingShare = sharesMap.get(wishPrice.id) || 0;
      const amountDue = calculateAmountDue(unitPriceNum, shippingShare, 0);

      await db
        .update(wish)
        .set({
          unitPrice: wishPrice.unitPrice || null,
          shippingShare: shippingShare.toFixed(2),
          amountDue: amountDue.toFixed(2),
        })
        .where(eq(wish.id, wishPrice.id));
    }

    // Revalider le cache
    revalidatePath(`/admin/baskets/${basketId}`);
    revalidatePath(`/admin/baskets/${basketId}/edit`);
    revalidatePath(`/admin/orders/${existingBasket.orderId}`);

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du panier:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour",
    };
  }
}

/**
 * Server Action pour passer un panier en attente de validation
 */
export async function submitBasketForValidationAction(
  basketId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "Vous devez être administrateur",
      };
    }

    // Récupérer le panier avec ses souhaits
    const basketWithWishes = await db.query.basket.findFirst({
      where: eq(basket.id, basketId),
      with: {
        wishes: true,
      },
    });

    if (!basketWithWishes) {
      return { success: false, error: "Panier non trouvé" };
    }

    if (basketWithWishes.status !== "draft") {
      return { success: false, error: "Ce panier n'est pas en brouillon" };
    }

    // Vérifier que tous les prix sont renseignés
    const wishesWithoutPrice = basketWithWishes.wishes.filter(
      (w) => !w.unitPrice || Number.parseFloat(w.unitPrice) <= 0,
    );

    if (wishesWithoutPrice.length > 0) {
      return {
        success: false,
        error: `${wishesWithoutPrice.length} souhait(s) n'ont pas de prix renseigné`,
      };
    }

    // Vérifier les frais de port
    if (
      !basketWithWishes.shippingCost ||
      Number.parseFloat(basketWithWishes.shippingCost) < 0
    ) {
      return {
        success: false,
        error: "Les frais de port doivent être renseignés",
      };
    }

    // Passer en attente de validation
    await db
      .update(basket)
      .set({ status: "awaiting_validation" })
      .where(eq(basket.id, basketId));

    // Mettre à jour le statut des souhaits
    for (const w of basketWithWishes.wishes) {
      await db
        .update(wish)
        .set({ status: "validated" })
        .where(eq(wish.id, w.id));
    }

    revalidatePath(`/admin/baskets/${basketId}`);
    revalidatePath(`/admin/orders/${basketWithWishes.orderId}`);

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la soumission du panier:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}
