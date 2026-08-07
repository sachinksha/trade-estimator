import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoryQueue } from './useHistoryQueue';

describe('History Queue State Management', () => {
  beforeEach(() => {
    const { clearHistory } = useHistoryQueue();
    clearHistory();
  });

  it('should add a new record to the history queue', () => {
    const { history, addRecord } = useHistoryQueue();
    
    addRecord({
      symbol: 'RELIANCE',
      tradeType: 'delivery', // <-- Added this
      buyPrice: 2500,
      qty: 10,
      targetPrice: 2550,
      slPrice: 2450,
      netProfit: 450
    });
    
    expect(history.value.length).toBe(1);
    expect(history.value[0].symbol).toBe('RELIANCE');
  });

  it('should maintain a maximum of 10 records and remove the oldest (FIFO)', () => {
    const { history, addRecord } = useHistoryQueue();
    
    for (let i = 1; i <= 12; i++) {
      addRecord({
        symbol: `STOCK_${i}`,
        tradeType: 'intraday', // <-- Added this
        buyPrice: 100,
        qty: i,
        targetPrice: 110,
        slPrice: 90,
        netProfit: 10 * i
      });
    }
    
    expect(history.value.length).toBe(10);
    expect(history.value[0].symbol).toBe('STOCK_3');
    expect(history.value[9].symbol).toBe('STOCK_12');
  });

  it('should clear all records from the queue', () => {
    const { history, addRecord, clearHistory } = useHistoryQueue();
    
    addRecord({
      symbol: 'TCS',
      tradeType: 'delivery', // <-- Added this
      buyPrice: 3500,
      qty: 5,
      targetPrice: 3600,
      slPrice: 3400,
      netProfit: 400
    });
    
    expect(history.value.length).toBe(1);
    
    clearHistory();
    
    expect(history.value.length).toBe(0);
  });
});