# Stratégie de Tests - Grouped Order

## Philosophie de test

### Principes directeurs

1. **Tests comme documentation vivante** : Les tests doivent clairement exprimer les règles métier et les critères d'acceptation
2. **TDD quand pertinent** : Écrire les tests E2E avant le code pour les features critiques
3. **Pyramide de tests** : Beaucoup de tests unitaires, quelques tests d'intégration, quelques tests E2E
4. **Confiance** : Chaque commit doit pouvoir être déployé en production avec confiance
5. **Rapidité** : Les tests doivent s'exécuter rapidement pour ne pas ralentir le développement

---

## Stack de tests

### Tests End-to-End (E2E)
- **Outil** : Playwright
- **Scope** : Workflows complets utilisateur
- **Exécution** : Local + CI (GitHub Actions)
- **Environnement** : Base de données de test (Neon branch)

### Tests Unitaires
- **Outil** : Vitest + React Testing Library
- **Scope** : Services, fonctions pures, calculs métier
- **Exécution** : Local + CI
- **Environnement** : Mocks et fixtures

### Tests d'Intégration
- **Outil** : Vitest
- **Scope** : Adapters + base de données
- **Exécution** : Local (optionnel en CI)
- **Environnement** : Base de données de test

---

## Configuration Playwright

### Installation

```bash
npm install -D @playwright/test
npx playwright install
```

### Configuration (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Fixtures d'authentification

```typescript
// tests/e2e/fixtures/auth.ts

import { test as base } from "@playwright/test";
import type { Page } from "@playwright/test";

type AuthFixtures = {
  adminPage: Page;
  memberPage: Page;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login as admin
    await page.goto("/auth/signin");
    await page.fill('input[name="email"]', "admin@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/admin/dashboard");

    await use(page);
    await context.close();
  },

  memberPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login as member
    await page.goto("/auth/signin");
    await page.fill('input[name="email"]', "member@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/orders");

    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
```

---

## Configuration Vitest

### Installation

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

### Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.config.*",
        "**/*.d.ts",
        "**/index.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Setup (`tests/setup.ts`)

```typescript
import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

---

## Structure des tests

```
tests/
├── e2e/                          # Tests End-to-End
│   ├── fixtures/
│   │   ├── auth.ts              # Fixtures d'authentification
│   │   └── seed.ts              # Données de test
│   ├── admin/
│   │   ├── orders.spec.ts       # Tests admin - commandes
│   │   ├── baskets.spec.ts      # Tests admin - paniers
│   │   └── payments.spec.ts     # Tests admin - paiements
│   ├── member/
│   │   ├── wishes.spec.ts       # Tests membre - souhaits
│   │   ├── validation.spec.ts   # Tests membre - validation
│   │   └── pickups.spec.ts      # Tests membre - retraits
│   └── smoke.spec.ts            # Tests de fumée (tag @smoke)
│
├── unit/                         # Tests unitaires
│   ├── services/
│   │   ├── basket.service.test.ts
│   │   ├── order.service.test.ts
│   │   └── notification.service.test.ts
│   └── utils/
│       ├── format-price.test.ts
│       └── format-date.test.ts
│
├── integration/                  # Tests d'intégration (optionnel)
│   ├── adapters/
│   │   ├── order.adapter.test.ts
│   │   └── basket.adapter.test.ts
│   └── workflows/
│       └── basket-workflow.test.ts
│
└── setup.ts                      # Configuration Vitest
```

---

## Tests E2E - Exemples

### Test Smoke (Happy Path)

```typescript
// tests/e2e/smoke.spec.ts

import { test, expect } from "./fixtures/auth";

test.describe("Smoke tests @smoke", () => {
  test("Admin can create order, member can create wish, admin can create basket", async ({
    adminPage,
    memberPage,
  }) => {
    // 1. Admin crée une commande
    await adminPage.goto("/admin/orders/new");
    await adminPage.selectOption('select[name="type"]', "monthly");
    await adminPage.fill('input[name="targetDate"]', "2025-12-31");
    await adminPage.fill('textarea[name="description"]', "Test order");
    await adminPage.click('button[type="submit"]');

    await expect(adminPage).toHaveURL(/\/admin\/orders\/[a-z0-9-]+/);
    await expect(adminPage.locator("h1")).toContainText("Test order");

    // Récupérer l'ID de la commande
    const orderId = adminPage.url().split("/").pop();

    // 2. Membre crée un souhait
    await memberPage.goto(`/orders/${orderId}/wishes/new`);
    await memberPage.fill('input[name="gameName"]', "Wingspan");
    await memberPage.fill('input[name="philbertReference"]', "PHI123456");
    await memberPage.click('button[type="submit"]');

    await expect(memberPage.locator(".toast")).toContainText(
      "Souhait créé avec succès"
    );

    // 3. Admin voit le souhait
    await adminPage.goto(`/admin/orders/${orderId}`);
    await expect(adminPage.locator("text=Wingspan")).toBeVisible();

    // 4. Admin crée un panier
    await adminPage.check('input[type="checkbox"][value="wish-1"]');
    await adminPage.click('button:has-text("Créer un panier")');

    await expect(adminPage).toHaveURL(/\/admin\/baskets\/[a-z0-9-]+\/edit/);
    await expect(adminPage.locator("text=Wingspan")).toBeVisible();
  });
});
```

---

### Test Admin - Création de commande

```typescript
// tests/e2e/admin/orders.spec.ts

import { test, expect } from "../fixtures/auth";

test.describe("Admin - Orders", () => {
  test("should create a new order with valid data", async ({ adminPage }) => {
    await adminPage.goto("/admin/orders/new");

    // Remplir le formulaire
    await adminPage.selectOption('select[name="type"]', "monthly");
    await adminPage.fill('input[name="targetDate"]', "2025-12-31");
    await adminPage.fill(
      'textarea[name="description"]',
      "Commande mensuelle de décembre"
    );

    // Soumettre
    await adminPage.click('button[type="submit"]');

    // Vérifications
    await expect(adminPage).toHaveURL(/\/admin\/orders\/[a-z0-9-]+/);
    await expect(adminPage.locator("h1")).toContainText(
      "Commande mensuelle de décembre"
    );
    await expect(adminPage.locator('[data-testid="order-type"]')).toContainText(
      "Mensuelle"
    );
    await expect(adminPage.locator('[data-testid="order-status"]')).toContainText(
      "Ouverte"
    );
  });

  test("should show error if target date is in the past", async ({
    adminPage,
  }) => {
    await adminPage.goto("/admin/orders/new");

    await adminPage.selectOption('select[name="type"]', "monthly");
    await adminPage.fill('input[name="targetDate"]', "2020-01-01");
    await adminPage.click('button[type="submit"]');

    // Vérifier l'erreur
    await expect(adminPage.locator(".error-message")).toContainText(
      "La date cible doit être dans le futur"
    );
  });

  test("should list all orders with filters", async ({ adminPage }) => {
    await adminPage.goto("/admin/orders");

    // Vérifier la présence de la liste
    await expect(adminPage.locator("table")).toBeVisible();

    // Filtrer par statut
    await adminPage.selectOption('select[name="status"]', "open");
    await adminPage.waitForTimeout(500); // Debounce

    // Vérifier que seules les commandes ouvertes sont affichées
    const rows = adminPage.locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const statusBadge = rows.nth(i).locator('[data-testid="status-badge"]');
      await expect(statusBadge).toContainText("Ouverte");
    }
  });
});
```

---

### Test Membre - Création de souhait

```typescript
// tests/e2e/member/wishes.spec.ts

import { test, expect } from "../fixtures/auth";

test.describe("Member - Wishes", () => {
  test("should create a new wish on open order", async ({ memberPage }) => {
    // Supposons qu'une commande ouverte existe (créée par le seed)
    const orderId = "test-order-id"; // À récupérer dynamiquement

    await memberPage.goto(`/orders/${orderId}/wishes/new`);

    // Remplir le formulaire
    await memberPage.fill('input[name="gameName"]', "Azul");
    await memberPage.fill('input[name="philbertReference"]', "PHI789012");
    await memberPage.fill(
      'input[name="philbertUrl"]',
      "https://www.philibert.com/azul"
    );

    // Soumettre
    await memberPage.click('button[type="submit"]');

    // Vérifications
    await expect(memberPage).toHaveURL(`/orders/${orderId}`);
    await expect(memberPage.locator(".toast")).toContainText(
      "Souhait créé avec succès"
    );
    await expect(memberPage.locator("text=Azul")).toBeVisible();
  });

  test("should not create wish without required fields", async ({
    memberPage,
  }) => {
    const orderId = "test-order-id";

    await memberPage.goto(`/orders/${orderId}/wishes/new`);

    // Soumettre sans remplir
    await memberPage.click('button[type="submit"]');

    // Vérifier les erreurs
    await expect(
      memberPage.locator('input[name="gameName"] + .error-message')
    ).toContainText("Le nom du jeu est requis");
    await expect(
      memberPage.locator('input[name="philbertReference"] + .error-message')
    ).toContainText("La référence Philibert est requise");
  });

  test("should delete own wish if status is submitted", async ({
    memberPage,
  }) => {
    await memberPage.goto("/my-wishes");

    // Trouver un souhait avec statut "Émis"
    const wishRow = memberPage.locator(
      'tr:has([data-testid="status-badge"]:has-text("Émis"))'
    );
    await wishRow.locator('button:has-text("Supprimer")').click();

    // Confirmer la suppression
    await memberPage.locator('button:has-text("Confirmer")').click();

    // Vérifier le toast
    await expect(memberPage.locator(".toast")).toContainText(
      "Souhait supprimé avec succès"
    );
  });
});
```

---

### Test Admin - Gestion des paniers avec calculs

```typescript
// tests/e2e/admin/baskets.spec.ts

import { test, expect } from "../fixtures/auth";

test.describe("Admin - Baskets", () => {
  test("should create basket and calculate shipping shares correctly", async ({
    adminPage,
  }) => {
    // Créer une commande et des souhaits (via seed ou setup)
    const orderId = "test-order-id";

    await adminPage.goto(`/admin/orders/${orderId}`);

    // Sélectionner 3 souhaits
    await adminPage.check('input[value="wish-1"]'); // 40$
    await adminPage.check('input[value="wish-2"]'); // 30$
    await adminPage.check('input[value="wish-3"]'); // 30$

    // Créer le panier
    await adminPage.click('button:has-text("Créer un panier")');
    await expect(adminPage).toHaveURL(/\/admin\/baskets\/[a-z0-9-]+\/edit/);

    // Remplir les prix
    await adminPage.fill('input[name="wishes[0].unitPrice"]', "40");
    await adminPage.fill('input[name="wishes[1].unitPrice"]', "30");
    await adminPage.fill('input[name="wishes[2].unitPrice"]', "30");
    await adminPage.fill('input[name="shippingCost"]', "20");

    // Vérifier les calculs automatiques
    const shippingShare1 = adminPage.locator(
      '[data-testid="wish-0-shipping-share"]'
    );
    const shippingShare2 = adminPage.locator(
      '[data-testid="wish-1-shipping-share"]'
    );
    const shippingShare3 = adminPage.locator(
      '[data-testid="wish-2-shipping-share"]'
    );

    await expect(shippingShare1).toContainText("8.00");
    await expect(shippingShare2).toContainText("6.00");
    await expect(shippingShare3).toContainText("6.00");

    // Vérifier le total
    const totalBasket = adminPage.locator('[data-testid="basket-total"]');
    await expect(totalBasket).toContainText("120.00"); // 100 + 20
  });

  test("should submit basket for validation", async ({ adminPage }) => {
    const basketId = "test-basket-id";

    await adminPage.goto(`/admin/baskets/${basketId}/edit`);

    // Remplir tous les champs requis (supposons qu'ils sont déjà remplis)
    await adminPage.click('button:has-text("Soumettre pour validation")');

    // Confirmer
    await adminPage.click('button:has-text("Confirmer")');

    // Vérifications
    await expect(adminPage.locator(".toast")).toContainText(
      "Panier soumis pour validation"
    );
    await expect(adminPage.locator('[data-testid="basket-status"]')).toContainText(
      "Attente de validation"
    );

    // Vérifier que le formulaire est maintenant en lecture seule
    const priceInput = adminPage.locator('input[name="wishes[0].unitPrice"]');
    await expect(priceInput).toBeDisabled();
  });
});
```

---

### Test Membre - Validation de souhaits

```typescript
// tests/e2e/member/validation.spec.ts

import { test, expect } from "../fixtures/auth";

test.describe("Member - Wish Validation", () => {
  test("should validate wishes in basket", async ({ memberPage }) => {
    const basketId = "test-basket-id";

    await memberPage.goto(`/baskets/${basketId}/validate`);

    // Vérifier que les prix sont affichés
    const wish1 = memberPage.locator('[data-testid="wish-1"]');
    await expect(wish1.locator('[data-testid="unit-price"]')).toContainText(
      "40.00"
    );
    await expect(wish1.locator('[data-testid="shipping-share"]')).toContainText(
      "8.00"
    );
    await expect(wish1.locator('[data-testid="total"]')).toContainText("48.00");

    // Valider le souhait 1
    await wish1.locator('input[value="validate"]').check();

    // Refuser le souhait 2
    const wish2 = memberPage.locator('[data-testid="wish-2"]');
    await wish2.locator('input[value="refuse"]').check();

    // Soumettre
    await memberPage.click('button:has-text("Confirmer mes choix")');

    // Vérifications
    await expect(memberPage.locator(".toast")).toContainText(
      "Vos choix ont été enregistrés"
    );
    await expect(memberPage).toHaveURL("/my-baskets");
  });

  test("should indicate payment sent", async ({ memberPage }) => {
    const basketId = "test-basket-id";

    await memberPage.goto(`/baskets/${basketId}/validate`);

    // Vérifier le montant total à payer
    const totalDue = memberPage.locator('[data-testid="total-due"]');
    await expect(totalDue).toContainText("48.00");

    // Indiquer paiement envoyé
    await memberPage.click('button:has-text("J\'ai envoyé le paiement")');

    // Vérifications
    await expect(memberPage.locator(".toast")).toContainText(
      "Paiement enregistré"
    );
    await expect(
      memberPage.locator('[data-testid="payment-status"]')
    ).toContainText("Envoyé");
  });
});
```

---

## Tests Unitaires - Exemples

### Test du service de calcul au prorata

```typescript
// tests/unit/services/basket.service.test.ts

import { describe, it, expect } from "vitest";
import { calculateProrataShares } from "@/features/baskets/domain/basket.service";

describe("calculateProrataShares", () => {
  it("should calculate prorata shares correctly for equal prices", () => {
    const items = [
      { id: "1", unitPrice: 30 },
      { id: "2", unitPrice: 30 },
      { id: "3", unitPrice: 30 },
    ];

    const result = calculateProrataShares(items, 15);

    expect(result).toEqual([
      { id: "1", share: 5.0 },
      { id: "2", share: 5.0 },
      { id: "3", share: 5.0 },
    ]);
  });

  it("should calculate prorata shares correctly for different prices", () => {
    const items = [
      { id: "1", unitPrice: 40 },
      { id: "2", unitPrice: 30 },
      { id: "3", unitPrice: 30 },
    ];

    const result = calculateProrataShares(items, 20);

    expect(result).toEqual([
      { id: "1", share: 8.0 },
      { id: "2", share: 6.0 },
      { id: "3", share: 6.0 },
    ]);
  });

  it("should handle rounding and ensure total matches", () => {
    const items = [
      { id: "1", unitPrice: 33.33 },
      { id: "2", unitPrice: 33.33 },
      { id: "3", unitPrice: 33.34 },
    ];

    const result = calculateProrataShares(items, 10);

    const total = result.reduce((sum, r) => sum + r.share, 0);
    expect(total).toBe(10);
  });

  it("should handle single item", () => {
    const items = [{ id: "1", unitPrice: 50 }];

    const result = calculateProrataShares(items, 10);

    expect(result).toEqual([{ id: "1", share: 10.0 }]);
  });

  it("should handle zero total price by distributing equally", () => {
    const items = [
      { id: "1", unitPrice: 0 },
      { id: "2", unitPrice: 0 },
    ];

    const result = calculateProrataShares(items, 10);

    expect(result).toEqual([
      { id: "1", share: 5.0 },
      { id: "2", share: 5.0 },
    ]);
  });
});
```

---

### Test du service de ViewModel

```typescript
// tests/unit/services/basket.service.test.ts

import { describe, it, expect } from "vitest";
import { createBasketViewModel } from "@/features/baskets/domain/basket.service";

describe("createBasketViewModel", () => {
  it("should create correct ViewModel with all totals", () => {
    const basket = {
      id: "basket-1",
      name: "Panier 1",
      status: "draft",
      shippingCost: "20.00",
      customsCost: "15.00",
      wishes: [
        {
          id: "wish-1",
          userId: "user-1",
          unitPrice: "40.00",
          shippingShare: "8.00",
          customsShare: "9.38",
        },
        {
          id: "wish-2",
          userId: "user-2",
          unitPrice: "30.00",
          shippingShare: "6.00",
          customsShare: "5.62",
        },
      ],
    };

    const result = createBasketViewModel(basket, "user-1");

    expect(result).toEqual({
      id: "basket-1",
      name: "Panier 1",
      status: "draft",
      totalGames: 70.0,
      totalShipping: 20.0,
      totalCustoms: 15.0,
      totalBasket: 105.0,
      wishCount: 2,
      myWishes: [basket.wishes[0]],
      myTotal: 57.38, // 40 + 8 + 9.38
      canEdit: true,
      canDelete: true,
    });
  });

  it("should set canEdit to false if status is not draft", () => {
    const basket = {
      id: "basket-1",
      name: "Panier 1",
      status: "awaiting_validation",
      wishes: [],
    };

    const result = createBasketViewModel(basket);

    expect(result.canEdit).toBe(false);
    expect(result.canDelete).toBe(false);
  });
});
```

---

### Test des utilitaires de formatage

```typescript
// tests/unit/utils/format-price.test.ts

import { describe, it, expect } from "vitest";
import { formatPrice } from "@/lib/utils/format-price";

describe("formatPrice", () => {
  it("should format price with 2 decimals", () => {
    expect(formatPrice(42.5)).toBe("42.50 $");
    expect(formatPrice(100)).toBe("100.00 $");
  });

  it("should handle negative prices", () => {
    expect(formatPrice(-10.5)).toBe("-10.50 $");
  });

  it("should round to 2 decimals", () => {
    expect(formatPrice(42.567)).toBe("42.57 $");
    expect(formatPrice(42.563)).toBe("42.56 $");
  });
});
```

---

## Critères d'acceptation dans les tests

### Approche BDD (Behavior-Driven Development)

Chaque test E2E doit clairement exprimer un critère d'acceptation de la user story.

**Exemple** : Story 2.2.1 - Créer une commande

```typescript
test.describe("Story 2.2.1: Créer une commande", () => {
  test("GIVEN I am an admin, WHEN I create an order with valid data, THEN the order is created and I am redirected to its details page", async ({
    adminPage,
  }) => {
    // GIVEN: Utilisateur admin authentifié (fixture)

    // WHEN: Je crée une commande
    await adminPage.goto("/admin/orders/new");
    await adminPage.selectOption('select[name="type"]', "monthly");
    await adminPage.fill('input[name="targetDate"]', "2025-12-31");
    await adminPage.click('button[type="submit"]');

    // THEN: La commande est créée et je suis redirigé
    await expect(adminPage).toHaveURL(/\/admin\/orders\/[a-z0-9-]+/);
    await expect(adminPage.locator('[data-testid="order-status"]')).toContainText(
      "Ouverte"
    );
  });

  test("GIVEN I am an admin, WHEN I submit a form with a past target date, THEN I see an error message", async ({
    adminPage,
  }) => {
    await adminPage.goto("/admin/orders/new");
    await adminPage.selectOption('select[name="type"]', "monthly");
    await adminPage.fill('input[name="targetDate"]', "2020-01-01");
    await adminPage.click('button[type="submit"]');

    await expect(adminPage.locator(".error-message")).toContainText(
      "La date cible doit être dans le futur"
    );
  });
});
```

---

## Stratégie de Seed de données

### Seed pour les tests E2E

```typescript
// tests/e2e/fixtures/seed.ts

import { db } from "@/lib/db";
import { user, order, wish, basket, depositPoint } from "@/lib/db/schema";

export async function seedTestData() {
  // Créer des utilisateurs
  const [admin] = await db
    .insert(user)
    .values({
      id: "admin-1",
      name: "Admin Test",
      email: "admin@test.com",
      emailVerified: true,
      role: "admin",
    })
    .returning();

  const [member1] = await db
    .insert(user)
    .values({
      id: "member-1",
      name: "Member 1",
      email: "member1@test.com",
      emailVerified: true,
    })
    .returning();

  const [member2] = await db
    .insert(user)
    .values({
      id: "member-2",
      name: "Member 2",
      email: "member2@test.com",
      emailVerified: true,
    })
    .returning();

  // Créer une commande
  const [testOrder] = await db
    .insert(order)
    .values({
      id: "test-order-id",
      type: "monthly",
      targetDate: new Date("2025-12-31"),
      status: "open",
      createdBy: admin.id,
    })
    .returning();

  // Créer des souhaits
  await db.insert(wish).values([
    {
      id: "wish-1",
      orderId: testOrder.id,
      userId: member1.id,
      gameName: "Wingspan",
      philbertReference: "PHI123456",
      status: "submitted",
    },
    {
      id: "wish-2",
      orderId: testOrder.id,
      userId: member2.id,
      gameName: "Azul",
      philbertReference: "PHI789012",
      status: "submitted",
    },
  ]);

  // Créer un point de dépôt par défaut
  await db.insert(depositPoint).values({
    id: "deposit-1",
    name: "Point principal",
    address: "123 rue Test, Montréal",
    isDefault: true,
  });

  return {
    admin,
    member1,
    member2,
    testOrder,
  };
}

export async function cleanTestData() {
  await db.delete(wish);
  await db.delete(basket);
  await db.delete(order);
  await db.delete(depositPoint);
  await db.delete(user).where(eq(user.email, "admin@test.com"));
  await db.delete(user).where(eq(user.email, "member1@test.com"));
  await db.delete(user).where(eq(user.email, "member2@test.com"));
}
```

### Utilisation dans les tests

```typescript
import { test as base } from "@playwright/test";
import { seedTestData, cleanTestData } from "./seed";

export const test = base.extend({
  // Hook pour seed avant tous les tests
  async ({ }, use) {
    await seedTestData();
    await use();
    await cleanTestData();
  },
});
```

---

## CI/CD - GitHub Actions

### Workflow de tests

```yaml
# .github/workflows/test.yml

name: Tests

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: ${{ secrets.NEON_DATABASE_URL_TEST }}
      BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
      BETTER_AUTH_URL: http://localhost:3000

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Commandes npm

```json
{
  "scripts": {
    "test:unit": "vitest",
    "test:unit:ui": "vitest --ui",
    "test:unit:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:smoke": "playwright test --grep '@smoke'",
    "test:e2e:debug": "playwright test --debug",
    "test": "npm run test:unit && npm run test:e2e"
  }
}
```

---

## Checklist de tests pour chaque feature

Avant de considérer une feature comme terminée :

- [ ] **Test E2E du happy path** écrit et passant
- [ ] **Tests unitaires** pour la logique métier (services)
- [ ] **Tests des cas d'erreur** (validation, permissions)
- [ ] **Tests des calculs** (si applicable : prorata, totaux)
- [ ] **Tests de permissions** (admin vs membre)
- [ ] **Tests des notifications** (si applicable)
- [ ] Tous les tests passent en **local**
- [ ] Tous les tests passent en **CI**
- [ ] Coverage > 70% sur les services

---

## Bonnes pratiques

### Dos
✅ Utiliser des `data-testid` pour les éléments critiques
✅ Écrire des tests lisibles (Given-When-Then)
✅ Mocker les dépendances externes (emails, etc.)
✅ Utiliser des fixtures pour éviter la duplication
✅ Tester les cas d'erreur autant que les happy paths
✅ Vérifier les messages de toast/notification
✅ Tester l'accessibilité (roles ARIA)

### Don'ts
❌ Ne pas dépendre de l'ordre d'exécution des tests
❌ Ne pas utiliser `sleep()` ou `waitForTimeout()` sans raison
❌ Ne pas tester les détails d'implémentation (classes CSS, etc.)
❌ Ne pas ignorer les tests qui échouent
❌ Ne pas oublier de nettoyer les données de test

---

## Prochaines étapes

Consulter les autres fichiers de documentation :
- [BACKLOG.md](./BACKLOG.md) - User stories et planning
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture technique
- [DOMAIN.md](./DOMAIN.md) - Règles métier
- [UI-COMPONENTS.md](./UI-COMPONENTS.md) - Design system
