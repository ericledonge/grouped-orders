"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { basket, wish } from "@/lib/db/schema";
import { createBasketSchema } from "../domain/basket.validation";

export type CreateBasketState = {
  success: boolean;
  error?: string;
  basketId?: string;
};

/**
 * Server Action pour créer un nouveau panier
 * et y ajouter les souhaits sélectionnés
 */
export async function createBasketAction(
  _prevState: CreateBasketState,
  formData: FormData,
): Promise<CreateBasketState> {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "Vous devez être administrateur pour créer un panier",
      };
    }

    // Extraire les données du formulaire
    const rawData = {
      orderId: formData.get("orderId") as string,
      name: formData.get("name") as string,
      wishIds: formData.getAll("wishIds") as string[],
    };

    // Valider les données
    const validationResult = createBasketSchema.safeParse(rawData);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { success: false, error: errors };
    }

    const { orderId, name, wishIds } = validationResult.data;

    // Vérifier que tous les souhaits sont en statut "submitted"
    const wishesToAdd = await db
      .select()
      .from(wish)
      .where(eq(wish.orderId, orderId));

    const selectedWishes = wishesToAdd.filter((w) => wishIds.includes(w.id));

    // Vérifier que tous les souhaits sélectionnés existent et sont disponibles
    if (selectedWishes.length !== wishIds.length) {
      return {
        success: false,
        error: "Certains souhaits sélectionnés n'existent pas",
      };
    }

    const unavailableWishes = selectedWishes.filter(
      (w) => w.status !== "submitted",
    );
    if (unavailableWishes.length > 0) {
      return {
        success: false,
        error: "Certains souhaits sélectionnés ne sont plus disponibles",
      };
    }

    // Créer le panier
    const [newBasket] = await db
      .insert(basket)
      .values({
        orderId,
        name,
        status: "draft",
        createdBy: session.user.id,
      })
      .returning();

    // Mettre à jour les souhaits pour les associer au panier
    for (const wishId of wishIds) {
      await db
        .update(wish)
        .set({
          basketId: newBasket.id,
          status: "in_basket",
        })
        .where(eq(wish.id, wishId));
    }

    // Revalider le cache
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/admin/baskets/${newBasket.id}`);

    // Rediriger vers la page d'édition du panier
    redirect(`/admin/baskets/${newBasket.id}/edit`);
  } catch (error) {
    // Gérer l'erreur de redirection (Next.js lance une erreur pour redirect)
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Erreur lors de la création du panier:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création du panier",
    };
  }
}
