# Architecture - Grouped Order

## Vue d'ensemble

Cette application suit une architecture en couches inspirée de la Clean Architecture, adaptée aux contraintes et opportunités de Next.js 15 avec React Server Components.

### Principes directeurs

1. **Séparation des responsabilités** : UI, logique métier, accès aux données sont séparés
2. **Testabilité** : Chaque couche est testable indépendamment
3. **Modularité** : Organisation par feature, pas par type technique
4. **Type-safety** : TypeScript strict partout, types dérivés du schéma DB
5. **Server-First** : Privilégier les Server Components et Server Actions

---

## Structure de dossiers

```
src/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── auth/[...all]/       # Better Auth API routes
│   ├── admin/                    # Routes admin protégées
│   │   ├── dashboard/
│   │   ├── orders/
│   │   │   ├── page.tsx         # Liste des commandes
│   │   │   ├── new/
│   │   │   │   └── page.tsx     # Créer une commande
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Détails de la commande
│   │   │       └── edit/
│   │   │           └── page.tsx # Éditer la commande
│   │   ├── baskets/
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Détails du panier
│   │   │       ├── edit/
│   │   │       └── payments/
│   │   └── deposit-points/
│   ├── orders/                   # Routes membres
│   │   └── [id]/
│   │       ├── page.tsx         # Voir une commande
│   │       └── wishes/
│   │           └── new/
│   ├── my-wishes/               # Mes souhaits
│   ├── my-baskets/              # Mes paniers
│   ├── my-pickups/              # Mes retraits
│   ├── notifications/           # Centre de notifications
│   ├── auth/                    # Pages auth (Better Auth UI)
│   ├── layout.tsx               # Layout root
│   ├── page.tsx                 # Home (redirect)
│   └── providers.tsx            # Providers React

├── features/                     # Organisation par domaine métier
│   ├── orders/
│   │   ├── domain/              # Logique métier
│   │   │   ├── order.adapter.ts
│   │   │   ├── order.repository.ts
│   │   │   ├── order.service.ts
│   │   │   └── order.types.ts
│   │   └── use-cases/           # Composants et hooks
│   │       ├── create-order-form.tsx
│   │       ├── order-list.tsx
│   │       ├── order-details.tsx
│   │       └── use-order-form.ts
│   │
│   ├── wishes/
│   │   ├── domain/
│   │   │   ├── wish.adapter.ts
│   │   │   ├── wish.repository.ts
│   │   │   ├── wish.service.ts
│   │   │   └── wish.types.ts
│   │   └── use-cases/
│   │       ├── create-wish-form.tsx
│   │       ├── wish-list.tsx
│   │       └── wish-validation-panel.tsx
│   │
│   ├── baskets/
│   │   ├── domain/
│   │   │   ├── basket.adapter.ts
│   │   │   ├── basket.repository.ts
│   │   │   ├── basket.service.ts   # Calculs au prorata
│   │   │   └── basket.types.ts
│   │   └── use-cases/
│   │       ├── create-basket-form.tsx
│   │       ├── basket-edit-form.tsx
│   │       └── basket-payment-tracker.tsx
│   │
│   ├── payments/
│   │   ├── domain/
│   │   │   ├── payment.adapter.ts
│   │   │   ├── payment.repository.ts
│   │   │   ├── payment.service.ts
│   │   │   └── payment.types.ts
│   │   └── use-cases/
│   │       ├── payment-status-panel.tsx
│   │       └── payment-confirmation-dialog.tsx
│   │
│   ├── deposit-points/
│   │   ├── domain/
│   │   │   ├── deposit-point.adapter.ts
│   │   │   ├── deposit-point.repository.ts
│   │   │   ├── deposit-point.service.ts
│   │   │   └── deposit-point.types.ts
│   │   └── use-cases/
│   │       ├── deposit-point-list.tsx
│   │       └── deposit-point-form.tsx
│   │
│   └── notifications/
│       ├── domain/
│       │   ├── notification.adapter.ts
│       │   ├── notification.repository.ts
│       │   ├── notification.service.ts
│       │   └── notification.types.ts
│       └── use-cases/
│           ├── notification-bell.tsx
│           ├── notification-dropdown.tsx
│           └── notification-list.tsx

├── components/                   # Composants UI réutilisables (Atomic Design)
│   ├── atoms/                   # Composants de base
│   │   ├── button.tsx           # Shadcn button
│   │   ├── input.tsx            # Shadcn input
│   │   ├── badge.tsx            # Shadcn badge
│   │   ├── price-display.tsx    # Affichage formaté des prix
│   │   └── user-avatar.tsx      # Avatar utilisateur
│   │
│   ├── molecules/               # Combinaisons de composants
│   │   ├── status-badge.tsx     # Badge avec couleur selon statut
│   │   ├── order-type-chip.tsx  # Chip pour type de commande
│   │   ├── form-field.tsx       # Label + Input + Error
│   │   └── data-table.tsx       # Table réutilisable
│   │
│   ├── organisms/               # Composants complexes
│   │   ├── header.tsx           # Header avec navigation
│   │   ├── sidebar.tsx          # Sidebar admin
│   │   └── data-table-with-pagination.tsx
│   │
│   └── templates/               # Layouts de pages
│       ├── admin-layout.tsx
│       └── member-layout.tsx

├── lib/                          # Infrastructure et utilitaires
│   ├── auth/
│   │   ├── index.ts             # Better Auth config
│   │   └── auth-client.ts       # Client-side auth
│   │
│   ├── db/
│   │   ├── index.ts             # Drizzle client
│   │   ├── schema.ts            # Schéma complet (généré)
│   │   └── migrations/          # Migrations SQL
│   │
│   ├── email/                   # Service d'envoi d'emails
│   │   ├── sendgrid.ts
│   │   └── templates/
│   │
│   └── utils/                   # Utilitaires génériques
│       ├── cn.ts                # classnames helper
│       ├── format-date.ts
│       ├── format-price.ts
│       └── validation.ts        # Helpers Zod

├── styles/
│   └── globals.css              # Tailwind + styles globaux

└── middleware.ts                 # Protection des routes admin
```

---

## Modèle de données complet

### Schéma Drizzle

```typescript
// src/lib/db/schema.ts

import { pgTable, text, timestamp, boolean, decimal, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// ENUMS
// ============================================================

export const orderTypeEnum = pgEnum("order_type", [
  "monthly",
  "private_sale",
  "special",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "open",
  "in_progress",
  "completed",
]);

export const basketStatusEnum = pgEnum("basket_status", [
  "draft",
  "awaiting_validation",
  "validated",
  "awaiting_customs",
  "awaiting_reception",
  "awaiting_delivery",
  "available_pickup",
]);

export const wishStatusEnum = pgEnum("wish_status", [
  "submitted",
  "in_basket",
  "validated",
  "refused",
  "paid",
  "picked_up",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "sent",
  "received",
  "partial",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "wish_submitted",
  "basket_validation",
  "basket_customs",
  "payment_sent",
  "payment_received",
  "basket_received",
  "basket_available",
  "wish_refused",
]);

// ============================================================
// TABLES BETTER AUTH (générées automatiquement)
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
    .$onUpdate(() => new Date())
    .notNull(),
  role: text("role"), // 'admin' ou null (membre)
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

// session, account, verification : voir schéma actuel

// ============================================================
// DOMAIN TABLES
// ============================================================

export const order = pgTable("order", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: orderTypeEnum("type").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date").notNull(),
  status: orderStatusEnum("status").default("open").notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const basket = pgTable("basket", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => order.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: basketStatusEnum("status").default("draft").notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }),
  customsCost: decimal("customs_cost", { precision: 10, scale: 2 }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  receivedAt: timestamp("received_at"),
  availableAt: timestamp("available_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const depositPoint = pgTable("deposit_point", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const wish = pgTable("wish", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => order.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  basketId: uuid("basket_id").references(() => basket.id, {
    onDelete: "set null",
  }),
  depositPointId: uuid("deposit_point_id").references(() => depositPoint.id, {
    onDelete: "set null",
  }),
  gameName: text("game_name").notNull(),
  philbertReference: text("philibert_reference").notNull(),
  philbertUrl: text("philibert_url"),
  status: wishStatusEnum("status").default("submitted").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  shippingShare: decimal("shipping_share", { precision: 10, scale: 2 }),
  customsShare: decimal("customs_share", { precision: 10, scale: 2 }),
  amountDue: decimal("amount_due", { precision: 10, scale: 2 }),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).default("0"),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  paymentSentAt: timestamp("payment_sent_at"),
  paymentReceivedAt: timestamp("payment_received_at"),
  pickedUpAt: timestamp("picked_up_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const notification = pgTable("notification", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================
// RELATIONS
// ============================================================

export const orderRelations = relations(order, ({ one, many }) => ({
  creator: one(user, {
    fields: [order.createdBy],
    references: [user.id],
  }),
  baskets: many(basket),
  wishes: many(wish),
}));

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

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));
```

---

## Diagramme entité-relation

```
┌──────────────┐
│     USER     │
│ (Better Auth)│
└──────┬───────┘
       │
       │ created_by
       ▼
┌─────────────────┐         ┌──────────────────┐
│     ORDER       │◄────────┤     BASKET       │
│ - type          │ 1     * │ - name           │
│ - target_date   │         │ - shipping_cost  │
│ - status        │         │ - customs_cost   │
│ - description   │         │ - status         │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │ 1                         │ *
         │                           │
         │ *                         │ basket_id
         ▼                           ▼
    ┌────────────────────────────────┐
    │          WISH                  │
    │ - game_name                    │
    │ - philibert_reference          │
    │ - unit_price                   │
    │ - shipping_share               │
    │ - customs_share                │
    │ - amount_due / amount_paid     │
    │ - payment_status               │
    │ - status                       │
    └────────┬───────────────────────┘
             │
             │ deposit_point_id
             │
             ▼
    ┌────────────────────┐
    │   DEPOSIT_POINT    │
    │ - name             │
    │ - address          │
    │ - is_default       │
    └────────────────────┘

┌──────────────────────┐
│    NOTIFICATION      │
│ - user_id            │
│ - type               │
│ - title / message    │
│ - link               │
│ - read               │
└──────────────────────┘
```

---

## Architecture en couches

### Couche 1: Adapters (`.adapter.ts`)

**Responsabilité** : Communication directe avec la base de données ou APIs externes

**Caractéristiques** :
- Utilise Drizzle ORM pour les requêtes SQL
- Validation des inputs avec Zod (si nécessaire)
- Pas de logique métier
- Retourne des types du schéma DB bruts

**Exemple** :

```typescript
// src/features/orders/domain/order.adapter.ts

import { db } from "@/lib/db";
import { order, basket, wish } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { NewOrder, Order } from "./order.types";

export const orderAdapter = {
  async create(data: NewOrder): Promise<Order> {
    const [created] = await db
      .insert(order)
      .values(data)
      .returning();
    return created;
  },

  async findById(id: string): Promise<Order | undefined> {
    return await db.query.order.findFirst({
      where: eq(order.id, id),
      with: {
        creator: true,
        baskets: true,
        wishes: {
          with: {
            user: true,
          },
        },
      },
    });
  },

  async findAll(): Promise<Order[]> {
    return await db.query.order.findMany({
      orderBy: [desc(order.targetDate)],
      with: {
        creator: true,
      },
    });
  },

  async update(id: string, data: Partial<NewOrder>): Promise<Order> {
    const [updated] = await db
      .update(order)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(order.id, id))
      .returning();
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.delete(order).where(eq(order.id, id));
  },
};
```

---

### Couche 2: Repositories (`.repository.ts`)

**Responsabilité** : Envelopper les adapters avec React Query (optionnel si nécessaire)

**Caractéristiques** :
- Hooks React Query pour la gestion du cache
- Optimistic updates
- Invalidation du cache
- Pour cette application, peut être **optionnel** si on utilise principalement des Server Actions

**Exemple** (si React Query utilisé) :

```typescript
// src/features/orders/domain/order.repository.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderAdapter } from "./order.adapter";
import type { NewOrder } from "./order.types";

export const orderRepository = {
  useOrders: () => {
    return useQuery({
      queryKey: ["orders"],
      queryFn: () => orderAdapter.findAll(),
    });
  },

  useOrder: (id: string) => {
    return useQuery({
      queryKey: ["orders", id],
      queryFn: () => orderAdapter.findById(id),
      enabled: !!id,
    });
  },

  useCreateOrder: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: NewOrder) => orderAdapter.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      },
    });
  },
};
```

**Note** : Pour ce projet, on privilégiera les **Server Actions** plutôt que React Query pour les mutations, donc les repositories seront principalement utilisés pour les queries.

---

### Couche 3: Services (`.service.ts`)

**Responsabilité** : Logique métier pure (calculs, transformations, règles de gestion)

**Caractéristiques** :
- Fonctions factory (pas de classes)
- Pas d'accès direct à la DB (utilise les adapters si nécessaire)
- Testable unitairement (Vitest)
- Pas de dépendances React
- Fonctions `createXXXViewModel` pour préparer les données pour le UI

**Exemple** :

```typescript
// src/features/baskets/domain/basket.service.ts

import type { Wish } from "../wishes/domain/wish.types";
import type { BasketViewModel, ProrataCalculation } from "./basket.types";

/**
 * Calcule la répartition au prorata d'un coût total entre plusieurs items
 * @param items - Les items avec leur prix unitaire
 * @param totalCost - Le coût total à répartir
 * @returns Un tableau avec la part de chaque item
 */
export function calculateProrataShares(
  items: Array<{ id: string; unitPrice: number }>,
  totalCost: number
): ProrataCalculation[] {
  if (items.length === 0) return [];

  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice, 0);

  if (totalPrice === 0) {
    // Si le total est 0, on répartit équitablement
    const equalShare = totalCost / items.length;
    return items.map((item) => ({
      id: item.id,
      share: Number(equalShare.toFixed(2)),
    }));
  }

  // Calcul au prorata
  const shares = items.map((item) => ({
    id: item.id,
    share: Number(((item.unitPrice / totalPrice) * totalCost).toFixed(2)),
  }));

  // Correction des arrondis : ajuster le dernier item
  const totalShares = shares.reduce((sum, s) => sum + s.share, 0);
  const diff = Number((totalCost - totalShares).toFixed(2));
  if (diff !== 0 && shares.length > 0) {
    shares[shares.length - 1].share = Number(
      (shares[shares.length - 1].share + diff).toFixed(2)
    );
  }

  return shares;
}

/**
 * Calcule le montant total dû pour un souhait
 */
export function calculateWishTotal(wish: Wish): number {
  const unitPrice = Number(wish.unitPrice || 0);
  const shippingShare = Number(wish.shippingShare || 0);
  const customsShare = Number(wish.customsShare || 0);

  return Number((unitPrice + shippingShare + customsShare).toFixed(2));
}

/**
 * Crée le ViewModel pour l'affichage d'un panier
 */
export function createBasketViewModel(
  basket: any, // Type Drizzle brut avec relations
  currentUserId?: string
): BasketViewModel {
  const wishes = basket.wishes || [];
  const totalGames = wishes.reduce(
    (sum, w) => sum + Number(w.unitPrice || 0),
    0
  );
  const totalShipping = Number(basket.shippingCost || 0);
  const totalCustoms = Number(basket.customsCost || 0);
  const totalBasket = totalGames + totalShipping + totalCustoms;

  const myWishes = currentUserId
    ? wishes.filter((w) => w.userId === currentUserId)
    : [];

  const myTotal = myWishes.reduce(
    (sum, w) => sum + calculateWishTotal(w),
    0
  );

  return {
    id: basket.id,
    name: basket.name,
    status: basket.status,
    totalGames: Number(totalGames.toFixed(2)),
    totalShipping: Number(totalShipping.toFixed(2)),
    totalCustoms: Number(totalCustoms.toFixed(2)),
    totalBasket: Number(totalBasket.toFixed(2)),
    wishCount: wishes.length,
    myWishes,
    myTotal: Number(myTotal.toFixed(2)),
    canEdit: basket.status === "draft",
    canDelete: basket.status === "draft",
  };
}
```

---

### Couche 4: Use Cases (`.ts` / `.tsx`)

**Responsabilité** : Hooks React orchestrant l'état et les effets de bord

**Caractéristiques** :
- Hooks custom React
- Gère l'état local (useState, useReducer)
- Appelle les Server Actions
- Gère les effets de bord (toasts, redirections)
- Utilise les services pour les transformations

**Exemple** :

```typescript
// src/features/orders/use-cases/use-create-order.ts

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrderAction } from "./create-order.action";
import type { CreateOrderInput } from "../domain/order.types";

export function useCreateOrder() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const createOrder = async (data: CreateOrderInput) => {
    setIsPending(true);

    try {
      const result = await createOrderAction(data);

      if (result.success) {
        toast.success("Commande créée avec succès");
        router.push(`/admin/orders/${result.data.id}`);
      } else {
        toast.error(result.error || "Erreur lors de la création");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsPending(false);
    }
  };

  return {
    createOrder,
    isPending,
  };
}
```

**Server Action associée** :

```typescript
// src/features/orders/use-cases/create-order.action.ts

"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { orderAdapter } from "../domain/order.adapter";
import { createOrderSchema } from "../domain/order.validation";
import type { CreateOrderInput } from "../domain/order.types";

export async function createOrderAction(input: CreateOrderInput) {
  try {
    // 1. Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Valider l'input
    const validated = createOrderSchema.parse(input);

    // 3. Créer la commande
    const order = await orderAdapter.create({
      ...validated,
      createdBy: session.user.id,
    });

    // 4. Créer une notification pour les membres (optionnel)
    // await notificationService.notifyNewOrder(order);

    return { success: true, data: order };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}
```

---

### Couche 5: Views (`.tsx`)

**Responsabilité** : Composants UI avec logique minimale

**Caractéristiques** :
- Composants React purement UI
- Utilisent les hooks des use-cases
- Pas de logique métier
- Pas d'accès direct aux adapters/services
- Server Components par défaut, Client Components quand nécessaire

**Exemple** :

```typescript
// src/features/orders/use-cases/create-order-form.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Select } from "@/components/atoms/select";
import { Textarea } from "@/components/atoms/textarea";
import { useCreateOrder } from "./use-create-order";
import { createOrderSchema } from "../domain/order.validation";
import type { CreateOrderInput } from "../domain/order.types";

export function CreateOrderForm() {
  const { createOrder, isPending } = useCreateOrder();

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      type: "monthly",
      description: "",
      targetDate: new Date(),
    },
  });

  const onSubmit = async (data: CreateOrderInput) => {
    await createOrder(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label>Type de commande</label>
        <Select {...form.register("type")}>
          <option value="monthly">Mensuelle</option>
          <option value="private_sale">Vente privée</option>
          <option value="special">Spéciale</option>
        </Select>
      </div>

      <div>
        <label>Date cible</label>
        <Input type="date" {...form.register("targetDate")} />
      </div>

      <div>
        <label>Description (optionnelle)</label>
        <Textarea {...form.register("description")} />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Créer la commande"}
      </Button>
    </form>
  );
}
```

---

## Patterns et conventions

### Server Components vs Client Components

**Par défaut : Server Components**
- Toutes les pages (`page.tsx`)
- Les layouts
- Les composants de liste (sauf si interactions complexes)

**Quand utiliser Client Components (`"use client"`)** :
- Formulaires (react-hook-form)
- Hooks d'état (useState, useReducer)
- Hooks d'effet (useEffect, useLayoutEffect)
- Event handlers (onClick, onChange)
- Context providers
- Bibliothèques client-only (React Query, etc.)

### Server Actions

**Conventions** :
- Fichiers : `*.action.ts`
- Toujours `"use server"` en haut du fichier
- Retour standardisé : `{ success: boolean, data?: T, error?: string }`
- Validation Zod systématique
- Vérification de la session utilisateur
- Logs des erreurs

**Template** :

```typescript
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const inputSchema = z.object({
  // ...
});

export async function myAction(input: z.infer<typeof inputSchema>) {
  try {
    // 1. Auth check
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Validate input
    const validated = inputSchema.parse(input);

    // 3. Business logic
    const result = await doSomething(validated);

    // 4. Return success
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in myAction:", error);
    return { success: false, error: "Something went wrong" };
  }
}
```

### Types et Validation

**Organisation** :
- Types dérivés du schéma Drizzle : `typeof order.$inferSelect`
- Types personnalisés dans `*.types.ts`
- Schémas Zod dans `*.validation.ts`

**Exemple** :

```typescript
// src/features/orders/domain/order.types.ts

import type { order } from "@/lib/db/schema";
import { z } from "zod";
import { createOrderSchema } from "./order.validation";

// Types dérivés de Drizzle
export type Order = typeof order.$inferSelect;
export type NewOrder = typeof order.$inferInsert;

// Types custom pour les inputs
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// ViewModels
export type OrderViewModel = {
  id: string;
  type: string;
  typeLabel: string;
  targetDate: Date;
  status: string;
  statusLabel: string;
  description?: string;
  wishCount: number;
  basketCount: number;
  creatorName: string;
};
```

```typescript
// src/features/orders/domain/order.validation.ts

import { z } from "zod";

export const createOrderSchema = z.object({
  type: z.enum(["monthly", "private_sale", "special"]),
  targetDate: z.coerce.date().min(new Date(), {
    message: "La date cible doit être dans le futur",
  }),
  description: z.string().optional(),
});
```

### ViewModels

**Principe** : Transformer les données brutes DB en objets optimisés pour le UI

**Avantages** :
- Simplification du code dans les composants
- Logique de présentation centralisée
- Testable unitairement
- Pas de mapping dans les composants

**Quand créer un ViewModel ?**
- Calculs complexes (totaux, pourcentages)
- Formatage de dates/prix
- Libellés dynamiques (statuts, types)
- Agrégation de données de plusieurs tables

**Exemple** :

```typescript
export function createOrderViewModel(
  order: Order & { baskets: Basket[]; wishes: Wish[] }
): OrderViewModel {
  return {
    id: order.id,
    type: order.type,
    typeLabel: getOrderTypeLabel(order.type),
    targetDate: order.targetDate,
    status: order.status,
    statusLabel: getOrderStatusLabel(order.status),
    description: order.description || undefined,
    wishCount: order.wishes.length,
    basketCount: order.baskets.length,
    creatorName: order.creator.name,
  };
}

function getOrderTypeLabel(type: string): string {
  const labels = {
    monthly: "Mensuelle",
    private_sale: "Vente privée",
    special: "Spéciale",
  };
  return labels[type] || type;
}

function getOrderStatusLabel(status: string): string {
  const labels = {
    open: "Ouverte",
    in_progress: "En cours",
    completed: "Terminée",
  };
  return labels[status] || status;
}
```

---

## Middleware de protection

```typescript
// src/middleware.ts

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes publiques
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/privacy" ||
    pathname === "/terms"
  ) {
    return NextResponse.next();
  }

  // Vérifier la session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirection si non connecté
  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Routes admin : vérifier le rôle
  if (pathname.startsWith("/admin")) {
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## Gestion des erreurs

### Server Actions

```typescript
try {
  // ...
  return { success: true, data: result };
} catch (error) {
  if (error instanceof z.ZodError) {
    return { success: false, error: "Invalid input", details: error.errors };
  }

  console.error("Unexpected error:", error);
  return { success: false, error: "An unexpected error occurred" };
}
```

### Composants

```typescript
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

---

## Performance

### React Server Components
- Fetch des données au plus près du composant
- Pas de waterfall : fetch en parallèle quand possible
- Utiliser `Suspense` pour le streaming

### Images
- Utiliser `next/image` pour l'optimisation automatique
- Lazy loading par défaut

### Fonts
- `next/font` pour optimiser le chargement
- Preload des fonts critiques

---

## Prochaines étapes

Consulter les autres fichiers de documentation :
- [DOMAIN.md](./DOMAIN.md) - Règles métier et workflows
- [TESTING.md](./TESTING.md) - Stratégie de tests
- [UI-COMPONENTS.md](./UI-COMPONENTS.md) - Design system
- [BACKLOG.md](./BACKLOG.md) - User stories et planning
