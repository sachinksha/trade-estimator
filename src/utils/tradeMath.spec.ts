import { describe, it, expect } from 'vitest';
import { calculateTradeStats, calculateSellPriceForNetProfit } from './tradeMath';
describe('Trade Math Computations', () => {
  it('should accurately calculate gross investment for delivery buy', () => {
    const stats = calculateTradeStats({
      buyPrice: 1000,
      qty: 10,
      targetPrice: 1020,
      slPrice: 980,
      tradeType: 'delivery'
    });
    
    expect(stats.grossInvestment).toBe(10000);
  });

  it('should calculate correct net profit for a successful delivery trade', () => {
    const stats = calculateTradeStats({
      buyPrice: 100,
      qty: 100, // 10,000 investment
      targetPrice: 105, // 10,500 sell value
      slPrice: 98,
      tradeType: 'delivery'
    });
    
    // Gross profit is 500. Taxes will reduce this.
    expect(stats.netProfitAtTarget).toBeLessThan(500);
    expect(stats.netProfitAtTarget).toBeGreaterThan(450); // Rough estimation bounds for typical taxes
  });

  it('should handle divide by zero or zero quantity gracefully', () => {
    const stats = calculateTradeStats({
      buyPrice: 1000,
      qty: 0,
      targetPrice: 1020,
      slPrice: 980,
      tradeType: 'delivery'
    });
    
    expect(stats.grossInvestment).toBe(0);
    expect(stats.totalExpensesAtTarget).toBe(0);
  });
});

describe('Trade Math Reverse Computations', () => {
  it('should calculate the required sell price for a desired net profit (Delivery)', () => {
    const buyPrice = 1000;
    const qty = 10;
    const targetNetProfit = 500;
    
    // Reverse calculate the target price
    const requiredSellPrice = calculateSellPriceForNetProfit(buyPrice, qty, targetNetProfit, 'delivery');
    
    // Verify by plugging it back into the forward calculation
    const stats = calculateTradeStats({
      buyPrice,
      qty,
      targetPrice: requiredSellPrice,
      slPrice: 0, // SL doesn't matter for this test
      tradeType: 'delivery'
    });
    
    // Because of STT/Stamp Duty rounding to the nearest integer, we allow a +/- 1 Rupee variance
    expect(stats.netProfitAtTarget).toBeGreaterThanOrEqual(targetNetProfit - 1);
    expect(stats.netProfitAtTarget).toBeLessThanOrEqual(targetNetProfit + 1);
  });

  it('should calculate the required sell price for a desired net profit (Intraday)', () => {
    const buyPrice = 500;
    const qty = 100;
    const targetNetProfit = 1000;
    
    const requiredSellPrice = calculateSellPriceForNetProfit(buyPrice, qty, targetNetProfit, 'intraday');
    
    const stats = calculateTradeStats({
      buyPrice,
      qty,
      targetPrice: requiredSellPrice,
      slPrice: 0,
      tradeType: 'intraday'
    });
    
    expect(stats.netProfitAtTarget).toBeGreaterThanOrEqual(targetNetProfit - 1);
    expect(stats.netProfitAtTarget).toBeLessThanOrEqual(targetNetProfit + 1);
  });

  it('should calculate the break-even sell price (Net Profit = 0)', () => {
    const requiredSellPrice = calculateSellPriceForNetProfit(100, 50, 0, 'delivery');
    
    const stats = calculateTradeStats({
      buyPrice: 100,
      qty: 50,
      targetPrice: requiredSellPrice,
      slPrice: 0,
      tradeType: 'delivery'
    });
    
    // Should be exactly or very close to 0
    expect(Math.abs(stats.netProfitAtTarget)).toBeLessThanOrEqual(1);
    // The sell price must be strictly greater than buy price to cover buy-side taxes
    expect(requiredSellPrice).toBeGreaterThan(100); 
  });

  it('should return 0 if quantity or price is invalid', () => {
    const result = calculateSellPriceForNetProfit(0, 10, 500, 'delivery');
    expect(result).toBe(0);
  });
});