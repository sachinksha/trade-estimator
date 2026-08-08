<script setup lang="ts">
import { computed } from 'vue';
import StepperInput from './StepperInput.vue';
import type { TradeStats } from '../utils/tradeMath';

const targetPrice = defineModel<number | ''>('targetPrice');
const slPrice = defineModel<number | ''>('slPrice');

const props = defineProps<{
  stats: TradeStats;
  buyPrice: number | '';
  qty: number | '';
  targetNetProfitPercent: number;
  slGrossLossPercent: number;
}>();

const emit = defineEmits<{
  (e: 'update:targetFromNetProfit', value: number): void;
  (e: 'update:targetFromPercent', value: number): void;
  (e: 'update:slFromNetLoss', value: number): void;
  (e: 'update:slFromPercent', value: number): void;
  (e: 'saveRecord'): void;
}>();

// --- Two-Way Computed Bindings ---

// Slider & Input for Target Net Profit (in ₹)
const targetNetProfitInput = computed({
  get: () => Number(props.stats.netProfitAtTarget.toFixed(2)),
  set: (val: number) => emit('update:targetFromNetProfit', val)
});

// Slider for Target Gross %
const targetPercentInput = computed({
  get: () => Number(props.targetNetProfitPercent.toFixed(2)),
  set: (val: number) => emit('update:targetFromPercent', val)
});

// Slider for Stop Loss Gross %
const slPercentInput = computed({
  get: () => Number(props.slGrossLossPercent.toFixed(2)),
  set: (val: number) => emit('update:slFromPercent', val)
});

// Slider & Input for Stop Loss Net Loss (in ₹)
const slNetLossInput = computed({
  get: () => Math.abs(Number(props.stats.netLossAtSl.toFixed(2))),
  set: (val: number) => emit('update:slFromNetLoss', Math.abs(val))
});

// Helper for Indian Currency formatting
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val);
};

const isReady = computed(() => Number(props.buyPrice) > 0 && Number(props.qty) > 0);
</script>

<template>
  <div class="card board">
    <h2>2. Estimator Board</h2>
    
    <div v-if="!isReady" class="empty-state">
      <p>Enter your Buy Price and Quantity to see estimations.</p>
    </div>

    <div v-else class="board-content">
      <!-- Investment Summary -->
      <div class="investment-summary flex-row space-between">
        <span>Gross Investment:</span>
        <strong>{{ formatCurrency(stats.grossInvestment) }}</strong>
      </div>

      <!-- Target Section (Profit) -->
      <div class="zone target-zone">
        <h3>Target (Take Profit)</h3>
        
        <!-- TARGET SECTION GRID -->
        <div class="input-grid">
          <div class="input-group">
            <label>Target Price (₹)</label>
            <StepperInput v-model="targetPrice" :min="0" :step="0.5" />
          </div>
          <div class="input-group">
            <label>Desired Net Profit (₹)</label>
            <StepperInput v-model="targetNetProfitInput" :min="0" :step="100" />
          </div>
        </div>

        <div class="slider-group">
          <div class="flex-row space-between">
            <label>Target % (Net Return)</label>
            <span class="text-profit">{{ targetPercentInput }}%</span>
          </div>
          <input 
            type="range" 
            v-model.number="targetPercentInput" 
            min="0.5" max="20" step="0.1"
          />
        </div>

        <!-- Breakdown Details -->
        <div class="breakdown">
          <div class="flex-row space-between">
            <span>Gross Profit</span>
            <span>{{ formatCurrency(stats.grossProfitAtTarget) }}</span>
          </div>
          <div class="flex-row space-between text-muted">
            <span>Total Expenses & Taxes</span>
            <span>- {{ formatCurrency(stats.totalExpensesAtTarget) }}</span>
          </div>
          <hr class="divider" />
          <div class="flex-row space-between result-row text-profit">
            <span>Net Profit</span>
            <strong>{{ formatCurrency(stats.netProfitAtTarget) }}</strong>
          </div>
        </div>
      </div>

      <!-- Stop Loss Section (Risk) -->
      <div class="zone sl-zone">
        <h3>Stop Loss</h3>
        
        <div class="input-grid">
          <div class="input-group">
            <label>Stop Loss Price (₹)</label>
            <StepperInput v-model="slPrice" :min="0" :step="0.5" />
          </div>
          <div class="input-group">
            <label>Max Acceptable Loss (₹)</label>
            <StepperInput v-model="slNetLossInput" :min="0" :step="100" />
          </div>
        </div>

        <div class="slider-group">
          <div class="flex-row space-between">
            <label>Max Loss %</label>
            <span class="text-loss">{{ slPercentInput }}%</span>
          </div>
          <input 
            type="range" 
            v-model.number="slPercentInput" 
            min="0.5" max="20" step="0.1" 
          />
        </div>

        <!-- NEW: Stop Loss Breakdown Details -->
        <div class="breakdown">
          <div class="flex-row space-between">
            <span>Gross Loss</span>
            <span>{{ formatCurrency(stats.grossLossAtSl) }}</span>
          </div>
          <div class="flex-row space-between text-muted">
            <span>Total Expenses & Taxes</span>
            <span>- {{ formatCurrency(stats.totalExpensesAtSl) }}</span>
          </div>
          <hr class="divider" />
          <div class="flex-row space-between result-row text-loss">
            <span>Net Loss</span>
            <strong>{{ formatCurrency(stats.netLossAtSl) }}</strong>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <button class="save-btn" @click="emit('saveRecord')">
        Save to History Queue
      </button>
    </div>
  </div>
</template>

<style scoped>
.board h2 {
  color: var(--color-accent);
  margin-bottom: var(--spacing-lg);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl) 0;
  color: var(--text-muted);
  font-style: italic;
}

.board-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.investment-summary {
  background-color: var(--color-border);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: 1.1rem;
}

.zone {
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.target-zone {
  background: linear-gradient(to bottom right, var(--bg-surface), rgba(167, 243, 208, 0.1));
  border-left: 4px solid var(--color-profit);
}

.sl-zone {
  background: linear-gradient(to bottom right, var(--bg-surface), rgba(254, 205, 211, 0.1));
  border-left: 4px solid var(--color-loss);
}

.input-grid {
  display: grid;
  grid-template-columns: 1fr; /* Stack vertically on mobile */
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

@media (min-width: 600px) {
  .input-grid {
    grid-template-columns: 1fr 1fr; /* Side-by-side on desktop */
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.input-group label {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-align: center; /* Center align labels on mobile */
}

@media (min-width: 600px) {
  .input-group label {
    text-align: left;
  }
}

/* Optional: center align the zone titles on mobile */
.zone h3 {
  text-align: center;
}
@media (min-width: 600px) {
  .zone h3 {
    text-align: left;
  }
}

.slider-group {
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

/* Minimal styling for range slider */
input[type="range"] {
  width: 100%;
  margin-top: var(--spacing-sm);
  cursor: pointer;
}

.breakdown {
  margin-top: var(--spacing-md);
  background-color: var(--bg-surface);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
}

.text-muted {
  color: var(--text-muted);
}

.divider {
  border: none;
  border-top: 1px dashed var(--color-border);
  margin: var(--spacing-sm) 0;
}

.result-row {
  font-size: 1.1rem;
}

.save-btn {
  width: 100%;
  background-color: var(--text-main);
  color: var(--bg-app);
  margin-top: var(--spacing-sm);
}
</style>