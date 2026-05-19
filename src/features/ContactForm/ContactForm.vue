<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';

const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string;

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const formState = ref<FormState>('idle');
const name = ref('');
const email = ref('');
const message = ref('');
const honeypot = ref('');
const turnstileToken = ref('');
const turnstileWidgetId = ref<string | undefined>();
const errorMessage = ref('');

const successEl = ref<HTMLElement | null>(null);
const turnstileContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  if (turnstileContainer.value && window.turnstile) {
    turnstileWidgetId.value = window.turnstile.render(turnstileContainer.value, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => {
        turnstileToken.value = token;
      },
      'expired-callback': () => {
        turnstileToken.value = '';
      },
    });
  }
});

function resetTurnstile(): void {
  turnstileToken.value = '';
  if (turnstileWidgetId.value !== undefined && window.turnstile) {
    window.turnstile.reset(turnstileWidgetId.value);
  }
}

async function submit(): Promise<void> {
  if (!turnstileToken.value) return;

  formState.value = 'submitting';
  errorMessage.value = '';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        message: message.value,
        honeypot: honeypot.value,
        turnstileToken: turnstileToken.value,
      }),
    });

    const data = (await res.json()) as { success: boolean; message?: string };

    if (data.success) {
      formState.value = 'success';
      await nextTick();
      successEl.value?.focus();
    } else {
      formState.value = 'error';
      errorMessage.value = data.message ?? 'Something went wrong. Please try again.';
      resetTurnstile();
    }
  } catch {
    formState.value = 'error';
    errorMessage.value = 'Network error. Please check your connection and try again.';
    resetTurnstile();
  }
}
</script>

<template>
  <div class="contact-form">
    <div
      v-if="formState === 'success'"
      ref="successEl"
      class="contact-form__success"
      tabindex="-1"
      aria-live="assertive"
    >
      <span
        class="contact-form__success-icon"
        aria-hidden="true"
      >✓</span>
      <p class="contact-form__success-text">
        Message sent!
      </p>
      <p class="contact-form__success-sub">
        I'll get back to you shortly.
      </p>
    </div>

    <form
      v-else
      class="contact-form__form"
      novalidate
      @submit.prevent="submit"
    >
      <p
        v-if="formState === 'error'"
        class="contact-form__error"
        role="alert"
        aria-live="polite"
      >
        {{ errorMessage }}
      </p>

      <div class="contact-form__field">
        <label
          class="contact-form__label"
          for="cf-name"
        >Name</label>
        <input
          id="cf-name"
          v-model="name"
          class="contact-form__input"
          type="text"
          autocomplete="name"
          aria-required="true"
          :disabled="formState === 'submitting'"
        >
      </div>

      <div class="contact-form__field">
        <label
          class="contact-form__label"
          for="cf-email"
        >Email</label>
        <input
          id="cf-email"
          v-model="email"
          class="contact-form__input"
          type="email"
          autocomplete="email"
          aria-required="true"
          :disabled="formState === 'submitting'"
        >
      </div>

      <div class="contact-form__field">
        <label
          class="contact-form__label"
          for="cf-message"
        >Message</label>
        <textarea
          id="cf-message"
          v-model="message"
          class="contact-form__textarea"
          rows="6"
          aria-required="true"
          :disabled="formState === 'submitting'"
        />
      </div>

      <!-- Honeypot — hidden from real users, visible to bots -->
      <div
        class="contact-form__honeypot"
        aria-hidden="true"
      >
        <label for="cf-honeypot">Leave this empty</label>
        <input
          id="cf-honeypot"
          v-model="honeypot"
          type="text"
          tabindex="-1"
          autocomplete="off"
        >
      </div>

      <div
        ref="turnstileContainer"
        class="contact-form__turnstile"
      />

      <button
        class="contact-form__submit"
        type="submit"
        :disabled="formState === 'submitting' || !turnstileToken"
        :aria-busy="formState === 'submitting'"
      >
        {{ formState === 'submitting' ? 'Sending…' : 'Send message' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.contact-form {
  width: 100%;
}

.contact-form__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.contact-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.contact-form__label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-subtle);
}

.contact-form__input,
.contact-form__textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
  transition: border-color var(--transition-fast);
  box-sizing: border-box;

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-color: var(--color-accent);
  }

  &:hover:not(:disabled) {
    border-color: var(--color-border-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.contact-form__textarea {
  resize: vertical;
  min-height: 140px;
}

.contact-form__honeypot {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.contact-form__turnstile {
  min-height: 65px;
}

.contact-form__error {
  font-size: 13px;
  color: var(--color-accent);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-accent);
  border-radius: 0;
}

.contact-form__submit {
  align-self: flex-start;
  padding: var(--space-3) var(--space-6);
  background: var(--color-accent);
  color: var(--color-bg);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: background-color var(--transition-fast);

  &:hover:not(:disabled) {
    background: var(--color-accent-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.contact-form__success {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-8) 0;

  &:focus-visible {
    outline: none;
  }
}

.contact-form__success-icon {
  font-size: 24px;
  color: var(--color-accent);
}

.contact-form__success-text {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
}

.contact-form__success-sub {
  font-size: 14px;
  color: var(--color-muted);
}

@media (prefers-reduced-motion: reduce) {
  .contact-form__input,
  .contact-form__textarea,
  .contact-form__submit {
    transition: none;
  }
}
</style>
