# How to Write an Effective CLAUDE.md

CLAUDE.md loads into every Claude Code session and competes with Claude's ~50 built-in instructions. A short, precise file wins over a long one every time. Bloated files cause uniform degradation — all rules weaken together.

## The rule: max 150 lines

If you're approaching that limit, move details to `agent_docs/`. Claude will read those files on demand.

## Required sections

```markdown
# Project Name

One-line description of what this project does.

## Stack
Language, framework, key runtime dependencies. Include versions if they matter.

## Commands
List only commands Claude will actually run:
  install: pnpm install
  dev: pnpm dev
  build: pnpm build
  test: pnpm test:run
  typecheck: pnpm typecheck
  lint: pnpm lint

## Key files
3–5 files that are most important for Claude to know about.
  src/cli.ts       — entry point
  src/schema.ts    — data contract between layers
  data/config.json — runtime configuration

## Domain rules
Project-specific rules Claude must follow — content constraints, naming rules, NDA areas, algorithmic decisions.
Only include rules that are non-obvious or would cause real problems if violated.

## Notes
Things to remember across sessions: environment quirks, known traps, setup requirements.
```

## What NOT to include

- Generic best practices ("write clean code", "handle errors") — these are built into Claude
- Duplicates of code comments — if it's in the code, don't repeat it here
- Changelog or history — that's what git is for
- Long explanations of obvious things

## Domain rules section: when to use it

Use it when the project has rules an AI would not guess from the code:
- "Never use em-dash in English text — use comma or period"
- "Numbers in the CSV source are strings until explicitly cast"
- "Internal product names are under NDA — use generic descriptions"
- "All API dates are UTC; never convert to local time before storing"

If there are no special content rules, omit this section entirely.

## Notes section: what belongs here

Things that would confuse a developer (or AI) picking up the project cold:
- First install downloads 100MB — that's normal, not broken
- Output directory is .gitignored — generate locally, never commit
- Running in dev mode requires the VPN to be active

## How to grow CLAUDE.md over time

Add a note when you hit an unexpected problem. Remove notes that turn out to be obvious. The file should reflect hard-won project knowledge, not a specification document.

If CLAUDE.md gets past 120 lines, move the most detailed section to `agent_docs/` and replace it with a one-line reference. Example:
```
## Domain rules
See agent_docs/domain-rules.md
```
