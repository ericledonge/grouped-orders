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

/**
 * Type de propriétaire du souhait
 */
export const ownerTypeSchema = z.enum(["user", "guest"]);

/**
 * Schéma de validation pour la création d'un souhait par un admin
 * Permet de créer un souhait pour un utilisateur existant ou un invité
 */
export const adminCreateWishSchema = z
  .object({
    /**
     * ID de la commande (UUID)
     */
    orderId: z.string().uuid("L'ID de la commande est invalide"),

    /**
     * Type de propriétaire : utilisateur inscrit ou invité
     */
    ownerType: ownerTypeSchema,

    /**
     * ID de l'utilisateur (requis si ownerType = "user")
     */
    userId: z.string().optional(),

    /**
     * Nom de l'invité (requis si ownerType = "guest")
     */
    guestName: z
      .string()
      .min(1, "Le nom de l'invité est requis")
      .max(100, "Le nom de l'invité est trop long")
      .optional(),

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
  })
  .refine(
    (data) => {
      if (data.ownerType === "user") {
        return !!data.userId;
      }
      if (data.ownerType === "guest") {
        return !!data.guestName;
      }
      return false;
    },
    {
      message: "Sélectionnez un membre ou entrez un nom d'invité",
      path: ["ownerType"],
    },
  );

/**
 * Type pour les données du formulaire de création de souhait par admin
 */
export type AdminCreateWishInput = z.infer<typeof adminCreateWishSchema>;
