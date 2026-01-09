import { z } from "zod";

/**
 * Schéma de validation pour la création d'un souhait
 */
export const createWishSchema = z.object({
  /**
   * ID de la commande (UUID)
   */
  orderId: z.string().uuid("L'ID de la commande est invalide"),

  /**
   * Nom du jeu de société
   */
  gameName: z
    .string()
    .min(1, "Le nom du jeu est requis")
    .max(200, "Le nom du jeu est trop long"),

  /**
   * Référence Philibert (ex: "PH3456789")
   */
  philibertReference: z
    .string()
    .min(1, "La référence Philibert est requise")
    .max(50, "La référence Philibert est trop longue"),

  /**
   * URL Philibert (optionnelle)
   */
  philibertUrl: z
    .string()
    .url("L'URL Philibert n'est pas valide")
    .optional()
    .or(z.literal("")),
});

/**
 * Type pour les données du formulaire de création de souhait
 */
export type CreateWishInput = z.infer<typeof createWishSchema>;
