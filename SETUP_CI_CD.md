# Setup CI/CD - Guide complet

Ce guide explique comment configurer votre environnement pour que les tests E2E fonctionnent sur vos feature branches et en production.

## Architecture

### Feature Branches (Previews)
```
Push vers feature branch
  ↓
Vercel détecte et build (avec db:push)
  ↓
Vercel crée automatiquement une branche Neon
  ↓
Déploiement preview réussi
  ↓
GitHub Actions seed + tests E2E complets
```

### Production (main)
```
Merge vers main
  ↓
Vercel build production (avec db:migrate)
  ↓
Déploiement production réussi
  ↓
GitHub Actions smoke tests (homepage + login)
  ↓
Alerte si échec
```

---

## Étape 1 : Configuration Vercel

### 1.1 Activer le database branching

1. Allez dans votre projet Vercel
2. **Storage** → **Neon Database** → **Settings**
3. Activez **"Create a branch for each preview deployment"**
4. Sauvegardez

✅ Maintenant chaque feature branch aura sa propre DB isolée !

### 1.2 Configurer les Build Commands

#### Pour les Previews (feature branches)

1. **Settings** → **General** → **Build & Development Settings**
2. **Build Command** → `npm run build:preview`
   - Cela run `db:push` (plus rapide, idempotent)
3. **Override** → Cochez "Override" uniquement pour **Preview**

#### Pour la Production (main)

1. **Build Command** → `npm run build:production`
   - Cela run `db:migrate` (plus safe pour la prod)
2. Assurez-vous que c'est bien configuré pour **Production** uniquement

### 1.3 Variables d'environnement

Vérifiez que ces variables sont bien configurées dans Vercel :

**Pour tous les environnements** (Production, Preview, Development) :
- `DATABASE_URL` - ✅ Auto-configuré par Neon via Vercel
- `BETTER_AUTH_SECRET` - Secret aléatoire (générez avec `openssl rand -base64 32`)
- `BETTER_AUTH_URL` - Auto-détecté par Vercel
- `NEXT_PUBLIC_BETTER_AUTH_URL` - Auto-détecté par Vercel

---

## Étape 2 : Configuration GitHub

### 2.1 Secrets GitHub (optionnel pour maintenant)

Pour l'instant, vous n'avez **pas besoin** de secrets GitHub car :
- Les workflows utilisent les événements `deployment_status` de Vercel
- Vercel fournit automatiquement l'URL de déploiement

**Plus tard, si vous voulez des fonctionnalités avancées**, ajoutez :

1. Allez dans **GitHub** → **Settings** → **Secrets and variables** → **Actions**
2. Cliquez **New repository secret**
3. Ajoutez (optionnel) :
   - `VERCEL_TOKEN` - Pour API calls avancées
   - `NEON_API_KEY` - Si vous passez à Neon natif plus tard

### 2.2 Vérifier les workflows

Les workflows sont déjà en place :
- [`.github/workflows/preview.yml`](.github/workflows/preview.yml) - Tests E2E pour previews
- [`.github/workflows/production.yml`](.github/workflows/production.yml) - Smoke tests pour prod

---

## Étape 3 : Tester le setup

### Test 1 : Feature branch

1. Créez une nouvelle branche :
   ```bash
   git checkout -b feature/test-ci
   ```

2. Faites un petit changement et pushez :
   ```bash
   git add .
   git commit -m "test: verify CI/CD setup"
   git push origin feature/test-ci
   ```

3. Créez une Pull Request sur GitHub

4. Vérifiez dans **Vercel** :
   - ✅ Un déploiement preview démarre
   - ✅ Une branche Neon est créée (visible dans Vercel Storage)
   - ✅ Le build réussit avec `db:push`

5. Vérifiez dans **GitHub Actions** :
   - ✅ Le workflow "Preview Deployment Tests" se lance
   - ✅ Le seed crée l'utilisateur test
   - ✅ Les tests E2E passent
   - ✅ Un commentaire est posté sur la PR avec les résultats

### Test 2 : Production

1. Mergez la PR vers `main`

2. Vérifiez dans **Vercel** :
   - ✅ Un déploiement production démarre
   - ✅ Le build réussit avec `db:migrate`

3. Vérifiez dans **GitHub Actions** :
   - ✅ Le workflow "Production Deployment Tests" se lance
   - ✅ Les smoke tests passent
   - ✅ Si échec → une issue est créée automatiquement

---

## Étape 4 : Troubleshooting

### Le seed échoue avec "database not found"

**Cause** : La branche Neon n'a pas été créée ou `db:push` a échoué

**Solution** :
1. Vérifiez que database branching est activé dans Vercel
2. Regardez les logs du build Vercel pour voir si `db:push` a réussi
3. Vérifiez que `DATABASE_URL` est bien injecté

### Les tests échouent avec "navigation timeout"

**Cause** : Le déploiement Vercel n'est pas encore prêt

**Solution** :
- Augmentez les retries dans `playwright.config.ts` :
  ```ts
  retries: process.env.CI ? 3 : 2
  ```
- Ou ajoutez un petit délai au début du test :
  ```ts
  await page.waitForTimeout(5000);
  ```

### Les tests passent en preview mais échouent en prod

**Cause** : Différences entre DB de test et prod (données manquantes)

**Solution** :
- Le seed ne run pas en prod (normal)
- Assurez-vous que l'utilisateur de test existe en prod
- Ou créez un utilisateur de test manuellement en prod

### Le workflow ne se déclenche pas

**Cause** : GitHub n'a pas reçu l'événement `deployment_status` de Vercel

**Solution** :
1. Vérifiez dans **GitHub** → **Settings** → **Webhooks**
2. Cherchez le webhook Vercel
3. Vérifiez les "Recent Deliveries" pour voir s'il y a des erreurs

---

## Étape 5 : Prochaines améliorations (optionnel)

### Cleanup automatique des branches Neon

Quand vous mergez une PR, Vercel supprime automatiquement la branche Neon ✅

### Notifications Slack/Discord

Ajoutez une étape dans `.github/workflows/production.yml` pour notifier sur échec :
```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
```

### Tests de performance

Ajoutez Lighthouse CI pour mesurer les performances :
```yaml
- name: Run Lighthouse
  uses: treosh/lighthouse-ci-action@v10
```

---

## Commandes utiles

### En local

```bash
# Développement avec hot-reload
npm run dev

# Tester les migrations
npm run db:push        # Preview mode (rapide)
npm run db:migrate     # Production mode (avec historique)

# Tester le seed
npm run seed:test

# Tests E2E en local
npm run test:e2e          # Tous les tests
npm run test:e2e:ui       # Mode UI interactif
npm run test:e2e:smoke    # Uniquement smoke tests
npm run test:e2e:headed   # Voir le navigateur
```

### Vérifier la branche Neon actuelle

Dans votre terminal local :
```bash
echo $DATABASE_URL
```

Dans Vercel :
**Storage** → **Neon Database** → **Branches**

---

## Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans **GitHub Actions** → **Actions tab**
2. Vérifiez les logs de build dans **Vercel** → **Deployments**
3. Vérifiez que les variables d'env sont bien configurées
4. Testez le seed manuellement avec l'URL Vercel :
   ```bash
   BETTER_AUTH_URL=https://votre-preview.vercel.app npm run seed:test
   ```

---

## Résumé de la configuration

✅ **Vercel** : Database branching activé
✅ **Build Commands** : Différents pour preview vs production
✅ **GitHub Workflows** : preview.yml + production.yml
✅ **Tests** : Smoke tests (@smoke tag) pour la prod
✅ **Seed** : Utilisateur test créé automatiquement

Vous êtes prêt à tester ! 🚀
