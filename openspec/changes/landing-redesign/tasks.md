# Tasks: Landing Page Redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350–400 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR — all 6 files, tightly coupled by tokens |
| Delivery strategy | ask-always (→ ask-on-risk) |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

**Rationale**: The change touches 6 files where CSS tokens are the root dependency. Splitting across PRs would require either incomplete styling or duplicated token setup. Visual-only refactor, no logic changes, low functional risk. A single PR at ~400 changed lines is manageable.

## Phase 1: Design Tokens — Foundation

- [x] 1.1 Replace `@theme` semantic tokens in `src/index.css` — swap navy/amber hex values to teal/mint per design-tokens spec table. Keep amber scale tokens for backward compat.
- [x] 1.2 Replace legacy scale tokens (`--color-primary-50..900`, `--color-accent-50..900`) with teal shades so admin/doctor panels render teal palette.
- [x] 1.3 Sync `:root` oklch values (`--primary`, `--accent`, `--ring`) to match the new teal/mint hex colors visually. Preserve `.dark` block unchanged.

## Phase 2: Button Refactor

- [x] 2.1 Replace `variantClasses` in `Button.tsx` — `bg-primary-600` → `bg-primary`, `hover:bg-primary-700` → `hover:bg-primary/90`, `focus-visible:ring-primary-500` → `focus-visible:ring-primary`. Same pattern for secondary/accent and outline.

## Phase 3: Layout Components

- [x] 3.1 Replace `bg-gray-50` with `bg-background` in `Layout.tsx` root div.
- [x] 3.2 Style `Header.tsx` — add `sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border`. Add flex horizontal layout (logo + nav + CTA). Add `useState<boolean>` mobile menu toggle with conditional nav panel.
- [x] 3.3 Style `Footer.tsx` — add `bg-primary text-primary-foreground py-12 px-6`. Add `grid md:grid-cols-3 gap-8` layout for Brand/Contact/Hours columns. Add `Separator` + copyright bar.

## Phase 4: Home Page Redesign

- [x] 4.1 Style Hero — add `py-16 px-6 max-w-6xl mx-auto grid` layout. Add heading, description, and primary `Button size="lg"` CTA.
- [x] 4.2 Refactor Specialties section — wrap cards in shadcn `Card`/`CardHeader`/`CardTitle`/`CardDescription`. Add `Badge variant="secondary"` eyebrow. Add skeleton loading cards (`animate-pulse`). Add error state with `Button variant="outline"` retry. Grid: `sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- [x] 4.3 Style CTA section — `bg-muted rounded-2xl p-8 text-center` layout with heading, description, and `Button size="lg"`.
- [x] 4.4 Style Recovery toggle and form — wrap in `Card`. Add collapsible toggle with `text-primary underline`. Style input fields and error message (`text-destructive`).

## Phase 5: Verification

- [x] 5.1 Run `tsc --noEmit` and fix any type errors.
- [ ] 5.2 Visual check: landing page renders fully — Header (fixed + mobile toggle), Hero, Specialties cards, CTA, Recovery form, Footer grid.
- [ ] 5.3 Visual check: admin/doctor panel buttons render with teal palette, no broken colors.
