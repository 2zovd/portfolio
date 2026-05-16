# dmytrotuzov.dev — Portfolio

Personal professional website for a Senior Frontend Engineer (7+ years, fintech, 3M+ users).
Built with Astro 6 + Vue 3 + TypeScript strict. FSD principles adapted for Astro routing conventions.

## Repo layout

```
src/app/           — global styles and layouts (BaseLayout, PageLayout, _tokens.scss)
src/pages/         — Astro file-based routing (index, about, portfolio/, blog/, 404)
src/widgets/       — full-section Astro components (Header, Hero, Footer, About, Contact)
src/features/      — interactive Vue 3 islands (ThemeToggle, ContactForm, ProjectFilter)
src/entities/      — domain types + Zod schemas (project.ts, post.ts)
src/shared/        — reusable UI (Button, Tag, Card, Icon), lib utilities, site config
src/content/       — Content Collections: blog/*.md and portfolio/*.md
public/            — static assets (favicon.svg, cv/dmytro-tuzov-cv.pdf)
agent_docs/        — overflow docs: design-system.md, architecture.md
```

## Commands

```
pnpm dev          — development server
pnpm build        — production build
pnpm typecheck    — zero-error TypeScript + Astro check
pnpm test:run     — unit tests (Vitest)
pnpm lint         — ESLint check (flat config)
pnpm lint:fix     — ESLint auto-fix
```

## Conventions

- TypeScript strict mode, noUncheckedIndexedAccess — zero `any`
- SCSS: scoped `<style lang="scss">` inside Vue SFCs; SCSS modules for Astro components
- Component structure per layer: ComponentName/ComponentName.vue + .test.ts + index.ts
- All design tokens via CSS custom properties in src/app/styles/_tokens.scss
- Inline SVG only for icons — no icon font libraries
- Images: WebP/AVIF, explicit width+height, loading="lazy" below fold
- Semantic HTML: nav, main, article, section, aside, header, footer throughout

## Constraints

- No Tailwind CSS, no CSS-in-JS
- No color or spacing values hardcoded outside _tokens.scss
- No `outline: none` without custom focus-visible replacement
- No border-radius on cards, buttons, tags (always 0); nav pill = 999px; status dot = 50%
- Every animation must have @media (prefers-reduced-motion: reduce) override
- Vue islands only for interactive sections; static sections are Astro components
- No icon font libraries (Font Awesome, Material Icons, etc.) — inline SVG only
