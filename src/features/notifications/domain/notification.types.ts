import type { notification } from "@/lib/db/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

/**
 * Type pour une notification sélectionnée depuis la base de données
 */
export type Notification = InferSelectModel<typeof notification>;

/**
 * Type pour créer une nouvelle notification
 */
export type NewNotification = InferInsertModel<typeof notification>;

/**
 * Types de notifications disponibles
 */
export type NotificationType =
  | "wish_submitted"
  | "basket_ready"
  | "wish_validated"
  | "wish_refused"
  | "payment_sent"
  | "payment_received"
  | "basket_received"
  | "pickup_available"
  | "wish_picked_up";
