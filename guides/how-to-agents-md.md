# How to Write AGENTS.md

AGENTS.md is cross-platform context. It is read by Claude Code, Cursor, GitHub Copilot, and any other AI tool that follows the AGENTS.md convention.

The key difference from CLAUDE.md: **no Claude-specific instructions here**. AGENTS.md contains shared facts about the project — layout, commands, conventions — not instructions about how Claude should behave.

## When to create AGENTS.md

Create it alongside CLAUDE.md. If you only use one AI tool, AGENTS.md is still useful as the canonical "how this repo works" document that any agent can read.

## What goes in AGENTS.md

```markdown
# Project Name

2–3 sentence description. What it does, who uses it, what makes it non-obvious.

## Repo layout
Short directory tree with one-line descriptions.
  src/           — application source
  src/cli.ts     — CLI entry point (Commander)
  src/parser.ts  — input parsing
  data/          — input data files
  output/        — generated files (.gitignored)
  tests/         — unit tests

## Commands
Commands any agent should know:
  pnpm install   — install dependencies
  pnpm dev       — run in development mode
  pnpm build     — compile output
  pnpm test:run  — run test suite
  pnpm typecheck — TypeScript validation
  pnpm lint      — lint check

## Conventions
Code style and naming rules that apply everywhere:
  - TypeScript strict mode throughout
  - snake_case for data fields, camelCase for code
  - Errors thrown with context — never swallowed silently

## Constraints
What not to do — hard rules with real consequences:
  - Do not commit the output/ directory
  - Do not introduce runtime dependencies without updating the Key files list in CLAUDE.md
  - All public functions must have explicit return types
```

## What NOT to put in AGENTS.md

- Instructions like "always ask before deleting" — those are Claude-specific, put them in CLAUDE.md
- Internal process notes — those belong in docs/
- Long architecture essays — keep it scannable

## Length

Aim for under 150 lines. If layout or conventions need more space, add a `docs/architecture.md` and link to it.

## AGENTS.md vs CLAUDE.md: the split

| Topic | AGENTS.md | CLAUDE.md |
|-------|-----------|-----------|
| Repo layout | ✓ | — |
| Commands | ✓ | ✓ (abbreviated) |
| Code conventions | ✓ | — |
| Domain rules | — | ✓ |
| Claude-specific behavior | — | ✓ |
| Notes / environment quirks | — | ✓ |
