# csv-to-json

CLI tool that converts CSV files to JSON. Supports custom delimiters, column mapping, and optional schema validation of the output.

## Stack

TypeScript, Node.js 20+, Commander (CLI), csv-parse, Ajv (schema validation), Vitest

## Commands

```
pnpm install          — install dependencies
pnpm dev [file]       — run on a file in watch mode
pnpm build            — compile to dist/
pnpm test:run         — run unit tests
pnpm typecheck        — TypeScript validation
pnpm lint             — lint check
```

## Key files

```
src/cli.ts            — entry point, Commander setup and argument parsing
src/parser.ts         — CSV parsing (wraps csv-parse, handles encoding)
src/transform.ts      — column mapping and field transformation
src/validate.ts       — optional JSON schema validation via Ajv
schemas/              — user-provided JSON schemas for output validation
```

## Domain rules

- Empty cells and explicit null values in CSV both map to `null` in JSON — never an empty string `""`
- Numbers in CSV source are always strings until the transform step explicitly casts them — never auto-cast
- BOM character at the start of Windows-generated CSV files must be stripped before parsing
- Column names from the header row are used as-is as JSON keys — no automatic camelCase conversion

## Notes

- Large files (>50MB) must use the streaming path (`--stream` flag) — loading them fully into memory will OOM
- The `schemas/` directory is optional; if absent, Ajv validation step is skipped without error
- `dist/` is .gitignored — run `pnpm build` locally before publishing
