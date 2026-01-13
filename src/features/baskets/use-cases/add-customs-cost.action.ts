"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { wish } from "@/lib/db/schema";
import { basketRepository } from "../domain/basket.repository";
import { calculateProrataShares, calculateAmountDue } from "../domain/basket.service";
import { requireAdmin } from "@/lib/auth/session";

export interface AddCustomsCostState {
  success: boolean;
  error?: string;
}

/**
 * Ajoute les frais de douane à un panier et les répartit entre les souhaits validés
 */
export async function addCustomsCostAction(
  basketId: string,
  customsCost: number,
): Promise<AddCustomsCostState> {
  try {
    await requireAdmin();

    // Vérifier que le panier existe
    const basket = await basketRepository.findByIdWithWishes(basketId);

    if (!basket) {
      return {
        success: false,
        error: "Panier non trouvé",
      };
    }

    // Vérifier que le panier est dans un statut permettant l'ajout de frais de douane
    if (basket.status !== "awaiting_validation" && basket.status !== "validated") {
      return {
        success: false,
        error: "Les frais de douane ne peuvent être ajoutés qu'aux paniers validés ou en attente de validation",
      };
    }

    // Récupérer les souhaits validés ou payés (ceux qui doivent payer les douanes)
    const eligibleWishes = basket.wishes.filter(
      (w) => w.status === "validated" || w.status === "paid",
    );

    if (eligibleWishes.length === 0) {
      return {
        success: false,
        error: "Aucun souhait validé dans ce panier",
      };
    }

    // Calculer la répartition des frais de douane au prorata des prix
    const items = eligibleWishes.map((w) => ({
      id: w.id,
      price: w.unitPrice ? Number.parseFloat(w.unitPrice) : 0,
    }));

    const customsShares = calculateProrataShares(items, customsCost);
    const sharesMap = new Map(customsShares.map((s) => [s.id, s.share]));

    // Mettre à jour chaque souhait avec sa part de douane et le nouveau montant dû
    for (const w of eligibleWishes) {
      const customsShare = sharesMap.get(w.id) || 0;
      const unitPrice = w.unitPrice ? Number.parseFloat(w.unitPrice) : 0;
      const shippingShare = w.shippingShare ? Number.parseFloat(w.shippingShare) : 0;
      const newAmountDue = calculateAmountDue(unitPrice, shippingShare, customsShare);

      await db
        .update(wish)
        .set({
          customsShare: customsShare.toFixed(2),
          amountDue: newAmountDue.toFixed(2),
        })
        .where(eq(wish.id, w.id));
    }

    // Enregistrer les frais de douane sur le panier
    await basketRepository.updateCustomsCost(basketId, customsCost.toFixed(2));

    // Passer le panier en "awaiting_reception" (commande passée)
    await basketRepository.updateStatus(basketId, "awaiting_reception");

    // Revalider les pages
    revalidatePath(`/admin/baskets/${basketId}`);
    revalidatePath(`/admin/baskets/${basketId}/edit`);
    revalidatePath(`/admin/orders/${basket.orderId}`);
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'ajout des frais de douane:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'ajout des frais de douane",
    };
  }
}
