import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { depositPoint } from "@/lib/db/schema";

/**
 * Type pour un point de dépôt sélectionné depuis la base de données
 */
export type DepositPoint = InferSelectModel<typeof depositPoint>;

/**
 * Type pour créer un nouveau point de dépôt
 */
export type NewDepositPoint = InferInsertModel<typeof depositPoint>;
