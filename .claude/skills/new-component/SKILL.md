---
name: new-component
description: Create a FSD-structured UI component with Vue SFC, co-located test, and index barrel. Usage: /new-component ComponentName [shared|features|widgets]
---

# /new-component $ARGUMENTS

Parse: first word is ComponentName (must be PascalCase — error and stop if not). Second word is
layer: shared, features, or widgets. Default layer: shared.

Component paths per layer:
- shared   → src/shared/ui/ComponentName/
- features → src/features/ComponentName/
- widgets  → src/widgets/ComponentName/

## 1. Read existing components

Read 1-2 existing components in the target layer to understand:
- File structure (script/template/style ordering)
- SCSS class naming convention (BEM)
- How props are typed
- Test patterns (@vue/test-utils, describe/it blocks)

If the target layer is empty, read from src/shared/ui/ as the reference.

## 2. Create ComponentName.vue

Structure (strict ordering):

```vue
<script setup lang="ts">
// props interface at top
// emits definition if needed
// composables and computed
</script>

<template>
  <!-- semantic HTML -->
  <!-- CSS classes follow BEM: .component-name__element--modifier -->
  <!-- use var(--color-*) and var(--color-*) tokens, never hardcoded values -->
</template>

<style lang="scss" scoped>
// BEM structure
// var(--token-name) for all colors and spacing
// @media (prefers-reduced-motion: reduce) for any animations
</style>
```

## 3. Create ComponentName.test.ts

Co-locate in the same directory. Import from @vue/test-utils. Use describe/it blocks. No snapshot tests.

Required test coverage:
- Props render correctly (test at least 2 prop variations if applicable)
- Slot content renders (if component has slots)
- Emitted events fire on interaction (if component has emits)
- Keyboard interaction: Tab, Enter, Space where applicable
- ARIA attributes present when expected (aria-label, role, aria-expanded, etc.)

## 4. Create index.ts

```typescript
export { default } from './ComponentName.vue';
// export type { ComponentNameProps } from './ComponentName.vue'; // if using defineProps with exported interface
```

## 5. Verify

Run: pnpm typecheck && pnpm test:run ComponentName

Both must pass with zero errors before reporting.

## 6. Report

State: files created (3 paths), what tests cover, props interface, emits defined (if any).
