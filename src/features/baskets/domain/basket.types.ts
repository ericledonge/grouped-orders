import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { basket, basketStatusEnum, wish } from "@/lib/db/schema";

/**
 * Type pour un panier sélectionné depuis la base de données
 */
export type Basket = InferSelectModel<typeof basket>;

/**
 * Type pour créer un nouveau panier
 */
export type NewBasket = InferInsertModel<typeof basket>;

/**
 * Type pour le statut d'un panier
 */
export type BasketStatus = (typeof basketStatusEnum.enumValues)[number];

/**
 * Type pour un panier avec ses souhaits
 */
export interface BasketWithWishes extends Basket {
  wishes: (InferSelectModel<typeof wish> & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  })[];
}

/**
 * Type pour un item dans le calcul au prorata
 */
export interface ProrataItem {
  id: string;
  price: number;
}

/**
 * Type pour le résultat du calcul au prorata
 */
export interface ProrataResult {
  id: string;
  share: number;
}

/**
 * Transitions de statut valides pour les paniers
 */
export const BASKET_STATUS_TRANSITIONS: Record<BasketStatus, BasketStatus[]> = {
  draft: ["awaiting_validation"],
  awaiting_validation: ["validated", "awaiting_reception"],
  validated: ["awaiting_reception"],
  awaiting_customs: ["awaiting_reception"],
  awaiting_reception: ["awaiting_delivery"],
  awaiting_delivery: ["available_pickup"],
  available_pickup: [],
};
