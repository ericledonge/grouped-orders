import { describe, expect, it } from "vitest";
import {
  calculateAmountDue,
  calculateProrataShares,
  roundToTwoDecimals,
  totalsMatch,
} from "./basket.service";

describe("basket.service", () => {
  describe("roundToTwoDecimals", () => {
    it("should round down when third decimal is less than 5", () => {
      expect(roundToTwoDecimals(1.234)).toBe(1.23);
    });

    it("should round up when third decimal is 5 or more", () => {
      expect(roundToTwoDecimals(1.235)).toBe(1.24);
      expect(roundToTwoDecimals(1.236)).toBe(1.24);
    });

    it("should handle whole numbers", () => {
      expect(roundToTwoDecimals(10)).toBe(10);
    });

    it("should handle negative numbers", () => {
      expect(roundToTwoDecimals(-1.234)).toBe(-1.23);
    });
  });

  describe("calculateProrataShares", () => {
    it("should return empty array for empty items", () => {
      const result = calculateProrataShares([], 100);
      expect(result).toEqual([]);
    });

    it("should assign full cost to single item", () => {
      const items = [{ id: "1", price: 50 }];
      const result = calculateProrataShares(items, 10);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: "1", share: 10 });
    });

    it("should split equally for items with equal prices", () => {
      const items = [
        { id: "1", price: 30 },
        { id: "2", price: 30 },
        { id: "3", price: 30 },
      ];
      const result = calculateProrataShares(items, 9);

      expect(result).toHaveLength(3);
      // Each should get 3 (9 / 3)
      const total = result.reduce((sum, r) => sum + r.share, 0);
      expect(total).toBe(9);
      expect(result[0].share).toBe(3);
      expect(result[1].share).toBe(3);
      expect(result[2].share).toBe(3);
    });

    it("should split proportionally for items with different prices", () => {
      const items = [
        { id: "1", price: 50 }, // 50%
        { id: "2", price: 30 }, // 30%
        { id: "3", price: 20 }, // 20%
      ];
      const result = calculateProrataShares(items, 10);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ id: "1", share: 5 }); // 50% of 10
      expect(result[1]).toEqual({ id: "2", share: 3 }); // 30% of 10
      expect(result[2]).toEqual({ id: "3", share: 2 }); // 20% of 10

      // Total should match exactly
      const total = result.reduce((sum, r) => sum + r.share, 0);
      expect(total).toBe(10);
    });

    it("should handle rounding and ensure total matches", () => {
      const items = [
        { id: "1", price: 33.33 },
        { id: "2", price: 33.33 },
        { id: "3", price: 33.34 },
      ];
      const result = calculateProrataShares(items, 10);

      // Total must match exactly despite rounding
      const total = result.reduce((sum, r) => sum + r.share, 0);
      expect(roundToTwoDecimals(total)).toBe(10);
    });

    it("should handle zero prices by splitting equally", () => {
      const items = [
        { id: "1", price: 0 },
        { id: "2", price: 0 },
      ];
      const result = calculateProrataShares(items, 10);

      expect(result).toHaveLength(2);
      const total = result.reduce((sum, r) => sum + r.share, 0);
      expect(roundToTwoDecimals(total)).toBe(10);
    });

    it("should handle realistic shipping cost scenario", () => {
      // Scénario réaliste: 3 jeux avec des prix différents, frais de port de 15€
      const items = [
        { id: "game1", price: 45.9 }, // Wingspan
        { id: "game2", price: 32.5 }, // Azul
        { id: "game3", price: 21.6 }, // Hanabi
      ];
      const shippingCost = 15;
      const result = calculateProrataShares(items, shippingCost);

      // Vérifier que le total des parts = frais de port
      const totalShares = result.reduce((sum, r) => sum + r.share, 0);
      expect(roundToTwoDecimals(totalShares)).toBe(shippingCost);

      // Vérifier que la répartition est proportionnelle
      const totalPrices = 45.9 + 32.5 + 21.6; // 100
      const game1Expected = (45.9 / totalPrices) * shippingCost; // ~6.89
      const game2Expected = (32.5 / totalPrices) * shippingCost; // ~4.88

      expect(result[0].share).toBeCloseTo(game1Expected, 1);
      expect(result[1].share).toBeCloseTo(game2Expected, 1);
    });

    it("should handle customs cost scenario", () => {
      // Scénario: frais de douane de 25€ sur 4 jeux
      const items = [
        { id: "1", price: 60 },
        { id: "2", price: 40 },
        { id: "3", price: 25 },
        { id: "4", price: 15 },
      ];
      const customsCost = 25;
      const result = calculateProrataShares(items, customsCost);

      const totalShares = result.reduce((sum, r) => sum + r.share, 0);
      expect(roundToTwoDecimals(totalShares)).toBe(customsCost);
    });
  });

  describe("calculateAmountDue", () => {
    it("should calculate total with shipping only", () => {
      expect(calculateAmountDue(50, 5)).toBe(55);
    });

    it("should calculate total with shipping and customs", () => {
      expect(calculateAmountDue(50, 5, 3)).toBe(58);
    });

    it("should handle decimal values correctly", () => {
      expect(calculateAmountDue(45.9, 6.89, 4.12)).toBe(56.91);
    });

    it("should handle zero values", () => {
      expect(calculateAmountDue(0, 0, 0)).toBe(0);
      expect(calculateAmountDue(50, 0)).toBe(50);
    });
  });

  describe("totalsMatch", () => {
    it("should return true for exact match", () => {
      expect(totalsMatch(100, 100)).toBe(true);
    });

    it("should return true for values within default tolerance", () => {
      expect(totalsMatch(100, 100.005)).toBe(true);
      expect(totalsMatch(100, 99.995)).toBe(true);
    });

    it("should return false for values outside default tolerance", () => {
      expect(totalsMatch(100, 100.02)).toBe(false);
      expect(totalsMatch(100, 99.98)).toBe(false);
    });

    it("should respect custom tolerance", () => {
      expect(totalsMatch(100, 100.5, 1)).toBe(true);
      expect(totalsMatch(100, 101.5, 1)).toBe(false);
    });
  });
});
