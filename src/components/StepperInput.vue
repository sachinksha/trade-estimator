<script setup lang="ts">
const model = defineModel<number | ''>();

const props = withDefaults(defineProps<{
  id?: string;
  placeholder?: string;
  min?: number;
  step?: number;
}>(), {
  min: 0,
  step: 1
});

// Handles adding/subtracting and fixes floating-point math quirks (e.g., 0.1 + 0.2)
const adjust = (direction: 1 | -1) => {
  let current = Number(model.value) || 0;
  let newValue = current + (props.step * direction);
  
  if (newValue < props.min) {
    newValue = props.min;
  }
  
  // Format to max 2 decimal places to prevent long floating point strings
  model.value = Number(newValue.toFixed(2));
};
</script>

<template>
  <div class="stepper-wrapper">
    <button type="button" class="stepper-btn" @click="adjust(-1)" aria-label="Decrease">−</button>
    <input 
      :id="id"
      type="number"
      v-model="model"
      :min="min"
      :step="step"
      :placeholder="placeholder"
    />
    <button type="button" class="stepper-btn" @click="adjust(1)" aria-label="Increase">+</button>
  </div>
</template>

<style scoped>
.stepper-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--bg-surface);
  border: 1px solid var(--color-border); /* Thinner border */
  border-radius: var(--radius-md);
  transition: border-color 0.2s;
  overflow: hidden;
  height: 40px; /* Lock height */
  width: 100%;
}

.stepper-wrapper:focus-within {
  border-color: var(--color-accent);
}

.stepper-wrapper input {
  flex: 1;
  border: none;
  border-radius: 0;
  background: transparent;
  padding: 0 var(--spacing-xs);
  height: 100%;
  text-align: center;
  outline: none;
}

.stepper-btn {
  background-color: transparent;
  color: var(--text-main);
  border: none;
  border-radius: 0;
  width: 40px; /* Fixed square touch target (40x40) */
  height: 100%;
  padding: 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.1s;
}

.stepper-btn:hover {
  background-color: var(--color-border);
}

.stepper-btn:active {
  background-color: var(--color-accent);
  color: var(--bg-app);
}
</style>