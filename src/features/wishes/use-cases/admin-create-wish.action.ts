"use server";

import { revalidatePath } from "next/cache";
import { orderRepository } from "@/features/orders/domain/order.repository";
import { userRepository } from "@/features/users/domain/user.repository";
import { requireAdmin } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { wishRepository } from "../domain/wish.repository";
import {
  type AdminCreateWishInput,
  adminCreateWishSchema,
} from "../domain/wish.validation";

/**
 * Server Action pour créer un souhait par un admin
 * Permet de créer un souhait pour un utilisateur existant ou un invité
 *
 * Règles de gestion :
 * - L'utilisateur doit être admin
 * - La commande doit exister et avoir le statut "open"
 * - Si ownerType = "user", l'utilisateur cible doit exister
 * - Si ownerType = "guest", le nom de l'invité doit être fourni
 * - Le souhait est créé avec le statut "submitted"
 */
export async function adminCreateWish(input: AdminCreateWishInput) {
  try {
    // 1. Vérifier que l'utilisateur est admin
    const session = await requireAdmin();

    // 2. Valider les données d'entrée
    const validatedData = adminCreateWishSchema.parse(input);

    // 3. Vérifier que la commande existe et est ouverte
    const order = await orderRepository.findById(validatedData.orderId);

    if (!order) {
      return {
        success: false,
        error: "Commande introuvable",
      };
    }

    if (order.status !== "open") {
      return {
        success: false,
        error: "Cette commande n'accepte plus de souhaits",
      };
    }

    // 4. Si utilisateur sélectionné, vérifier qu'il existe
    if (validatedData.ownerType === "user" && validatedData.userId) {
      const targetUser = await userRepository.findById(validatedData.userId);
      if (!targetUser) {
        return {
          success: false,
          error: "Membre introuvable",
        };
      }
    }

    // 5. Créer le souhait
    const wish = await wishRepository.createByAdmin({
      orderId: validatedData.orderId,
      userId:
        validatedData.ownerType === "user" ? validatedData.userId : undefined,
      guestName:
        validatedData.ownerType === "guest"
          ? validatedData.guestName
          : undefined,
      gameName: validatedData.gameName,
      philibertReference: validatedData.philibertReference,
      philibertUrl: validatedData.philibertUrl || null,
      createdBy: session.user.id,
    });

    // 6. Revalider les caches
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${validatedData.orderId}`);
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      wishId: wish.id,
    };
  } catch (error) {
    console.error("Error creating admin wish:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Erreur lors de la création du souhait"),
    };
  }
}
