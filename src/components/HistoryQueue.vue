<script setup lang="ts">
import { computed } from 'vue';
import { useHistoryQueue } from '../composables/useHistoryQueue';

const { history, clearHistory } = useHistoryQueue();

// Reverse the array for display so the newest entry is always on top
const displayHistory = computed(() => {
  return [...history.value].reverse();
});

// Currency formatter
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val);
};
</script>

<template>
  <div class="card history-sidebar">
    <div class="header-row space-between flex-row">
      <h2>Recent Estimations</h2>
      <span class="count-badge">{{ history.length }} / 10</span>
    </div>
    
    <div v-if="history.length === 0" class="empty-state">
      <p>Your saved estimations will appear here.</p>
    </div>

    <div v-else class="history-list flex-col">
      <div 
        v-for="(record, index) in displayHistory" 
        :key="index" 
        class="history-item"
      >
        <div class="item-header flex-row space-between">
          <strong>{{ record.symbol || 'UNNAMED' }}</strong>
          <span class="text-profit net-badge">
            +{{ formatCurrency(record.netProfit) }}
          </span>
        </div>
        
        <div class="item-details">
          <div class="detail-row">
            <span>Buy: {{ formatCurrency(record.buyPrice) }}</span>
            <span>Qty: {{ record.qty }}</span>
          </div>
          <div class="detail-row">
            <span>Target: {{ formatCurrency(record.targetPrice) }}</span>
            <span>SL: {{ formatCurrency(record.slPrice) }}</span>
          </div>
        </div>
      </div>
      
      <button class="clear-btn" @click="clearHistory">
        Clear Queue
      </button>
    </div>
  </div>
</template>

<style scoped>
.history-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-surface);
}

.header-row {
  margin-bottom: var(--spacing-lg);
}

.history-sidebar h2 {
  margin-bottom: 0;
  font-size: 1.25rem;
}

.count-badge {
  background-color: var(--color-border);
  padding: 2px 8px;
  border-radius: var(--radius-lg);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl) 0;
  color: var(--text-muted);
  font-style: italic;
  flex: 1;
}

.history-list {
  gap: var(--spacing-md);
  flex: 1;
}

.history-item {
  background-color: var(--bg-app);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  transition: transform 0.2s ease;
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  border-color: var(--color-accent);
}

.item-header {
  margin-bottom: var(--spacing-sm);
  border-bottom: 1px dashed var(--color-border);
  padding-bottom: var(--spacing-sm);
}

.net-badge {
  font-weight: 700;
  background-color: rgba(167, 243, 208, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

[data-theme="dark"] .net-badge {
  background-color: rgba(6, 78, 59, 0.3);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.detail-row {
  display: flex;
  justify-content: space-between;
}

.clear-btn {
  margin-top: auto;
  background-color: transparent;
  border: 1px solid var(--color-loss);
  color: var(--color-text-loss);
}

.clear-btn:hover {
  background-color: var(--color-loss);
  color: var(--text-main);
}
</style>