# Landing Layout Specification

## Purpose

Defines the visual structure and styling for the landing page layout: Header, Footer, Home page sections, and the Layout wrapper. All components MUST use semantic tokens only — never raw hex colors.

## Requirements

### Requirement: Fixed Header with Transparent Background

The Header MUST render as a fixed top bar with a transparent/blur background, containing the logo, navigation links, and a CTA button. It MUST be responsive with a mobile menu toggle.

#### Scenario: Header stays fixed on scroll

- GIVEN the user scrolls the page
- WHEN the viewport scrolls past the top
- THEN the Header MUST remain visible at `position: fixed` or `sticky` top

#### Scenario: Header has transparent blur background

- GIVEN the Header renders
- WHEN inspecting its background style
- THEN it MUST use a transparent or semi-transparent bg with backdrop-blur (e.g., `bg-background/80 backdrop-blur`)

#### Scenario: Header contains logo, nav, and CTA

- GIVEN the Header renders on desktop
- WHEN inspecting its children
- THEN it MUST contain: logo image, navigation links (Inicio, Especialidades, Médicos, Mis turnos), and a CTA button

#### Scenario: Mobile menu toggles on small screens

- GIVEN the viewport is below the mobile breakpoint
- WHEN the user clicks the menu toggle
- THEN a navigation panel MUST appear with the same links
- AND clicking toggle again MUST close it

### Requirement: Footer with Dark Teal Background

The Footer MUST render with a dark teal background, a 3-column responsive grid layout, and a copyright bar. Columns MUST contain: logo + description, contact info, and business hours.

#### Scenario: Footer displays 3-column grid on desktop

- GIVEN the viewport is at desktop width
- WHEN the Footer renders
- THEN it MUST show 3 columns: Brand, Contact, Hours

#### Scenario: Footer stacks on mobile

- GIVEN the viewport is below the mobile breakpoint
- WHEN the Footer renders
- THEN the 3 columns MUST stack vertically

#### Scenario: Footer background is dark teal

- GIVEN the Footer renders
- WHEN inspecting its background
- THEN it MUST use a dark teal color (semantic token, not raw hex)

#### Scenario: Footer shows copyright with current year

- GIVEN the Footer renders
- WHEN inspecting the copyright text
- THEN it MUST display `© {current year} Elica. Todos los derechos reservados.`

### Requirement: Home Page Sections

The Home page MUST render four distinct sections: Hero with strong statement and CTA, Specialties grid using shadcn Card components, CTA section with booking prompt, and a collapsible Recovery section.

#### Scenario: Hero renders with headline and CTA button

- GIVEN the Home page loads
- WHEN the Hero section renders
- THEN it MUST display a headline, supporting text, and a "Reservar turno ahora" CTA button

#### Scenario: Specialties grid uses shadcn Card

- GIVEN specialties data loads successfully
- WHEN the Specialties section renders
- THEN each specialty MUST be displayed inside a shadcn Card component with name and description

#### Scenario: Specialties shows loading state

- GIVEN the specialties API call is in progress
- WHEN the Specialties section renders
- THEN it MUST display a loading indicator

#### Scenario: Specialties shows error with retry

- GIVEN the specialties API call fails
- WHEN the Specialties section renders
- THEN it MUST display the error message and a "Reintentar" button

#### Scenario: CTA section prompts booking

- GIVEN the CTA section renders
- WHEN inspecting its content
- THEN it MUST display a heading, supporting text, and a "Comenzar reserva" button

#### Scenario: Recovery section is collapsible

- GIVEN the Recovery section renders
- WHEN the user clicks the toggle button
- THEN the recovery form MUST appear
- AND clicking again MUST hide it

#### Scenario: Recovery form validates required fields

- GIVEN the recovery form is visible
- WHEN the user clicks "Recuperar turno" with empty fields
- THEN an error message MUST display indicating email and DNI are required

### Requirement: Layout Uses Semantic Background

The Layout component MUST use `bg-background` instead of hardcoded `bg-gray-50` for its root container.

#### Scenario: Layout root uses bg-background

- GIVEN the Layout component renders
- WHEN inspecting its root div className
- THEN it MUST contain `bg-background`
- AND it MUST NOT contain `bg-gray-50`

### Requirement: Semantic Tokens Only

All landing components (Header, Footer, Home, Layout) MUST use ONLY semantic Tailwind tokens (`bg-primary`, `text-foreground`, `border-border`, etc.) — never raw hex colors or non-semantic utility classes like `bg-blue-500`.

#### Scenario: No raw hex colors in landing components

- GIVEN any landing component file (Header, Footer, Home, Layout)
- WHEN scanning for inline styles or className with hex values
- THEN no hex color values MUST be found

#### Scenario: All colors use semantic tokens

- GIVEN any landing component uses a color utility
- WHEN inspecting the class
- THEN it MUST be a semantic token (e.g., `bg-primary`, `text-muted-foreground`, `border-border`)
