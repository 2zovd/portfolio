<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { SITE } from '@shared/config/site';
import { useTerminalSession } from './useTerminalSession';

const bodyRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

function scrollToBottom() {
  const el = bodyRef.value;
  if (el && typeof el.scrollTo === 'function') {
    el.scrollTo({ top: el.scrollHeight });
  }
}

const { isInteractive, inputValue, outputHistory, enter, exit, execute, clearHistory, navigateHistory } =
  useTerminalSession(scrollToBottom);

async function handleContainerClick() {
  if (isInteractive.value) return;
  enter();
  await nextTick();
  inputRef.value?.focus();
}

async function handleContainerKeydown(e: KeyboardEvent) {
  if (!isInteractive.value && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    enter();
    await nextTick();
    inputRef.value?.focus();
  }
  if (isInteractive.value && e.key === 'Escape') {
    exit();
    await nextTick();
    containerRef.value?.focus();
  }
  if (isInteractive.value && e.metaKey && e.key === 'k') {
    e.preventDefault();
    clearHistory();
  }
}

const cursorPosition = ref(0);

function syncCursor(e: Event) {
  const el = e.target as HTMLInputElement;
  cursorPosition.value = el.selectionStart ?? el.value.length;
}

const staticLines = [
  { prompt: 'whoami', value: SITE.name },
  { prompt: 'location', value: SITE.location },
  { prompt: 'experience', value: '7+ years · fintech' },
  { prompt: 'stack', value: 'Vue 3 · TypeScript · Astro' },
];
</script>

<template>
  <div
    ref="containerRef"
    class="terminal"
    :class="{ 'terminal--active': isInteractive }"
    :tabindex="isInteractive ? -1 : 0"
    role="group"
    aria-label="Interactive terminal"
    @click="handleContainerClick"
    @keydown="handleContainerKeydown"
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

    <div
      ref="bodyRef"
      class="terminal__body"
      role="log"
      aria-live="polite"
      aria-label="Terminal output"
    >
      <div
        v-for="line in staticLines"
        :key="line.prompt"
        class="terminal__line"
      >
        <span
          class="terminal__prompt"
          aria-hidden="true"
        >$</span>
        <span class="terminal__cmd">{{ line.prompt }}</span>
        <span class="terminal__value">{{ line.value }}</span>
      </div>

      <div
        v-for="(entry, i) in outputHistory"
        :key="i"
        class="terminal__line terminal__line--group"
      >
        <div class="terminal__line">
          <span
            class="terminal__prompt"
            aria-hidden="true"
          >$</span>
          <span class="terminal__cmd">{{ entry.command }}</span>
        </div>
        <div
          v-if="entry.output"
          :class="['terminal__output', `terminal__output--${entry.type}`]"
        >
          {{ entry.output }}
        </div>
      </div>

      <div class="terminal__line terminal__line--input">
        <span
          class="terminal__prompt"
          aria-hidden="true"
        >$</span>
        <div
          v-if="isInteractive"
          class="terminal__input-wrapper"
        >
          <input
            ref="inputRef"
            v-model="inputValue"
            class="terminal__input"
            type="text"
            aria-label="Terminal command input"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            @keydown.enter.prevent="execute"
            @keydown.up.prevent="navigateHistory(-1)"
            @keydown.down.prevent="navigateHistory(1)"
            @keydown.esc.prevent="() => {}"
            @input="syncCursor"
            @keyup="syncCursor"
            @click="syncCursor"
            @select="syncCursor"
          >
          <!-- mirror drives fake block-cursor position via ::after -->
          <span
            class="terminal__input-mirror"
            aria-hidden="true"
          >{{ inputValue.slice(0, cursorPosition) }}</span>
        </div>
        <span
          v-else
          class="terminal__cursor"
          aria-hidden="true"
        />
      </div>
    </div>

    <div
      class="terminal__hint"
      aria-hidden="true"
    >
      <template v-if="!isInteractive">
        click to chat ·
      </template>type 'help'
    </div>
  </div>
</template>

<style scoped>
.terminal {
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  overflow: hidden;
  position: relative;
  cursor: text;
  outline: none;

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
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
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 280px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.terminal__line {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.terminal__line--group {
  flex-direction: column;
  gap: 0;
}

.terminal__line--input {
  margin-top: var(--space-1);
}

.terminal__prompt {
  color: var(--color-accent);
  user-select: none;
  flex-shrink: 0;
}

.terminal__cmd {
  color: var(--color-text);
}

.terminal__value {
  color: var(--color-muted);
}

.terminal__output {
  padding-left: calc(var(--space-2) + 1ch);
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-muted);

  &.terminal__output--error {
    color: var(--color-accent);
  }

  &.terminal__output--success {
    color: var(--color-text);
  }
}

/* --- input wrapper + fake block cursor --- */

.terminal__input-wrapper {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
}

.terminal__input {
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  caret-color: transparent;
  flex: 1;
  padding: 0;
  min-width: 0;
}

/* invisible mirror: positions the fake cursor after the text at selectionStart */
.terminal__input-mirror {
  position: absolute;
  left: 0;
  top: 0;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  line-height: inherit;
  white-space: pre;
  visibility: hidden;
  pointer-events: none;
  user-select: none;

  &::after {
    content: '';
    display: inline-block;
    width: 8px;
    height: 1em;
    background-color: var(--color-accent);
    vertical-align: baseline;
    visibility: visible;
    animation: blink 1s step-end infinite;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
      opacity: 1;
    }
  }
}

/* --- static block cursor (inactive state) --- */

.terminal__cursor {
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

/* --- hint bar --- */

.terminal__hint {
  position: absolute;
  bottom: var(--space-2);
  right: var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  color: var(--color-subtle);
  pointer-events: none;
}
</style>
