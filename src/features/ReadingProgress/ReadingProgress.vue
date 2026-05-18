<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const progress = ref(0);

function onScroll() {
  const scrollable = document.body.scrollHeight - window.innerHeight;
  progress.value = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <div
    class="reading-progress"
    role="progressbar"
    aria-hidden="true"
  >
    <div
      class="reading-progress__bar"
      :style="{ width: `${progress * 100}%` }"
    />
  </div>
</template>

<style scoped>
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: calc(var(--z-header) + 1);
  pointer-events: none;
  background: var(--color-border);
}

.reading-progress__bar {
  height: 100%;
  background: var(--color-accent);
  transition: width 50ms linear;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
</style>
