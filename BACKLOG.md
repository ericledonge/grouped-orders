# Backlog - Grouped Order (Commandes Groupées Philibert)

## Vue d'ensemble du projet

Application web pour faciliter les achats groupés de jeux de société chez Philibert par une communauté québécoise. L'application gère le cycle complet depuis la création de commandes par les administrateurs jusqu'à la livraison des jeux aux membres.

### Objectifs principaux
- Simplifier la gestion des commandes groupées
- Assurer la transparence sur les coûts (jeux + frais de port + douanes)
- Faciliter le suivi des paiements et des livraisons
- Réduire les échanges emails grâce à un système centralisé

### Contraintes techniques
- Next.js 15.5.6 avec App Router et React Server Components
- Better Auth (email/password + Google OAuth)
- Drizzle ORM + Neon PostgreSQL
- Hébergement Vercel avec branching Neon (dev/prod)
- Shadcn UI avec dark/light theme
- Tests E2E (Playwright) et unitaires (Vitest + RTL)

---

## Roadmap - Phases de développement

### Phase 1: Fondations et Authentification ✅
**Statut**: Complété
- [x] Configuration projet Next.js + Turbopack
- [x] Configuration Better Auth (email/password + Google)
- [x] Configuration Neon Database + branching
- [x] Configuration Vercel CI/CD
- [x] Dark/Light theme avec next-themes
- [x] Better Auth UI intégré

### Phase 2: Core Domain - Commandes et Souhaits ✅
**Statut**: Complété
**Objectif**: Permettre la création de commandes et l'émission de souhaits
**Timeline estimée**: Sprint 1-2

### Phase 3: Gestion des Paniers 🟡
**Statut**: En cours
**Objectif**: Créer et gérer des paniers de commande avec calculs de frais
**Timeline estimée**: Sprint 3-4

### Phase 4: Workflow de Validation et Paiements
**Objectif**: Permettre la validation des souhaits et le suivi des paiements
**Timeline estimée**: Sprint 5-6

### Phase 5: Réception et Livraison
**Objectif**: Gérer la réception des colis et la livraison aux points de dépôt
**Timeline estimée**: Sprint 7

### Phase 6: Dashboard et Notifications In-App 🟡
**Objectif**: Tableau de bord des tâches à faire et événements
**Timeline estimée**: Sprint 8
**Note**: Dashboard admin de base implémenté en Phase 2

### Phase 7: Notifications Email (optionnel)
**Objectif**: Envoyer des notifications par email via SendGrid
**Timeline estimée**: Sprint 9-10

---

## Phase 2: Core Domain - Commandes et Souhaits

### Epic 2.1: Modèle de données de base

#### Story 2.1.1: Définir le schéma Drizzle pour les commandes
**En tant que** développeur
**Je veux** créer le schéma de base de données pour les commandes
**Afin de** pouvoir stocker les informations des commandes groupées

**Critères d'acceptation**:
- [x] Table `order` créée avec les champs:
  - `id` (UUID, PK)
  - `type` (enum: 'monthly', 'private_sale', 'special')
  - `description` (text, nullable)
  - `target_date` (date)
  - `status` (enum: 'open', 'in_progress', 'completed')
  - `created_by` (FK vers user)
  - `created_at`, `updated_at` (timestamps)
- [x] Migration Drizzle générée et appliquée
- [x] Types TypeScript générés depuis le schéma
- [x] Schéma validé en local et sur preview Vercel

**Points d'estimation**: 3
**Dépendances**: Aucune
**Statut**: ✅ Complété

---

#### Story 2.1.2: Définir le schéma Drizzle pour les souhaits
**En tant que** développeur
**Je veux** créer le schéma de base de données pour les souhaits
**Afin de** pouvoir stocker les demandes des membres

**Critères d'acceptation**:
- [x] Table `wish` créée avec les champs:
  - `id` (UUID, PK)
  - `order_id` (FK vers order)
  - `user_id` (FK vers user)
  - `game_name` (text)
  - `philibert_reference` (text)
  - `philibert_url` (text, nullable)
  - `status` (enum: 'submitted', 'in_basket', 'validated', 'refused', 'paid', 'picked_up')
  - `created_at`, `updated_at` (timestamps)
- [x] Relation one-to-many: order -> wishes
- [x] Relation many-to-one: wish -> user
- [x] Migration Drizzle générée et appliquée
- [x] Types TypeScript générés depuis le schéma

**Points d'estimation**: 2
**Dépendances**: Story 2.1.1
**Statut**: ✅ Complété

---

### Epic 2.2: Gestion des commandes (Admin)

#### Story 2.2.1: Créer une commande
**En tant qu'** administrateur
**Je veux** créer une nouvelle commande groupée
**Afin de** permettre aux membres d'émettre des souhaits

**Critères d'acceptation**:
- [x] Page `/admin/orders/new` accessible uniquement aux admins
- [x] Formulaire avec:
  - Type de commande (select: Mensuelle, Vente privée, Spéciale)
  - Date cible (date picker)
  - Description optionnelle (textarea)
- [x] Validation Zod côté serveur et client
- [x] Server Action pour créer la commande
- [x] Redirection vers `/admin/orders/{id}` après création
- [x] Toast de confirmation
- [x] Test E2E du happy path

**Règles de gestion**:
- La date cible doit être dans le futur
- Le créateur est automatiquement l'utilisateur connecté
- Le statut initial est "open"

**Points d'estimation**: 5
**Dépendances**: Story 2.1.1
**Statut**: ✅ Complété

---

#### Story 2.2.2: Lister les commandes
**En tant qu'** administrateur
**Je veux** voir toutes les commandes existantes
**Afin de** naviguer et gérer les commandes

**Critères d'acceptation**:
- [x] Page `/admin/orders` accessible uniquement aux admins
- [x] Liste affichant:
  - Type de commande (badge avec couleur)
  - Date cible
  - Statut (badge)
  - Nombre de souhaits
  - Actions (Voir détails, Éditer)
- [x] Tri par date cible (décroissant par défaut)
- [ ] Filtres par statut et type (reporté - nice to have)
- [ ] Pagination (20 items par page) (reporté - nice to have)
- [x] Test E2E

**Points d'estimation**: 5
**Dépendances**: Story 2.2.1
**Statut**: ✅ Complété (filtres et pagination reportés)

---

#### Story 2.2.3: Voir les détails d'une commande
**En tant qu'** administrateur
**Je veux** voir les détails d'une commande
**Afin de** suivre son avancement et gérer les souhaits

**Critères d'acceptation**:
- [x] Page `/admin/orders/{id}` accessible uniquement aux admins
- [x] Affichage des informations de la commande:
  - Type, date cible, description, statut
  - Statistiques: nombre de souhaits par statut
  - Liste des souhaits (voir Story 2.3.3)
- [x] Bouton "Éditer la commande"
- [ ] Bouton "Créer un panier" (reporté à Phase 3)
- [x] Test E2E

**Points d'estimation**: 3
**Dépendances**: Story 2.2.1
**Statut**: ✅ Complété

---

#### Story 2.2.4: Éditer une commande
**En tant qu'** administrateur
**Je veux** modifier les informations d'une commande
**Afin de** corriger des erreurs ou ajuster la date cible

**Critères d'acceptation**:
- [x] Page `/admin/orders/{id}/edit` accessible uniquement aux admins
- [x] Formulaire pré-rempli avec les données existantes
- [x] Validation Zod
- [x] Server Action pour mettre à jour
- [x] Redirection vers `/admin/orders/{id}` après modification
- [x] Toast de confirmation
- [x] Test E2E

**Règles de gestion**:
- Impossible de changer le type si des paniers existent
- La date cible ne peut pas être dans le passé

**Points d'estimation**: 3
**Dépendances**: Story 2.2.3
**Statut**: ✅ Complété

---

### Epic 2.3: Gestion des souhaits (Membres)

#### Story 2.3.1: Créer un souhait
**En tant que** membre
**Je veux** créer un souhait sur une commande ouverte
**Afin de** demander l'achat d'un jeu

**Critères d'acceptation**:
- [x] Page `/orders/{orderId}/wishes/new` accessible aux membres connectés
- [x] Formulaire avec:
  - Nom du jeu (text input)
  - Référence Philibert (text input)
  - URL Philibert optionnelle (text input)
- [x] Validation Zod (champs requis)
- [x] Server Action pour créer le souhait
- [x] Redirection vers `/my-wishes` après création
- [x] Toast de confirmation
- [x] Test E2E du happy path

**Règles de gestion**:
- Un membre peut créer plusieurs souhaits pour le même jeu (pas de contrainte d'unicité)
- Le souhait est automatiquement lié à l'utilisateur connecté
- Statut initial: "submitted"
- Impossible de créer un souhait sur une commande "completed"

**Points d'estimation**: 5
**Dépendances**: Story 2.1.2
**Statut**: ✅ Complété

---

#### Story 2.3.2: Lister mes souhaits
**En tant que** membre
**Je veux** voir tous mes souhaits
**Afin de** suivre leur avancement

**Critères d'acceptation**:
- [x] Page `/my-wishes` accessible aux membres connectés
- [x] Liste affichant mes souhaits avec:
  - Nom du jeu
  - Référence Philibert (lien si URL fournie)
  - Commande associée (type + date cible)
  - Statut (badge)
  - Prix (si disponible)
  - Actions (Voir détails, Supprimer si status=submitted)
- [x] Tri par date de création (décroissant)
- [ ] Filtres par commande et statut (reporté - nice to have)
- [ ] Pagination (reporté - nice to have)
- [x] Test E2E

**Points d'estimation**: 5
**Dépendances**: Story 2.3.1
**Statut**: ✅ Complété

---

#### Story 2.3.3: Voir les souhaits d'une commande (Admin)
**En tant qu'** administrateur
**Je veux** voir tous les souhaits d'une commande
**Afin de** créer des paniers

**Critères d'acceptation**:
- [x] Section "Souhaits" dans `/admin/orders/{id}`
- [x] Liste affichant:
  - Nom du membre
  - Nom du jeu
  - Référence Philibert
  - Statut
  - Panier associé (si applicable) - reporté Phase 3
  - Checkbox de sélection (pour créer un panier) - reporté Phase 3
- [x] Filtres par statut
- [x] Tri par date de soumission
- [ ] Action de masse: "Créer un panier avec les souhaits sélectionnés" (reporté Phase 3)
- [x] Test E2E

**Points d'estimation**: 5
**Dépendances**: Story 2.2.3, Story 2.3.1
**Statut**: ✅ Complété (checkboxes et paniers reportés à Phase 3)

---

#### Story 2.3.4: Supprimer un souhait (Membre)
**En tant que** membre
**Je veux** supprimer un souhait que j'ai créé
**Afin de** corriger une erreur ou changer d'avis

**Critères d'acceptation**:
- [x] Bouton "Supprimer" visible uniquement si status = "submitted"
- [x] Dialog de confirmation avant suppression
- [x] Server Action pour supprimer (hard delete)
- [x] Toast de confirmation
- [x] Test E2E

**Règles de gestion**:
- Impossible de supprimer un souhait déjà dans un panier (status != "submitted")

**Points d'estimation**: 2
**Dépendances**: Story 2.3.2
**Statut**: ✅ Complété

---

### Epic 2.4: Navigation et accès

#### Story 2.4.1: Middleware de protection des routes admin
**En tant que** développeur
**Je veux** protéger les routes `/admin/*` avec un middleware
**Afin que** seuls les administrateurs y accèdent

**Critères d'acceptation**:
- [x] Middleware Next.js vérifiant le rôle de l'utilisateur
- [x] Redirection vers `/auth/sign-in` si non connecté
- [x] Redirection vers `/` si connecté mais non admin
- [x] Test E2E tentant d'accéder en tant que membre

**Règles de gestion**:
- Rôle "admin" vérifié via `user.role === 'admin'`
- Les routes publiques restent accessibles

**Points d'estimation**: 3
**Dépendances**: Aucune
**Statut**: ✅ Complété

---

#### Story 2.4.2: Menu de navigation principal
**En tant qu'** utilisateur connecté
**Je veux** naviguer facilement dans l'application
**Afin d'** accéder aux différentes sections

**Critères d'acceptation**:
- [x] Header responsive avec logo
- [x] Menu différent selon le rôle:
  - **Membre**: Commandes, Mes souhaits, Mon compte
  - **Admin**: Dashboard, Commandes, Mon compte (Paniers ajouté en Phase 3)
- [x] Dropdown utilisateur (nom + avatar + déconnexion)
- [x] Indicateur actif sur la page courante
- [x] Menu mobile (Sheet)
- [x] Test E2E de navigation

**Points d'estimation**: 5
**Dépendances**: Aucune
**Statut**: ✅ Complété

---

#### Story 2.4.3: Page d'accueil contextuelle
**En tant qu'** utilisateur connecté
**Je veux** voir une page d'accueil adaptée à mon rôle
**Afin de** rapidement accéder aux informations pertinentes

**Critères d'acceptation**:
- [x] Route `/` redirige vers:
  - `/admin/dashboard` si admin
  - `/orders` si membre
- [x] Redirection vers `/auth/sign-in` si non connecté
- [x] Test E2E

**Points d'estimation**: 2
**Dépendances**: Story 2.4.1
**Statut**: ✅ Complété

---

## Phase 3: Gestion des Paniers

### Epic 3.1: Modèle de données des paniers

#### Story 3.1.1: Définir le schéma Drizzle pour les paniers
**En tant que** développeur
**Je veux** créer le schéma de base de données pour les paniers
**Afin de** gérer les groupements de souhaits

**Critères d'acceptation**:
- [x] Table `basket` créée avec les champs:
  - `id` (UUID, PK)
  - `order_id` (FK vers order)
  - `name` (text) - ex: "Panier 1 - Commande Janvier"
  - `status` (enum: 'draft', 'awaiting_validation', 'validated', 'awaiting_customs', 'awaiting_reception', 'awaiting_delivery', 'available_pickup')
  - `shipping_cost` (decimal, nullable)
  - `customs_cost` (decimal, nullable)
  - `created_by` (FK vers user)
  - `created_at`, `updated_at` (timestamps)
- [x] Migration appliquée
- [x] Types TypeScript générés

**Points d'estimation**: 3
**Dépendances**: Story 2.1.1
**Statut**: ✅ Complété

---

#### Story 3.1.2: Ajouter les champs prix aux souhaits
**En tant que** développeur
**Je veux** ajouter les informations de prix aux souhaits
**Afin de** calculer les coûts totaux

**Critères d'acceptation**:
- [x] Champs ajoutés à la table `wish`:
  - `basket_id` (FK vers basket, nullable)
  - `unit_price` (decimal, nullable) - prix du jeu
  - `shipping_share` (decimal, nullable) - part des frais de port
  - `customs_share` (decimal, nullable) - part des frais de douane
  - `deposit_point_id` (FK vers deposit_point, nullable)
  - `payment_status` (enum: pending, sent, received, partial)
  - `amount_due`, `amount_paid` (decimal)
  - `payment_sent_at`, `payment_received_at`, `picked_up_at` (timestamps)
- [x] Migration appliquée
- [x] Types TypeScript mis à jour

**Points d'estimation**: 2
**Dépendances**: Story 3.1.1
**Statut**: ✅ Complété

---

#### Story 3.1.3: Définir le schéma pour les points de dépôt
**En tant que** développeur
**Je veux** créer le schéma des points de dépôt
**Afin de** gérer les lieux de retrait

**Critères d'acceptation**:
- [x] Table `deposit_point` créée avec les champs:
  - `id` (UUID, PK)
  - `name` (text)
  - `address` (text)
  - `is_default` (boolean)
  - `created_at`, `updated_at` (timestamps)
- [ ] Seed avec un point de dépôt par défaut (reporté)
- [x] Migration appliquée

**Points d'estimation**: 2
**Dépendances**: Aucune
**Statut**: ✅ Complété

---

### Epic 3.2: Création et gestion des paniers (Admin)

#### Story 3.2.1: Créer un panier
**En tant qu'** administrateur
**Je veux** créer un panier à partir des souhaits disponibles
**Afin de** grouper les achats

**Critères d'acceptation**:
- [x] Page `/admin/orders/{orderId}/baskets/new`
- [x] Formulaire avec:
  - Nom du panier (auto-généré modifiable)
  - Liste des souhaits disponibles (status = 'submitted')
  - Checkboxes de sélection
  - Résumé par membre
- [x] Validation: au moins un souhait sélectionné
- [x] Server Action pour créer le panier
- [x] Souhaits sélectionnés passent en status "in_basket"
- [x] Redirection vers `/admin/baskets/{basketId}/edit`
- [ ] Test E2E (reporté)

**Règles de gestion**:
- Statut initial du panier: "draft"
- Un souhait ne peut être que dans un seul panier à la fois

**Points d'estimation**: 8
**Dépendances**: Story 3.1.1, Story 2.3.3
**Statut**: ✅ Complété

---

#### Story 3.2.2: Éditer un panier (ajouter prix et frais de port)
**En tant qu'** administrateur
**Je veux** saisir les prix des jeux et les frais de port
**Afin de** finaliser le panier avant validation

**Critères d'acceptation**:
- [x] Page `/admin/baskets/{basketId}/edit`
- [x] Pour chaque souhait du panier:
  - Input pour le prix unitaire
  - Affichage auto-calculé de la part de frais de port (au prorata)
- [x] Input pour les frais de port totaux du panier
- [x] Calcul automatique en temps réel:
  - Total des prix des jeux
  - Répartition des frais de port au prorata des prix
  - Total par souhait (prix + frais de port)
  - Total du panier
- [x] Bouton "Enregistrer le brouillon"
- [x] Bouton "Soumettre pour validation" avec dialog de confirmation
- [x] Server Action pour mettre à jour
- [ ] Test E2E avec calculs vérifiés (reporté)

**Règles de gestion**:
- La répartition des frais de port se fait au prorata du prix de chaque jeu
- Formule: `shipping_share = (unit_price / total_prices) * total_shipping_cost`
- Arrondissement à 2 décimales

**Points d'estimation**: 8
**Dépendances**: Story 3.2.1
**Statut**: ✅ Complété

---

#### Story 3.2.3: Service de calcul des frais au prorata
**En tant que** développeur
**Je veux** créer un service de calcul des frais au prorata
**Afin de** réutiliser cette logique pour frais de port et douanes

**Critères d'acceptation**:
- [x] Fichier `src/features/baskets/domain/basket.service.ts`
- [x] Fonction `calculateProrataShares(items, totalCost)` retournant les parts
- [x] Tests unitaires Vitest avec différents scénarios (20 tests):
  - 3 jeux de prix égaux
  - 3 jeux de prix différents
  - 1 jeu seul
  - Vérification des arrondis (total doit correspondre)
  - Scénarios réalistes (frais de port, douanes)
- [x] Fonctions utilitaires: `roundToTwoDecimals`, `calculateAmountDue`, `totalsMatch`
- [x] Documentation JSDoc

**Points d'estimation**: 5
**Dépendances**: Aucune
**Statut**: ✅ Complété

---

#### Story 3.2.4: Lister les paniers d'une commande
**En tant qu'** administrateur
**Je veux** voir tous les paniers d'une commande
**Afin de** suivre leur avancement

**Critères d'acceptation**:
- [x] Section "Paniers" dans `/admin/orders/{orderId}` via `BasketsSection`
- [x] Liste des paniers avec:
  - Nom
  - Statut (badge via `BasketStatusBadge`)
  - Nombre de souhaits
  - Total estimé
  - Actions (Voir, Éditer)
- [x] Bouton "Créer un nouveau panier"
- [ ] Test E2E (reporté)

**Points d'estimation**: 5
**Dépendances**: Story 3.2.1
**Statut**: ✅ Complété

---

#### Story 3.2.5: Retirer un souhait d'un panier
**En tant qu'** administrateur
**Je veux** retirer un souhait d'un panier
**Afin de** le remettre en attente d'affectation

**Critères d'acceptation**:
- [ ] Bouton "Retirer" sur chaque souhait dans `/admin/baskets/{basketId}/edit`
- [ ] Dialog de confirmation
- [ ] Server Action pour retirer le souhait
- [ ] Souhait repasse en status "submitted"
- [ ] Recalcul automatique des frais de port au prorata
- [ ] Toast de confirmation
- [ ] Test E2E

**Règles de gestion**:
- Impossible de retirer un souhait si status du panier != "draft"

**Points d'estimation**: 5
**Dépendances**: Story 3.2.2

---

#### Story 3.2.6: Supprimer un panier
**En tant qu'** administrateur
**Je veux** supprimer un panier
**Afin de** corriger une erreur

**Critères d'acceptation**:
- [ ] Bouton "Supprimer le panier" visible si status = "draft"
- [ ] Dialog de confirmation avec avertissement
- [ ] Server Action pour supprimer
- [ ] Tous les souhaits repassent en status "submitted"
- [ ] Redirection vers `/admin/orders/{orderId}`
- [ ] Test E2E

**Règles de gestion**:
- Impossible de supprimer un panier si status != "draft"

**Points d'estimation**: 3
**Dépendances**: Story 3.2.2

---

### Epic 3.3: Passage en validation

#### Story 3.3.1: Passer un panier en attente de validation
**En tant qu'** administrateur
**Je veux** finaliser un panier et le soumettre aux membres
**Afin qu'** ils valident leurs souhaits avec les prix

**Critères d'acceptation**:
- [x] Bouton "Soumettre pour validation" dans `/admin/baskets/{basketId}/edit`
- [x] Validation:
  - Tous les prix unitaires sont renseignés
  - Les frais de port sont renseignés
- [x] Dialog de confirmation avec récapitulatif
- [x] Server Action pour changer le status en "awaiting_validation"
- [x] Toast de confirmation
- [ ] Test E2E (reporté)

**Règles de gestion**:
- Le panier devient non-éditable après passage en validation

**Points d'estimation**: 5
**Dépendances**: Story 3.2.2
**Statut**: ✅ Complété

---

## Phase 4: Workflow de Validation et Paiements

### Epic 4.1: Validation des souhaits par les membres

#### Story 4.1.1: Voir les paniers en attente de validation (Membre)
**En tant que** membre
**Je veux** voir les paniers contenant mes souhaits en attente de validation
**Afin de** les valider ou les refuser

**Critères d'acceptation**:
- [ ] Page `/my-baskets` accessible aux membres
- [ ] Liste des paniers avec mes souhaits en attente
- [ ] Pour chaque panier:
  - Nom du panier
  - Commande associée
  - Liste de mes souhaits avec prix détaillés
  - Total à payer pour ce panier
  - Bouton "Valider mes souhaits" ou "Voir détails"
- [ ] Badge "Action requise" si validation en attente
- [ ] Test E2E

**Points d'estimation**: 5
**Dépendances**: Story 3.3.1

---

#### Story 4.1.2: Valider ou refuser un souhait
**En tant que** membre
**Je veux** valider ou refuser un souhait dans un panier
**Afin d'** accepter ou décliner l'achat avec le prix proposé

**Critères d'acceptation**:
- [ ] Page `/baskets/{basketId}/validate`
- [ ] Pour chaque de mes souhaits:
  - Nom du jeu
  - Prix unitaire
  - Frais de port
  - Total
  - Boutons radio: Valider / Refuser
- [ ] Total global de mes souhaits validés
- [ ] Bouton "Confirmer mes choix"
- [ ] Server Action pour mettre à jour les statuts:
  - Validé -> status "validated"
  - Refusé -> status "refused"
- [ ] Toast de confirmation
- [ ] Test E2E (scénarios: tout valider, tout refuser, mixte)

**Règles de gestion**:
- Le membre ne peut pas modifier les prix
- Si tous les souhaits d'un panier sont refusés, notifier l'admin (Phase 6)

**Points d'estimation**: 8
**Dépendances**: Story 4.1.1

---

### Epic 4.2: Suivi des paiements

#### Story 4.2.1: Ajouter les champs de paiement aux souhaits
**En tant que** développeur
**Je veux** ajouter les informations de paiement au schéma
**Afin de** suivre les paiements par souhait

**Critères d'acceptation**:
- [ ] Champs ajoutés à la table `wish`:
  - `payment_status` (enum: 'pending', 'sent', 'received', 'partial')
  - `amount_due` (decimal, nullable) - calculé automatiquement
  - `amount_paid` (decimal, default 0)
  - `payment_sent_at` (timestamp, nullable)
  - `payment_received_at` (timestamp, nullable)
- [ ] Migration appliquée
- [ ] Types TypeScript mis à jour

**Points d'estimation**: 2
**Dépendances**: Aucune

---

#### Story 4.2.2: Indiquer avoir envoyé un paiement (Membre)
**En tant que** membre
**Je veux** indiquer que j'ai envoyé mon paiement
**Afin d'** informer l'administrateur

**Critères d'acceptation**:
- [ ] Dans `/baskets/{basketId}/validate`, après validation
- [ ] Section "Paiement" affichant:
  - Total à payer
  - Statut du paiement
  - Bouton "J'ai envoyé le paiement" si status = pending
- [ ] Server Action pour marquer `payment_status = 'sent'`
- [ ] Timestamp `payment_sent_at` automatique
- [ ] Toast de confirmation
- [ ] Test E2E

**Règles de gestion**:
- Visible uniquement si au moins un souhait est validé
- Le montant dû est calculé automatiquement: sum(unit_price + shipping_share + customs_share)

**Points d'estimation**: 5
**Dépendances**: Story 4.2.1, Story 4.1.2

---

#### Story 4.2.3: Confirmer réception d'un paiement (Admin)
**En tant qu'** administrateur
**Je veux** confirmer la réception d'un paiement
**Afin de** suivre les paiements reçus

**Critères d'acceptation**:
- [ ] Page `/admin/baskets/{basketId}/payments`
- [ ] Liste des membres avec souhaits validés:
  - Nom du membre
  - Nombre de souhaits
  - Montant dû
  - Montant payé
  - Statut (badge)
  - Actions: Marquer comme reçu / Paiement partiel
- [ ] Dialog pour paiement partiel (saisir montant)
- [ ] Server Action pour mettre à jour:
  - `payment_status = 'received'` ou `'partial'`
  - `amount_paid`
  - `payment_received_at`
- [ ] Toast de confirmation
- [ ] Test E2E

**Points d'estimation**: 8
**Dépendances**: Story 4.2.2

---

### Epic 4.3: Ajout des frais de douane

#### Story 4.3.1: Ajouter les frais de douane à un panier
**En tant qu'** administrateur
**Je veux** ajouter les frais de douane après réception de la facture
**Afin de** les répartir entre les membres

**Critères d'acceptation**:
- [ ] Dans `/admin/baskets/{basketId}/edit`
- [ ] Bouton "Ajouter frais de douane" visible si status = "validated"
- [ ] Dialog avec input pour le montant total
- [ ] Server Action pour:
  - Enregistrer `customs_cost` sur le panier
  - Calculer `customs_share` pour chaque souhait validé (au prorata)
  - Mettre à jour `amount_due` de chaque souhait
  - Changer status en "awaiting_customs" puis "awaiting_reception"
- [ ] Toast de confirmation
- [ ] Test E2E avec vérification des calculs

**Règles de gestion**:
- Les frais de douane sont répartis uniquement sur les souhaits validés
- Formule identique aux frais de port (au prorata du prix)

**Points d'estimation**: 8
**Dépendances**: Story 3.2.3 (service de calcul), Story 4.2.1

---

## Phase 5: Réception et Livraison

### Epic 5.1: Workflow de réception

#### Story 5.1.1: Marquer un panier comme réceptionné
**En tant qu'** administrateur
**Je veux** indiquer qu'un panier a été réceptionné
**Afin de** notifier les membres

**Critères d'acceptation**:
- [ ] Dans `/admin/baskets/{basketId}`
- [ ] Bouton "Marquer comme réceptionné" visible si status = "awaiting_reception"
- [ ] Dialog de confirmation
- [ ] Server Action pour changer status en "awaiting_delivery"
- [ ] Champ `received_at` (timestamp) ajouté à la table `basket`
- [ ] Toast de confirmation
- [ ] Test E2E

**Points d'estimation**: 3
**Dépendances**: Story 4.3.1

---

### Epic 5.2: Livraison aux points de dépôt

#### Story 5.2.1: Gérer les points de dépôt (Admin)
**En tant qu'** administrateur
**Je veux** créer et gérer les points de dépôt
**Afin de** les assigner aux souhaits

**Critères d'acceptation**:
- [ ] Page `/admin/deposit-points`
- [ ] Liste des points de dépôt avec:
  - Nom
  - Adresse
  - Badge "Par défaut"
  - Actions (Éditer, Supprimer, Définir par défaut)
- [ ] Bouton "Ajouter un point de dépôt"
- [ ] Formulaire (nom, adresse, is_default)
- [ ] Server Actions (CRUD)
- [ ] Test E2E

**Règles de gestion**:
- Un seul point de dépôt peut être défini par défaut
- Impossible de supprimer un point utilisé par des souhaits

**Points d'estimation**: 5
**Dépendances**: Story 3.1.3

---

#### Story 5.2.2: Assigner les points de dépôt aux souhaits
**En tant qu'** administrateur
**Je veux** assigner un point de dépôt à chaque souhait
**Afin de** organiser la livraison

**Critères d'acceptation**:
- [ ] Dans `/admin/baskets/{basketId}`
- [ ] Colonne "Point de dépôt" avec select pour chaque souhait
- [ ] Par défaut: point de dépôt par défaut
- [ ] Server Action pour mettre à jour `deposit_point_id`
- [ ] Toast de confirmation
- [ ] Test E2E

**Règles de gestion**:
- L'assignation peut être faite à tout moment après création du panier

**Points d'estimation**: 5
**Dépendances**: Story 5.2.1

---

#### Story 5.2.3: Marquer un panier comme disponible au dépôt
**En tant qu'** administrateur
**Je veux** indiquer qu'un panier est disponible au point de dépôt
**Afin de** notifier les membres qu'ils peuvent récupérer leurs jeux

**Critères d'acceptation**:
- [ ] Dans `/admin/baskets/{basketId}`
- [ ] Bouton "Marquer comme disponible au dépôt" visible si status = "awaiting_delivery"
- [ ] Dialog de confirmation
- [ ] Server Action pour changer status en "available_pickup"
- [ ] Champ `available_at` (timestamp) ajouté à la table `basket`
- [ ] Toast de confirmation
- [ ] Test E2E

**Règles de gestion**:
- Tous les points de dépôt doivent être assignés avant de marquer disponible

**Points d'estimation**: 3
**Dépendances**: Story 5.1.1, Story 5.2.2

---

### Epic 5.3: Retrait par les membres

#### Story 5.3.1: Voir les jeux disponibles au retrait (Membre)
**En tant que** membre
**Je veux** voir mes jeux disponibles au retrait
**Afin de** savoir où et quand les récupérer

**Critères d'acceptation**:
- [ ] Page `/my-pickups` accessible aux membres
- [ ] Liste des paniers avec status "available_pickup" contenant mes souhaits validés
- [ ] Pour chaque panier:
  - Nom du panier
  - Point de dépôt (nom + adresse)
  - Liste de mes jeux
  - Bouton "Marquer comme récupéré"
- [ ] Test E2E

**Points d'estimation**: 5
**Dépendances**: Story 5.2.3

---

#### Story 5.3.2: Marquer un souhait comme récupéré (Membre)
**En tant que** membre
**Je veux** indiquer que j'ai récupéré mon jeu
**Afin de** clôturer le processus

**Critères d'acceptation**:
- [ ] Dans `/my-pickups`, bouton "Marquer comme récupéré"
- [ ] Dialog de confirmation
- [ ] Server Action pour changer status du souhait en "picked_up"
- [ ] Champ `picked_up_at` (timestamp) ajouté à la table `wish`
- [ ] Toast de confirmation
- [ ] Test E2E

**Points d'estimation**: 3
**Dépendances**: Story 5.3.1

---

## Phase 6: Dashboard et Notifications In-App

### Epic 6.1: Dashboard administrateur

#### Story 6.1.1: Vue d'ensemble des commandes actives
**En tant qu'** administrateur
**Je veux** voir un dashboard récapitulatif
**Afin d'** avoir une vue globale de l'activité

**Critères d'acceptation**:
- [x] Page `/admin/dashboard`
- [x] Cartes statistiques:
  - Nombre de commandes ouvertes
  - Nombre de souhaits en attente d'affectation
  - [ ] Nombre de paniers en attente de validation (Phase 3)
  - [ ] Nombre de paiements en attente (Phase 4)
- [x] Section "Actions requises" avec:
  - Nouveaux souhaits à traiter (derniers souhaits soumis)
  - [ ] Souhaits refusés récents (Phase 4)
  - [ ] Paiements envoyés à confirmer (Phase 4)
- [x] Liens directs vers les pages de gestion
- [ ] Test E2E

**Points d'estimation**: 8
**Dépendances**: Toutes les stories précédentes
**Statut**: 🟡 Partiellement complété (version de base, évoluera avec les phases)

---

### Epic 6.2: Notifications in-app

#### Story 6.2.1: Modèle de données des notifications
**En tant que** développeur
**Je veux** créer le schéma des notifications
**Afin de** stocker les événements pour les utilisateurs

**Critères d'acceptation**:
- [ ] Table `notification` créée avec les champs:
  - `id` (UUID, PK)
  - `user_id` (FK vers user)
  - `type` (enum: 'wish_submitted', 'basket_validation', 'payment_received', etc.)
  - `title` (text)
  - `message` (text)
  - `link` (text, nullable)
  - `read` (boolean, default false)
  - `created_at` (timestamp)
- [ ] Migration appliquée
- [ ] Types TypeScript générés

**Points d'estimation**: 3
**Dépendances**: Aucune

---

#### Story 6.2.2: Service de création de notifications
**En tant que** développeur
**Je veux** créer un service de notifications
**Afin de** générer des notifications lors d'événements métier

**Critères d'acceptation**:
- [ ] Fichier `src/features/notifications/domain/notification.service.ts`
- [ ] Fonction `createNotification(userId, type, data)` avec templates
- [ ] Templates pour chaque type:
  - `wish_submitted`: "Un nouveau souhait a été émis sur {order.name}"
  - `basket_validation`: "Un panier est prêt pour validation"
  - `payment_received`: "Votre paiement a été confirmé"
  - Etc.
- [ ] Tests unitaires Vitest
- [ ] Documentation JSDoc

**Points d'estimation**: 5
**Dépendances**: Story 6.2.1

---

#### Story 6.2.3: Intégrer les notifications dans les workflows
**En tant que** développeur
**Je veux** déclencher des notifications lors des actions métier
**Afin que** les utilisateurs soient informés

**Critères d'acceptation**:
- [ ] Appel du service de notifications dans les Server Actions:
  - Création de souhait -> notif admin
  - Passage en validation -> notif membres
  - Souhait refusé -> notif admin
  - Paiement envoyé -> notif admin
  - Paiement confirmé -> notif membre
  - Panier réceptionné -> notif membres
  - Panier disponible -> notif membres
- [ ] Tests E2E vérifiant la création des notifications

**Points d'estimation**: 8
**Dépendances**: Story 6.2.2, toutes les stories de workflows

---

#### Story 6.2.4: Centre de notifications dans le header
**En tant qu'** utilisateur
**Je veux** voir mes notifications non lues
**Afin d'** être informé des événements importants

**Critères d'acceptation**:
- [ ] Icône cloche dans le header avec badge (nombre de non lues)
- [ ] Dropdown affichant les 10 dernières notifications:
  - Icône selon le type
  - Titre et message
  - Date relative (il y a 2h)
  - Lien vers la page concernée
- [ ] Clic sur une notification:
  - Marque comme lue
  - Redirige vers le lien
- [ ] Bouton "Tout marquer comme lu"
- [ ] Lien "Voir toutes les notifications"
- [ ] Test E2E

**Points d'estimation**: 8
**Dépendances**: Story 6.2.3

---

#### Story 6.2.5: Page des notifications
**En tant qu'** utilisateur
**Je veux** voir toutes mes notifications
**Afin de** consulter l'historique

**Critères d'acceptation**:
- [ ] Page `/notifications` accessible à tous
- [ ] Liste paginée des notifications (50 par page)
- [ ] Filtres: Non lues / Toutes
- [ ] Tri par date (décroissant)
- [ ] Actions: Marquer comme lue / Supprimer
- [ ] Test E2E

**Points d'estimation**: 5
**Dépendances**: Story 6.2.4

---

## Phase 7: Notifications Email (Optionnel)

### Epic 7.1: Configuration SendGrid

#### Story 7.1.1: Configurer SendGrid
**En tant que** développeur
**Je veux** configurer SendGrid pour l'envoi d'emails
**Afin de** envoyer des notifications par email

**Critères d'acceptation**:
- [ ] Package `@sendgrid/mail` installé
- [ ] Variables d'environnement configurées:
  - `SENDGRID_API_KEY`
  - `SENDGRID_FROM_EMAIL`
- [ ] Service d'envoi d'email créé
- [ ] Test d'envoi fonctionnel

**Points d'estimation**: 3
**Dépendances**: Aucune

---

#### Story 7.1.2: Templates d'emails
**En tant que** développeur
**Je veux** créer des templates d'emails
**Afin d'** envoyer des emails formatés

**Critères d'acceptation**:
- [ ] Utilisation de React Email ou Resend
- [ ] Templates pour:
  - Nouvelle commande créée
  - Nouveau souhait émis
  - Panier en attente de validation
  - Frais de douane ajoutés
  - Panier réceptionné
  - Panier disponible au retrait
- [ ] Preview local des templates
- [ ] Tests d'envoi

**Points d'estimation**: 8
**Dépendances**: Story 7.1.1

---

#### Story 7.1.3: Intégrer les envois d'emails
**En tant que** développeur
**Je veux** déclencher les envois d'emails lors des événements
**Afin que** les utilisateurs reçoivent des notifications par email

**Critères d'acceptation**:
- [ ] Appel du service d'email dans les Server Actions (même points que notifications in-app)
- [ ] Gestion des erreurs d'envoi (retry, logs)
- [ ] Feature flag pour activer/désactiver les emails
- [ ] Tests E2E

**Points d'estimation**: 5
**Dépendances**: Story 7.1.2, Story 6.2.3

---

## Backlog technique transversal

### Architecture et qualité

#### Tech-1: Configuration des tests E2E Playwright ✅
**Statut**: Complété
**Critères d'acceptation**:
- [x] Configuration Playwright pour local et CI
- [x] Fixtures pour l'authentification (admin et membre)
- [x] Helpers pour les actions courantes (`tests/helpers/test-admin.ts`)
- [x] Scripts npm pour lancer les tests (`npm run test:e2e`)

**Points d'estimation**: 5

---

#### Tech-2: Configuration des tests unitaires Vitest ✅
**Statut**: Complété
**Critères d'acceptation**:
- [x] Configuration Vitest (`vitest.config.ts`)
- [ ] Helpers pour les tests de composants (reporté)
- [ ] Coverage configuré (minimum 70%) (reporté)
- [x] Scripts npm: `npm run test:unit`, `npm run test:unit:ui`
- [x] Tests pour `basket.service.ts` (20 tests)

**Points d'estimation**: 3

---

#### Tech-3: Seed de données de test ✅
**Statut**: Complété (version simplifiée)
**Critères d'acceptation**:
- [x] Script `scripts/seed-test.ts` créant:
  - 1 utilisateur admin
  - Utilisateurs membres
  - Commandes de test
  - Souhaits de test
- [ ] 5 paniers avec différents statuts (reporté Phase 3)
- [ ] 2 points de dépôt (reporté Phase 3)
- [x] Script exécutable via `npm run seed:test`

**Points d'estimation**: 5

---

#### Tech-4: Composants UI de base (Atomic Design) ✅
**Statut**: Complété
**Critères d'acceptation**:
- [x] Installation Shadcn UI (button, input, select, dialog, card, form, etc.)
- [x] Composants custom:
  - `OrderStatusBadge`, `OrderTypeBadge` (affiche les statuts/types avec couleurs)
  - `WishStatusBadge` (statuts des souhaits)
- [x] Organisation dans `src/components/ui/` et `src/features/*/components/`
- [x] Documentation dans UI-COMPONENTS.md

**Points d'estimation**: 5

---

#### Tech-5: Dark/Light theme ✅
**Statut**: Complété
- [x] next-themes configuré
- [x] Toggle dans le header

---

## Estimation globale

| Phase | Stories | Points | Sprints estimés | Statut |
|-------|---------|--------|-----------------|--------|
| Phase 2 | 14 | 56 | 2 sprints | ✅ Complété |
| Phase 3 | 11 | 52 | 2 sprints | 🟡 En cours (7/11 complétés) |
| Phase 4 | 7 | 38 | 1.5 sprints | À faire |
| Phase 5 | 8 | 29 | 1 sprint | À faire |
| Phase 6 | 6 | 37 | 1.5 sprints | À faire |
| Phase 7 | 3 | 16 | 1 sprint | À faire |
| Tech | 5 | 23 | Transversal | 3/5 complétés |
| **Total** | **54** | **251** | **~9-10 sprints** | |

---

## Priorisation MVP

Pour un MVP fonctionnel rapidement, prioriser dans l'ordre :

### Sprint 1 (Focus: Infrastructure + Commandes) ✅ Complété
- Tech-1, Tech-2, Tech-3, Tech-4
- Story 2.1.1, 2.1.2
- Story 2.2.1, 2.2.2, 2.2.3
- Story 2.4.1, 2.4.2, 2.4.3

### Sprint 2 (Focus: Souhaits + début Paniers) ✅ Complété
- Story 2.3.1, 2.3.2, 2.3.3
- Story 3.1.1, 3.1.2, 3.1.3
- Story 3.2.1, 3.2.2, 3.2.3, 3.2.4
- Story 3.3.1

### Sprint 3 (Focus: Paniers restants + Validation) 🟡 En cours
- Story 3.2.5, 3.2.6
- Story 4.1.1, 4.1.2

### Sprint 4 (Focus: Paiements + Douanes)
- Story 4.2.1, 4.2.2, 4.2.3
- Story 4.3.1

### Sprint 5 (Focus: Réception + Livraison)
- Story 5.1.1
- Story 5.2.1, 5.2.2, 5.2.3
- Story 5.3.1, 5.3.2

### Sprint 6 (Focus: Dashboard + Notifications)
- Story 6.1.1
- Story 6.2.1, 6.2.2, 6.2.3, 6.2.4

À ce stade, l'application est complètement fonctionnelle pour gérer le workflow complet !

---

## Définition of Done

Pour qu'une story soit considérée comme terminée :

- [ ] Code écrit et fonctionnel
- [ ] Tests E2E Playwright sur le happy path (si applicable)
- [ ] Tests unitaires Vitest sur la logique métier (services)
- [ ] Validation Biome sans erreurs (`npm run lint`)
- [ ] Types TypeScript sans erreurs (`npm run type-check`)
- [ ] Fonctionne en local (`npm run dev`)
- [ ] Fonctionne en preview Vercel (déployé sur branche)
- [ ] Schéma de base de données migré sur Neon (dev et preview)
- [ ] Revue de code (pair programming ou self-review)
- [ ] Documentation mise à jour si nécessaire

---

## Notes pour le vibecoding

- **Commencer petit** : Une story à la fois, en validant le déploiement à chaque fois
- **Tests d'abord** : Écrire les tests E2E avant le code (TDD) pour les features critiques
- **Itérer rapidement** : Ne pas chercher la perfection, mais la fonctionnalité
- **Branching Neon** : Utiliser une branche de dev pour tester les migrations sans risque
- **Preview Vercel** : Chaque branche Git = un environnement de preview automatique

Bon vibecoding ! 🚀
