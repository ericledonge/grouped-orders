import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
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

/**
 * Statut d'un panier
 * - draft: Brouillon, en cours de création
 * - awaiting_validation: En attente de validation par les membres
 * - validated: Validé, prêt pour la commande
 * - awaiting_customs: En attente des frais de douane
 * - awaiting_reception: Commande passée, en attente de réception
 * - awaiting_delivery: Réceptionné, en attente de livraison aux points de dépôt
 * - available_pickup: Disponible au retrait
 */
export const basketStatusEnum = pgEnum("basket_status", [
  "draft",
  "awaiting_validation",
  "validated",
  "awaiting_customs",
  "awaiting_reception",
  "awaiting_delivery",
  "available_pickup",
]);

/**
 * Statut de paiement d'un souhait
 * - pending: En attente de paiement
 * - sent: Paiement envoyé par le membre
 * - received: Paiement reçu et confirmé
 * - partial: Paiement partiel reçu
 */
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "sent",
  "received",
  "partial",
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
 * Table des points de dépôt
 * Lieux où les membres peuvent récupérer leurs jeux
 */
export const depositPoint = pgTable("deposit_point", {
  // Clé primaire : UUID auto-généré
  id: uuid("id").defaultRandom().primaryKey(),

  // Nom du point de dépôt (ex: "Chez Jean", "Local association")
  name: text("name").notNull(),

  // Adresse complète du point de dépôt
  address: text("address").notNull(),

  // Point de dépôt par défaut
  isDefault: boolean("is_default").default(false).notNull(),

  // Timestamps de création et modification
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * Table des paniers (baskets)
 * Un panier regroupe plusieurs souhaits pour une commande sur Philibert
 */
export const basket = pgTable("basket", {
  // Clé primaire : UUID auto-généré
  id: uuid("id").defaultRandom().primaryKey(),

  // Référence vers la commande groupée
  orderId: uuid("order_id")
    .notNull()
    .references(() => order.id, { onDelete: "cascade" }),

  // Nom du panier (ex: "Panier 1 - Janvier 2026")
  name: text("name").notNull(),

  // Statut du panier
  status: basketStatusEnum("status").default("draft").notNull(),

  // Frais de port totaux du panier
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }),

  // Frais de douane totaux du panier
  customsCost: decimal("customs_cost", { precision: 10, scale: 2 }),

  // Référence vers l'utilisateur créateur (admin)
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),

  // Date de réception du colis
  receivedAt: timestamp("received_at"),

  // Date de disponibilité au retrait
  availableAt: timestamp("available_at"),

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

  // Référence vers le panier (nullable car un souhait peut ne pas encore être dans un panier)
  basketId: uuid("basket_id").references(() => basket.id, {
    onDelete: "set null",
  }),

  // Prix unitaire du jeu (renseigné par l'admin lors de la création du panier)
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),

  // Part des frais de port (calculée au prorata)
  shippingShare: decimal("shipping_share", { precision: 10, scale: 2 }),

  // Part des frais de douane (calculée au prorata)
  customsShare: decimal("customs_share", { precision: 10, scale: 2 }),

  // Référence vers le point de dépôt (nullable)
  depositPointId: uuid("deposit_point_id").references(() => depositPoint.id, {
    onDelete: "set null",
  }),

  // Statut du paiement
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),

  // Montant dû (calculé: unit_price + shipping_share + customs_share)
  amountDue: decimal("amount_due", { precision: 10, scale: 2 }),

  // Montant payé
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).default("0"),

  // Date d'envoi du paiement par le membre
  paymentSentAt: timestamp("payment_sent_at"),

  // Date de réception du paiement confirmée par l'admin
  paymentReceivedAt: timestamp("payment_received_at"),

  // Date de récupération du jeu par le membre
  pickedUpAt: timestamp("picked_up_at"),

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
 * - baskets: Les paniers associés à cette commande (one-to-many)
 */
export const orderRelations = relations(order, ({ one, many }) => ({
  creator: one(user, {
    fields: [order.createdBy],
    references: [user.id],
  }),
  wishes: many(wish),
  baskets: many(basket),
}));

/**
 * Relations de la table basket
 * - order: La commande à laquelle appartient ce panier (many-to-one)
 * - creator: L'utilisateur admin qui a créé le panier (many-to-one)
 * - wishes: Les souhaits dans ce panier (one-to-many)
 */
export const basketRelations = relations(basket, ({ one, many }) => ({
  order: one(order, {
    fields: [basket.orderId],
    references: [order.id],
  }),
  creator: one(user, {
    fields: [basket.createdBy],
    references: [user.id],
  }),
  wishes: many(wish),
}));

/**
 * Relations de la table wish
 * - order: La commande à laquelle appartient ce souhait (many-to-one)
 * - user: L'utilisateur qui a créé ce souhait (many-to-one)
 * - basket: Le panier dans lequel ce souhait est placé (many-to-one, nullable)
 * - depositPoint: Le point de dépôt assigné (many-to-one, nullable)
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
  basket: one(basket, {
    fields: [wish.basketId],
    references: [basket.id],
  }),
  depositPoint: one(depositPoint, {
    fields: [wish.depositPointId],
    references: [depositPoint.id],
  }),
}));

/**
 * Relations de la table depositPoint
 * - wishes: Les souhaits assignés à ce point de dépôt (one-to-many)
 */
export const depositPointRelations = relations(depositPoint, ({ many }) => ({
  wishes: many(wish),
}));
