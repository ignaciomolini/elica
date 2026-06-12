# Design: Landing Page Redesign

## Technical Approach

Visual refactor of 6 files: synchronize the CSS theme to the teal/mint palette, migrate Button.tsx from legacy scale tokens to semantic tokens, and add Tailwind styling to the currently unstyled Header, Footer, Home, and Layout components using shadcn primitives (Card, Badge, Separator). No new routes, no new dependencies, no functional changes.

## Architecture Decisions

### Decision: CSS Block Separation Strategy

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single `@theme` block with all tokens | Simple but mixes Tailwind utility generation with shadcn var() mapping | Rejected |
| Three-block split: `@theme` (hex), `@theme inline` (var map), `:root` (oklch) | Clear separation of concerns; `@theme` drives Tailwind utilities, `@theme inline` bridges to shadcn CSS vars, `:root` provides oklch for dark mode interpolation | **Chosen** |

**Rationale**: The existing codebase already uses this three-block pattern. We preserve it and only swap color values. The `@theme inline` block's `--color-*: var(--*)` mappings mean shadcn components resolve through `:root` CSS vars, so `:root` oklch values must visually match `@theme` hex values.

### Decision: Legacy Token Strategy

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Remove legacy scale tokens | Breaks admin/doctor panels | Rejected |
| Keep legacy scale, update values to teal | Admin panels get teal automatically, zero consumer changes | **Chosen** |

**Rationale**: Admin/doctor panels use `bg-primary-600`, `bg-accent-600` directly. Remapping the scale values to teal shades means those panels update visually with no code changes — consistent brand, zero risk.

### Decision: Header Mobile Menu Implementation

| Option | Tradeoff | Decision |
|--------|----------|----------|
| External library (hamburger-menu, etc.) | Adds dependency, violates "no new deps" constraint | Rejected |
| Conditional render with `useState` | 10 lines of code, no deps, matches project patterns | **Chosen** |

**Rationale**: Proposal explicitly forbids new runtime dependencies. A `useState<boolean>` toggle with a conditional `<nav>` block is sufficient for the mobile breakpoint.

### Decision: Footer Background Token

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Raw hex `bg-[#042525]` | Breaks semantic-only rule | Rejected |
| `bg-primary` with `text-primary-foreground` | Semantic, but primary (#0A5C5B) may not be dark enough | Rejected |
| `bg-primary/90` or dedicated `--color-footer` token | Adds complexity | Rejected |
| `bg-primary` (deep teal #0A5C5B) with `text-primary-foreground` | Sufficient contrast, semantic, simple | **Chosen** |

**Rationale**: #0A5C5B on white text provides 7.2:1 contrast ratio (WCAG AAA). This is dark enough for a footer. If the team wants darker, a `--color-surface-inverted` token can be added later.

## Data Flow

```
index.css                    Tailwind Utility Generation
┌─────────────────────────────────────────────────────────┐
│ @theme { hex values }  ──→  bg-primary, text-accent    │
│                              hover:bg-primary/90        │
│                                                         │
│ @theme inline { var map } ──→  shadcn components        │
│   --color-primary: var(--primary)    resolve via :root  │
│                                                         │
│ :root { oklch values }  ──→  CSS var definitions        │
│   --primary: oklch(...)              dark mode ready    │
└─────────────────────────────────────────────────────────┘
          │
          ▼
Components (Header, Footer, Home, Layout, Button)
  - Use ONLY semantic tokens: bg-primary, text-foreground, border-border
  - shadcn Card/Badge/Separator inherit tokens automatically
```

## Component Tree

```
Layout (bg-background, flex-col min-h-screen)
├── Header (fixed/sticky, bg-background/80, backdrop-blur)
│   ├── LogoLink → img + span
│   ├── Nav (desktop: flex row | mobile: hidden)
│   │   ├── Link "Inicio"
│   │   ├── Link "Especialidades"
│   │   ├── Link "Médicos"
│   │   └── Link "Mis turnos"
│   ├── Button CTA (variant="primary" | pending → "secondary")
│   └── MobileToggle (button, hamburger icon)
│       └── MobileNav (conditional, absolute/fixed overlay)
├── main (flex-1, pt-[header-height])
│   └── Home
│       ├── Hero (grid: text-left + watermark-right on lg)
│       │   ├── h1 (font-serif or font-bold text-4xl)
│       │   ├── p (text-muted-foreground)
│       │   └── Button "Reservar turno ahora" (variant="primary" size="lg")
│       ├── Specialties
│       │   ├── SectionHeader (h2 + p)
│       │   ├── Loading → skeleton cards (3x Card with animate-pulse)
│       │   ├── Error → alert Card + Button "Reintentar" (variant="outline")
│       │   └── Grid (sm:1col md:2col lg:3col)
│       │       └── Card per specialty
│       │           ├── CardHeader → Badge (variant="secondary") eyebrow
│       │           ├── CardTitle
│       │           └── CardDescription
│       ├── CTA Section (bg-muted, centered)
│       │   ├── h2 + p
│       │   └── Button "Comenzar reserva" (size="lg")
│       └── Recovery (collapsible)
│           ├── Toggle button (text-primary, underline)
│           └── [conditional] Form Card
│               ├── Email input
│               ├── DNI input
│               ├── Error message (text-destructive)
│               └── Button "Recuperar turno" (variant="primary")
└── Footer (bg-primary, text-primary-foreground)
    ├── Grid (md:3col, stacked on mobile)
    │   ├── Brand: img + description
    │   ├── Contact: h3 + ul (tel, mail, address)
    │   └── Hours: h3 + ul (schedule)
    └── Separator + Copyright (text-center, text-sm)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/index.css` | Modify | Replace navy/amber semantic tokens with teal/mint hex values in `@theme`. Update `:root` oklch to match teal. Update legacy scale to teal shades. Keep `@theme inline`, `.dark`, fonts, imports unchanged. |
| `src/components/ui/Button.tsx` | Modify | Replace `variantClasses` map: `bg-primary-600` → `bg-primary`, `text-white` → `text-primary-foreground`, `hover:bg-primary-700` → `hover:bg-primary/90`, `focus-visible:ring-primary-500` → `focus-visible:ring-primary`. Same pattern for secondary (accent) and outline. |
| `src/components/layout/Layout.tsx` | Modify | Replace `bg-gray-50` with `bg-background`. |
| `src/components/layout/Header.tsx` | Modify | Add Tailwind classes: `sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border`. Add flex layout for logo/nav/CTA. Add `useState` mobile toggle with conditional nav panel. Wrap CTA text in `<Button>`. |
| `src/components/layout/Footer.tsx` | Modify | Add `bg-primary text-primary-foreground py-12 px-6`. Grid layout `grid md:grid-cols-3 gap-8`. Add `Separator` before copyright. Style links with `text-primary-foreground/70 hover:text-primary-foreground`. |
| `src/pages/Home.tsx` | Modify | Add section spacing (`py-16 px-6 max-w-6xl mx-auto`). Hero: grid layout with watermark. Specialties: wrap cards in shadcn `Card`/`CardHeader`/`CardTitle`/`CardDescription`, add `Badge` eyebrow. Loading: skeleton cards. CTA: `bg-muted rounded-2xl p-8`. Recovery: wrap form in `Card`, add collapsible toggle styling. |

## Interfaces / Contracts

No new interfaces. Existing contracts preserved:

```typescript
// Button.tsx — API unchanged
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';  // default: 'primary'
  size?: 'sm' | 'md' | 'lg';                       // default: 'md'
}
```

## Responsive Breakpoint Strategy

| Breakpoint | Tailwind | Header | Home Hero | Specialties Grid | Footer |
|------------|----------|--------|-----------|------------------|--------|
| Mobile | `< md` | Logo + hamburger, nav hidden | Single column, full-width | 1 column | Stacked |
| Tablet | `md` | Logo + inline nav + CTA | 2-col grid (text + watermark) | 2 columns | 3 columns |
| Desktop | `lg` | Same as md, wider max-w | Asymmetric (5/7 or 6/6) | 3 columns | 3 columns |

Container: `max-w-6xl mx-auto px-4 sm:px-6` for all sections. Header/Footer: full-width with inner container.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Build | `tsc --noEmit` passes | CI gate — zero type errors after refactor |
| Visual | All 6 files render correctly | Manual browser check: landing page + admin/doctor panel buttons |
| Regression | Admin/doctor pages still have correct button colors | Visual spot-check: `bg-primary-600` now renders teal, not blue |
| Responsive | Mobile menu toggle, grid stacking | Browser devtools at 375px, 768px, 1024px |

No unit tests — this is a pure visual refactor with no logic changes. The existing React components have no test infrastructure.

## Migration / Rollout

No migration required. Single-commit visual change. Rollback: `git revert <sha>`.

## Open Questions

- [ ] Should the Hero watermark use the existing `/logo.svg` as a low-opacity background element, or a dedicated SVG asset?
- [ ] Footer `bg-primary` (#0A5C5B) — is this dark enough, or should we introduce a `--color-surface-inverted` token for a darker footer?
