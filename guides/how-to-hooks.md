# How to Configure Claude Code Hooks

Hooks are shell commands that run automatically at specific points in Claude's workflow. Unlike instructions in CLAUDE.md, hooks are **deterministic** — they run regardless of what Claude decides. Use hooks for must-happen-every-time enforcement.

## Hook events

| Event | When it fires | Typical use |
|-------|--------------|-------------|
| `SessionStart` | When Claude Code launches | Print status reminder, run health check |
| `PreToolUse` | Before each tool call | Block specific commands, log what's about to run |
| `PostToolUse` | After each tool call | Auto-format edited files, validate output |
| `Stop` | Before Claude ends its turn | Run typecheck, remind of pending steps |
| `PreCompact` | Before context compression | Log state summary |

## Settings.json structure

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "your-lint-fix-command 2>&1 || true"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "your-typecheck-command 2>&1"
          }
        ]
      }
    ]
  }
}
```

## The two most valuable hook patterns

### 1. Auto-format on every edit

```json
"PostToolUse": [
  {
    "matcher": "Edit|Write",
    "hooks": [{ "type": "command", "command": "pnpm lint:fix --reporter=silent 2>&1 || true" }]
  }
]
```

Adapt the command to your stack:
- Python: `ruff format . 2>&1 || true`
- Go: `gofmt -w . 2>&1 || true`
- Rust: `cargo fmt 2>&1 || true`

The `|| true` prevents lint warnings from blocking Claude's work.

### 2. Typecheck before Claude declares done

```json
"Stop": [
  {
    "hooks": [{ "type": "command", "command": "pnpm typecheck 2>&1" }]
  }
]
```

If typecheck fails, Claude sees the error output and fixes it before ending the turn. This catches mistakes that CLAUDE.md instructions alone can't guarantee.

Adapt to your stack:
- Python: `mypy src/ 2>&1`
- Go: `go build ./... 2>&1`
- Rust: `cargo check 2>&1`

## Blocking dangerous commands with PreToolUse

```json
"PreToolUse": [
  {
    "matcher": "Bash",
    "hooks": [
      {
        "type": "command",
        "command": "echo \"$CLAUDE_TOOL_INPUT\" | grep -qE '^(curl|wget|ssh)' && echo 'BLOCK: network command requires approval' && exit 1 || true"
      }
    ]
  }
]
```

Exit code 1 blocks the tool call. Exit code 0 allows it.

## Permissions block

The `permissions` block in settings.json lets you pre-approve commands so Claude doesn't have to ask:

```json
{
  "permissions": {
    "allow": [
      "Bash(git status)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Bash(pnpm install)",
      "Bash(pnpm typecheck)"
    ],
    "deny": [
      "Bash(git push --force*)",
      "Bash(rm -rf*)"
    ]
  }
}
```

Adapt the package manager commands to match your project (npm, pip, cargo, etc.).

## Key rule

Hooks enforce what CLAUDE.md can only request. If something must happen every time without exception, it belongs in a hook — not in an instruction.
