"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { wish } from "@/lib/db/schema";
import { depositPointRepository } from "../domain/deposit-point.repository";

export interface DepositPointActionState {
  success: boolean;
  error?: string;
}

const depositPointSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Nom trop long"),
  address: z
    .string()
    .min(1, "L'adresse est requise")
    .max(500, "Adresse trop longue"),
  isDefault: z.boolean().optional().default(false),
});

/**
 * Crée un nouveau point de dépôt
 */
export async function createDepositPointAction(
  prevState: DepositPointActionState,
  formData: FormData,
): Promise<DepositPointActionState> {
  try {
    await requireAdmin();

    const rawData = {
      name: formData.get("name"),
      address: formData.get("address"),
      isDefault: formData.get("isDefault") === "on",
    };

    const validatedData = depositPointSchema.safeParse(rawData);

    if (!validatedData.success) {
      const firstError = validatedData.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Données invalides",
      };
    }

    const { name, address, isDefault } = validatedData.data;

    // Si on crée un point par défaut, retirer le flag des autres
    if (isDefault) {
      const existingDefault = await depositPointRepository.findDefault();
      if (existingDefault) {
        await depositPointRepository.update(existingDefault.id, {
          isDefault: false,
        });
      }
    }

    await depositPointRepository.create({
      name,
      address,
      isDefault,
    });

    revalidatePath("/admin/deposit-points");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la création du point de dépôt:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création",
    };
  }
}

/**
 * Met à jour un point de dépôt
 */
export async function updateDepositPointAction(
  id: string,
  prevState: DepositPointActionState,
  formData: FormData,
): Promise<DepositPointActionState> {
  try {
    await requireAdmin();

    const rawData = {
      name: formData.get("name"),
      address: formData.get("address"),
    };

    const validatedData = depositPointSchema
      .omit({ isDefault: true })
      .safeParse(rawData);

    if (!validatedData.success) {
      const firstError = validatedData.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Données invalides",
      };
    }

    await depositPointRepository.update(id, validatedData.data);

    revalidatePath("/admin/deposit-points");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du point de dépôt:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour",
    };
  }
}

/**
 * Définit un point de dépôt comme défaut
 */
export async function setDefaultDepositPointAction(
  id: string,
): Promise<DepositPointActionState> {
  try {
    await requireAdmin();

    await depositPointRepository.setAsDefault(id);

    revalidatePath("/admin/deposit-points");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la définition par défaut:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}

/**
 * Supprime un point de dépôt
 */
export async function deleteDepositPointAction(
  id: string,
): Promise<DepositPointActionState> {
  try {
    await requireAdmin();

    // Vérifier si le point est utilisé par des souhaits
    const [usageCount] = await db
      .select({ count: count() })
      .from(wish)
      .where(eq(wish.depositPointId, id));

    if (usageCount && usageCount.count > 0) {
      return {
        success: false,
        error: `Ce point de dépôt est utilisé par ${usageCount.count} souhait(s) et ne peut pas être supprimé`,
      };
    }

    // Vérifier si c'est le point par défaut
    const point = await depositPointRepository.findById(id);
    if (point?.isDefault) {
      return {
        success: false,
        error: "Impossible de supprimer le point de dépôt par défaut",
      };
    }

    await depositPointRepository.delete(id);

    revalidatePath("/admin/deposit-points");

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du point de dépôt:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression",
    };
  }
}
