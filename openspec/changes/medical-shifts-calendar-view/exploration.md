## Exploration: medical-shifts-calendar-view

### Current State

The project "elica" is a medical appointment booking system with an Express 5 + Prisma 6 + PostgreSQL backend and a React 19 + Vite 8 + TanStack Router + Zustand frontend.

There are currently **two appointment (turno) list views**:

1. **Admin view** (`/admin/turnos`) — `src/pages/admin/Appointments.tsx` (`AdminAppointments`)
   - Displays ALL appointments for ALL doctors in an HTML table.
   - Columns: Patient, Doctor, Date, Time, Status, Actions.
   - Actions: Filter by status (all/pending/confirmed/cancelled), Modify, Cancel, Delete, Create new.
   - Fetches from `GET /api/admin/appointments` via `adminApi.getAllAppointments()`.
   - Uses local `useState` for data; no global Zustand store for appointments.

2. **Doctor view** (`/medico/turnos`) — `src/pages/doctor/Appointments.tsx` (`DoctorAppointments`)
   - Displays only the logged-in doctor's appointments in an HTML table.
   - Columns: Patient, Date, Time, Status, Actions.
   - Actions: Filter by status, Confirm, Cancel, Delete.
   - Fetches from `GET /api/doctor/appointments` via `doctorPanelApi.getAppointments()`.
   - Also uses local `useState`.

**Data model (Prisma schema)**:
- `Appointment` has: `id`, `doctorId`, `patientId`, `timeSlotId`, `date` (DateTime), `startTime` (String), `endTime` (String), `status` (enum: PENDING | CONFIRMED | CANCELLED), `verified`, `expiresAt`, etc.
- **No `appointmentType` field exists.** The current model only tracks `status`.
- `Doctor`, `Patient`, `TimeSlot`, `Specialty`, `DoctorSchedule` are related models.

**Backend endpoints**:
- `GET /api/admin/appointments` → `getAllAppointments()` (returns all, no pagination, no date range filter).
- `GET /api/doctor/appointments` → `getDoctorAppointments(doctorId)` (returns all for doctor, no date range filter).
- `PUT /api/admin/appointments/:id/cancel`
- `PUT /api/admin/appointments/:id/reschedule`
- `DELETE /api/admin/appointments/:id`
- `PUT /api/doctor/appointments/:id/status`
- `DELETE /api/doctor/appointments/:id`

**Frontend stack & styling**:
- React 19, Vite 8, TanStack Router, Zustand (v5).
- Tailwind CSS v4 with custom `@theme` tokens (teal/mint palette: `primary-500: #0A5C5B`, `accent-500: #6ABDAF`).
- shadcn/ui installed (`base-mira` style) with components: `Button`, `Card`, `Badge`, `Separator`, `SpecialtyIcon`.
- No global appointment store exists; only `authStore`, `doctorAuthStore`, `bookingStore` (public booking flow), and `pendingAppointmentStore`.
- **No date manipulation library is installed** (`date-fns` is not in `package.json`; only transitively in `package-lock.json`).
- **No calendar library is installed** (`react-big-calendar`, `fullcalendar`, etc. are absent).

### Affected Areas

- `src/pages/admin/Appointments.tsx` — Main admin view to be replaced by calendar.
- `src/pages/doctor/Appointments.tsx` — Main doctor view to be replaced by calendar.
- `src/routes/admin/turnos.tsx` — Route wrapper for admin appointments.
- `src/routes/medico/turnos.tsx` — Route wrapper for doctor appointments.
- `src/services/api.ts` — May need new API helpers for date-range queries.
- `backend/src/services/appointmentService.ts` — Needs date-range filtering/pagination.
- `backend/src/controllers/adminController.ts` — Needs new query params for range filtering.
- `backend/src/controllers/doctorPanelController.ts` — Needs new query params for range filtering.
- `backend/prisma/schema.prisma` — Needs `appointmentType` field added if color-by-type is required.
- `src/types/index.ts` — Needs `appointmentType` added to `Appointment` interface.

### Approaches

1. **Use an existing calendar library (react-big-calendar)**
   - Brief: Install `react-big-calendar` (or `react-calendar`) and configure day/week/month views.
   - Pros: Fast setup; built-in view switching, navigation, event positioning, and basic accessibility.
   - Cons: Heavy bundle size; styling conflicts with Tailwind v4 (uses custom CSS classes); React 19 compatibility may require workarounds; theming to match teal/mint palette is tedious; drag-and-drop is often an extra plugin.
   - Effort: Medium

2. **Custom calendar component with `date-fns` + Tailwind grid**
   - Brief: Install `date-fns` for date math (start/end of week, days in month, etc.) and build the day/week/month grids as pure React components styled with Tailwind CSS.
   - Pros: Full control over design; perfect integration with existing theme and shadcn/ui tokens; lightweight; no CSS conflict risk; easy to add color-by-type logic.
   - Cons: Higher initial effort; must implement navigation (prev/next), view switching, and responsive behavior manually.
   - Effort: High

3. **Hybrid: Headless calendar hook + custom grid**
   - Brief: Use a headless library like `@use-gesture` or a small date hook library, but build the UI ourselves.
   - Pros: Reduces date-logic boilerplate while keeping UI control.
   - Cons: Adds another dependency; most "headless" calendar libraries are still immature or over-engineered for this use case.
   - Effort: Medium-High

### Recommendation

**Approach 2: Custom calendar component with `date-fns` + Tailwind grid.**

Justification:
- The project already has a strong, cohesive design system (teal/mint Tailwind tokens + shadcn/ui). A custom component guarantees the calendar looks native and not templated.
- `date-fns` is a small, tree-shakeable dependency that solves the hardest part (date arithmetic) without imposing UI opinions.
- React 19 + Tailwind v4 is a modern stack; third-party calendar libraries often lag in compatibility or require CSS-in-JS solutions that clash with Tailwind v4.
- The admin and doctor views are similar enough that a single reusable `CalendarView` component (with a `mode` prop) can serve both, reducing duplication.

### Risks

1. **Missing `appointmentType` field.** The requirement says "color depending on the appointment type," but the Prisma schema only has `status`. A schema migration is needed to add `appointmentType` (e.g., `CONSULTA`, `SEGUIMIENTO`, `URGENCIA`), or the requirement must be redefined to color by `status`.
2. **No date-range filtering on endpoints.** Both `getAllAppointments()` and `getDoctorAppointments()` return **all** records. As the dataset grows, fetching every appointment for a calendar month will become slow. The backend must accept `startDate` and `endDate` query parameters.
3. **No frontend test runner.** The project has no tests configured (no `vitest`, `jest`, `playwright`, or `cypress`). Any calendar refactor is high-risk for regressions in appointment CRUD actions. Strong manual QA or a test-runner setup is advisable before implementation.
4. **No global state for appointments.** The calendar will need to share filtered data between views (e.g., a sidebar detail panel). We should either elevate appointment state to a new Zustand store or keep it local with URL query params (e.g., `?view=week&date=2026-06-13`).
5. **Responsive complexity.** A month grid with multiple appointments per day is dense on mobile. A custom implementation allows us to design a mobile-first responsive layout (e.g., stacked day list on small screens), but this adds scope.

### Ready for Proposal

**Yes**, but the orchestrator should surface the following **pending decisions** to the user before proceeding to `sdd-propose`:

1. **Appointment type vs. status:** Do we add an `appointmentType` field to the database (requires migration), or should the calendar use `status` (PENDING/CONFIRMED/CANCELLED) for coloring?
2. **Scope of views:** Should the calendar replace **both** the admin and doctor views, or only the admin view?
3. **Date-range filtering:** Should we add `startDate`/`endDate` query params to the backend endpoints as part of this change, or load all appointments client-side?

These answers will directly impact the spec, design, and task breakdown.
