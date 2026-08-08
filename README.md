
# Trade Estimator & Simulator 📈

A sleek, purely client-side web application built to simulate equity trades and estimate expenses, net profit, and stop-loss margins for the Indian stock market. 

**Live App Here:** [https://trade-estimator-equity.vercel.app/](https://trade-estimator-equity.vercel.app/)
**Developer Documentation:** [https://your-username.github.io/trade-estimator/](https://sachinksha.github.io/trade-estimator/)
This tool is designed for precise risk management and profit planning. It perfectly mimics complex brokerage tax structures (Brokerage, STT, Exchange Txn Fees, GST, SEBI charges, Stamp Duty, and DP charges) to give you the exact Net P/L you can expect from a trade.

---

## Key Features

* **Dynamic Two-Way Binding:** Adjust your desired Net Profit %, Absolute Profit (₹), or Target Price, and watch the other variables reverse-calculate instantly using a built-in binary search algorithm.
* **Risk Management (Stop Loss):** Define your maximum acceptable absolute loss (e.g., "I only want to lose ₹500") and the program will calculate the exact Stop Loss price required to honor that limit after taxes.
* **Accurate Expense Simulation:** Expense formulas are strictly matched to standard Indian discount broker models (like Zerodha), handling both Delivery and Intraday tax brackets separately.
* **History Queue:** Temporarily stores your last 10 simulation runs for easy comparison. Click on any historical record to instantly repopulate it into the estimator board. 
* **Privacy First:** 100% client-side computation. No data is persisted on any server, and state clears on a hard refresh.
* **Beautiful Pastel UI:** Minimalist, responsive design with a custom Light/Dark mode toggle, utilizing smooth CSS variables and the 'Ubuntu' font.

---

## Tech Stack

* **Framework:** Vue 3 (Composition API)
* **Language:** TypeScript
* **Build Tool:** Vite
* **Testing:** Vitest (Built strictly using Test-Driven Development)
* **Styling:** Pure CSS (Variables, Flexbox, Grid) — zero inline styles.
* **Deployment:** Vercel

---

## Getting Started

To run this project locally, you will need [Node.js](https://nodejs.org/) installed on your machine.

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install

```

### 2. Development Server

Start the Vite development server:

```bash
npm run dev

```

The application will be available at `http://localhost:5173`.

### 3. Running Tests (TDD)

This project was built using Test-Driven Development. To run the math, logic, and state management test suites:

```bash
npm run test

```

---

## Configuration: Updating Taxes & Brokerage

Financial rules, government taxes, and broker fees change over time. The application is designed to be easily configurable without digging into the core component logic.

To update any tax percentages, flat fees, or DP charges, simply edit the configuration file located at `src/constants/fees.config.ts`.

```typescript
// Example snippet from src/constants/fees.config.ts
export const BROKERAGE_CONFIG = {
  delivery: {
    brokerageFlat: 0.01,          
    sttPercentage: 0.001,         
    txnChargePercentage: 0.0000307, 
    // ... update variables here as rules change
    dpCharge: 15.34,              
  }
};

```

Because the reverse-calculators utilize the forward-math functions dynamically, updating this single file will automatically update all forward and reverse estimations across the entire app.

---

## How to Use the App

1. **Trade Setup:** Enter the Script Symbol, Trade Type (Delivery or Intraday), Average Buy Price, and Quantity.
2. **Estimator Board:**
* Move the Target slider, type a Target Price, or enter an exact "Desired Net Profit (₹)".
* Use the Stop Loss section to determine your exit point by adjusting the Max Loss % or "Max Acceptable Loss (₹)".


3. **Save & Compare:** Click "Save to History Queue" to lock the estimation into the right-hand sidebar. The form will clear for your next entry.
4. **Reload:** Click on any previously saved card in the sidebar to load its exact configuration back into the main estimator board.

---

## License

This project is open-source and available for personal use and modification.
