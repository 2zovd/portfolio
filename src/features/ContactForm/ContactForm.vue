<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { CONTACT_API_URL } from '@shared/config/constants';
import FormField from '@shared/ui/FormField.vue';

const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string;

type FormState = 'idle' | 'submitting' | 'success' | 'error';
type TurnstileState = 'loading' | 'verified' | 'error';
type Field = 'name' | 'email' | 'message';

const formState = ref<FormState>('idle');
const turnstileState = ref<TurnstileState>('loading');
const name = ref('');
const email = ref('');
const message = ref('');
const honeypot = ref('');
const turnstileToken = ref('');
const turnstileWidgetId = ref<string | undefined>();
const errorMessage = ref('');
const touched = ref(new Set<Field>());
const errors = ref<Partial<Record<Field, string>>>({});

const formEl = ref<HTMLFormElement | null>(null);
const successEl = ref<HTMLElement | null>(null);
const turnstileContainer = ref<HTMLElement | null>(null);

const submitLabel = computed(() => {
  if (formState.value === 'submitting') return 'Sending…';
  if (turnstileState.value === 'loading') return 'Loading security check…';
  if (turnstileState.value === 'error') return 'Security check unavailable';
  return 'Send message';
});

const isSubmitDisabled = computed(() =>
  formState.value === 'submitting' ||
  turnstileState.value !== 'verified',
);

let pollTimer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  const render = () => {
    if (!turnstileContainer.value) return;
    if (!window.turnstile) { pollTimer = setTimeout(render, 50); return; }
    turnstileWidgetId.value = window.turnstile.render(turnstileContainer.value, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => {
        turnstileToken.value = token;
        turnstileState.value = 'verified';
      },
      'expired-callback': () => {
        turnstileToken.value = '';
        turnstileState.value = 'loading';
      },
      'error-callback': () => {
        turnstileToken.value = '';
        turnstileState.value = 'error';
      },
    });
  };
  render();
});

onUnmounted(() => {
  clearTimeout(pollTimer);
  if (turnstileWidgetId.value !== undefined && window.turnstile) {
    window.turnstile.remove(turnstileWidgetId.value);
    turnstileWidgetId.value = undefined;
  }
});

function isValidEmail(value: string): boolean {
  const el = document.createElement('input');
  el.type = 'email';
  el.value = value;
  return el.validity.valid;
}

function validateField(field: Field): string | undefined {
  switch (field) {
    case 'name':
      return !name.value.trim() ? 'Name is required.' : undefined;
    case 'email':
      if (!email.value.trim()) return 'Email is required.';
      return !isValidEmail(email.value.trim()) ? 'Enter a valid email address.' : undefined;
    case 'message':
      return !message.value.trim() ? 'Message is required.' : undefined;
  }
}

function validateAll(): boolean {
  const e: Partial<Record<Field, string>> = {};
  (['name', 'email', 'message'] as Field[]).forEach(field => {
    const err = validateField(field);
    if (err) e[field] = err;
  });
  errors.value = e;
  return Object.keys(e).length === 0;
}

function onBlur(field: Field): void {
  touched.value.add(field);
  errors.value = { ...errors.value, [field]: validateField(field) };
}

function onInput(field: Field): void {
  if (!touched.value.has(field)) return;
  errors.value = { ...errors.value, [field]: validateField(field) };
}

function resetTurnstile(): void {
  turnstileToken.value = '';
  turnstileState.value = 'loading';
  if (turnstileWidgetId.value !== undefined && window.turnstile) {
    window.turnstile.reset(turnstileWidgetId.value);
  }
}

async function submit(): Promise<void> {
  (['name', 'email', 'message'] as Field[]).forEach(f => touched.value.add(f));

  if (!validateAll() || !turnstileToken.value) {
    await nextTick();
    formEl.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    return;
  }

  formState.value = 'submitting';
  errorMessage.value = '';

  try {
    const res = await fetch(CONTACT_API_URL, {
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
      ref="formEl"
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

      <FormField
        name="cf-name"
        label="Name"
        :model-value="name"
        :error="errors.name"
        type="text"
        autocomplete="name"
        :maxlength="100"
        :disabled="formState === 'submitting'"
        @update:model-value="name = $event"
        @blur="onBlur('name')"
        @input="onInput('name')"
      />

      <FormField
        name="cf-email"
        label="Email"
        :model-value="email"
        :error="errors.email"
        type="email"
        autocomplete="email"
        :maxlength="254"
        :disabled="formState === 'submitting'"
        @update:model-value="email = $event"
        @blur="onBlur('email')"
        @input="onInput('email')"
      />

      <FormField
        name="cf-message"
        label="Message"
        :model-value="message"
        :error="errors.message"
        type="textarea"
        :rows="6"
        :maxlength="3000"
        :disabled="formState === 'submitting'"
        @update:model-value="message = $event"
        @blur="onBlur('message')"
        @input="onInput('message')"
      />

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

      <div class="contact-form__turnstile-wrap">
        <div
          ref="turnstileContainer"
          class="contact-form__turnstile"
        />
        <p
          v-if="turnstileState === 'error'"
          class="contact-form__turnstile-error"
          role="alert"
        >
          Security check failed. Please reload the page.
        </p>
      </div>

      <button
        class="contact-form__submit"
        type="submit"
        :disabled="isSubmitDisabled"
        :aria-busy="formState === 'submitting'"
      >
        {{ submitLabel }}
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


.contact-form__honeypot {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.contact-form__turnstile-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.contact-form__turnstile {
  min-height: 65px;
}

.contact-form__turnstile-error {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
}

.contact-form__error {
  font-size: var(--font-size-md);
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
  font-size: var(--font-size-md);
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
  font-size: var(--font-size-4xl);
  color: var(--color-accent);
}

.contact-form__success-text {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text);
}

.contact-form__success-sub {
  font-size: var(--font-size-base);
  color: var(--color-muted);
}

@media (prefers-reduced-motion: reduce) {
  .contact-form__submit {
    transition: none;
  }
}
</style>
