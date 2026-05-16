---
name: new-transformer
description: Add a new field transformer to the converter pipeline. Usage: /new-transformer name description
---

# /new-transformer $ARGUMENTS

Parse arguments: first word is the transformer name (kebab-case), rest is the description of what it does.

## 1. Read existing transformers

Read `src/transformers/` to understand the file structure and function signature used by existing transformers.

Read `src/transform.ts` to see how transformers are registered and applied.

## 2. Clarify (if needed)

If it's unclear what input this transformer accepts or what it should return, ask one question before continuing.

## 3. Create transformer file

Create `src/transformers/{name}.ts`.

The function must follow the existing signature: `(value: string | null, options?: Record<string, unknown>) => unknown`

Handle `null` input explicitly — never assume the value is a string.

## 4. Register transformer

Add the new transformer to the exports in `src/transformers/index.ts`.

## 5. Write tests

Create `tests/transformers/{name}.test.ts`.

Test cases must include:
- Happy path with typical input
- `null` input handling
- Edge case specific to this transformer (empty string, boundary value, etc.)

## 6. Verify

```bash
pnpm typecheck
pnpm test:run tests/transformers/{name}.test.ts
```

Show output. Both must pass before declaring done.

## 7. Report

State: file created, how it's registered, what the test file covers.
