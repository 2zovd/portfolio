## What

<!-- One sentence: what does this PR add or fix? -->

## Why

<!-- The problem or gap this addresses. Link related issue if applicable. -->

## Verification

For new or modified presets, paste the output of the full verification chain:

```
$ cd presets/<name>
$ pnpm install
$ pnpm typecheck
$ pnpm lint
$ pnpm test:run
$ pnpm build
```

<details>
<summary>Output</summary>

```
paste here
```

</details>

## Checklist

- [ ] `CLAUDE.md` stays under 150 lines
- [ ] All new presets pass `pnpm install && pnpm typecheck && pnpm lint && pnpm test:run` on a fresh clone
- [ ] `starter.yml` updated if a preset or recipe was added
- [ ] `CHANGELOG.md` updated under Unreleased
