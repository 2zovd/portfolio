<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue';
import { SITE } from '@shared/config/site';

const isOpen = ref(false);
const overlayRef = ref<HTMLElement | null>(null);

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function open(): void {
  isOpen.value = true;
  nextTick(() => {
    (overlayRef.value?.querySelector<HTMLElement>(FOCUSABLE) as HTMLElement | null)?.focus();
  });
}

function close(): void {
  isOpen.value = false;
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    close();
    return;
  }
  if (e.key !== 'Tab' || !overlayRef.value) return;

  const focusable = Array.from(overlayRef.value.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (focusable.length === 0) return;

  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', onKeydown);
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', onKeydown);
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="mobile-nav">
    <button
      class="mobile-nav__trigger"
      :aria-expanded="isOpen"
      :aria-label="isOpen ? 'Close navigation' : 'Open navigation'"
      aria-controls="mobile-nav-overlay"
      @click="isOpen ? close() : open()"
    >
      <svg
        v-if="!isOpen"
        class="mobile-nav__icon"
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line
          x1="4"
          y1="6"
          x2="20"
          y2="6"
        />
        <line
          x1="4"
          y1="12"
          x2="20"
          y2="12"
        />
        <line
          x1="4"
          y1="18"
          x2="20"
          y2="18"
        />
      </svg>
      <svg
        v-else
        class="mobile-nav__icon"
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line
          x1="18"
          y1="6"
          x2="6"
          y2="18"
        />
        <line
          x1="6"
          y1="6"
          x2="18"
          y2="18"
        />
      </svg>
    </button>

    <Transition name="overlay">
      <div
        v-if="isOpen"
        id="mobile-nav-overlay"
        ref="overlayRef"
        class="mobile-nav__overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <nav aria-label="Mobile navigation">
          <ul
            class="mobile-nav__list"
            role="list"
          >
            <li
              v-for="item in SITE.nav"
              :key="item.href"
            >
              <a
                :href="item.href"
                class="mobile-nav__link"
                @click="close"
              >
                {{ item.label }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mobile-nav {
  display: none;
  position: relative;

  @media (max-width: 767px) {
    display: block;
  }
}

.mobile-nav__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-none);
  color: var(--color-muted);
  transition: border-color var(--transition-fast), color var(--transition-fast);

  &:hover {
    border-color: var(--color-border-hover);
    color: var(--color-text);
  }
}

.mobile-nav__icon {
  pointer-events: none;
}

.mobile-nav__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  background-color: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-nav__list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.mobile-nav__link {
  font-size: 24px;
  font-weight: 500;
  color: var(--color-muted);
  text-decoration: none;
  transition: color var(--transition-fast);

  &:hover {
    color: var(--color-text);
  }
}

.overlay-enter-active {
  transition: opacity var(--transition-fast);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.overlay-leave-active {
  transition: opacity var(--transition-fast);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
