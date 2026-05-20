<script setup lang="ts">
import { SITE } from '@shared/config/site';

const terminalContent = [
  `<span class="terminal__prompt">$</span> whoami\n<span class="terminal__value">${SITE.name}</span>`,
  `<span class="terminal__prompt">$</span> location\n<span class="terminal__value">${SITE.location}</span>`,
  `<span class="terminal__prompt">$</span> experience\n<span class="terminal__value">7+ years · fintech</span>`,
  `<span class="terminal__prompt">$</span> stack\n<span class="terminal__value">Vue 3 · TypeScript · Astro</span>`,
  `<span class="terminal__prompt">$</span> <span class="terminal__cursor" aria-hidden="true"></span>`,
].join('\n\n');
</script>

<template>
  <div
    class="terminal"
    aria-label="Terminal output"
  >
    <div class="terminal__bar">
      <span
        class="terminal__dot"
        aria-hidden="true"
      />
      <span
        class="terminal__dot"
        aria-hidden="true"
      />
      <span
        class="terminal__dot"
        aria-hidden="true"
      />
      <span class="terminal__title">dmytro@dev:~</span>
    </div>
    <!-- eslint-disable vue/no-v-html -->
    <!-- content is developer-controlled config only, no user input -->
    <pre
      class="terminal__body"
      aria-label="About me in terminal format"
      v-html="terminalContent"
    />
    <!-- eslint-enable vue/no-v-html -->
  </div>
</template>

<style scoped>
.terminal {
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  overflow: hidden;
}

.terminal__bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.terminal__dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background-color: var(--color-border);
  flex-shrink: 0;
}

.terminal__title {
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  color: var(--color-muted);
  margin-left: var(--space-2);
}

.terminal__body {
  padding: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  line-height: 1.8;
  color: var(--color-text);
  white-space: pre;
  overflow-x: auto;
  margin: 0;
}

.terminal__body :deep(.terminal__prompt) {
  color: var(--color-accent);
  user-select: none;
}

.terminal__body :deep(.terminal__value) {
  color: var(--color-text);
}

.terminal__body :deep(.terminal__cursor) {
  display: inline-block;
  width: 8px;
  height: 14px;
  background-color: var(--color-accent);
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
  }
}
</style>
