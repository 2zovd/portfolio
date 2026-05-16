---
name: new-project
description: Scaffold a new portfolio project entry with correct Content Collections frontmatter. Usage: /new-project "Project Title" [tag1,tag2]
---

# /new-project $ARGUMENTS

Parse: first quoted string is the project title (required). Remaining comma-separated words are tags (optional).
Slug: convert title to kebab-case — lowercase, spaces to hyphens, remove special characters.

## 1. Read schema

Read src/content/config.ts to get the exact Project schema fields and required types.
Read 1 existing file in src/content/portfolio/ (if any) to confirm frontmatter style.

## 2. Create project file

Create src/content/portfolio/{slug}.md with frontmatter matching the schema exactly:

```yaml
---
title: "{title from argument}"
description: "Placeholder description — replace with 1-2 sentences, max 160 chars"
date: {today YYYY-MM-DD}
tags: [{tags from argument, or empty array}]
links:
  live: ""
  github: ""
cover: ""
featured: false
---

## Overview

Placeholder overview paragraph. Describe what this project is and who it's for.

## Problem

What problem does this solve?

## Solution

How was it solved technically?

## Stack

- Technology 1
- Technology 2

## Result

What was the outcome or impact?
```

## 3. Verify

Run: pnpm typecheck

Must exit zero. Fix any frontmatter mismatches before reporting.

## 4. Report

State: file path, slug, tags. Remind to: fill in links.live and links.github, add cover image path, set featured: true if applicable.
