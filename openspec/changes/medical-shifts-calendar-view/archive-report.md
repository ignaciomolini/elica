# Archive Report: Medical Shifts Calendar View

## Change Summary

Replaced the doctor appointments table with an interactive calendar featuring day/week/month views, status-based colors, and a create/edit/cancel popup.

## Status

**COMPLETED** — all 4 PRs merged to `main`.

## PRs Merged

| PR | Branch | Merge Commit | Scope |
|---|---|---|---|
| PR1 | `feat/calendar-date-range-filter` | `ccd3706` | Backend date-range filtering + Prisma composite index |
| PR2 | `feat/calendar-week-view` | `2952f0d` | Calendar shell + WeekView + keyboard navigation |
| PR3 | `feat/calendar-day-month-views` | `55312a8` | DayView + MonthView (expanding cells) |
| PR4 | `fix/pr4-appointment-popup-warnings` | `76dbdd1` | AppointmentPopup create/edit/cancel/delete |

## Key Decisions

- Appointment color is based on `status`, not a separate `appointmentType`.
- Calendar is visible to doctors only (not patients or admins).
- Clicking a slot or existing appointment opens a popup to create, edit, or cancel.
- Only one appointment per available time slot per doctor (no overlap).
- Month view expands day cells vertically to show all appointments (no "+N more" overflow).
- Day and week views respect the doctor's configured `DoctorSchedule` hours.
- The doctor popup uses `createConfirmedAppointment` without SMS verification because the doctor is already authenticated.

## Verification Summary

- PR1: PASS — 12/12 `date-range-api` scenarios compliant.
- PR2: PASS — 15/22 `calendar-view` scenarios compliant (7 stubs pending PR3).
- PR3: PASS — 22/22 `calendar-view` scenarios compliant.
- PR4: PASS — 16/16 `appointment-popup` scenarios compliant.

All PRs passed TypeScript, Vite build, and ESLint checks (within scope).

## Tech Debt

1. `updateAppointmentPatient` service method runs outside a Prisma transaction (low-risk race condition).
2. Doctor panel authorization controller fetches all doctor appointments to check ownership (`O(n)`), acceptable at current scale but should be optimized later.

## Lessons Learned

- No test runner is configured in the project; all verification was manual or build-based.
- Windows case-insensitive file system caused a naming conflict between the existing custom `Button.tsx` and shadcn's `button.tsx`; resolved by renaming the shadcn button file.
- TypeScript configuration did not catch the undefined `dRow` variable initially; ESLint cleanup during verification caught it.
- Keeping SDD specs and design in sync with product decisions prevents spec-deviance warnings during verification.

## Notable Files Added or Modified

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260613163304_add_appointment_doctor_date_index/migration.sql`
- `backend/src/services/appointmentService.ts`
- `backend/src/controllers/doctorPanelController.ts`
- `backend/src/routes/doctor.ts`
- `src/services/api.ts`
- `src/store/calendarStore.ts`
- `src/components/calendar/CalendarView.tsx`
- `src/components/calendar/WeekView.tsx`
- `src/components/calendar/DayView.tsx`
- `src/components/calendar/MonthView.tsx`
- `src/components/calendar/AppointmentPopup.tsx`
- `src/components/calendar/calendarUtils.ts`
- `src/components/calendar/statusColors.ts`
- `src/pages/doctor/Appointments.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/shadcn-button.tsx`

## Next Steps

- Run manual QA phase 5 (outside SDD scope).
- Consider adding Vitest as the project's test runner.
- Address the two backend tech-debt items in future, smaller PRs.
