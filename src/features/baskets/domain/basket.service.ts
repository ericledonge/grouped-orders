import type { ProrataItem, ProrataResult } from "./basket.types";

/**
 * Service de calcul des frais au prorata
 *
 * Ce service contient la logique métier pour calculer la répartition
 * des frais (port, douane) entre les différents souhaits d'un panier.
 */

/**
 * Calcule la répartition des frais au prorata des prix
 *
 * La formule utilisée est:
 * share = (itemPrice / totalPrices) * totalCost
 *
 * Pour éviter les erreurs d'arrondi, on calcule d'abord tous les montants,
 * puis on ajuste le dernier item pour que le total corresponde exactement.
 *
 * @param items - Liste des items avec leur prix
 * @param totalCost - Coût total à répartir
 * @returns Liste des parts calculées pour chaque item
 *
 * @example
 * ```ts
 * const items = [
 *   { id: "1", price: 50 },
 *   { id: "2", price: 30 },
 *   { id: "3", price: 20 },
 * ];
 * const shares = calculateProrataShares(items, 10);
 * // Résultat: [{ id: "1", share: 5 }, { id: "2", share: 3 }, { id: "3", share: 2 }]
 * ```
 */
export function calculateProrataShares(
  items: ProrataItem[],
  totalCost: number,
): ProrataResult[] {
  // Cas particulier: aucun item
  if (items.length === 0) {
    return [];
  }

  // Cas particulier: un seul item
  if (items.length === 1) {
    return [
      {
        id: items[0].id,
        share: roundToTwoDecimals(totalCost),
      },
    ];
  }

  // Calculer le total des prix
  const totalPrices = items.reduce((sum, item) => sum + item.price, 0);

  // Cas particulier: total des prix est 0
  if (totalPrices === 0) {
    // Répartir équitablement
    const equalShare = roundToTwoDecimals(totalCost / items.length);
    const results = items.map((item) => ({
      id: item.id,
      share: equalShare,
    }));

    // Ajuster le dernier pour compenser les arrondis
    const currentTotal = results.reduce((sum, r) => sum + r.share, 0);
    const diff = roundToTwoDecimals(totalCost - currentTotal);
    if (diff !== 0 && results.length > 0) {
      results[results.length - 1].share = roundToTwoDecimals(
        results[results.length - 1].share + diff,
      );
    }

    return results;
  }

  // Calculer les parts au prorata
  const results: ProrataResult[] = [];
  let runningTotal = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (i === items.length - 1) {
      // Dernier item: utiliser la différence pour éviter les erreurs d'arrondi
      const remainingShare = roundToTwoDecimals(totalCost - runningTotal);
      results.push({
        id: item.id,
        share: remainingShare,
      });
    } else {
      // Calculer la part au prorata
      const share = roundToTwoDecimals((item.price / totalPrices) * totalCost);
      runningTotal += share;
      results.push({
        id: item.id,
        share,
      });
    }
  }

  return results;
}

/**
 * Arrondit un nombre à 2 décimales
 * Utilise la méthode "round half up" pour éviter les biais
 *
 * @param value - Valeur à arrondir
 * @returns Valeur arrondie à 2 décimales
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calcule le total dû pour un souhait
 *
 * @param unitPrice - Prix unitaire du jeu
 * @param shippingShare - Part des frais de port
 * @param customsShare - Part des frais de douane (optionnel)
 * @returns Total dû
 */
export function calculateAmountDue(
  unitPrice: number,
  shippingShare: number,
  customsShare = 0,
): number {
  return roundToTwoDecimals(unitPrice + shippingShare + customsShare);
}

/**
 * Vérifie si un total calculé correspond au total attendu
 * avec une tolérance pour les erreurs d'arrondi
 *
 * @param calculated - Total calculé
 * @param expected - Total attendu
 * @param tolerance - Tolérance en valeur absolue (défaut: 0.01)
 * @returns true si les totaux correspondent
 */
export function totalsMatch(
  calculated: number,
  expected: number,
  tolerance = 0.01,
): boolean {
  return Math.abs(calculated - expected) <= tolerance;
}
