---
name: Shortedd
description: A serverless URL shortener that treats the encoded link as visible data, not a hidden magic trick.
colors:
  paper: '#f7f7f6'
  paper-dark: '#121417'
  ink: '#14161a'
  ink-dark: '#f2f2ef'
  card: '#fcfcfc'
  card-dark: '#1b1d21'
  signal-indigo: '#2340c8'
  signal-indigo-dark: '#739dff'
  signal-indigo-foreground: '#f6f8fd'
  signal-indigo-foreground-dark: '#060c1e'
  secondary: '#ecebe9'
  secondary-dark: '#24272b'
  muted-ink: '#585b5f'
  muted-ink-dark: '#95989d'
  hairline: '#d5d4d1'
  hairline-dark: 'rgba(255,255,255,0.11)'
  destructive: '#e7000b'
typography:
  display:
    fontFamily: 'Geist Variable, ui-sans-serif, sans-serif'
    fontSize: 'clamp(1.875rem, 4vw, 2.25rem)'
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: '-0.02em'
  body:
    fontFamily: 'Geist Variable, ui-sans-serif, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
  data:
    fontFamily: 'Geist Mono Variable, ui-monospace, monospace'
    fontSize: '0.875rem'
    fontWeight: 400
    letterSpacing: '-0.02em'
rounded:
  sm: '3.6px'
  md: '4.8px'
  lg: '6px'
  xl: '8.4px'
spacing:
  sm: '8px'
  md: '16px'
  lg: '24px'
components:
  button-primary:
    backgroundColor: '{colors.signal-indigo}'
    textColor: '{colors.signal-indigo-foreground}'
    rounded: '{rounded.lg}'
    padding: '0 24px'
  button-primary-hover:
    backgroundColor: '{colors.signal-indigo}CC'
  button-outline:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    padding: '0 10px'
  data-field:
    backgroundColor: '{colors.card}'
    textColor: '{colors.ink}'
    typography: '{typography.data}'
    rounded: '{rounded.lg}'
    padding: '10px 12px'
---

# Design System: Shortedd

## Overview

**Creative North Star: "The Codebook"**

Shortedd reads like a technical reference document rather than a marketing surface: a codebook or cipher table where a value goes in and its encoded form appears, plainly, in the same alphabet the whole page speaks. There is no dashboard chrome, no card stack, no navigation to get out of the way of — one centered column, one field, one flat result. The design's entire argument is that nothing is hidden: the destination lives inside the link, and the interface says so by showing the link as literal, legible, monospaced data the instant it exists.

The system rejects the generic "type here, get a magic box" utility template (a bordered card floating on a gradient backdrop, a loading spinner standing in for real-time feedback) in favor of a flatter, quieter register: paper-toned ground, near-black ink, hairline rules, and exactly one accent color reserved for the single moment that matters — the primary action and anything actively confirmed. Dark mode is not an afterthought skin; it inverts the same paper/ink/hairline relationship onto a graphite ground, because this is a developer-facing tool used at any hour.

**Key Characteristics:**

- Flat throughout — no shadows, no cards, no gradients, no glass.
- Monospace is reserved for data (the URL, the encoded token); prose stays in a humanist sans.
- A single indigo accent, spent only on the primary action and focus/active state.
- Hairline (1px) rules and borders do the structural work shadows would otherwise do.
- No header, no navigation, no logo mark — the centered column is the entire interface.

## Colors

Two neutrals (paper and ink) plus one committed accent — a Restrained strategy where color earns attention by its rarity, not its coverage.

### Primary

- **Signal Indigo** (`#2340c8` light / `#739dff` dark): the single accent in the system. Used only on the primary "Generar" button and on focus rings / the active input border. Nowhere else — it is reserved, not decorative.

### Neutral

- **Paper** (`#f7f7f6` light / `#121417` dark): the page ground.
- **Card** (`#fcfcfc` light / `#1b1d21` dark): a barely-lifted tone for the input wrapper and the result field — a whisper of separation from Paper, never a shadow.
- **Ink** (`#14161a` light / `#f2f2ef` dark): headings and primary text.
- **Muted Ink** (`#585b5f` light / `#95989d` dark): supporting copy, captions, the savings caption under the result.
- **Hairline** (`#d5d4d1` light / `rgba(255,255,255,0.11)` dark): every border, divider, and input stroke in the system.
- **Destructive** (`#e7000b`): reserved for the inline error state on an invalid URL; unchanged between light and dark beyond the existing shadcn convention.

### Named Rules

**The One Accent Rule.** Signal Indigo appears in exactly two places: the primary button and focus/active states. It never colors body text, icons at rest, or decorative surfaces. Its rarity is what makes the primary action legible at a glance.

## Typography

**Display/Body Font:** Geist Variable (with `ui-sans-serif, sans-serif` fallback)
**Data/Mono Font:** Geist Mono Variable (with `ui-monospace, monospace` fallback)

**Character:** A workhorse humanist sans for anything meant to be read, paired with its own monospace sibling for anything meant to be _data_ — the pairing shares one type family's design language, so the switch between prose and code never feels like a costume change.

### Hierarchy

- **Display/Headline** (500 weight, `clamp(1.875rem, 4vw, 2.25rem)`, 1.15 line-height, -0.02em tracking): the single H1, e.g. "Enlaces privados, sin servidor". Centered, `text-balance`.
- **Body** (400 weight, 0.875rem–1rem, 1.5 line-height): the positioning subtext under the headline, max-width constrained for a short, centered measure.
- **Data/Mono** (400 weight, 0.875rem–1rem, -0.02em tracking): the URL input value and the generated link/token. This is the one place monospace is used, because it is the one place the page displays code/data rather than prose.
- **Caption/Label** (400 weight, 0.75rem, mono): the "N% más corto" savings line and the button labels inside the result row.

### Named Rules

**The Data-Only Mono Rule.** Monospace type is used exclusively for the URL and the generated token — never for headings, body copy, or UI chrome. It signals "this is data" precisely because it never appears anywhere else.

## Layout

A single centered column (`max-w-lg`), vertically centered in the viewport with no header, footer, or navigation — the whole page is the task. Generous vertical rhythm between the headline block and the form (`gap-10`) keeps the first viewport calm; inside the form, the input and its (once generated) result sit close together, separated by one hairline rule rather than extra whitespace, so the result reads as a direct consequence of the input, not a new section. Below `sm` (640px), the URL field and the "Generar" button stack full-width instead of sitting side by side; the result row's copy/share buttons wrap onto their own line via `flex-wrap` rather than overflowing or truncating further. No shell chrome adapts at any breakpoint because there is none to adapt.

## Elevation & Depth

Flat by design — there is no shadow vocabulary in this system. Depth (such as it exists) is conveyed by a near-imperceptible tonal step between Paper and Card, and by hairline borders, never by blur or offset shadows. This is a deliberate reading of the product's own claim: a tool with "nothing hidden" should not stage its interface behind drop shadows implying layers that aren't there.

### Named Rules

**The Flat-By-Default Rule.** No `box-shadow` appears anywhere in the interface. Separation between surfaces comes from a 1px hairline border and, at most, a one-step tonal shift (Paper → Card).

## Shapes

Corners are small and consistent (`--radius: 6px`, scaling from 3.6px on the smallest controls to 8.4px on the largest) — crisp enough to read as a precise, technical surface rather than a soft consumer app, but not sharp enough to feel brutalist. Every bordered surface (the input wrapper, the result field) uses the same 1px hairline stroke; there are no double borders, no colored side-borders, and no border weight above 1px anywhere in the system.

## Components

### Buttons

- **Shape:** rounded corners (6px), matching the system radius scale.
- **Primary ("Generar"):** Signal Indigo background, near-white text, no border. Used exactly once per screen, for the single primary action.
- **Outline ("Copiar" / "Compartir"):** transparent background, hairline border, ink text; icon (Lucide, 14px, single stroke weight) plus a visible text label — never icon-only, so the action is always named.
- **Hover / Focus:** primary darkens slightly (`/80` opacity blend) on hover; every interactive control gets a 3px Signal Indigo focus ring on `:focus-visible`, never on mouse click.

### Inputs / Fields

- **Style:** transparent background, no border of its own — the border lives on the wrapping row so the URL field and the "Generar" button read as one continuous control, split only by a hairline. Value text is set in the mono/data face.
- **Focus:** the wrapping row's border shifts to Signal Indigo with a soft 3px ring; no glow, no shadow.
- **Error:** the wrapper border and ring shift to Destructive red; the error message appears as plain text below, in the body face, never mono (it's prose, not data).

### Result Field (signature component)

- **Style:** a flat, hairline-bordered, Card-toned row holding the generated link as one continuous mono string (truncated with an ellipsis, never wrapped or fragmented into per-character cells — the field stays one accessible text node). Copy and Share sit inline at the row's end as outline buttons.
- **Reveal:** appears the instant a link is generated, offset by one hairline rule from the input above it, with a single fade/slide-up entrance (skipped entirely under `prefers-reduced-motion`).
- **Caption:** a mono caption below the field states the length savings, or "Enlace generado" when there is nothing to compare.

## Do's and Don'ts

### Do:

- **Do** reserve Signal Indigo for the primary action and focus/active states only (The One Accent Rule).
- **Do** set any URL, token, or other literal data in the mono face; set every other word in the sans face (The Data-Only Mono Rule).
- **Do** use a 1px hairline border as the only structural separator between surfaces (The Flat-By-Default Rule).
- **Do** label every button with visible text, even when it also carries an icon.
- **Do** keep the page to a single centered column with no header/nav — a new control is a reason to reconsider before it is a reason to add chrome.

### Don't:

- **Don't** add a shadow, gradient, or glass/blur effect anywhere in this system.
- **Don't** introduce a second accent color; if a new state needs color, reach for the existing Destructive red or a neutral first.
- **Don't** fragment the generated link into per-character DOM nodes for visual effect — it must stay one selectable, screen-reader-legible text node.
- **Don't** reintroduce a top navigation bar, logo lockup, or persistent header — the centered column is the whole surface.
- **Don't** use an icon without a visible text label on an actionable button.
