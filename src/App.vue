<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TradeInputForm from './components/TradeInputForm.vue';
import EstimatorBoard from './components/EstimatorBoard.vue';
import HistoryQueue from './components/HistoryQueue.vue';
import { useHistoryQueue, type HistoryRecord } from './composables/useHistoryQueue';
import { useTradeCalculator } from './composables/useTradeCalculator';

// --- Theme Management ---
const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
};

onMounted(() => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark.value = true;
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});

// --- Trade Logic Integration ---
const {
  symbol,
  tradeType,
  buyPrice,
  qty,
  targetPrice,
  slPrice,
  tradeStats,
  targetNetProfitPercent,
  slGrossLossPercent,
  breakEvenPrice,
  setTargetFromNetProfit,
  setTargetFromPercentage,
  setSlFromNetLoss,
  setSlFromPercentage,
  resetCalculator
} = useTradeCalculator();

const { addRecord } = useHistoryQueue();

const handleSaveRecord = () => {
  if (Number(buyPrice.value) > 0 && Number(qty.value) > 0) {
    addRecord({
      symbol: symbol.value || 'UNNAMED',
      tradeType: tradeType.value, // <--- NEW: Save tradeType
      buyPrice: Number(buyPrice.value),
      qty: Number(qty.value),
      targetPrice: Number(targetPrice.value),
      slPrice: Number(slPrice.value),
      netProfit: tradeStats.value.netProfitAtTarget
    });
    
    resetCalculator(); 
  }
};

// NEW: Handle clicking a record in the queue
const handleSelectTrade = (record: HistoryRecord) => {
  // Restore all values from the selected record into the calculator state
  symbol.value = record.symbol === 'UNNAMED' ? '' : record.symbol;
  tradeType.value = record.tradeType;
  buyPrice.value = record.buyPrice;
  qty.value = record.qty;
  targetPrice.value = record.targetPrice;
  slPrice.value = record.slPrice;
  
  // Smoothly scroll back to the top of the form (super helpful on mobile!)
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
  <div class="app-wrapper">
    <!-- Header Area -->
    <header class="app-header">
      <div class="header-content">
        <h1>Trade Estimator</h1>
        <button 
          @click="toggleTheme" 
          class="theme-toggle" 
          aria-label="Toggle Theme"
        >
          {{ isDark ? '☀️ Light Mode' : '🌙 Dark Mode' }}
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="main-container">
      <div class="layout-grid">
        
        <!-- Left Column: Core Application -->
        <div class="left-col flex-col">
          
          <TradeInputForm 
            v-model:symbol="symbol"
            v-model:tradeType="tradeType"
            v-model:buyPrice="buyPrice"
            v-model:qty="qty"
          />

          <EstimatorBoard 
            v-model:targetPrice="targetPrice"
            v-model:slPrice="slPrice"
            :stats="tradeStats"
            :buyPrice="buyPrice"
            :qty="qty"
            :targetNetProfitPercent="targetNetProfitPercent"
            :slGrossLossPercent="slGrossLossPercent"
            :breakEvenPrice="breakEvenPrice"
            @update:targetFromNetProfit="setTargetFromNetProfit"
            @update:targetFromPercent="setTargetFromPercentage"
            @update:slFromNetLoss="setSlFromNetLoss"
            @update:slFromPercent="setSlFromPercentage"
            @saveRecord="handleSaveRecord"
          />

        </div>

        <!-- Right Column: Sidebar / History -->
        <div class="right-col">
            <HistoryQueue @selectTrade="handleSelectTrade" />
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
/* App Layout Container */
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Ultra-Compact Header */
.app-header {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-toggle {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--text-main);
  height: 32px; /* Smaller button just for the header */
  padding: 0 var(--spacing-sm);
  font-size: 0.8rem;
}

.theme-toggle:hover {
  background-color: var(--color-neutral);
}

/* Main Layout Grid */
.main-container {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-sm); /* Minimal padding for mobile */
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  overflow-x: hidden;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md); /* Reduced from xl */
  align-items: start;
}

@media (min-width: 992px) {
  .main-container {
    padding: var(--spacing-lg); 
  }
  .layout-grid {
    grid-template-columns: 2fr 1fr;
    gap: var(--spacing-lg); /* Tighter column gap */
  }
}
</style>