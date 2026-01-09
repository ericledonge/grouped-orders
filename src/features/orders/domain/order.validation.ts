import { startOfDay } from "date-fns";
import { z } from "zod";

/**
 * Schéma de validation pour la création d'une commande
 */
export const createOrderSchema = z.object({
  type: z.enum(["monthly", "private_sale", "special"], {
    message: "Le type de commande est requis",
  }),

  targetDate: z
    .date({
      message: "La date cible est requise",
    })
    .refine(
      (date) => {
        const today = startOfDay(new Date());
        return date >= today;
      },
      {
        message: "La date cible ne peut pas être dans le passé",
      },
    ),

  description: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/**
 * Schéma de validation pour la mise à jour d'une commande
 */
export const updateOrderSchema = z.object({
  id: z.string().uuid({ message: "L'ID de la commande est invalide" }),

  type: z.enum(["monthly", "private_sale", "special"], {
    message: "Le type de commande est requis",
  }),

  targetDate: z
    .date({
      message: "La date cible est requise",
    })
    .refine(
      (date) => {
        const today = startOfDay(new Date());
        return date >= today;
      },
      {
        message: "La date cible ne peut pas être dans le passé",
      },
    ),

  description: z.string().optional(),
});

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
