<script setup lang="ts">
defineProps<{
  name: string;
  label: string;
  modelValue: string;
  error?: string;
  type?: 'text' | 'email' | 'textarea';
  autocomplete?: string;
  maxlength?: number;
  rows?: number;
  disabled?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: string];
  blur: [];
  input: [];
}>();
</script>

<template>
  <div class="form-field">
    <label
      class="form-field__label"
      :for="name"
    >{{ label }}</label>
    <textarea
      v-if="type === 'textarea'"
      :id="name"
      class="form-field__textarea"
      :class="{ 'form-field__textarea--error': error }"
      :value="modelValue"
      :rows="rows"
      :maxlength="maxlength"
      :disabled="disabled"
      aria-required="true"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${name}-error` : undefined"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value); $emit('input')"
      @blur="$emit('blur')"
    />
    <input
      v-else
      :id="name"
      class="form-field__input"
      :class="{ 'form-field__input--error': error }"
      :type="type ?? 'text'"
      :value="modelValue"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :disabled="disabled"
      aria-required="true"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${name}-error` : undefined"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value); $emit('input')"
      @blur="$emit('blur')"
    >
    <span
      v-if="error"
      :id="`${name}-error`"
      class="form-field__error"
      aria-live="polite"
    >{{ error }}</span>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-field__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-subtle);
}

.form-field__input,
.form-field__textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
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

.form-field__textarea {
  resize: vertical;
  min-height: 140px;
}

.form-field__error {
  font-size: var(--font-size-sm);
  color: var(--color-accent);
}

.form-field__input--error,
.form-field__textarea--error {
  border-color: var(--color-accent);
}

@media (prefers-reduced-motion: reduce) {
  .form-field__input,
  .form-field__textarea {
    transition: none;
  }
}
</style>
