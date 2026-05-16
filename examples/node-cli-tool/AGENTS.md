# csv-to-json

A CLI tool that converts CSV files to structured JSON. Takes a CSV file as input, applies optional column mapping and type transformations, validates the output against a JSON schema if provided, and writes the result to stdout or a file.

## Repo layout

```
src/
  cli.ts          — Commander CLI: parses flags, wires pipeline stages together
  parser.ts       — CSV → raw row objects (wraps csv-parse, handles encoding/BOM)
  transform.ts    — applies column mapping, field transformers, type casting
  validate.ts     — validates output JSON against Ajv schema (no-op if no schema)
  transformers/   — individual field transformer functions (date, number, boolean...)
schemas/          — user-supplied JSON schemas for output validation (optional)
tests/            — unit tests, one file per src module
dist/             — compiled output (.gitignored)
```

## Commands

```
pnpm install    — install dependencies
pnpm dev        — run in development (tsx watch)
pnpm build      — compile TypeScript to dist/
pnpm test:run   — run test suite (Vitest)
pnpm typecheck  — tsc --noEmit
pnpm lint       — eslint check
```

## Conventions

- TypeScript strict mode throughout (`noImplicitAny`, `strictNullChecks`)
- Each pipeline stage is a pure function: `parse(input) → rows`, `transform(rows, config) → records`, `validate(records, schema) → result`
- Transformer functions in `src/transformers/` follow a uniform signature: `(value: string | null, options?: Record<string, unknown>) => unknown`
- Errors include context: which file, which row, which column, what value caused the problem
- Tests use real CSV fixtures in `tests/fixtures/` — no synthetic data invented inline

## Constraints

- Do not add runtime dependencies without a clear reason — the pipeline is intentionally small
- Do not auto-cast column types without explicit config — the "numbers as strings" rule is intentional
- Output to stdout by default; file output is opt-in via `--output` flag
- Never write to the input file
