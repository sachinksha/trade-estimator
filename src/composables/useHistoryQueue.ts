import { ref } from 'vue';

/**
 * Represents a single historical estimation run saved by the user.
 */
export interface HistoryRecord {
  /** The stock or script symbol (e.g., 'RELIANCE'). */
  symbol: string;
  /** The trade segment used during the estimation. */
  tradeType: 'delivery' | 'intraday';
  /** The configured buy price per share. */
  buyPrice: number;
  /** The configured quantity of shares. */
  qty: number;
  /** The configured target exit price. */
  targetPrice: number;
  /** The configured stop-loss exit price. */
  slPrice: number;
  /** The estimated net profit (after taxes) calculated at the time of saving. */
  netProfit: number;
}

/** 
 * Global reactive state array defined outside the composable.
 * This ensures all components utilizing `useHistoryQueue` bind to a single, 
 * shared instance of the queue rather than creating isolated copies. 
 */
const history = ref<HistoryRecord[]>([]);

/**
 * Composable for managing the trade estimation history queue.
 * Handles the storage, retention limits (FIFO), and clearing of recent estimations.
 * Data is managed entirely client-side and is not persisted across hard refreshes.
 * 
 * @returns An object containing the reactive history array and mutation methods.
 */
export function useHistoryQueue() {
  /** The maximum number of historical records to retain in memory. */
  const MAX_RECORDS = 10;

  /**
   * Pushes a new trade estimation record into the queue.
   * If the addition exceeds `MAX_RECORDS`, the oldest entry is automatically removed (FIFO).
   * 
   * @param {HistoryRecord} record - The populated trade data object to save.
   */
  const addRecord = (record: HistoryRecord) => {
    history.value.push(record);
    
    if (history.value.length > MAX_RECORDS) {
      history.value.shift();
    }
  };

  /**
   * Instantly purges all stored estimation records from the global reactive array.
   */
  const clearHistory = () => {
    history.value = [];
  };

  return {
    history,
    addRecord,
    clearHistory
  };
}