# Plan de Test Manuel - Grouped Order

Ce document décrit les scénarios de test manuel pour valider l'ensemble des fonctionnalités de l'application.

## Prérequis

### Comptes de test
1. **Compte Admin** : Créer un compte et le promouvoir admin via :
   ```bash
   npx tsx scripts/promote-admin.ts admin@test.com
   ```
2. **Compte Membre 1** : `membre1@test.com`
3. **Compte Membre 2** : `membre2@test.com`

### Environnement
- Application démarrée : `npm run dev`
- Base de données Neon connectée
- Navigateur avec DevTools ouvert (onglet Network pour vérifier les requêtes)

---

## Phase 1 : Authentification

### Test 1.1 : Inscription
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Aller sur `/auth/sign-up` | Formulaire d'inscription affiché |
| 2 | Remplir email, nom, mot de passe | Champs validés |
| 3 | Cliquer "Créer un compte" | Redirection vers page d'accueil, utilisateur connecté |

### Test 1.2 : Connexion / Déconnexion
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Se déconnecter (menu utilisateur) | Redirection vers `/auth/sign-in` |
| 2 | Se reconnecter avec les identifiants | Redirection vers `/`, header avec nom affiché |

### Test 1.3 : Protection des routes admin
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Se connecter en tant que **membre** | Pas de menu "Admin" visible |
| 2 | Accéder directement à `/admin/dashboard` | Redirection ou erreur 403 |
| 3 | Se connecter en tant que **admin** | Menu "Admin" visible, accès OK |

---

## Phase 2 : Gestion des Commandes (Admin)

### Test 2.1 : Créer une commande
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Admin → `/admin/orders` | Liste des commandes affichée |
| 2 | Cliquer "Nouvelle commande" | Formulaire de création |
| 3 | Remplir : Description "Commande Janvier 2026", Type "monthly", Date limite | Champs validés |
| 4 | Soumettre | Redirection vers la liste, nouvelle commande visible avec statut "Ouverte" |

### Test 2.2 : Modifier une commande
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Cliquer sur une commande existante | Page détail affichée |
| 2 | Cliquer "Modifier" | Formulaire pré-rempli |
| 3 | Changer la description | Sauvegarde OK, modification visible |

---

## Phase 3 : Gestion des Souhaits (Membre)

### Test 3.1 : Voir les commandes ouvertes
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Membre → `/orders` | Liste des commandes ouvertes |
| 2 | Cliquer sur une commande | Page avec bouton "Ajouter un souhait" |

### Test 3.2 : Ajouter un souhait
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Cliquer "Ajouter un souhait" | Formulaire de souhait |
| 2 | Remplir : Nom "Ark Nova", Référence "12345", URL Philibert | Champs validés |
| 3 | Soumettre | Toast "Souhait ajouté", souhait visible dans la liste |
| 4 | Vérifier `/my-wishes` | Le souhait apparaît avec statut "Soumis" |

### Test 3.3 : Notification admin nouveau souhait 🔔
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Se connecter en tant qu'admin | - |
| 2 | Vérifier l'icône cloche | Badge avec nombre de notifications non lues |
| 3 | Cliquer sur la cloche | Notification "Nouveau souhait" visible |
| 4 | Cliquer sur la notification | Redirection vers la commande concernée |

---

## Phase 4 : Gestion des Paniers (Admin)

### Test 4.1 : Créer un panier
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Admin → Détail d'une commande avec souhaits | Bouton "Créer un panier" visible |
| 2 | Cliquer "Créer un panier" | Formulaire avec liste des souhaits disponibles |
| 3 | Nommer "Panier Philibert #1", sélectionner 2-3 souhaits | - |
| 4 | Soumettre | Panier créé, visible dans la section "Paniers" |

### Test 4.2 : Éditer un panier (prix et frais)
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Cliquer sur le panier créé | Page détail du panier |
| 2 | Cliquer "Modifier" | Formulaire d'édition |
| 3 | Renseigner les prix unitaires (ex: 45.90€, 32.50€) | - |
| 4 | Renseigner les frais de port totaux (ex: 6.90€) | - |
| 5 | Sauvegarder | Parts de port calculées au prorata (vérifier les montants) |

### Test 4.3 : Retirer un souhait du panier
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Sur la page d'édition du panier | Bouton "Retirer" à côté de chaque souhait |
| 2 | Cliquer "Retirer" sur un souhait | Confirmation demandée |
| 3 | Confirmer | Souhait retiré, frais de port recalculés |

### Test 4.4 : Supprimer un panier
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Sur la page d'édition du panier | Bouton "Supprimer le panier" |
| 2 | Cliquer et confirmer | Panier supprimé, souhaits retournés à "Soumis" |

---

## Phase 5 : Workflow de Validation

### Test 5.1 : Passer un panier en validation
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Admin → Page détail d'un panier avec prix renseignés | Bouton "Passer en validation" |
| 2 | Cliquer | Statut passe à "En attente de validation" |
| 3 | Vérifier les souhaits | Statut passé à "Validé" |

### Test 5.2 : Notification membre panier prêt 🔔
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Se connecter en tant que membre concerné | - |
| 2 | Vérifier la cloche | Notification "Panier à valider" |
| 3 | Cliquer | Redirection vers `/baskets/{id}/validate` |

### Test 5.3 : Valider/Refuser ses souhaits (Membre)
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Membre → `/my-baskets` | Liste des paniers en attente de validation |
| 2 | Cliquer sur un panier | Page de validation avec ses souhaits |
| 3 | Cocher "Valider" pour un souhait, "Refuser" pour un autre | - |
| 4 | Soumettre | Redirection vers page de paiement |

### Test 5.4 : Notification admin souhait refusé 🔔
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Se connecter en tant qu'admin | - |
| 2 | Vérifier la cloche | Notification "Souhait refusé" visible |

---

## Phase 6 : Workflow de Paiement

### Test 6.1 : Voir le montant dû (Membre)
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Après validation → Page `/baskets/{id}/payment` | Récapitulatif des montants |
| 2 | Vérifier le calcul | Prix unitaire + Part frais port = Total |

### Test 6.2 : Marquer paiement envoyé (Membre)
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Cliquer "J'ai envoyé le paiement" | Confirmation |
| 2 | Soumettre | Statut paiement passe à "Envoyé" |

### Test 6.3 : Notification admin paiement envoyé 🔔
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Se connecter en tant qu'admin | - |
| 2 | Vérifier la cloche | Notification "Paiement envoyé" avec montant |

### Test 6.4 : Confirmer paiement reçu (Admin)
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Admin → `/admin/baskets/{id}/payments` | Liste des paiements par membre |
| 2 | Cliquer "Confirmer paiement complet" | Statut passe à "Reçu" |

### Test 6.5 : Paiement partiel (Admin)
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Cliquer "Paiement partiel" | Dialog avec champ montant |
| 2 | Entrer un montant inférieur au total | - |
| 3 | Confirmer | Statut passe à "Partiel", montant enregistré |

### Test 6.6 : Notification membre paiement confirmé 🔔
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Se connecter en tant que membre | - |
| 2 | Vérifier la cloche | Notification "Paiement confirmé" |

---

## Phase 7 : Frais de Douane

### Test 7.1 : Ajouter des frais de douane (Admin)
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Admin → Page détail d'un panier | Bouton "Ajouter frais de douane" |
| 2 | Entrer un montant (ex: 15.00€) | - |
| 3 | Confirmer | Frais répartis au prorata sur chaque souhait |
| 4 | Vérifier un souhait | `customsShare` calculé, `amountDue` mis à jour |

---

## Phase 8 : Réception et Livraison

### Test 8.1 : Marquer panier réceptionné (Admin)
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Admin → Page détail d'un panier "En attente réception" | Bouton "Marquer comme réceptionné" |
| 2 | Cliquer | Statut passe à "En attente de livraison", date réception enregistrée |

### Test 8.2 : Notification membre panier réceptionné 🔔
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Se connecter en tant que membre | - |
| 2 | Vérifier la cloche | Notification "Colis réceptionné" |

### Test 8.3 : Marquer panier disponible au retrait (Admin)
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Admin → Page détail du panier | Bouton "Marquer comme disponible" |
| 2 | Cliquer | Statut passe à "Disponible au retrait" |

### Test 8.4 : Notification membre disponible 🔔
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Se connecter en tant que membre | - |
| 2 | Vérifier la cloche | Notification "Jeux disponibles !" |

### Test 8.5 : Voir jeux à récupérer (Membre)
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Membre → `/my-pickups` | Liste des paniers disponibles au retrait |
| 2 | Voir les détails | Nom des jeux, point de dépôt (si configuré) |

### Test 8.6 : Marquer jeu récupéré (Membre)
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Cliquer "Marquer comme récupéré" sur un jeu | Confirmation |
| 2 | Confirmer | Souhait passe à "Récupéré", date enregistrée |

---

## Phase 9 : Points de Dépôt (Admin)

### Test 9.1 : Créer un point de dépôt
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Admin → `/admin/deposit-points` | Liste des points de dépôt |
| 2 | Remplir le formulaire : Nom, Adresse | - |
| 3 | Cocher "Par défaut" | - |
| 4 | Soumettre | Point créé, affiché dans la liste |

### Test 9.2 : Modifier / Supprimer un point de dépôt
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Cliquer "Modifier" sur un point | Formulaire pré-rempli |
| 2 | Modifier l'adresse | Sauvegarde OK |
| 3 | Cliquer "Supprimer" | Confirmation, point supprimé |

---

## Phase 10 : Centre de Notifications

### Test 10.1 : Affichage du badge
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Générer plusieurs notifications (via les actions ci-dessus) | - |
| 2 | Vérifier l'icône cloche | Badge avec le bon nombre |
| 3 | Cliquer | Dropdown avec les 10 dernières |

### Test 10.2 : Marquer comme lu
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Cliquer sur une notification | Notification marquée comme lue, navigation |
| 2 | Revenir sur le dropdown | Notification sans indicateur "non lu" |

### Test 10.3 : Tout marquer comme lu
| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Cliquer "Tout lire" | Toutes les notifications passent en "lu" |
| 2 | Vérifier le badge | Badge disparaît (0 non lues) |

---

## Tests de Régression

### Test R.1 : Workflow complet
Effectuer le workflow complet avec 2 membres et 1 admin :
1. Admin crée une commande
2. Membre 1 ajoute 2 souhaits
3. Membre 2 ajoute 1 souhait
4. Admin crée un panier avec les 3 souhaits
5. Admin renseigne les prix et frais de port
6. Admin passe en validation
7. Membre 1 valide ses 2 souhaits
8. Membre 2 refuse son souhait
9. Membre 1 marque paiement envoyé
10. Admin confirme le paiement
11. Admin ajoute des frais de douane
12. Admin marque comme réceptionné
13. Admin marque comme disponible
14. Membre 1 récupère ses jeux

**Vérifier à chaque étape** :
- Les statuts sont corrects
- Les notifications sont générées
- Les montants sont bien calculés

### Test R.2 : Données invalides
| Test | Action | Résultat attendu |
|------|--------|------------------|
| Prix négatif | Entrer -10€ comme prix | Erreur de validation |
| Date passée | Créer commande avec deadline passée | Erreur ou avertissement |
| Souhait vide | Soumettre formulaire sans nom de jeu | Erreur de validation |

---

## Checklist Finale

- [ ] Tous les tests de la Phase 1 passent
- [ ] Tous les tests de la Phase 2 passent
- [ ] Tous les tests de la Phase 3 passent
- [ ] Tous les tests de la Phase 4 passent
- [ ] Tous les tests de la Phase 5 passent
- [ ] Tous les tests de la Phase 6 passent
- [ ] Tous les tests de la Phase 7 passent
- [ ] Tous les tests de la Phase 8 passent
- [ ] Tous les tests de la Phase 9 passent
- [ ] Tous les tests de la Phase 10 passent
- [ ] Test de workflow complet (R.1) réussi
- [ ] Tests de données invalides (R.2) réussis

---

## Notes

- **Temps estimé** : 1h30 - 2h pour un test complet
- **Environnement recommandé** : 2 navigateurs (ou fenêtres privées) pour tester simultanément admin et membre
- **Astuce** : Utiliser les DevTools pour surveiller les requêtes réseau et les erreurs console
