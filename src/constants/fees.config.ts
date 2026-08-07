/**
 * Configuration object defining the exact fee structures for Indian equity trades.
 * These values mirror the standard discount broker (e.g., Zerodha) and 
 * government tax calculations.
 * 
 * Update these constants if government tax brackets or broker policies change.
 */
export const BROKERAGE_CONFIG = {
  /** Fee structure for equity delivery trades (holding overnight or longer). */
  delivery: {
    /** Flat base brokerage fee in Rupees (₹). */
    brokerageFlat: 0.01,
    /** Percentage-based brokerage fee. */
    brokeragePercentage: 0,
    /** Maximum cap on brokerage fee per trade. */
    brokerageMax: 0,
    /** Securities Transaction Tax (STT) percentage applied to the total traded value. */
    sttPercentage: 0.001,
    /** Exchange transaction charge percentage (NSE/BSE). */
    txnChargePercentage: 0.0000307,
    /** SEBI turnover fee percentage. */
    sebiChargePercentage: 0.000001,
    /** Stamp duty percentage (applied only on the buy side). */
    stampDutyPercentage: 0.00015,
    /** Goods and Services Tax (GST) percentage applied to taxable charges. */
    gstPercentage: 0.18,
    /** Depository Participant (DP) flat charge applied when shares leave the demat account (Sell). */
    dpCharge: 15.34,
  },
  
  /** Fee structure for equity intraday trades (MIS - squared off the same day). */
  intraday: {
    /** Flat base brokerage fee in Rupees (₹). */
    brokerageFlat: 0,
    /** Percentage-based brokerage fee. */
    brokeragePercentage: 0.0003,
    /** Maximum cap on brokerage fee per trade. */
    brokerageMax: 20,
    /** Securities Transaction Tax (STT) percentage applied to the total traded value (Sell side only). */
    sttPercentage: 0.00025,
    /** Exchange transaction charge percentage (NSE/BSE). */
    txnChargePercentage: 0.0000307,
    /** SEBI turnover fee percentage. */
    sebiChargePercentage: 0.000001,
    /** Stamp duty percentage (applied only on the buy side). */
    stampDutyPercentage: 0.00003,
    /** Goods and Services Tax (GST) percentage applied to taxable charges. */
    gstPercentage: 0.18,
    /** Depository Participant (DP) flat charge (Not applicable for intraday). */
    dpCharge: 0,
  }
};