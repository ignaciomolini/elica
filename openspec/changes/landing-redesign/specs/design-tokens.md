# Design Tokens Specification

## Purpose

Defines the teal/mint design system derived from the Elica brand logo. All semantic tokens in `@theme` and `:root` MUST be synchronized to the same color values. Legacy scale tokens remain for backward compatibility with admin/doctor panels.

## Requirements

### Requirement: Teal Semantic Tokens

The system MUST define semantic color tokens in `@theme` that match the Elica logo palette. Primary MUST be `#0A5C5B` (deep teal). Accent MUST be `#6ABDAF` (mint). All semantic tokens MUST use hex values in `@theme`.

| Token | Value | Role |
|-------|-------|------|
| `--color-primary` | `#0A5C5B` | Main brand color, CTAs, links |
| `--color-primary-foreground` | `#FFFFFF` | Text on primary backgrounds |
| `--color-accent` | `#6ABDAF` | Secondary actions, highlights |
| `--color-accent-foreground` | `#0A5C5B` | Text on accent backgrounds |
| `--color-background` | `#FFFFFF` | Page background |
| `--color-foreground` | `#1A1A2E` | Body text |
| `--color-card` | `#FFFFFF` | Card surfaces |
| `--color-card-foreground` | `#1A1A2E` | Card text |
| `--color-border` | `#E2E8F0` | Borders, dividers |
| `--color-ring` | `#0A5C5B` | Focus rings |
| `--color-muted` | `#F1F5F9` | Subtle backgrounds |
| `--color-muted-foreground` | `#64748B` | Secondary text |
| `--color-destructive` | `#EF4444` | Error states |
| `--color-destructive-foreground` | `#FFFFFF` | Text on destructive |
| `--color-secondary` | `#F1F5F9` | Secondary surfaces |
| `--color-secondary-foreground` | `#1E293B` | Secondary text |

#### Scenario: Primary token matches logo teal

- GIVEN the `@theme` block in `src/index.css`
- WHEN reading `--color-primary`
- THEN the value MUST be `#0A5C5B`

#### Scenario: Accent token matches logo mint

- GIVEN the `@theme` block in `src/index.css`
- WHEN reading `--color-accent`
- THEN the value MUST be `#6ABDAF`

### Requirement: @theme and :root Synchronization

The system MUST ensure `:root` CSS custom variables produce the same visual colors as `@theme` tokens. The `@theme inline` block maps `--color-*` to `var(--*)`, so `:root` values MUST be equivalent to the `@theme` hex values.

#### Scenario: :root primary equals @theme primary

- GIVEN the `:root` block defines `--primary`
- AND `@theme inline` maps `--color-primary` to `var(--primary)`
- WHEN the computed color of `--primary` is evaluated
- THEN it MUST visually match `#0A5C5B`

#### Scenario: :root ring equals @theme primary

- GIVEN `--ring` in `:root` is used for focus rings
- WHEN the computed color is evaluated
- THEN it MUST visually match `#0A5C5B` (same as primary)

#### Scenario: No desync between @theme and :root

- GIVEN both `@theme` and `:root` define the same semantic tokens
- WHEN comparing computed values for `background`, `foreground`, `primary`, `accent`, `card`, `border`
- THEN each pair MUST produce identical rendered colors

### Requirement: Legacy Token Teal Scale

The system MUST update legacy scale tokens (`--color-primary-50` through `--color-primary-900`, `--color-accent-50` through `--color-accent-900`) to a teal-based scale so admin/doctor panels that reference `bg-primary-600` or `bg-accent-600` render in the teal palette instead of blue/green.

| Legacy Token | New Value |
|-------------|-----------|
| `--color-primary-50` | `#E6F5F5` |
| `--color-primary-100` | `#CCEBEB` |
| `--color-primary-200` | `#99D7D6` |
| `--color-primary-300` | `#66C3C2` |
| `--color-primary-400` | `#33AFAD` |
| `--color-primary-500` | `#0A5C5B` |
| `--color-primary-600` | `#084A49` |
| `--color-primary-700` | `#063837` |
| `--color-primary-800` | `#042525` |
| `--color-primary-900` | `#021313` |
| `--color-accent-50` | `#F0F9F7` |
| `--color-accent-100` | `#E1F3EF` |
| `--color-accent-200` | `#C3E7DF` |
| `--color-accent-300` | `#A5DBCF` |
| `--color-accent-400` | `#87CFBF` |
| `--color-accent-500` | `#6ABDAF` |
| `--color-accent-600` | `#55A89A` |
| `--color-accent-700` | `#409385` |
| `--color-accent-800` | `#2B7E70` |
| `--color-accent-900` | `#16695B` |

#### Scenario: Admin panel bg-primary-600 renders teal

- GIVEN an admin page uses `bg-primary-600`
- WHEN the page renders
- THEN the background MUST be `#084A49` (teal shade, not blue)

#### Scenario: Doctor panel bg-accent-600 renders mint

- GIVEN a doctor panel uses `bg-accent-600`
- WHEN the page renders
- THEN the background MUST be `#55A89A` (mint shade, not emerald)

### Requirement: Geist Font Applied Globally

The system MUST apply Geist Variable as the default font family for all text. The `@theme inline` block MUST set `--font-sans` to `'Geist Variable', sans-serif` and `--font-heading` to `var(--font-sans)`.

#### Scenario: Body text uses Geist Variable

- GIVEN the page renders any text element
- WHEN inspecting computed font-family
- THEN it MUST include `Geist Variable`

#### Scenario: Heading text uses Geist Variable

- GIVEN the page renders an `h1`, `h2`, or `h3`
- WHEN inspecting computed font-family
- THEN it MUST include `Geist Variable`

### Requirement: Dark Mode Structure Preserved

The system MUST preserve the `.dark` class selector structure with all existing variable names. Dark mode values MUST remain as-is for this change — only the light mode palette is being updated.

#### Scenario: .dark block exists with all variables

- GIVEN `src/index.css`
- WHEN searching for `.dark` selector
- THEN it MUST contain all semantic variables: `--background`, `--foreground`, `--primary`, `--accent`, `--card`, `--border`, `--ring`, `--muted`, `--destructive`, `--sidebar-*`

#### Scenario: Dark mode values unchanged

- GIVEN the `.dark` block exists
- WHEN comparing dark variable values before and after this change
- THEN they MUST remain identical
