# Architecture

> Read when making structural decisions: where to put a new file, which layer owns a concern,
> how to use Content Collections, what SEO meta a page needs, or how Vue islands integrate with Astro.

---

## Layer Structure (FSD adapted for Astro)

Import direction is strictly downward: pages → widgets → features → entities → shared.
Never import upward (shared must not import from features; features must not import from widgets).

```
src/
├── app/                — global styles and layouts (no components here)
│   ├── styles/         — _tokens.scss, _reset.scss, _typography.scss, global.scss
│   └── layouts/        — BaseLayout.astro, PageLayout.astro
│
├── pages/              — Astro routing; thin — only assemble widgets, no logic
│
├── widgets/            — full-page sections (Astro components)
│   ├── Header/         — Header.astro + Header.scss
│   ├── Hero/           — two-column layout, terminal card, stack bar
│   ├── Footer/
│   ├── About/
│   ├── Portfolio/      — project grid (static part)
│   ├── Blog/           — post list (static part)
│   └── Contact/
│
├── features/           — interactive Vue 3 islands (client-side only)
│   ├── ThemeToggle/    — ThemeToggle.vue + .test.ts + index.ts
│   ├── ContactForm/
│   └── ProjectFilter/  — filtering on /portfolio page
│
├── entities/           — domain types + Zod schemas
│   ├── project.ts      — Project type + Zod schema matching content/config.ts
│   └── post.ts         — BlogPost type + schema
│
├── shared/
│   ├── ui/             — reusable Vue components (Button, Tag, Card, Icon)
│   ├── lib/            — pure utilities (cn.ts, formatDate.ts)
│   └── config/
│       └── site.ts     — SITE constant (name, url, nav, socials, available flag)
│
└── content/
    ├── config.ts       — Content Collections schemas
    ├── portfolio/      — *.md project case studies
    └── blog/           — *.md posts
```

---

## Astro Component vs Vue Island

Use **Astro components** for:
- All layout and structural sections (Header, Hero, Footer, About, Portfolio grid)
- Content that is purely static — no user interaction needed
- Anything that should ship zero JavaScript

Use **Vue islands** (`client:load` or `client:idle`) for:
- ThemeToggle (needs localStorage read/write)
- ContactForm (needs validation and submission state)
- ProjectFilter (needs reactive filtering)
- Any component where the user interacts and the DOM must change

Rule: if it doesn't move or change after page load, it's an Astro component.

---

## Theme System

**Flash prevention** — the most critical rule:
In `BaseLayout.astro`, place this inline `<script>` as the FIRST child of `<head>`,
before any font or CSS link:

```html
<script is:inline>
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored ?? (prefersDark ? 'dark' : 'light');
  if (theme === 'light') document.documentElement.classList.add('light');
</script>
```

**ThemeToggle.vue** responsibilities:
- Read current theme from `document.documentElement.classList`
- On toggle: add/remove class `light` from `<html>`, write to `localStorage`
- Emit nothing — reads and writes DOM directly

---

## Content Collections

Schemas live in `src/content/config.ts`. After changing schemas, always run `pnpm typecheck`.

**BlogPost schema** (minimum required fields):
```typescript
title: z.string()
description: z.string().max(160)
pubDate: z.date()
tags: z.array(z.string()).default([])
draft: z.boolean().default(false)
```

**Project schema** (minimum required fields):
```typescript
title: z.string()
description: z.string().max(160)
date: z.date()
tags: z.array(z.string()).default([])
links: z.object({ live: z.string().optional(), github: z.string().optional() })
cover: z.string().optional()
featured: z.boolean().default(false)
```

Query pattern in Astro pages:
```typescript
import { getCollection } from 'astro:content';
const posts = await getCollection('blog', ({ data }) => !data.draft);
const sorted = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
```

---

## SEO Meta Per Page

Every page must pass a `title`, `description`, and canonical URL to `BaseLayout.astro`.
`BaseLayout` is responsible for rendering all `<head>` meta.

Required per page:
```
<title>{pageName} · Dmytro Tuzov</title>
<meta name="description" content="{150–160 chars}">
<link rel="canonical" href="{absolute URL}">
<meta property="og:title" content="{same as title}">
<meta property="og:description" content="{same as description}">
<meta property="og:image" content="{absolute OG image URL}">
<meta property="og:url" content="{canonical URL}">
<meta property="og:type" content="website"> (or "article" for blog posts)
<meta name="twitter:card" content="summary_large_image">
```

Homepage only — JSON-LD Person schema:
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Dmytro Tuzov",
  "jobTitle": "Frontend Engineer",
  "url": "https://dmytrotuzov.dev",
  "sameAs": [
    "https://linkedin.com/in/dmitrytuzov",
    "https://github.com/2zovd"
  ]
}
```

---

## Accessibility Checklist

Every component and page must satisfy:
- Semantic HTML: `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`
- Skip-to-main link: visually hidden, visible on focus, first focusable element in `<body>`
- All interactive elements reachable by keyboard (Tab order, Enter, Space, Escape where applicable)
- `focus-visible` styles on all focusable elements — never `outline: none` without a custom replacement
- Icon-only buttons: `aria-label` required
- Images: meaningful `alt` text; decorative images `alt=""`
- Color contrast: WCAG AA minimum (4.5:1 for text, 3:1 for large text)
- No color as the only means of conveying information

---

## Performance Rules

- Images: WebP or AVIF format, explicit `width` + `height` on every `<img>`, `loading="lazy"` for below-fold
- Fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">` + `<link rel="preload">` for critical fonts; `font-display: swap`
- Icons: inline SVG only — never external font requests or sprite sheets
- Vue islands: use `client:idle` for non-critical interactive components (ContactForm, ProjectFilter); use `client:load` only for ThemeToggle (needed immediately)
- Zero render-blocking resources: no `<script>` without `defer` or `type="module"` except the theme inline script

---

## site.ts Reference

```typescript
export const SITE = {
  name: 'Dmytro Tuzov',
  role: 'Frontend Engineer',
  url: 'https://dmytrotuzov.dev',
  description: '7+ years shipping production-grade interfaces for fintech platforms.',
  location: 'Montenegro (GMT+2)',
  available: true,
  email: 'dmytrotuzov1@gmail.com',
  socials: {
    linkedin: 'https://linkedin.com/in/dmitrytuzov',
    github: 'https://github.com/2zovd',
    telegram: 'dm2r0',
  },
  nav: [
    { label: 'Work',    href: '/portfolio' },
    { label: 'About',   href: '/about' },
    { label: 'Blog',    href: '/blog' },
    { label: 'Contact', href: '/#contact' },
  ],
} as const;
```
