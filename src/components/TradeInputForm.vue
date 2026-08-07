<script setup lang="ts">
// Using defineModel for seamless two-way binding with the parent component
const symbol = defineModel<string>('symbol');
const buyPrice = defineModel<number | ''>('buyPrice');
const qty = defineModel<number | ''>('qty');
const tradeType = defineModel<'delivery' | 'intraday'>('tradeType');
</script>

<template>
  <div class="card trade-form">
    <h2>1. Trade Setup</h2>
    
    <div class="form-grid">
      <!-- Script Symbol -->
      <div class="input-group">
        <label for="symbol">Script Symbol</label>
        <input 
          id="symbol" 
          type="text" 
          v-model="symbol" 
          placeholder="e.g. RELIANCE or INFY" 
          autocomplete="off"
        />
      </div>

      <!-- Trade Type Toggle -->
      <div class="input-group">
        <label>Trade Type</label>
        <div class="toggle-pill">
          <button 
            type="button"
            :class="{ active: tradeType === 'delivery' }"
            @click="tradeType = 'delivery'"
          >
            Delivery
          </button>
          <button 
            type="button"
            :class="{ active: tradeType === 'intraday' }"
            @click="tradeType = 'intraday'"
          >
            Intraday
          </button>
        </div>
      </div>

      <!-- Buy Price -->
      <div class="input-group">
        <label for="buyPrice">Avg Buy Price (₹)</label>
        <input 
          id="buyPrice" 
          type="number" 
          v-model="buyPrice" 
          min="0" 
          step="0.05" 
          placeholder="0.00" 
        />
      </div>

      <!-- Quantity -->
      <div class="input-group">
        <label for="qty">Quantity</label>
        <input 
          id="qty" 
          type="number" 
          v-model="qty" 
          min="1" 
          step="1" 
          placeholder="0" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.trade-form h2 {
  margin-bottom: var(--spacing-lg);
  color: var(--color-accent);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

label {
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text-muted);
}

/* Custom Pill Toggle styling replacing standard radio buttons */
.toggle-pill {
  display: flex;
  background-color: var(--color-border);
  border-radius: var(--radius-md);
  padding: 4px;
}

.toggle-pill button {
  flex: 1;
  background-color: transparent;
  color: var(--text-muted);
  border-radius: calc(var(--radius-md) - 4px);
  padding: var(--spacing-sm);
  font-size: 0.95rem;
  box-shadow: none;
}

.toggle-pill button:hover {
  opacity: 1;
  color: var(--text-main);
}

.toggle-pill button.active {
  background-color: var(--bg-surface);
  color: var(--text-main);
  box-shadow: var(--shadow-sm);
  font-weight: 700;
}
</style>