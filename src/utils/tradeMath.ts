import { BROKERAGE_CONFIG } from '../constants/fees.config';

export interface TradeParams {
  buyPrice: number;
  qty: number;
  targetPrice: number;
  slPrice: number;
  tradeType: 'delivery' | 'intraday';
}

export interface TradeStats {
  grossInvestment: number;
  grossProfitAtTarget: number;
  netProfitAtTarget: number;
  totalExpensesAtTarget: number;
  grossLossAtSl: number;
  netLossAtSl: number; 
  totalExpensesAtSl: number;
}

/**
 * Computes all related trade expenses and net P/L based on input prices.
 * Formula strictly adheres to the 'CN Exp Wrkg.xlsx' trusted source, 
 * calculating Buy and Sell legs as completely independent entries.
 */
export function calculateTradeStats(params: TradeParams): TradeStats {
  if (params.qty <= 0 || params.buyPrice <= 0) {
    return {
      grossInvestment: 0,
      grossProfitAtTarget: 0, netProfitAtTarget: 0, totalExpensesAtTarget: 0,
      grossLossAtSl: 0, netLossAtSl: 0, totalExpensesAtSl: 0
    };
  }

  const config = BROKERAGE_CONFIG[params.tradeType];
  const buyValue = params.buyPrice * params.qty;
  const isIntraday = params.tradeType === 'intraday';

  // --- INDEPENDENT LEG CALCULATOR ---
  const calculateLegExpenses = (value: number, isBuy: boolean) => {
    // 1. Brokerage
    let brokerage = 0;
    if (isIntraday) {
      brokerage = Math.min(config.brokerageMax, value * config.brokeragePercentage);
    } else {
      // Per CN Exp Wrkg.xlsx, delivery brokerage flat fee applies only to the first leg
      brokerage = isBuy ? (config.brokerageFlat || 0) : 0; 
    }

    // 2. Stamp Duty (Strictly Buy Leg Only, Rounded)
    const stampDuty = isBuy ? Math.round(value * config.stampDutyPercentage) : 0;

    // 3. SEBI Fees (Not rounded)
    const sebi = value * config.sebiChargePercentage;

    // 4. STT (Rounded)
    let stt = 0;
    if (isIntraday) {
      stt = isBuy ? 0 : Math.round(value * config.sttPercentage);
    } else {
      stt = Math.round(value * config.sttPercentage);
    }

    // 5. Transaction Charges (Not rounded)
    const txn = value * config.txnChargePercentage;

    // 6. DP Charge (Strictly delivery sell leg only; not applied to buy or intraday legs)
    const dp = (!isIntraday && !isBuy) ? (config.dpCharge || 0) : 0;

    // 7. GST @ 18%
    // DP is already configured as ₹15.34 (₹13 + 18% GST) for delivery sell trades.
    const gst = (brokerage + txn + sebi) * config.gstPercentage;

    return brokerage + stampDuty + sebi + stt + txn + dp + gst;
  };

  // Calculate the Buy Leg exactly once
  const buyExpenses = calculateLegExpenses(buyValue, true);

  // --- EXIT SCENARIO CALCULATOR ---
  const calculateExitScenario = (sellPrice: number) => {
    if (sellPrice <= 0) {
      return { grossPnL: 0, netPnL: 0, totalExpenses: buyExpenses };
    }

    const sellValue = sellPrice * params.qty;
    const sellExpenses = calculateLegExpenses(sellValue, false);
    
    const totalExpenses = buyExpenses + sellExpenses;
    const grossPnL = sellValue - buyValue;
    const netPnL = grossPnL - totalExpenses;

    return { grossPnL, netPnL, totalExpenses };
  };

  const targetScenario = calculateExitScenario(params.targetPrice);
  const slScenario = calculateExitScenario(params.slPrice);

  return {
    grossInvestment: buyValue,
    
    grossProfitAtTarget: targetScenario.grossPnL,
    netProfitAtTarget: targetScenario.netPnL,
    totalExpensesAtTarget: targetScenario.totalExpenses,
    
    grossLossAtSl: slScenario.grossPnL,
    netLossAtSl: slScenario.netPnL,
    totalExpensesAtSl: slScenario.totalExpenses
  };
}

/**
 * Reverse-calculates the required selling price to achieve a specific exact net profit in Rupees.
 * Uses a binary search algorithm since tax rounding (like STT) and brokerage caps 
 * make a clean algebraic reversal nearly impossible.
 * 
 * @param {number} buyPrice - The average buy price of the script.
 * @param {number} qty - The quantity of shares.
 * @param {number} desiredNetProfit - The exact absolute profit desired after all taxes are paid.
 * @param {'delivery' | 'intraday'} tradeType - The type of trade.
 * @returns {number} The required target selling price, rounded to 2 decimal places.
 */
export function calculateSellPriceForNetProfit(
  buyPrice: number,
  qty: number,
  desiredNetProfit: number,
  tradeType: 'delivery' | 'intraday'
): number {
  if (qty <= 0 || buyPrice <= 0) return 0;

  let low = 0.01; 
  let high = (buyPrice * 10) + Math.max(0, desiredNetProfit * 10); 
  let mid = 0;
  let iterations = 0;

  while (iterations < 100 && (high - low) > 0.001) {
    mid = (low + high) / 2;
    const stats = calculateTradeStats({ buyPrice, qty, targetPrice: mid, slPrice: 0, tradeType });

    if (stats.netProfitAtTarget < desiredNetProfit) {
      low = mid; 
    } else {
      high = mid; 
    }
    iterations++;
  }

  return Math.round(mid * 100) / 100;
}

/**
 * Calculates the break-even selling price where net P/L equals zero (after expenses).
 * A thin wrapper around `calculateSellPriceForNetProfit` with `desiredNetProfit` = 0.
 */
export function calculateBreakEvenPrice(
  buyPrice: number,
  qty: number,
  tradeType: 'delivery' | 'intraday'
): number {
  return calculateSellPriceForNetProfit(buyPrice, qty, 0, tradeType);
}

/**
 * Reverse-calculates the required Stop Loss price to cap the net loss at a specific absolute amount.
 * Utilizes a binary search algorithm to account for complex dynamic tax brackets.
 * 
 * @param {number} buyPrice - The average buy price of the script.
 * @param {number} qty - The quantity of shares.
 * @param {number} desiredAbsoluteNetLoss - The maximum acceptable loss as a positive number (e.g., 500 for a ₹500 loss limit).
 * @param {'delivery' | 'intraday'} tradeType - The type of trade.
 * @returns {number} The required Stop Loss price, rounded to 2 decimal places.
 */
export function calculateSlPriceForNetLoss(
  buyPrice: number,
  qty: number,
  desiredAbsoluteNetLoss: number,
  tradeType: 'delivery' | 'intraday'
): number {
  if (qty <= 0 || buyPrice <= 0 || desiredAbsoluteNetLoss < 0) return 0;

  let low = 0.01; 
  let high = buyPrice; 
  let mid = 0;
  let iterations = 0;
  
  const targetNetLoss = -Math.abs(desiredAbsoluteNetLoss); 

  while (iterations < 100 && (high - low) > 0.001) {
    mid = (low + high) / 2;
    const stats = calculateTradeStats({ buyPrice, qty, targetPrice: 0, slPrice: mid, tradeType });

    if (stats.netLossAtSl < targetNetLoss) {
      low = mid;
    } else {
      high = mid;
    }
    iterations++;
  }

  return Math.round(mid * 100) / 100;
}