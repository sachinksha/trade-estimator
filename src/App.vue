<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TradeInputForm from './components/TradeInputForm.vue';
import EstimatorBoard from './components/EstimatorBoard.vue';
import HistoryQueue from './components/HistoryQueue.vue';

import { useTradeCalculator } from './composables/useTradeCalculator';
import { useHistoryQueue } from './composables/useHistoryQueue';

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
  setTargetFromNetProfit,
  setTargetFromPercentage,
  setSlFromNetLoss,
  setSlFromPercentage,
  resetCalculator
} = useTradeCalculator();

const { addRecord } = useHistoryQueue();

// Handler to save current estimations to the queue
const handleSaveRecord = () => {
  if (Number(buyPrice.value) > 0 && Number(qty.value) > 0) {
    addRecord({
      symbol: symbol.value || 'UNNAMED',
      buyPrice: Number(buyPrice.value),
      qty: Number(qty.value),
      targetPrice: Number(targetPrice.value),
      slPrice: Number(slPrice.value),
      netProfit: tradeStats.value.netProfitAtTarget
    });
    
    // Automatically reset the inputs for a new entry
    resetCalculator();
  }
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
            @update:targetFromNetProfit="setTargetFromNetProfit"
            @update:targetFromPercent="setTargetFromPercentage"
            @update:slFromNetLoss="setSlFromNetLoss"
            @update:slFromPercent="setSlFromPercentage"
            @saveRecord="handleSaveRecord"
          />

        </div>

        <!-- Right Column: Sidebar / History -->
        <div class="right-col">
          <HistoryQueue />
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

/* Header Styling */
.app-header {
  padding: var(--spacing-md) var(--spacing-xl);
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
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
  border: 2px solid var(--color-border);
  color: var(--text-main);
  padding: var(--spacing-sm) var(--spacing-md);
}

.theme-toggle:hover {
  background-color: var(--color-neutral);
}

/* Main Layout Grid */
.main-container {
  flex: 1;
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
  align-items: start;
}

@media (min-width: 992px) {
  .layout-grid {
    grid-template-columns: 2fr 1fr;
  }
}
</style>