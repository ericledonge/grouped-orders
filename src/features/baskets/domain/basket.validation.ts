import { z } from "zod";

/**
 * Schéma de validation pour la création d'un panier
 */
export const createBasketSchema = z.object({
  orderId: z.string().uuid("L'ID de la commande doit être un UUID valide"),
  name: z
    .string()
    .min(1, "Le nom du panier est requis")
    .max(100, "Le nom du panier ne peut pas dépasser 100 caractères"),
  wishIds: z
    .array(z.string().uuid())
    .min(1, "Sélectionnez au moins un souhait"),
});

export type CreateBasketInput = z.infer<typeof createBasketSchema>;

/**
 * Schéma de validation pour la mise à jour des prix d'un panier
 */
export const updateBasketPricesSchema = z.object({
  basketId: z.string().uuid("L'ID du panier doit être un UUID valide"),
  shippingCost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Format de prix invalide")
    .refine(
      (val) => Number.parseFloat(val) >= 0,
      "Les frais doivent être >= 0",
    ),
  wishes: z.array(
    z.object({
      id: z.string().uuid(),
      unitPrice: z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, "Format de prix invalide")
        .refine((val) => Number.parseFloat(val) >= 0, "Le prix doit être >= 0"),
    }),
  ),
});

export type UpdateBasketPricesInput = z.infer<typeof updateBasketPricesSchema>;

/**
 * Schéma de validation pour l'ajout de frais de douane
 */
export const addCustomsCostSchema = z.object({
  basketId: z.string().uuid("L'ID du panier doit être un UUID valide"),
  customsCost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Format de prix invalide")
    .refine(
      (val) => Number.parseFloat(val) >= 0,
      "Les frais doivent être >= 0",
    ),
});

export type AddCustomsCostInput = z.infer<typeof addCustomsCostSchema>;
