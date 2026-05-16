# claude-code-starter

> Describe your project idea — Claude sets up the entire development environment for you.

[![CI](https://github.com/2zovd/claude-code-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/2zovd/claude-code-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub Template](https://img.shields.io/badge/Use%20this-Template-blue?logo=github)](https://github.com/2zovd/claude-code-starter/generate)

## What it does

This template gives Claude Code a bootstrap protocol. You describe your project — as a spec, a few sentences, or a markdown document — and Claude:

1. Decides the optimal tech stack for your project
2. Installs dependencies and initializes the project
3. Creates a `CLAUDE.md` with domain rules extracted from your description
4. Creates an `AGENTS.md` for cross-tool AI context
5. Generates project-specific slash commands (skills) for repeated workflows
6. Configures hooks so formatting and typechecking run automatically
7. Makes a first git commit

After bootstrap, the template infrastructure is deleted. What remains is a cleanly configured project tailored to your specific idea.

## What you get after bootstrap

- `CLAUDE.md` — concise session context (under 150 lines) with your stack, commands, and domain rules
- `AGENTS.md` — cross-platform context for Claude Code, Cursor, Copilot, and others
- `.claude/settings.json` — hooks for auto-format on edit and typecheck before Claude ends a turn
- `.claude/skills/` — slash commands tailored to your project's specific workflows
- `agent_docs/` — detailed reference material loaded on demand, not every session
- `.claude/agents/code-reviewer.md` — isolated code review subagent

## Quick start

### Option A — GitHub Template (recommended)

1. Click **"Use this template"** → Create new repository
2. Clone your new repo
3. Open Claude Code in the project root
4. Say: `Read INIT.md and set up my project`
5. Paste your project description when asked — spec document, bullet points, or a few sentences
6. Claude proposes the setup plan, waits for your approval, then executes

### Option B — Clone manually

```bash
git clone https://github.com/2zovd/claude-code-starter.git my-project
cd my-project
rm -rf .git && git init
# Open Claude Code and say: Read INIT.md and set up my project
```

## Repository layout

```
claude-code-starter/
│
├── INIT.md                    # Bootstrap protocol — Claude reads this on first run
│
├── guides/                    # How-to guides Claude reads during bootstrap
│   ├── how-to-claude-md.md    # What makes an effective CLAUDE.md
│   ├── how-to-agents-md.md    # How to write cross-platform AGENTS.md
│   ├── how-to-skills.md       # How to create Claude Code slash commands
│   ├── how-to-hooks.md        # How to configure deterministic hooks
│   └── how-to-agent-docs.md   # When and how to use agent_docs/
│
├── templates/                 # Skeleton files filled in during bootstrap
│   ├── CLAUDE.md.template
│   ├── AGENTS.md.template
│   └── settings.json
│
├── examples/                  # Reference implementation
│   └── node-cli-tool/         # Example of a well-configured TypeScript CLI project
│       ├── CLAUDE.md
│       ├── AGENTS.md
│       └── .claude/skills/new-transformer/SKILL.md
│
└── .claude/
    └── agents/
        └── code-reviewer.md   # Universal code review subagent
```

All of `guides/`, `templates/`, and `examples/` are deleted after bootstrap. The result is a clean project with no template overhead.

## What kind of project description works

Any format — Claude extracts what it needs:

> "A CLI tool that converts Markdown to HTML. TypeScript, Node.js. The output should support custom CSS themes via a flag."

> "A REST API for a task manager. Python, FastAPI, PostgreSQL. Users can create tasks, assign them, set deadlines. Auth via JWT."

> "Resume as Code — a developer-first resume builder. JSON data + pluggable templates + Git versioning. Generates HTML, DOCX, PDF from a single source of truth. Tailoring for specific companies via override files."

Or paste an entire product spec — the longer the description, the more context Claude has to configure your project accurately.

## Why this structure

**Claude decides the stack dynamically.** Technology best practices change faster than template files. Rather than shipping pre-baked presets that age, Claude uses its current knowledge to choose dependencies, config, and tooling for your specific project.

**Guides teach Claude how to configure, not what to use.** The `guides/` directory describes what makes a good CLAUDE.md, how to write effective skills, and when to use agent_docs/. Claude applies these principles to your project — the output is always project-specific.

**Hooks enforce what instructions can only request.** Auto-format on edit and typecheck before done are deterministic behaviors — they run regardless of what Claude decides in a given turn.

**agent_docs/ keeps CLAUDE.md short.** Details that would bloat the session context live in separate files loaded on demand. CLAUDE.md stays under 150 lines; Claude reads the detail files when a topic becomes relevant.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) to suggest improvements to guides, templates, or examples.

## License

MIT — see [LICENSE](LICENSE).
