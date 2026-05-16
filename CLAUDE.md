# dmytrotuzov.dev — Portfolio

Personal professional website: portfolio showcase, technical blog, professional landing page.
"Academic" project — architecture, a11y, performance, and code cleanliness are first-class.

## Stack

Astro 6, Vue 3, TypeScript strict, SCSS + CSS custom properties, Vitest + @vue/test-utils,
Cloudflare Pages. No Tailwind. No CSS-in-JS. No icon font libraries.

## Commands

```
pnpm dev          — development server (localhost:4321)
pnpm build        — production build to dist/
pnpm preview      — preview production build locally
pnpm typecheck    — astro check && tsc --noEmit (zero errors required)
pnpm test:run     — vitest run
pnpm test:cov     — vitest run --coverage
pnpm lint         — ESLint check
pnpm lint:fix     — ESLint auto-fix
```

## Key files

```
src/app/styles/_tokens.scss        — ALL design tokens (CSS custom properties)
src/app/layouts/BaseLayout.astro   — <html>, <head>, theme flash-prevention inline script
src/shared/config/site.ts          — site-wide constants (name, url, nav, socials)
src/content/config.ts              — Content Collections schemas (Project, BlogPost)
astro.config.ts                    — Vue integration, View Transitions, sitemap
eslint.config.js                   — ESLint flat config (ESLint 9)
```

## Domain rules

Design system: see agent_docs/design-system.md
Architecture:  see agent_docs/architecture.md

Hard constraints (never violate):
- border-radius: 0 everywhere except nav pill (999px) and status dot (50%)
- No color or spacing values outside _tokens.scss
- No `outline: none` without a custom focus-visible replacement
- No `any` in TypeScript — strict mode, noUncheckedIndexedAccess
- Vue islands only for interactive sections — static layout uses Astro components
- All animations must have `@media (prefers-reduced-motion: reduce)` override
- Commit format: Conventional Commits (feat: / fix: / chore: / style: / test: / docs: / refactor:)

## Notes

- Theme flash: inline script in BaseLayout reads localStorage BEFORE any render — never move it
- JetBrains Mono font: used ONLY in terminal card and blog code blocks
- Content Collections: run `pnpm typecheck` after changing src/content/config.ts
- CV file lives at public/cv/dmytro-tuzov-cv.pdf — not in content collections
- ESLint uses flat config (eslint.config.js) — not .eslintrc.cjs; --ext flag not supported
- Astro 6 (not 5): sitemap via @astrojs/sitemap; Vue integration via @astrojs/vue 6
