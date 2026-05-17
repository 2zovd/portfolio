---
title: Libertex Trading Platform
description: Web trading platform serving 3M+ users across 27 countries. Led frontend architecture migration from Backbone.js to Vue 3 micro-frontend system.
date: 2024-01-01
tags: [Vue 3, TypeScript, Backbone.js, Micro-frontends, Vite, Cordova]
featured: true
links:
  live: https://libertex.com
cover: /images/portfolio/libertex.png
---

## Overview

Libertex is a regulated online broker operating in 27 countries with over 3 million registered users. I joined the frontend team in 2017 and have been leading the platform's architectural evolution ever since.

## Challenge

The platform was built on a legacy Backbone.js + Marionette stack — difficult to maintain, impossible to test reliably, and blocking product velocity. The challenge was migrating a production trading platform with zero downtime and no regression for millions of active users.

## Approach

Rather than a big-bang rewrite, we adopted an incremental micro-frontend strategy:

1. **Strangler Fig pattern** — new features built in Vue 3, legacy Backbone code wrapped and kept in place
2. **Shared infrastructure** — common event bus, shared authentication state, unified design tokens
3. **Component library** — a typed Vue 3 component library consumed by 6 product teams
4. **Automated quality gates** — ESLint, Vitest coverage thresholds, Lighthouse CI budgets

## Results

- 40% reduction in initial bundle size through route-based code splitting
- 60% faster feature delivery after micro-frontend architecture stabilised
- 95%+ Lighthouse performance score on critical trading pages
- Zero production incidents during the 18-month migration window
