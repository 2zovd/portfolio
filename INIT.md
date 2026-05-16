# Bootstrap Protocol

> You are setting up a freshly cloned `claude-code-starter`.
> Read this file, run the bootstrap, configure the project, then delete this file.
>
> **User:** Open Claude Code and say: `Read INIT.md and set up my project`

---

## Step 1 — Verify state

If `CLAUDE.md` already exists at the project root, bootstrap already ran — stop and ask the user what they want.

```bash
ls guides/ templates/ examples/
```

If this command fails (directories not found), bootstrap has already run and cleaned up — check for `CLAUDE.md` and stop.

Read these guides before proceeding — they define what good configuration looks like:

- `guides/how-to-claude-md.md`
- `guides/how-to-skills.md`
- `guides/how-to-hooks.md`
- `guides/how-to-agent-docs.md`

Also look at the example in `examples/node-cli-tool/` to see a complete, well-configured project.

---

## Step 2 — Accept the project description

Ask the user:

> "Describe your project. Paste a spec, point me to a file (`Read PRODUCT.md`), or give me a few sentences — any format works."

Accept whatever they provide. If they give you a file, read it fully.

From the description, extract:
- **Project type** — CLI tool, web app, API, library, mobile app, data pipeline, script...
- **Technology preferences** — explicitly stated stack, or strongly implied by the domain
- **Domain rules** — content constraints, naming rules, NDA areas, data invariants
- **Key features** — what it does, main user actions, core data flow
- **Tone and complexity** — is this a prototype or production service?

---

## Step 3 — Propose the setup plan

Present your plan and wait for the user to confirm or adjust:

```
Project: [name]
Type: [CLI / web app / API / ...]
Stack: [language, runtime, key dependencies]

CLAUDE.md will capture:
  - [domain rules extracted from the description]
  - [key commands]
  - [non-obvious notes found in the spec]

Skills I'll create:
  - /[skill-name] — [what it does, when to use it]

agent_docs/ files:
  - [filename] — [why this topic needs its own file]

Ready to proceed? Adjust anything if needed.
```

If the user adjusts the stack or approach, update your plan before executing.

---

## Step 4 — Execute setup

### 4a. Initialize the project

Based on the agreed stack, run the appropriate init command:
- Node.js / TypeScript: `pnpm init` (or npm/yarn if the user prefers)
- Python: `uv init` or `python -m venv .venv && pip install ...`
- Rust: `cargo init`
- Go: `go mod init [module-name]`
- Other: use the stack's standard initialization

Install the identified dependencies.

### 4b. Create project configuration files

1. Copy `templates/CLAUDE.md.template` → `./CLAUDE.md`
   - Replace all placeholders with real content from the project description
   - Follow the quality rules in `guides/how-to-claude-md.md`
   - Keep it under 150 lines

2. Copy `templates/AGENTS.md.template` → `./AGENTS.md`
   - Fill in repo layout, commands, conventions, constraints
   - Follow the quality rules in `guides/how-to-agents-md.md`

3. Copy `templates/settings.json` → `./.claude/settings.json`
   - Replace example hook commands with the actual formatter and typecheck commands for this stack
   - Add package manager permissions relevant to the stack (pnpm, pip, cargo, etc.)
   - Remove `_comment`, `_note`, `_examples`, `_readme` keys before saving

### 4c. Create agent_docs/ (if needed)

Create `./agent_docs/` with files for topics that would bloat CLAUDE.md.

Always create:
- `agent_docs/verification.md` — adapted for this stack's verification commands and what "done" looks like

Create if applicable:
- `agent_docs/domain-rules.md` — if the project has rich content or style constraints
- `agent_docs/data-schema.md` — if there's a core data model Claude will interact with frequently
- `agent_docs/architecture.md` — if there are non-obvious structural decisions with important constraints

Reference these files from CLAUDE.md if relevant sections would otherwise be too long.

### 4d. Create project-specific skills

In `./.claude/skills/`, create skill files for the most common repeated operations specific to this project.

Use `guides/how-to-skills.md` as the guide for quality. Only create skills for workflows that are:
- Project-specific (not generic development tasks)
- Repeated often
- Multi-step with a specific structure to follow

3 skills is better than 10 mediocre ones. It's fine to create zero skills if nothing fits.

### 4e. Initialize git

```bash
git status
```

If no git repo exists yet:
```bash
git init
git add .
git commit -m "chore: bootstrap from claude-code-starter"
```

If the template's git history is present, ask the user before resetting:
> "This repo has the template's git history. Reset to start clean with `rm -rf .git && git init`?"

---

## Step 5 — Verify

Run the stack-appropriate verification commands:
- Node.js: `pnpm install && pnpm typecheck && pnpm lint && pnpm test:run`
- Python: `uv sync && mypy src/ && ruff check && pytest`
- Rust: `cargo build && cargo test`

If any command fails, fix the issue before continuing.

---

## Step 6 — Clean up

Delete the bootstrap infrastructure — it's not needed once the project is configured:

```bash
rm -rf guides/ templates/ examples/ INIT.md
```

Confirm deletion:
```bash
ls guides/ templates/ examples/ INIT.md 2>&1
```

Expected: "No such file or directory" for each. If any still exist, delete them.

---

## Step 7 — Hand off

Tell the user:
- What was configured: CLAUDE.md summary, skills created, agent_docs/ created
- The commands to start developing
- "Review CLAUDE.md and add notes as you discover non-obvious things — that section grows most valuable over time."

Bootstrap is complete.
