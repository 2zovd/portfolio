---
title: "Building an \"Academic\" Portfolio with Astro 6 and Vue 3"
description: Why I chose Astro 6 over Next.js, how FSD scales to SSG, and the architectural decisions that make this codebase a showcase in itself.
pubDate: 2025-05-17
tags: [Astro, Vue 3, TypeScript, Architecture, FSD]
draft: false
---

When most engineers build a portfolio, they reach for the framework they know best. I wanted mine to do something different: serve as a live demonstration of the engineering principles I claim to practise.

## Why Astro

Next.js is the default choice for React engineers. I'm a Vue specialist, so I briefly considered Nuxt. But both ship more JavaScript than a content-heavy site needs. Astro's islands architecture lets me write mostly static HTML — with Vue 3 islands only where interactivity is genuinely required (theme toggle, mobile nav).

The result: the home page ships **zero kilobytes of JavaScript** for layout, header, hero, and footer. ThemeToggle and MobileNav hydrate independently via `client:load`.

## Feature-Sliced Design for SSG

FSD was designed for SPAs, but its strict import-direction rule maps cleanly onto Astro's file structure:

```
pages → widgets → features → entities → shared
```

No widget imports from another widget. No feature imports upward. This constraint is enforced by convention, not tooling — and it keeps the codebase navigable even as it grows.

## TypeScript Strict Mode

`noUncheckedIndexedAccess` is the killer option most projects skip. It forces you to handle the case where an array index returns `undefined`. It's painful for five minutes. After that, you write better code.

## What's Next

- Full blog with MDX and syntax highlighting
- Portfolio case studies with embedded metrics
- Cloudflare Pages deployment with edge caching
