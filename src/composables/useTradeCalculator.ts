import { ref, computed, watch } from 'vue';
import { calculateTradeStats, calculateSellPriceForNetProfit, calculateSlPriceForNetLoss, calculateBreakEvenPrice } from '../utils/tradeMath';

/**
 * Central state management and business logic hook for the Trade Estimator.
 * Encapsulates reactive form inputs, automatically triggers mathematical computations
 * upon state changes, and exposes methods for dynamic two-way bindings.
 * 
 * @returns An object containing reactive states, computed properties, and action methods.
 */
export function useTradeCalculator() {
  /** The stock or script symbol (e.g., 'RELIANCE'). */
  const symbol = ref('');
  /** The trade segment, dictating tax implications. Defaults to 'delivery'. */
  const tradeType = ref<'delivery' | 'intraday'>('delivery');
  /** The average acquisition price of the script. */
  const buyPrice = ref<number | ''>('');
  /** The total volume of shares purchased. */
  const qty = ref<number | ''>('');
  /** The desired selling price for securing a profit. */
  const targetPrice = ref<number | ''>('');
  /** The protective selling price to cap a downside loss. */
  const slPrice = ref<number | ''>('');

  /**
   * Computed property containing the full statistical breakdown of the trade.
   * Recalculates instantaneously when any primary input changes.
   */
  const tradeStats = computed(() => {
    return calculateTradeStats({
      buyPrice: Number(buyPrice.value) || 0,
      qty: Number(qty.value) || 0,
      targetPrice: Number(targetPrice.value) || 0,
      slPrice: Number(slPrice.value) || 0,
      tradeType: tradeType.value
    });
  });

  /**
   * The break-even selling price (rounded to 2 decimals) where net P/L becomes zero.
   */
  const breakEvenPrice = computed(() => {
    const p = Number(buyPrice.value);
    const q = Number(qty.value);
    if (!p || !q) return 0;
    return calculateBreakEvenPrice(p, q, tradeType.value);
  });

  /**
   * Computed property representing the Target Net Profit as a percentage 
   * of the initial gross investment.
   */
  const targetNetProfitPercent = computed(() => {
    if (!tradeStats.value.grossInvestment) return 0;
    return (tradeStats.value.netProfitAtTarget / tradeStats.value.grossInvestment) * 100;
  });

  /**
   * Computed property representing the Stop Loss Gross Drop as a percentage 
   * of the original buy price.
   */
  const slGrossLossPercent = computed(() => {
    if (!Number(buyPrice.value) || !Number(slPrice.value)) return 0;
    const diff = Number(buyPrice.value) - Number(slPrice.value);
    return (diff / Number(buyPrice.value)) * 100;
  });
  
  /**
   * Triggers a reverse-calculation to dynamically set the `targetPrice` 
   * necessary to achieve a specific absolute net profit.
   * 
   * @param {number} desiredNetProfit - The exact take-home profit desired (in ₹).
   */
  const setTargetFromNetProfit = (desiredNetProfit: number) => {
    const p = Number(buyPrice.value);
    const q = Number(qty.value);
    if (!p || !q) return;

    targetPrice.value = calculateSellPriceForNetProfit(p, q, desiredNetProfit, tradeType.value);
  };

  /**
   * Sets the `targetPrice` based on a straightforward percentage increase from the buy price.
   * 
   * @param {number} percentage - The desired gross percentage gain.
   */
  const setTargetFromPercentage = (percentage: number) => {
    const p = Number(buyPrice.value);
    if (!p) return;
    targetPrice.value = Number((p * (1 + (percentage / 100))).toFixed(2));
  };

  /**
   * Sets the `slPrice` based on a straightforward percentage drop from the buy price.
   * 
   * @param {number} percentage - The maximum gross percentage loss.
   */
  const setSlFromPercentage = (percentage: number) => {
    const p = Number(buyPrice.value);
    if (!p) return;
    slPrice.value = Number((p * (1 - (percentage / 100))).toFixed(2));
  };

  /**
   * Triggers a reverse-calculation to dynamically set the `slPrice` 
   * necessary to cap the total absolute loss (including taxes) at a specific amount.
   * 
   * @param {number} desiredNetLoss - The maximum acceptable absolute loss limit (in ₹).
   */
  const setSlFromNetLoss = (desiredNetLoss: number) => {
    const p = Number(buyPrice.value);
    const q = Number(qty.value);
    if (!p || !q) return;

    slPrice.value = calculateSlPriceForNetLoss(p, q, desiredNetLoss, tradeType.value);
  };

  // Watcher: Automatically initializes standard 2% bounds when initial values are typed.
  watch([buyPrice, qty], ([newBuyPrice, newQty], [oldBuyPrice]) => {
    if (newBuyPrice && newQty && !oldBuyPrice) {
      if (!targetPrice.value) setTargetFromPercentage(2);
      if (!slPrice.value) setSlFromPercentage(2);
    }
  });

  /**
   * Helper function to wipe all reactive states clean. Used when saving 
   * a record to prepare the board for a new estimation.
   */
  const resetCalculator = () => {
    symbol.value = '';
    buyPrice.value = '';
    qty.value = '';
    targetPrice.value = '';
    slPrice.value = '';
  };

  return {
    symbol,
    tradeType,
    buyPrice,
    qty,
    targetPrice,
    slPrice,
    tradeStats,
    targetNetProfitPercent,
    slGrossLossPercent,
    setTargetFromNetProfit,
    setTargetFromPercentage,
    setSlFromPercentage,
    setSlFromNetLoss,
    resetCalculator
    ,
    breakEvenPrice
  };
}