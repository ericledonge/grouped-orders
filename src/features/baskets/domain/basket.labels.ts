import type { BasketStatus } from "./basket.types";

/**
 * Labels français pour les statuts de paniers
 */
export const BASKET_STATUS_LABELS: Record<BasketStatus, string> = {
  draft: "Brouillon",
  awaiting_validation: "En attente de validation",
  validated: "Validé",
  awaiting_customs: "En attente douane",
  awaiting_reception: "En attente réception",
  awaiting_delivery: "En attente livraison",
  available_pickup: "Disponible au retrait",
};
