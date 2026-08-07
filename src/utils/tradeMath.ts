import { BROKERAGE_CONFIG } from '../constants/fees.config';

/**
 * Parameters required to calculate trade statistics.
 */
export interface TradeParams {
  /** The average buy price per share in Rupees (₹). */
  buyPrice: number;
  /** The number of shares purchased. */
  qty: number;
  /** The intended selling price for a profitable exit. */
  targetPrice: number;
  /** The intended selling price for a stop-loss exit. */
  slPrice: number;
  /** The nature of the trade, dictating which tax bracket to apply. */
  tradeType: 'delivery' | 'intraday';
}

/**
 * The complete statistical breakdown of a trade's expenses and outcomes.
 */
export interface TradeStats {
  /** Total capital required to initiate the buy order, excluding buy-side taxes. */
  grossInvestment: number;
  /** Absolute profit at the target price, before taxes are deducted. */
  grossProfitAtTarget: number;
  /** Actual take-home profit at the target price, after all taxes and fees. */
  netProfitAtTarget: number;
  /** The sum of all buy-side and sell-side expenses for the target scenario. */
  totalExpensesAtTarget: number;
  /** Absolute loss at the stop-loss price, before taxes are added. */
  grossLossAtSl: number;
  /** Actual total capital lost at the stop-loss price, including all taxes and fees. */
  netLossAtSl: number; 
  /** The sum of all buy-side and sell-side expenses for the stop-loss scenario. */
  totalExpensesAtSl: number;
}

/**
 * Computes all related trade expenses and net P/L based on input prices.
 * This mirrors standard discount broker formulas (e.g., Zerodha) precisely,
 * taking into account STT rounding, DP charges, and GST.
 * 
 * @param {TradeParams} params - The price, quantity, and trade type configurations.
 * @returns {TradeStats} A comprehensive breakdown of gross and net figures for both target and SL.
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

  /**
   * Internal helper to calculate the exact exit expenses and net P/L for a given sell price.
   * Calculates the full round-trip (buy + sell) taxes dynamically.
   */
  const calculateExitScenario = (sellPrice: number) => {
    if (sellPrice <= 0) {
      return { grossPnL: 0, netPnL: 0, totalExpenses: 0 };
    }

    const F2 = buyValue;
    const H2 = sellPrice * params.qty;
    let totalExpenses = 0;

    if (params.tradeType === 'intraday') {
      const buyBrokerage = Math.min(config.brokerageMax, F2 * config.brokeragePercentage);
      const sellBrokerage = Math.min(config.brokerageMax, H2 * config.brokeragePercentage);
      const stt = Math.round(H2 * config.sttPercentage);
      const stampDuty = F2 * config.stampDutyPercentage;
      const txnCharges = (F2 + H2) * config.txnChargePercentage;
      const sebiCharges = (F2 + H2) * config.sebiChargePercentage;
      const gst = config.gstPercentage * (buyBrokerage + sellBrokerage + txnCharges + sebiCharges);

      totalExpenses = buyBrokerage + sellBrokerage + stt + stampDuty + txnCharges + sebiCharges + gst;
    } else {
      const baseBrokerage = config.brokerageFlat || 0.01;
      const stt = Math.round((F2 + H2) * config.sttPercentage);
      const stampDuty = F2 * config.stampDutyPercentage;
      const txnCharges = (F2 + H2) * config.txnChargePercentage;
      const sebiCharges = (F2 + H2) * config.sebiChargePercentage;
      const gst = config.gstPercentage * (baseBrokerage + txnCharges + sebiCharges);
      const dpCharges = config.dpCharge || 15.34;

      totalExpenses = baseBrokerage + stt + stampDuty + txnCharges + sebiCharges + gst + dpCharges;
    }

    const grossPnL = H2 - F2;
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