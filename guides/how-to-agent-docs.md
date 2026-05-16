# How to Use agent_docs/

`agent_docs/` is a directory for detailed reference material that would bloat CLAUDE.md if included directly. Claude reads these files on demand — when a topic becomes relevant — rather than loading everything into every session.

## The problem it solves

CLAUDE.md has a hard limit of ~150 lines for good reason: longer files cause uniform degradation where all rules weaken together. But some projects need more detail than 150 lines can hold: a complex data schema, a set of domain-specific content rules, API contracts, architecture decisions.

`agent_docs/` holds the overflow.

## When to create a file

Create a file in `agent_docs/` when:
- A topic would take more than 15–20 lines to explain properly
- You find yourself wanting to explain the same thing repeatedly
- CLAUDE.md is approaching 120+ lines and something needs to move

Don't create files for:
- Things Claude already knows (general programming best practices)
- Information already in comments or docstrings in the code
- One-time notes — those belong in the commit message

## Suggested files and when to create them

| File | Create when |
|------|-------------|
| `domain-rules.md` | Project has content/style rules an AI would not guess from the code |
| `data-schema.md` | There's a core data model (JSON schema, DB schema) Claude will need to know |
| `api-contracts.md` | External API shapes that aren't obvious from the code |
| `architecture.md` | Non-obvious structural decisions with important constraints |
| `verification.md` | Complex verification requirements beyond "run the tests" |

## How Claude finds and uses these files

Claude reads `agent_docs/` files when they become relevant. You can also reference them explicitly from CLAUDE.md:

```markdown
## Domain rules
See agent_docs/domain-rules.md
```

Or from a skill:
```markdown
## 1. Read context
Read agent_docs/data-schema.md before creating new fields.
```

The files don't need to be referenced explicitly — Claude will look for them when a topic matches. But explicit references help when the connection is non-obvious.

## File format

Keep each file focused on one topic. Start with a one-line summary of what the file covers and when to read it:

```markdown
# Domain Rules

> Read when writing, editing, or reviewing any user-facing text content.

[content]
```

## Example: domain-rules.md

```markdown
# Domain Rules

> Read when writing or editing any text content (summaries, descriptions, labels, copy).

## Language and style
- Use plain English. No jargon unless defined.
- Sentences under 25 words where possible.
- Active voice. "The system stores X" not "X is stored by the system."
- Never use em-dash (—). Use a comma, period, or rewrite the sentence.

## Numbers and claims
- Never invent statistics or metrics. If a number is in the source data, use it. If not, ask.
- Percentages: round to nearest whole number unless precision matters.

## Sensitive areas
- Customer names and internal project codenames are confidential. Use generic descriptions.
- Legal copy must come from the legal team — never paraphrase or modify.
```

## Keeping agent_docs/ healthy

- Delete files that are no longer relevant (removed feature, changed architecture)
- Update files when the rules or schema they describe change
- If a file goes unused for months and the project has evolved, review whether it's still accurate
