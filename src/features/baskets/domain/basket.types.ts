import type { basket, basketStatusEnum, wish } from "@/lib/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

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
