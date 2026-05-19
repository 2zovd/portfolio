---
title: Fintech Trading Platform
description: Incremental migration of a production trading terminal from Backbone.js to a Vue 3 microfrontend architecture — live system, millions of active users.
date: 2024-01-01
tags: [Vue 3, TypeScript, Backbone.js, Microfrontends, Vite, Pinia]
featured: true
---

## Context

A regulated online broker with millions of registered users worldwide. I joined the frontend team as part of a cross-functional group maintaining and evolving the web trading platform.

## Challenge

The platform ran on a legacy Backbone.js + Marionette stack — large-scale, hard to maintain, and blocking product velocity. The goal: modernise incrementally while keeping a production system stable for active users.

## What I worked on

- **Microfrontend architecture** — designed and built two Vue 3 microfrontends (TypeScript/Pinia and JavaScript/Vuex 4) integrated into the Backbone host via a shared event bus
- **Legacy codebase** — shipped features across the existing ES5/AMD Backbone terminal; both paradigms coexist in the same production system
- **Stack modernisation** — drove JavaScript → TypeScript and Vuex → Pinia migrations across the new surface area
- **Tooling** — Vite UMD builds, i18n pipeline, ESLint/Vitest quality gates
- **Team practices** — led code reviews and onboarding within a cross-functional Agile team

## Approach

Rather than a big-bang rewrite, the team adopted a Strangler Fig pattern: new features shipped in Vue 3 while legacy Backbone code stayed in place. Shared infrastructure (event bus, auth state, design tokens) kept both layers in sync.
