# Button Refactor Specification

## Purpose

Migrates `Button.tsx` from legacy scale tokens (`bg-primary-600`, `bg-accent-600`) to semantic tokens (`bg-primary`, `bg-accent`, `text-primary-foreground`). The variant/size API MUST remain unchanged for backward compatibility with all consumers across the application.

## Requirements

### Requirement: Semantic Token Variant Map

The system MUST replace all legacy scale references in `variantClasses` with semantic tokens. The `primary` variant MUST use `bg-primary`, `hover:bg-primary/90`, and `focus-visible:ring-primary`. The `secondary` variant MUST use `bg-accent`, `hover:bg-accent/90`, and `focus-visible:ring-accent`. The `outline` variant MUST use `border-primary`, `text-primary`, and `hover:bg-primary/5`.

| Variant | Current (legacy) | New (semantic) |
|---------|-----------------|----------------|
| `primary` | `bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500` | `bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary` |
| `secondary` | `bg-accent-600 text-white hover:bg-accent-700 focus-visible:ring-accent-500` | `bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent` |
| `outline` | `border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500` | `border-2 border-primary text-primary hover:bg-primary/5 focus-visible:ring-primary` |

#### Scenario: Primary button uses bg-primary

- GIVEN a Button with `variant="primary"` renders
- WHEN inspecting its className
- THEN it MUST contain `bg-primary`
- AND it MUST NOT contain `bg-primary-600` or any legacy scale token

#### Scenario: Secondary button uses bg-accent

- GIVEN a Button with `variant="secondary"` renders
- WHEN inspecting its className
- THEN it MUST contain `bg-accent`
- AND it MUST NOT contain `bg-accent-600` or any legacy scale token

#### Scenario: Outline button uses border-primary

- GIVEN a Button with `variant="outline"` renders
- WHEN inspecting its className
- THEN it MUST contain `border-primary` and `text-primary`
- AND it MUST NOT contain `border-primary-600` or `text-primary-600`

#### Scenario: Hover states use opacity modifier

- GIVEN a primary or secondary button renders
- WHEN the user hovers over it
- THEN the hover style MUST use an opacity modifier (e.g., `hover:bg-primary/90`) instead of a different scale step

### Requirement: Backward Compatible API

The Button component MUST preserve its existing TypeScript interface: `variant` accepts `'primary' | 'secondary' | 'outline'` with default `'primary'`, and `size` accepts `'sm' | 'md' | 'lg'` with default `'md'`. All existing consumers MUST continue to work without code changes.

#### Scenario: Default variant renders as primary

- GIVEN a Button with no `variant` prop
- WHEN it renders
- THEN it MUST apply primary variant styles

#### Scenario: All three variants render without errors

- GIVEN Buttons with `variant="primary"`, `variant="secondary"`, and `variant="outline"`
- WHEN they render
- THEN all three MUST display with correct styles and no TypeScript errors

#### Scenario: All three sizes render correctly

- GIVEN Buttons with `size="sm"`, `size="md"`, and `size="lg"`
- WHEN they render
- THEN each MUST apply its corresponding padding and text size

### Requirement: Admin/Doctor Panel Compatibility

The refactor MUST NOT break buttons used in admin or doctor panels. Since these panels may still reference legacy scale tokens directly in their own classNames, the semantic token values MUST produce visually equivalent colors to the old legacy values (both now map to the teal scale).

#### Scenario: Admin panel buttons still render correctly

- GIVEN an admin page that uses `<Button variant="primary">` or `<Button variant="secondary">`
- WHEN the page renders after the refactor
- THEN buttons MUST display with teal palette colors and no visual regression

#### Scenario: Doctor panel buttons still render correctly

- GIVEN a doctor panel page that uses `<Button>` with any variant
- WHEN the page renders after the refactor
- THEN buttons MUST display correctly with no broken styles

#### Scenario: No legacy scale references remain in Button.tsx

- GIVEN the `Button.tsx` source file
- WHEN scanning for `primary-600`, `primary-700`, `primary-500`, `accent-600`, `accent-700`, `accent-500`
- THEN none of these legacy tokens MUST be found in the variantClasses map
