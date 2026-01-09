"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { wishRepository } from "../domain/wish.repository";

export async function deleteWish(wishId: string) {
  try {
    const session = await requireMember();

    // Récupérer le souhait
    const wish = await wishRepository.findById(wishId);
    if (!wish) {
      return {
        success: false,
        error: "Souhait non trouvé",
      };
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (wish.userId !== session.user.id) {
      return {
        success: false,
        error: "Vous n'êtes pas autorisé à supprimer ce souhait",
      };
    }

    // Vérifier que le souhait est encore en statut "submitted"
    if (wish.status !== "submitted") {
      return {
        success: false,
        error: "Impossible de supprimer un souhait déjà traité",
      };
    }

    // Supprimer le souhait
    await wishRepository.delete(wishId);

    revalidatePath("/my-wishes");
    revalidatePath(`/admin/orders/${wish.orderId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting wish:", error);

    return {
      success: false,
      error: getErrorMessage(error, "Erreur lors de la suppression du souhait"),
    };
  }
}
