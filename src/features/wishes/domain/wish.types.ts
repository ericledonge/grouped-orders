import type { wish } from "@/lib/db/schema";

/**
 * Type d'un souhait inféré depuis le schéma Drizzle
 */
export type Wish = typeof wish.$inferSelect;

/**
 * Type pour l'insertion d'un nouveau souhait
 */
export type NewWish = typeof wish.$inferInsert;
