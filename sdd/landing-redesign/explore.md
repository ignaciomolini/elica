## Exploration: landing-redesign — Color System & Theme Alignment

> **Scope**: Read-only investigation of the elica project's visual identity, current theme, available UI primitives, and layout structure to inform a landing page redesign.
> **Date**: 2026-06-10

---

### 1. Logo Palette

The logo (`public/logo.svg`) is a **monochromatic teal illustration** with **175 unique hex colors** and **no warm or high-chroma accent colors**. Every color sits in the dark-to-medium teal/cyan/green family.

#### Frequency Leaders
| Color | Count | Role Guess |
|-------|-------|------------|
| `#023F3E` | 4 | Deep shadow / darkest fill |
| `#013A3A` | 3 | Deep shadow |
| `#013F3D` | 3 | Deep shadow |
| `#024241` | 3 | Deep shadow |
| `#013D3C` | 3 | Deep shadow |

#### Prominent Brand Teals (mid-dark, most visible at a glance)
`#0A5C5B`, `#085959`, `#085A5A`, `#045859`, `#045758`, `#045757`, `#045656`, `#045555`, `#045454`, `#045657`, `#045858`, `#055858`, `#075858`, `#075959`, `#0A5957`, `#0D5A55`, `#0E5C59`, `#0D5E58`, `#105E57`, `#0E5F59`

#### Highlight / Light Teals (used for mid-tones and lighter accents inside the logo)
`#6ABDAF`, `#6AC1AC`, `#5EC2B5`, `#70BCAE`, `#6CB7AA`, `#68BBAA`, `#61AE9F`, `#53A094`, `#499F95`, `#48978A`, `#46948C`, `#82D3C2`, `#7BCCC2`, `#76C8BC`, `#7CC6B7`

#### Grouped by Role
| Role | Representative Colors | Notes |
|------|----------------------|-------|
| **Primary (brand)** | `#0A5C5B`, `#085959`, `#085A5A` | The most visible "Elica" teal. Mid-dark, professional, medical. |
| **Primary dark** | `#023F3E`, `#013A3A`, `#024241` | Near-black with a teal cast. Used for deep shadows. |
| **Accent (light)** | `#6ABDAF`, `#5EC2B5`, `#82D3C2` | Mint / light teal highlights. Natural in-logo accent. |
| **Neutral (background)** | `#ffffff` (implied by SVG canvas) | The logo sits on white; no logo background color. |

---

### 2. Current CSS Theme

**File**: `src/index.css`

#### `@theme` Block (Tailwind v4 / shadcn "nova" semantic tokens)
```
--color-background:   #ffffff
--color-foreground:   #1a1a2e
--color-primary:      #1e3a5f    (dark navy blue)
--color-primary-foreground: #f8fafc
--color-secondary:    #f1f5f9    (slate-100)
--color-secondary-foreground: #1e293b
--color-muted:        #f1f5f9    (slate-100)
--color-muted-foreground: #64748b
--color-accent:       #f0a500    (amber/gold)
--color-accent-foreground: #1a1a2e
--color-destructive:  #ef4444
--color-destructive-foreground: #f8fafc
--color-card:         #ffffff
--color-card-foreground: #1a1a2e
--color-border:       #e2e8f0
--color-ring:         #1e3a5f
--radius:             0.625rem
```

#### Legacy Scale Tokens
- **Primary scale**: `#3b82f6` (blue) at 500, derived from standard Tailwind blue.
- **Accent scale**: `#10b981` (emerald) at 500, derived from standard Tailwind emerald.
- **Amber scale**: `#f0a500` at 500 — used for the current semantic `accent`.

#### `:root` / `.dark` (oklch-based CSS variables)
- The `:root` block defines a **second layer** of CSS variables in oklch format, mostly coinciding with the `@theme` block but with `radius: 0`.
- `.dark` mode is fully defined (dark background, light foreground, muted primary, etc.).
- **Key issue**: `primary` in `:root` is `oklch(0.52 0.105 223.128)` — a blue hue. `accent` in `:root` is `oklch(0.96 0.002 17.2)` — essentially a near-gray, NOT the amber from the `@theme` block. This is a **desynchronization** between the `@theme` semantic layer and the `:root` CSS-variable layer.

#### `@theme inline` Block
- Maps the CSS variables (e.g., `var(--primary)`) back to Tailwind classes. This is the shadcn "nova" v4 pattern.

---

### 3. Current shadcn Config

**File**: `components.json`

```json
{
  "style": "base-mira",
  "baseColor": "taupe",
  "iconLibrary": "hugeicons",
  "cssVariables": true,
  "tailwind.css": "src/index.css"
}
```

- **style**: `base-mira` — a custom or third-party shadcn registry style.
- **baseColor**: `taupe` — the generator was originally set to taupe, but the actual theme is manually overridden to navy + amber.
- **iconLibrary**: `hugeicons`.

---

### 4. Current UI Components

**Directory**: `src/components/ui/`

| Component | Source | Notes |
|-----------|--------|-------|
| `SpecialtyIcon.tsx` | Custom | Maps specialty names (heart, skin, baby, bone, brain, eye) to inline SVGs. Uses `stroke="currentColor"`. |
| `separator.tsx` | shadcn | Standard separator. Uses `bg-border`. |
| `card.tsx` | shadcn (nova) | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`. Uses `bg-card`, `text-card-foreground`, `ring-foreground/10`. |
| `Button.tsx` | **Custom** | **NOT shadcn**. Uses hardcoded legacy Tailwind classes: `bg-primary-600`, `bg-accent-600`, `border-primary-600`, `bg-primary-50`. Directly dependent on the legacy `--color-primary-*` and `--color-accent-*` scales. |
| `badge.tsx` | shadcn (CVA) | Uses `bg-primary`, `bg-secondary`, `bg-destructive`, `bg-accent`, etc. — reads the semantic `@theme` tokens. |

---

### 5. Layout Structure

**File**: `src/components/layout/Layout.tsx`

```tsx
<div className="flex flex-col min-h-screen bg-gray-50">
  <Header />
  <main className="flex-1">{children}</main>
  <Footer />
</div>
```

- **Header** (`src/components/layout/Header.tsx`): Contains logo, navigation links (Inicio, Especialidades, Médicos, Mis turnos), and a CTA button ("Reservar turno" / "Confirmar turno pendiente"). **No styling classes applied** — raw HTML elements.
- **Footer** (`src/components/layout/Footer.tsx`): Logo, tagline, contact info, business hours. **No styling classes applied** — raw HTML elements.
- **Layout**: Uses `bg-gray-50` as the page background, which is **not connected** to the shadcn theme tokens (`--color-background` is `#ffffff`).

---

### 6. Recommendation

#### Colors to Promote to the Design System

| Token | Current Value | Proposed Value | Rationale |
|-------|--------------|---------------|-----------|
| `--color-primary` | `#1e3a5f` (navy) | `#0A5C5B` | Matches the most prominent brand teal in the logo. |
| `--color-primary-foreground` | `#f8fafc` | `#ffffff` | Maintains high contrast on dark teal. |
| `--color-accent` | `#f0a500` (amber) | `#6ABDAF` | Replaces the off-brand amber with the logo's natural light-mint highlight. |
| `--color-accent-foreground` | `#1a1a2e` | `#0f1c1c` | Dark teal-black for text on light teal accent. |
| `--color-secondary` | `#f1f5f9` | `#f0fdfa` | Very light teal-tinted gray to stay in-brand. |
| `--color-muted` | `#f1f5f9` | `#f0fdfa` | Same as secondary for consistency. |
| `--color-muted-foreground` | `#64748b` | `#5c7a78` | Muted teal-gray. |
| `--color-background` | `#ffffff` | `#ffffff` | Keep white — logo is designed for white backgrounds. |
| `--color-foreground` | `#1a1a2e` | `#0f1c1c` | Very dark teal-black instead of pure blue-black. |
| `--color-card` | `#ffffff` | `#ffffff` | Keep white. |
| `--color-card-foreground` | `#1a1a2e` | `#0f1c1c` | Match foreground. |
| `--color-border` | `#e2e8f0` | `#d1e0de` | Subtle teal-tinted border. |
| `--color-ring` | `#1e3a5f` | `#0A5C5B` | Match primary for focus rings. |
| `--color-destructive` | `#ef4444` | `#ef4444` | Keep standard red for errors. |

#### Legacy Token Scales (Must Update)

- **Primary scale**: Currently Tailwind blue (`#3b82f6` at 500). Must be regenerated to a teal scale derived from `#0A5C5B`.
- **Accent scale**: Currently Tailwind emerald (`#10b981` at 500). Must be regenerated to a mint-teal scale derived from `#6ABDAF`.

#### What Stays
- **Radius**: `0.625rem` — already rounded and modern.
- **Font**: Geist Variable — clean, medical, stays.
- **Dark mode definitions**: The `.dark` block structure stays, but the values inside should be re-mapped to dark-teal equivalents (e.g., dark background = `#0a1212`, dark primary = `#0A5C5B`, etc.).
- **shadcn components** (`card`, `badge`, `separator`) — they read semantic tokens and will auto-update once the `@theme` block changes.
- **SpecialtyIcon** — uses `currentColor`, so it will inherit the new primary/accent colors automatically.

#### What Must Change
- **`Button.tsx` (CUSTOM)** — This is the **highest risk**. It uses `bg-primary-600`, `bg-accent-600`, `border-primary-600`, `bg-primary-50`. These are legacy scale tokens. If the primary scale is updated to teal, the button will look correct **only if** the scale values are updated. If the scale is removed or renamed, the button will break. **Recommendation**: Either (a) update the legacy scale to the new teal values, or (b) refactor `Button.tsx` to use the semantic tokens (`bg-primary`, `bg-accent`, `bg-primary/10`, etc.) instead of the numbered scale.
- **`:root` oklch variables** — Currently desynchronized with the `@theme` block. The `:root` `primary` is blue, while `@theme` `primary` is navy. They must be unified to the same teal values. **Recommendation**: Make the `:root` block use the same hex values (or close oklch equivalents) as the `@theme` block.
- **Layout background** — `bg-gray-50` in `Layout.tsx` is hardcoded and not tied to the theme. Should become `bg-background` or `bg-muted`.
- **Header/Footer styling** — Both are completely unstyled. They need Tailwind classes applied to match the new design system.

#### Summary of Risks
1. **Custom Button component** is the biggest coupling risk. It is the only component that bypasses the semantic token system and uses the legacy numbered scale.
2. **Desync between `@theme` and `:root`** means some shadcn components might pick up oklch values while others pick up hex values, causing subtle color mismatches.
3. **Logo has no warm accent** — removing the amber accent is correct for brand alignment, but any UI that relied on amber for "call-to-action" emphasis will need to use the new mint-teal accent instead. Contrast ratios should be checked (`#6ABDAF` on white = ~2.5:1, which is NOT sufficient for text). Therefore, **accent foreground should be dark**, and accent should be used for backgrounds/badges, not primary text.

---

### Ready for Proposal

**Yes.** The exploration is complete. The orchestrator should tell the user:

> The current theme is **completely off-brand** (navy + amber vs. logo's all-teal identity). The redesign should update the shadcn semantic tokens to a teal/mint palette extracted from the logo, update the legacy Tailwind scales, fix the `:root` desynchronization, and refactor the custom `Button.tsx` to use semantic tokens instead of legacy numbered scales. The Header and Footer are raw HTML and need full styling.
