import { describe, it, expect } from 'vitest';
import { calculateTradeStats } from './tradeMath';
import { calculateBreakEvenPrice } from './tradeMath';

describe('Trade Math Calculations (Based on CN Exp Wrkg.xlsx)', () => {

  it('should perfectly match the TVSMOTOR intraday trade from the trusted spreadsheet', () => {
    const stats = calculateTradeStats({
      buyPrice: 4255, // From sheet row 2
      qty: 339,       // From sheet row 2
      targetPrice: 4321, // From sheet row 3 (Sell)
      slPrice: 0,
      tradeType: 'intraday'
    });

    // Validating Gross Investment (Pure Purchase Buy Leg) = 1,442,445
    expect(stats.grossInvestment).toBeCloseTo(1442445, 2);

    // Total Expenses in sheet: 
    // Buy Leg Expenses: 120.556 (rounded 120.56)
    // Sell Leg Expenses: 444.393 (rounded 444.39)
    // Total Expected: 564.95
    expect(stats.totalExpensesAtTarget).toBeCloseTo(564.95, 2);

    // Gross PnL: (4321 - 4255) * 339 = 22374
    expect(stats.grossProfitAtTarget).toBe(22374);

    // Net PnL: 22374 - 564.95 = 21809.05
    expect(stats.netProfitAtTarget).toBeCloseTo(21809.05, 2);
  });

  it('should apply delivery DP charges only on the sell leg', () => {
    const stats = calculateTradeStats({
      buyPrice: 100,
      qty: 100,
      targetPrice: 105,
      slPrice: 0,
      tradeType: 'delivery'
    });

    expect(stats.totalExpensesAtTarget).toBeCloseTo(38.12, 2);
    expect(stats.totalExpensesAtTarget).toBeGreaterThan(15.34);
  });

  it('example: buy 5000 qty 200 sell 5050 should still be net profit (delivery)', () => {
    const stats = calculateTradeStats({
      buyPrice: 5000,
      qty: 200,
      targetPrice: 5050,
      slPrice: 0,
      tradeType: 'delivery'
    });

    // Gross PnL = 10000
    expect(stats.grossProfitAtTarget).toBe(10000);

    // Net PnL must remain positive after expenses
    expect(stats.netProfitAtTarget).toBeGreaterThan(0);

    // Break-even price must be below 5050 for this example
    const be = calculateBreakEvenPrice(5000, 200, 'delivery');
    expect(be).toBeLessThan(5050);
    expect(be).toBeGreaterThanOrEqual(5000);
  });

  it('target causing loss should show negative net and negative percent', () => {
    const stats = calculateTradeStats({
      buyPrice: 100,
      qty: 100,
      targetPrice: 99, // selling below buy
      slPrice: 0,
      tradeType: 'delivery'
    });

    expect(stats.grossProfitAtTarget).toBe(-100);
    expect(stats.netProfitAtTarget).toBeLessThan(0);

    const percent = (stats.netProfitAtTarget / stats.grossInvestment) * 100;
    expect(percent).toBeLessThan(0);
  });

  it('stop loss above buy should show positive net at SL and positive percent', () => {
    const stats = calculateTradeStats({
      buyPrice: 100,
      qty: 100,
      targetPrice: 0,
      slPrice: 105, // SL above buy => would realize profit
      tradeType: 'intraday'
    });

    // Gross PnL positive
    expect(stats.grossLossAtSl).toBe(500);
    // Net at SL should be positive in this scenario
    expect(stats.netLossAtSl).toBeGreaterThan(0);

    const percent = (stats.netLossAtSl / stats.grossInvestment) * 100;
    expect(percent).toBeGreaterThan(0);
  });

  it('gross percent (buyPrice - slPrice)/buyPrice can be negative while net percent positive', () => {
    const buyPrice = 100;
    const slPrice = 105;
    const stats = calculateTradeStats({ buyPrice, qty: 100, targetPrice: 0, slPrice, tradeType: 'intraday' });

    const grossPercent = ((buyPrice - slPrice) / buyPrice) * 100;
    expect(grossPercent).toBeLessThan(0);

    const netPercent = (stats.netLossAtSl / stats.grossInvestment) * 100;
    expect(netPercent).toBeGreaterThan(0);
  });

});
