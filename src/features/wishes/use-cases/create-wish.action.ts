"use server";

import { revalidatePath } from "next/cache";
import { orderRepository } from "@/features/orders/domain/order.repository";
import { requireSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { wishRepository } from "../domain/wish.repository";
import {
  type CreateWishInput,
  createWishSchema,
} from "../domain/wish.validation";

/**
 * Server Action pour créer un souhait
 *
 * Règles de gestion :
 * - L'utilisateur doit être connecté
 * - La commande doit exister et avoir le statut "open"
 * - Le souhait est créé avec le statut "submitted"
 */
export async function createWish(input: CreateWishInput) {
  try {
    // 1. Vérifier que l'utilisateur est connecté
    const session = await requireSession();

    // 2. Valider les données d'entrée
    const validatedData = createWishSchema.parse(input);

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

    // 4. Créer le souhait
    const wish = await wishRepository.create({
      orderId: validatedData.orderId,
      userId: session.user.id,
      gameName: validatedData.gameName,
      philibertReference: validatedData.philibertReference,
      philibertUrl: validatedData.philibertUrl || null,
    });

    // 5. Revalider les caches
    revalidatePath("/orders");
    revalidatePath("/my-wishes");
    revalidatePath(`/admin/orders/${validatedData.orderId}`);

    return {
      success: true,
      wishId: wish.id,
    };
  } catch (error) {
    console.error("Error creating wish:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Erreur lors de la création du souhait"),
    };
  }
}
