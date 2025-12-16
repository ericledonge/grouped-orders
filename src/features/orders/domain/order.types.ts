/**
 * Types pour le domaine des commandes
 * Ces types sont dérivés du schéma Drizzle
 */

import type { order } from "@/lib/db/schema";

// Type représentant une commande complète (SELECT)
export type Order = typeof order.$inferSelect;

// Type pour insérer une nouvelle commande (INSERT)
export type NewOrder = typeof order.$inferInsert;

// Type pour les valeurs possibles du type de commande
export type OrderType = Order["type"];

// Type pour les valeurs possibles du statut de commande
export type OrderStatus = Order["status"];
