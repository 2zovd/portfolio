<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { SITE } from '@shared/config/site';
import { useFocusTrap } from '@shared/lib/useFocusTrap';

const isOpen = ref(false);
const isMounted = ref(false);
const overlayRef = ref<HTMLElement | null>(null);
const currentPath = ref('');

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const { activate, deactivate } = useFocusTrap(overlayRef, () => close());

onMounted(() => {
  isMounted.value = true;
  currentPath.value = window.location.pathname;
});

function open(): void {
  isOpen.value = true;
  nextTick(() => {
    (overlayRef.value?.querySelector<HTMLElement>(FOCUSABLE) as HTMLElement | null)?.focus();
  });
}

function close(): void {
  isOpen.value = false;
}

watch(isOpen, (open) => {
  if (open) {
    activate();
    document.body.style.overflow = 'hidden';
  } else {
    deactivate();
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  deactivate();
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="mobile-nav">
    <button
      class="mobile-nav__trigger"
      :class="{ 'is-open': isOpen }"
      :aria-expanded="isOpen"
      :aria-label="isOpen ? 'Close navigation' : 'Open navigation'"
      aria-controls="mobile-nav-overlay"
      @click="isOpen ? close() : open()"
    >
      <span
        class="hamburger"
        aria-hidden="true"
      >
        <span class="bar bar-top" />
        <span class="bar bar-mid" />
        <span class="bar bar-bot" />
      </span>
    </button>

    <Teleport
      v-if="isMounted"
      to="body"
    >
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
          <button
            class="mobile-nav__close"
            aria-label="Close navigation"
            @click="close"
          >
            <svg
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
                  :class="[
                    'mobile-nav__link',
                    { 'mobile-nav__link--active': item.href === currentPath },
                  ]"
                  :aria-current="item.href === currentPath ? 'page' : undefined"
                  @click="close"
                >
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </Transition>
    </teleport>
  </div>
</template>

<style scoped>
.mobile-nav {
  display: none;
  position: relative;

  @media (max-width: #{$bp-md - 1px}) {
    display: block;
  }
}

/* ── Trigger button ── */
.mobile-nav__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-none);
  color: var(--color-muted);
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast);

  &:hover {
    border-color: var(--color-border-hover);
    color: var(--color-text);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}

/* ── CSS hamburger → X morph ── */
.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 18px;
  height: 18px;
}

.bar {
  display: block;
  width: 18px;
  height: 2px;
  background: currentColor;
  transform-origin: center;
  transition:
    transform 200ms var(--ease-out-expo),
    opacity 150ms,
    background-color var(--transition-fast);
}

.is-open .bar-top {
  transform: translateY(6px) rotate(45deg);
}

.is-open .bar-mid {
  opacity: 0;
  transform: scaleX(0);
}

.is-open .bar-bot {
  transform: translateY(-6px) rotate(-45deg);
}

/* ── Overlay ── */
.mobile-nav__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  background-color: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Close button (X inside overlay) ── */
.mobile-nav__close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-6);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-none);
  color: var(--color-muted);
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast);

  &:hover {
    border-color: var(--color-border-hover);
    color: var(--color-text);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}

/* ── Nav list ── */
.mobile-nav__list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
}

.mobile-nav__link {
  font-size: var(--font-size-5xl);
  font-weight: 500;
  color: var(--color-muted);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  padding-bottom: var(--space-1);
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast);

  &:hover {
    color: var(--color-text);
    border-bottom-color: var(--color-border-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 4px;
  }
}

.mobile-nav__link--active {
  color: var(--color-text);
  border-bottom-color: var(--color-accent);
}

/* ── Slide-in transition ── */
.overlay-enter-active {
  transition:
    opacity 200ms var(--ease-out-expo),
    transform 200ms var(--ease-out-expo);
}

.overlay-leave-active {
  transition: opacity 150ms ease-in;
}

.overlay-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.overlay-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .bar {
    transition: none;
  }

  .overlay-enter-active,
  .overlay-leave-active {
    transition: none;
  }
}
</style>
