---
name: new-post
description: Scaffold a new blog post with correct Content Collections frontmatter. Usage: /new-post "Post Title" [tag1,tag2]
---

# /new-post $ARGUMENTS

Parse: first quoted string is the post title (required). Remaining comma-separated words are tags (optional).
Slug: convert title to kebab-case — lowercase, spaces to hyphens, remove special characters.

## 1. Read schema

Read src/content/config.ts to get the exact BlogPost schema fields and their types.
Read 1 existing file in src/content/blog/ (if any) to confirm frontmatter style.

## 2. Create post file

Create src/content/blog/{slug}.md with frontmatter that matches the schema exactly:

```yaml
---
title: "{title from argument}"
description: "Placeholder description — replace with 1-2 sentences, max 160 chars"
pubDate: {today YYYY-MM-DD}
tags: [{tags from argument, or empty array}]
draft: true
---

## Introduction

Placeholder introduction paragraph. Replace with actual content.
```

## 3. Verify

Run: pnpm typecheck

Must exit zero. If errors appear in Content Collections, fix frontmatter before reporting.

## 4. Report

State: file path created, slug used, tags, draft: true (reminder to set false before publishing).
