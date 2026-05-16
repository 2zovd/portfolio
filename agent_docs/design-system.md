# Design System

> Read when implementing any UI component, page section, or animation. All visual decisions live here.

---

## Color Tokens

Applied as CSS custom properties on `:root` (dark, default) and `.light` on `<html>` (light theme).

```css
/* Dark theme — default */
:root {
  --color-bg:           #0c0c0a;
  --color-surface:      rgba(255, 255, 255, 0.02);
  --color-border:       rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(255, 255, 255, 0.16);
  --color-text:         #e8e8e0;
  --color-muted:        #888888;
  --color-subtle:       #555555;
  --color-accent:       #c8f000;
  --color-accent-hover: #d4ff00;
}

/* Light theme — class="light" on <html> */
.light {
  --color-bg:           #f4f4f0;
  --color-surface:      rgba(0, 0, 0, 0.02);
  --color-border:       rgba(0, 0, 0, 0.08);
  --color-border-hover: rgba(0, 0, 0, 0.16);
  --color-text:         #0c0c0a;
  --color-muted:        #666666;
  --color-subtle:       #999999;
  --color-accent:       #5a7a00;
  --color-accent-hover: #4a6600;
}
```

---

## Background Grid

Applied on the `.site` root element (the body or a wrapping div spanning full viewport):

```css
/* Dark */
background-image:
  linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
background-size: 48px 48px;

/* Light — override inside .light */
.light .site {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
}
```

---

## Typography

Fonts loaded via Google Fonts with `<link rel="preconnect">` and `<link rel="preload">`.
`font-display: swap` on `@font-face`.

```
Inter (variable, weights 300/400/500/600/700) — all UI text
JetBrains Mono — terminal card and blog code blocks ONLY
```

| Role | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Hero heading | 38px | 600 | -0.02em | 1.15 |
| Section heading | 28px | 600 | -0.02em | 1.2 |
| Subheading | 20px | 500 | -0.01em | 1.3 |
| Body | 14px | 400 | 0 | 1.7 |
| Label / tag | 11px | 500 | 0.08–0.12em | 1.5 |
| Caption / meta | 10px | 400 | 0.06em | 1.5 |
| Terminal / code | 11px | 400 JetBrains Mono | 0 | 1.8 |

All labels and tags: `text-transform: uppercase`.
Minimum font size anywhere on the site: **11px**.

---

## Spacing Scale (8px base)

```
4px / 8px / 12px / 16px / 20px / 24px / 32px / 48px / 56px / 96px
```

Only these values. Never arbitrary numbers.

---

## Border Radius

```
Default everywhere:            0  (sharp — technical aesthetic)
Navigation pill container:     999px
Status dot / avatar circles:   50%
```

**Never** use border-radius on cards, buttons, tags, or inputs.

---

## Buttons

```css
/* Primary */
padding: 11px 22px;
background: var(--color-text);   /* #e8e8e0 in dark, #0c0c0a in light */
color: var(--color-bg);
font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
border: none; border-radius: 0;
transition: background 150ms;
/* hover */ background: var(--color-accent);

/* Secondary */
padding: 11px 22px;
background: transparent;
color: var(--color-muted);
border: 1px solid var(--color-border);
font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
border-radius: 0;
transition: border-color 150ms, color 150ms;
/* hover */ border-color: var(--color-border-hover); color: var(--color-text);
```

---

## Navigation

```
Layout: [Logo + role] ————————— [pill nav] ————————— [icon buttons right]

Pill container:
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 4px 6px;

Links inside pill:
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--color-muted);
  /* hover */ background: rgba(255, 255, 255, 0.06); color: var(--color-text);

Icon buttons (ThemeToggle, email/contact):
  width: 34px; height: 34px;
  border: 1px solid var(--color-border);
  border-radius: 0;
  background: transparent;
```

---

## Cards

```css
border: 1px solid var(--color-border);
background: var(--color-surface);
padding: 20px;
border-radius: 0;
```

**Card label** (above card content, identifies the card type):
```css
font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
color: var(--color-subtle);
display: flex; align-items: center; gap: 8px;
margin-bottom: 14px;
```
Always accompanied by an animated status dot (see below).

---

## Status Dot

```css
width: 6px; height: 6px;
border-radius: 50%;
background: #22c55e;
animation: pulse 2s infinite;

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

@media (prefers-reduced-motion: reduce) {
  animation: none;
}
```

---

## Terminal Card (Hero — right column, top)

```
Font: JetBrains Mono, 11px, line-height 1.8
Background: var(--color-surface)
Border: 1px solid var(--color-border)
Padding: 20px
```

```css
/* Command prompt ($) */
color: var(--color-accent);   /* #c8f000 */

/* Output lines */
color: var(--color-muted);

/* Blinking cursor block */
display: inline-block;
width: 7px; height: 13px;
background: var(--color-accent);
animation: blink 1.1s step-end infinite;

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  animation: none;
  opacity: 1;
}
```

Terminal content (static, in order):
```
$ whoami
dmytro.tuzov — frontend engineer

$ location
Montenegro (GMT+2) · EU remote · relocation

$ experience
7+ years · fintech · 3M+ users

$ stack█
```

---

## Stack Tags (hero bottom bar)

```css
font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em;
border: 1px solid rgba(255, 255, 255, 0.07);
padding: 4px 10px;
border-radius: 0;
color: var(--color-subtle);          /* default */
transition: color 150ms, border-color 150ms;
/* hover */ color: var(--color-accent); border-color: rgba(200, 240, 0, 0.3);

/* Highlighted tags (Vue, TypeScript) */
color: var(--color-muted);
border-color: rgba(255, 255, 255, 0.12);
```

---

## Animation System

```
Page transitions:    Astro View Transitions API (built-in, no custom JS needed)
Entrance animation:  fade-up — opacity 0→1, translateY 12px→0
Duration:            400ms standard; 150ms micro-interactions (hover states)
Easing:              cubic-bezier(0.16, 1, 0.3, 1) — expo out
```

Every animation rule must pair with a reduced-motion override:
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fade-up {
  animation: fadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-up { animation: none; }
  /* or globally: *, *::before, *::after { animation-duration: 0.01ms !important; } */
}
```

Theme switch transition (on `<html>` element):
```css
transition: background-color 200ms, color 200ms;
```
