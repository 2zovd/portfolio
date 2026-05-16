# Contributing to claude-code-starter

Contributions welcome. Read this first to understand what fits and what doesn't.

## Core principles — non-negotiable

1. **`CLAUDE.md` stays under 150 lines.** Longer files cause Claude to ignore instructions. Details belong in `agent_docs/` (generated per-project at bootstrap — not present in this repo).
2. **Tools enforce style, not text instructions.** Linting, formatting, type-checking belong in config files and hooks — not in the session prompt.
3. **No stack-specific content in the universal layer.** Guides, templates, and the code-reviewer subagent must work for any language and any framework.

## Types of contributions

### Improving a guide

Files in `guides/` are the highest-leverage contribution. A good guide improvement:
- Adds a concrete example where an abstract rule existed
- Removes advice that doesn't generalize across stacks
- Fixes something Claude consistently misapplies

To update a guide: edit the file, open a PR explaining what was wrong and what was improved.

### Adding or improving an example

`examples/` contains reference implementations showing what a well-configured project looks like.

A good example:
- Uses a neutral, universally understood project type (not a personal or company project)
- Demonstrates all key files: CLAUDE.md, AGENTS.md, at least one skill
- Includes realistic domain rules and notes — not placeholder text
- Shows a skill that has a clear verification step

To add an example: create a new directory under `examples/`, follow the structure in `examples/node-cli-tool/`, open a PR.

### Improving templates

Files in `templates/` are the starting scaffolds Claude fills in during bootstrap.

Changes should keep templates stack-neutral. A good template has clear placeholders and comments explaining what each section is for. Remove content that only makes sense for one language or framework.

### Bug fixes

Most valuable bugs: bootstrap produces a broken or nonsensical result for a specific type of project, or CLAUDE.md/AGENTS.md contains outdated advice.

## What we won't accept

- Presets for specific tech stacks (use the dynamic bootstrap approach instead)
- Stack-specific patterns in shared guides or templates
- Examples based on personal, commercial, or NDA-constrained projects
- Advice that applies only to one language or framework in a universal-layer file

## Versioning

- **MAJOR**: breaking change to bootstrap protocol or file layout
- **MINOR**: new guide, new example, improved template
- **PATCH**: fixes, clarifications, documentation corrections

## License

By contributing, you agree your contributions are licensed under MIT.
