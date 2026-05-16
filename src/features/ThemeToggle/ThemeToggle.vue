<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isLight = ref(false);

onMounted(() => {
  isLight.value = document.documentElement.classList.contains('light');
});

function toggle(): void {
  isLight.value = !isLight.value;
  if (isLight.value) {
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.remove('light');
    localStorage.setItem('theme', 'dark');
  }
}
</script>

<template>
  <button
    class="theme-toggle"
    :aria-label="isLight ? 'Switch to dark theme' : 'Switch to light theme'"
    @click="toggle"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
  >
    <svg
      v-if="isLight"
      class="theme-toggle__icon"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="4"
      />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
    <svg
      v-else
      class="theme-toggle__icon"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-none);
  color: var(--color-muted);
  transition: border-color var(--transition-fast), color var(--transition-fast);
  flex-shrink: 0;
}

.theme-toggle:hover {
  border-color: var(--color-border-hover);
  color: var(--color-text);
}

.theme-toggle__icon {
  pointer-events: none;
}
</style>
