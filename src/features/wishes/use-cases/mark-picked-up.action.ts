"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { wishRepository } from "../domain/wish.repository";

export interface MarkPickedUpState {
  success: boolean;
  error?: string;
}

/**
 * Marque un souhait comme récupéré par le membre
 */
export async function markWishAsPickedUpAction(
  wishId: string,
): Promise<MarkPickedUpState> {
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

    // Récupérer le souhait
    const wish = await wishRepository.findById(wishId);

    if (!wish) {
      return {
        success: false,
        error: "Souhait non trouvé",
      };
    }

    // Vérifier que le souhait appartient à l'utilisateur
    if (wish.userId !== session.user.id) {
      return {
        success: false,
        error: "Ce souhait ne vous appartient pas",
      };
    }

    // Vérifier que le souhait est dans un statut permettant le retrait
    // Les souhaits validés et payés peuvent être récupérés quand le panier est disponible
    if (wish.status !== "validated" && wish.status !== "paid") {
      return {
        success: false,
        error: "Ce souhait ne peut pas être marqué comme récupéré",
      };
    }

    // Mettre à jour le souhait
    await wishRepository.update(wishId, {
      status: "picked_up",
    });

    // Mettre à jour la date de récupération via le repository direct
    const { db } = await import("@/lib/db");
    const { wish: wishTable } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");
    await db
      .update(wishTable)
      .set({ pickedUpAt: new Date() })
      .where(eq(wishTable.id, wishId));

    // Revalider les pages
    revalidatePath("/my-pickups");
    revalidatePath("/my-wishes");
    revalidatePath(`/admin/baskets/${wish.basketId}`);

    return { success: true };
  } catch (error) {
    console.error("Erreur lors du marquage comme récupéré:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}
