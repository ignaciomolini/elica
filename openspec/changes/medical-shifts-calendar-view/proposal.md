# Proposal: Medical Shifts Calendar View

## Intent

Replace the current HTML-table "medical shifts" view for doctors with an interactive calendar that supports day, week, and month views. Clicking a cell or existing appointment opens a popup to create, edit, or cancel the appointment. Colors are driven by `status` (PENDING, CONFIRMED, CANCELLED).

**User stories**
- As a doctor, I want to see my appointments in a calendar so I can understand my schedule at a glance.
- As a doctor, I want to click a time slot to quickly create a new appointment.
- As a doctor, I want to click an existing appointment to edit or cancel it.

## Scope

### In Scope
- Reusable `CalendarView` component (day / week / month) using `date-fns` + Tailwind grid.
- `AppointmentPopup` component for create/edit/cancel.
- Backend: add `startDate`/`endDate` query params to `GET /api/doctor/appointments`.
- Frontend: wire doctor `/medico/turnos` route to the new calendar.
- Zustand store for appointments to share state between views and popup.
- Status-based color mapping (PENDING, CONFIRMED, CANCELLED).

### Out of Scope
- Admin calendar view (`/admin/turnos`) — deferred.
- Drag-and-drop rescheduling.
- Recurring appointments.
- Adding an `appointmentType` field to the schema.
- Mobile-specific responsive layout beyond standard Tailwind grid.

## Capabilities

### New Capabilities
- `calendar-view`: Day/week/month calendar grid for doctor appointments, custom-built with `date-fns` + Tailwind.
- `appointment-popup`: Modal for CRUD operations on appointments triggered from calendar cells.
- `date-range-api`: Backend query parameters to filter appointments by date range.

### Modified Capabilities
- None

## Approach

Build a custom `CalendarView` component using `date-fns` for date arithmetic and Tailwind CSS v4 grid for layout. Day view shows hourly slots; week view shows 7 days; month view expands each day cell to list all appointments. Use a new Zustand `appointmentStore` to hold filtered appointments and drive the popup. Add `startDate`/`endDate` query params to the existing doctor endpoint to avoid loading the entire history. The popup reuses existing backend mutations (`cancel`, `reschedule`, `create`) so no new endpoints are needed beyond the range filter.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/doctor/Appointments.tsx` | Modified | Replaced by calendar wrapper |
| `src/routes/medico/turnos.tsx` | Modified | Route renders new calendar page |
| `src/services/api.ts` | Modified | New date-range query helper for doctor appointments |
| `src/stores/` | New | `appointmentStore.ts` for calendar state |
| `src/components/calendar/` | New | `CalendarView.tsx`, `DayView.tsx`, `WeekView.tsx`, `MonthView.tsx`, `AppointmentPopup.tsx` |
| `backend/src/controllers/doctorPanelController.ts` | Modified | Accept `startDate`/`endDate` query params |
| `backend/src/services/appointmentService.ts` | Modified | `getDoctorAppointments` filtered by date range |
| `package.json` | Modified | Add `date-fns` dependency |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Custom calendar introduces accessibility gaps (keyboard nav, focus) | Med | Add `role="grid"`, arrow-key navigation, and visible focus rings in Tailwind |
| Date-range query missing index causes slow queries | Med | Add composite index on `(doctorId, date)` in Prisma schema |
| No test runner; regressions in CRUD actions | High | Manual QA checklist for create/edit/cancel flow; install Vitest in a follow-up change |
| Month view density exceeds 400-line review budget | Med | Build month view as a single component file; split into follow-up PR if needed |
| No `appointmentType` means color palette is limited to 3 statuses | Low | Accept status-only palette; add `appointmentType` later if needed |

## Rollback Plan

1. Revert the `medico/turnos` route to render the old `DoctorAppointments` table component.
2. Remove the `date-fns` dependency if not used elsewhere.
3. Keep the new `appointmentStore` inactive; it does not affect existing stores.
4. Backend date-range filter is additive; removing query params falls back to previous behavior.

## Dependencies

- `date-fns` (npm install) — tree-shakeable date math.
- Existing `appointmentService` backend methods (create, cancel, update status).
- Existing shadcn/ui components (`Button`, `Dialog`, `Badge`) for popup UI.

## Success Criteria

- [ ] Doctor sees calendar with day/week/month toggle on `/medico/turnos`.
- [ ] Each appointment cell shows patient name and time.
- [ ] Appointments are colored by `status` (PENDING, CONFIRMED, CANCELLED).
- [ ] Clicking a cell or appointment opens a popup to create/edit/cancel.
- [ ] Backend returns only appointments within the requested date range.
- [ ] No loading of full historical appointment list on initial render.
