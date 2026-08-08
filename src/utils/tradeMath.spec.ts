import { describe, it, expect } from 'vitest';
import { calculateTradeStats } from './tradeMath';

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

});