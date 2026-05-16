# Changelog

All notable changes will be documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/).

---

## [Unreleased]

---

## [0.3.0] — 2026-05-06

Conceptual redesign: from "template with batteries" to "universal self-configuring bootstrap".

### Added

- `guides/` directory — five how-to guides Claude reads during bootstrap to make quality decisions:
  - `how-to-claude-md.md` — rules for writing effective session context
  - `how-to-agents-md.md` — cross-platform AI context best practices
  - `how-to-skills.md` — when and how to create project-specific slash commands
  - `how-to-hooks.md` — deterministic hook patterns for any stack
  - `how-to-agent-docs.md` — on-demand reference files without bloating CLAUDE.md
- `templates/` directory — stack-neutral skeleton files:
  - `CLAUDE.md.template` — placeholder-based template Claude fills in
  - `AGENTS.md.template` — cross-platform context template
  - `settings.json` — universal base configuration with stack-agnostic hooks
- `examples/node-cli-tool/` — reference implementation for a TypeScript CLI project:
  - Filled-in CLAUDE.md with realistic domain rules and notes
  - AGENTS.md with architecture overview
  - `/new-transformer` skill demonstrating the skill pattern
- `INIT.md` — completely rewritten bootstrap protocol: accepts free-form project descriptions, proposes the setup plan for user approval, executes setup, cleans up afterwards

### Changed

- `INIT.md` — was a 5-question interview with preset selection; now accepts any project description format and dynamically determines stack, configuration, and skills
- `.claude/agents/code-reviewer.md` — removed Vue/Nuxt-specific review criteria; now universal across languages and frameworks
- `CONTRIBUTING.md` — updated for new structure: guides, examples, templates instead of presets and recipes
- `README.md` — rewritten to explain the self-configuring approach

### Removed

- `presets/` — nuxt-app, vue-vite, _empty (replaced by dynamic stack selection)
- `stack-recipes/` — node-bot, python-uv, astro, component-library (replaced by guides + Claude's built-in knowledge)
- `core/` — CLAUDE.md template, agent_docs/, Vue-specific .claude/ contents (replaced by guides/ and templates/)
- `starter.yml` — preset manifest (no longer needed)

### Breaking

Preset-based bootstrap (selecting nuxt-app / vue-vite / _empty) is no longer supported. Projects already bootstrapped with v0.1 or v0.2 are not affected — those projects have CLAUDE.md at root and don't use INIT.md.

---

## [0.2.0] — 2026-05-04

### Added

- `/plan-implement` skill
- `AGENTS.md` cross-platform context file
- GitHub Actions CI for template structure validation
- `code-reviewer` subagent with read-only tools

---

## [0.1.0] — 2026-05-02

Initial release.

### Added

- `core/` — CLAUDE.md template, agent_docs/, .claude/ with settings.example.json
- `presets/nuxt-app` — Nuxt 3, Pinia, VueUse, Vitest
- `presets/vue-vite` — Vue 3, Vite, Pinia, VueUse, Vitest
- `presets/_empty` — minimal scaffold
- `stack-recipes/` — node-bot, python-uv, astro, component-library
- `INIT.md` — preset-based bootstrap protocol
- `starter.yml` — template manifest
