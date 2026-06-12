# Proposal: Landing Page Redesign

## Intent

The landing page (Home, Header, Footer) currently renders as unstyled raw HTML. The design system uses a navy/amber palette that does not match the Elica brand logo (teal/mint). Button.tsx references legacy blue scale tokens (`bg-primary-600`) that are disconnected from the semantic theme. We need a coherent, minimalist visual identity aligned to the brand.

## Scope

### In Scope
- Synchronize `@theme` and `:root` semantic tokens to the logo-derived teal/mint palette
- Refactor `Button.tsx` from legacy scale tokens to semantic tokens (`bg-primary`, `text-primary-foreground`, etc.)
- Add Tailwind styling to `Header.tsx` and `Footer.tsx`
- Redesign `Home.tsx` with shadcn components (Card, Badge, Separator) and generous spacing
- Fix `Layout.tsx` hardcoded `bg-gray-50` to use `bg-background`

### Out of Scope
- Admin panel, doctor panel, booking flow, verification pages — keep working with legacy tokens
- New pages or routes
- Animation libraries, gradients, or heavy shadows
- Dark mode toggle

## Capabilities

### New Capabilities
None — pure visual refactor, no new functional behavior.

### Modified Capabilities
None — no existing spec-level requirement changes.

## Approach

1. Update `index.css` `@theme` block: replace navy/amber with teal (`#0A5C5B`) / mint (`#6ABDAF`) semantic tokens. Sync `:root` to match.
2. Refactor `Button.tsx` variant map to use semantic tokens (`bg-primary`, `hover:bg-primary/90`, etc.) instead of legacy scale classes.
3. Style `Header.tsx` with a clean top bar, logo, navigation, and responsive mobile menu.
4. Style `Footer.tsx` with a multi-column layout, contact info, and minimal copyright.
5. Redesign `Home.tsx` sections (Hero, Specialties, CTA, Recovery) using shadcn Card, Separator, and Badge where appropriate.
6. Update `Layout.tsx` to remove `bg-gray-50` and use `bg-background`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/index.css` | Modified | Teal/mint semantic tokens; legacy scale kept for backward compat |
| `src/components/ui/Button.tsx` | Modified | Refactor to semantic tokens |
| `src/components/layout/Header.tsx` | Modified | Add Tailwind styling and mobile menu |
| `src/components/layout/Footer.tsx` | Modified | Add Tailwind styling and layout |
| `src/pages/Home.tsx` | Modified | Redesign sections with shadcn components |
| `src/components/layout/Layout.tsx` | Modified | Replace `bg-gray-50` with `bg-background` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Palette change breaks existing admin/doctor pages | Low | Legacy scale tokens (`primary-50..900`) remain in `@theme` |
| Button refactor causes color regressions on other pages | Low | Semantic tokens (`primary`, `accent`) are the same values; test visually |
| Mobile menu adds complexity | Low | Use simple conditional render with state; no external lib |

## Rollback Plan

Revert the single commit (`git revert <commit-sha>`). The change is contained to six files; rollback restores the previous palette and unstyled layout immediately.

## Dependencies

None.

## Success Criteria

- [ ] Header and Footer render with professional styling matching the teal palette
- [ ] Home page looks cohesive, uses shadcn components, and has no visual regressions
- [ ] `tsc --noEmit` passes with zero errors
- [ ] Other pages (admin, doctor, booking) still render correctly with no broken colors
- [ ] No new runtime dependencies added
