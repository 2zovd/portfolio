# How to Create Claude Code Skills

A skill is a slash command that Claude Code recognizes. When a user types `/skill-name args`, Claude reads the SKILL.md file and follows its instructions.

Skills are powerful for **repeated, multi-step operations** that are specific to your project. A skill codifies the steps once; after that, the user triggers the full workflow with one command.

## When to create a skill

Create a skill when:
- A workflow has 3+ steps that need to happen in the right order
- You'd explain it the same way every time ("to add a new X, first create Y, then register it in Z, then run W")
- It involves creating multiple files in a specific structure
- It's specific to your project — not a generic "write tests" request

Don't create a skill for:
- Single-step actions ("create a file")
- Generic development tasks that Claude already handles well
- Operations you'll use once

## File location and naming

```
.claude/skills/
  your-skill-name/
    SKILL.md
```

The directory name becomes the slash command: `your-skill-name/` → `/your-skill-name`

## SKILL.md format

```markdown
---
name: your-skill-name
description: One sentence. What it does and when to use it. Usage: /your-skill-name ArgumentName [optional-arg]
---

# /your-skill-name $ARGUMENTS

Parse arguments: describe what arguments are expected and how to parse them.

## 1. [First step name]

Clear instruction for what to do. Read files if needed. Do not edit anything yet.

## 2. [Second step name]

Instructions for the second step. Reference the outputs of step 1.

## 3. Create files

List files to create and their content structure.

## 4. Verify

Verification command(s) to run. Show output. All must pass.

## 5. Report

State: what was created, where, what tests cover it.
```

## Tips for quality skills

**Step names matter.** "Create the component" is better than "Step 3". Steps should be scannable.

**One decision per step.** If a step requires knowing something from the user, ask at the start — not mid-execution.

**Verification is not optional.** Every skill should end with a command that confirms the work is correct. If the skill creates a file, run typecheck. If it creates a module, run the tests.

**Reference actual paths.** "Create `src/transformers/{name}.ts`" is better than "create a transformer file".

## Example: a skill for adding a new output format

```markdown
---
name: new-format
description: Add a new output format to the converter. Usage: /new-format format-name description
---

# /new-format $ARGUMENTS

Parse: first word is format name (kebab-case), rest is description.

## 1. Check existing formats

Read `src/formats/` to understand the pattern used by existing formats.

## 2. Clarify (if needed)

If the format's output structure is unclear, ask one question before continuing.

## 3. Create format file

Create `src/formats/{name}.ts` implementing the `OutputFormat` interface.
Follow the pattern from the file you read in step 1.

## 4. Register format

Add the new format to `src/formats/index.ts` exports.

## 5. Verify

pnpm typecheck
pnpm test:run

Show output. Both must pass.

## 6. Report

State: file created, where it's registered, what tests cover it.
```
