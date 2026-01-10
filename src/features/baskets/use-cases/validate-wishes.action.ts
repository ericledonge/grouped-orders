"use server";

import { revalidatePath } from "next/cache";
import { basketRepository } from "../domain/basket.repository";
import { wishRepository } from "@/features/wishes/domain/wish.repository";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { adminRepository } from "@/features/notifications/domain/admin.repository";
import { notificationService } from "@/features/notifications/domain/notification.service";

export interface ValidateWishesState {
  success: boolean;
  error?: string;
}

interface WishValidation {
  wishId: string;
  action: "validate" | "refuse";
}

/**
 * Valide ou refuse les souhaits d'un membre dans un panier
 */
export async function validateWishesAction(
  basketId: string,
  validations: WishValidation[],
): Promise<ValidateWishesState> {
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

    // Vérifier que le panier existe et est en attente de validation
    const basket = await basketRepository.findById(basketId);

    if (!basket) {
      return {
        success: false,
        error: "Panier non trouvé",
      };
    }

    if (basket.status !== "awaiting_validation") {
      return {
        success: false,
        error: "Ce panier n'est plus en attente de validation",
      };
    }

    // Vérifier que tous les souhaits appartiennent à l'utilisateur
    for (const validation of validations) {
      const wish = await wishRepository.findById(validation.wishId);

      if (!wish) {
        return {
          success: false,
          error: `Souhait ${validation.wishId} non trouvé`,
        };
      }

      if (wish.userId !== session.user.id) {
        return {
          success: false,
          error: "Vous ne pouvez pas valider les souhaits d'un autre membre",
        };
      }

      if (wish.basketId !== basketId) {
        return {
          success: false,
          error: "Ce souhait n'appartient pas à ce panier",
        };
      }
    }

    // Collecter les refus pour notification aux admins
    const refusedWishes: Array<{ gameName: string }> = [];

    // Mettre à jour les souhaits
    for (const validation of validations) {
      const newStatus = validation.action === "validate" ? "validated" : "refused";
      
      // Calculer le montant dû si validé
      const wishData = await wishRepository.findById(validation.wishId);
      if (!wishData) continue;

      const unitPrice = wishData.unitPrice ? Number.parseFloat(wishData.unitPrice) : 0;
      const shippingShare = wishData.shippingShare ? Number.parseFloat(wishData.shippingShare) : 0;
      const customsShare = wishData.customsShare ? Number.parseFloat(wishData.customsShare) : 0;
      const amountDue = validation.action === "validate" 
        ? (unitPrice + shippingShare + customsShare).toFixed(2)
        : "0";

      await wishRepository.update(validation.wishId, {
        status: newStatus,
        amountDue: validation.action === "validate" ? amountDue : null,
        paymentStatus: validation.action === "validate" ? "pending" : undefined,
      });

      if (validation.action === "refuse") {
        refusedWishes.push({ gameName: wishData.gameName });
      }
    }

    // Notifier les admins des souhaits refusés
    if (refusedWishes.length > 0) {
      try {
        const adminIds = await adminRepository.findAllAdminIds();
        for (const refusedWish of refusedWishes) {
          await notificationService.notifyAdmins(adminIds, "wish_refused", {
            userName: session.user.name || session.user.email || "Un membre",
            gameName: refusedWish.gameName,
            basketId,
          });
        }
      } catch (notifError) {
        console.error("Erreur lors de l'envoi des notifications:", notifError);
      }
    }

    // Revalider les pages
    revalidatePath(`/baskets/${basketId}/validate`);
    revalidatePath("/my-baskets");
    revalidatePath(`/admin/baskets/${basketId}`);

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la validation des souhaits:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la validation",
    };
  }
}
