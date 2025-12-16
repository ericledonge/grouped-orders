import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ============================================================
// ENUMS - Définition des types énumérés PostgreSQL
// ============================================================

/**
 * Type de commande groupée
 * - monthly: Commande mensuelle régulière
 * - private_sale: Vente privée ponctuelle
 * - special: Commande spéciale (événement, etc.)
 */
export const orderTypeEnum = pgEnum("order_type", [
  "monthly",
  "private_sale",
  "special",
]);

/**
 * Statut d'une commande
 * - open: Commande ouverte, accepte les souhaits
 * - in_progress: Commande en cours de traitement (paniers créés)
 * - completed: Commande terminée, tous les paniers livrés
 */
export const orderStatusEnum = pgEnum("order_status", [
  "open",
  "in_progress",
  "completed",
]);

/**
 * Statut d'un souhait
 * - submitted: Souhait soumis par le membre
 * - in_basket: Ajouté au panier Philibert
 * - validated: Validé par l'admin, sera commandé
 * - refused: Refusé par l'admin
 * - paid: Payé (commande passée)
 * - picked_up: Récupéré par le membre
 */
export const wishStatusEnum = pgEnum("wish_status", [
  "submitted",
  "in_basket",
  "validated",
  "refused",
  "paid",
  "picked_up",
]);

// ============================================================
// TABLES BETTER AUTH - Gérées par Better Auth
// ============================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role").default("user"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// ============================================================
// DOMAIN TABLES - Logique métier de l'application
// ============================================================

/**
 * Table des commandes groupées
 * Une commande est une période d'achat groupé avec une date cible de passage
 */
export const order = pgTable("order", {
  // Clé primaire : UUID auto-généré
  id: uuid("id").defaultRandom().primaryKey(),

  // Type de commande (enum: monthly, private_sale, special)
  type: orderTypeEnum("type").notNull(),

  // Description optionnelle de la commande
  description: text("description"),

  // Date cible de passage de la commande sur Philibert
  targetDate: timestamp("target_date").notNull(),

  // Statut de la commande (enum: open, in_progress, completed)
  status: orderStatusEnum("status").default("open").notNull(),

  // Référence vers l'utilisateur créateur (admin)
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),

  // Timestamps de création et modification
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Table des souhaits (wishes)
 * Un souhait représente la demande d'un jeu par un membre pour une commande donnée
 */
export const wish = pgTable("wish", {
  // Clé primaire : UUID auto-généré
  id: uuid("id").defaultRandom().primaryKey(),

  // Référence vers la commande groupée (cascade on delete: si la commande est supprimée, les souhaits le sont aussi)
  orderId: uuid("order_id")
    .notNull()
    .references(() => order.id, { onDelete: "cascade" }),

  // Référence vers l'utilisateur qui a fait le souhait (restrict on delete: ne pas supprimer un user avec des souhaits)
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),

  // Nom du jeu demandé
  gameName: text("game_name").notNull(),

  // Référence Philibert (ex: "PH3456789")
  philibertReference: text("philibert_reference").notNull(),

  // URL Philibert optionnelle
  philibertUrl: text("philibert_url"),

  // Statut du souhait (enum: submitted, in_basket, validated, refused, paid, picked_up)
  status: wishStatusEnum("status").default("submitted").notNull(),

  // Timestamps de création et modification
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================================
// RELATIONS - Définition des relations entre tables
// ============================================================

/**
 * Relations de la table order
 * - creator: L'utilisateur admin qui a créé la commande (many-to-one)
 * - wishes: Les souhaits associés à cette commande (one-to-many)
 */
export const orderRelations = relations(order, ({ one, many }) => ({
  creator: one(user, {
    fields: [order.createdBy],
    references: [user.id],
  }),
  wishes: many(wish),
}));

/**
 * Relations de la table wish
 * - order: La commande à laquelle appartient ce souhait (many-to-one)
 * - user: L'utilisateur qui a créé ce souhait (many-to-one)
 */
export const wishRelations = relations(wish, ({ one }) => ({
  order: one(order, {
    fields: [wish.orderId],
    references: [order.id],
  }),
  user: one(user, {
    fields: [wish.userId],
    references: [user.id],
  }),
}));
