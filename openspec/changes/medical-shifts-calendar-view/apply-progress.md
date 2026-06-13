# Apply Progress: medical-shifts-calendar-view

**Change**: medical-shifts-calendar-view
**Mode**: Standard (no test runner)
**Delivery**: stacked-to-main, PR1 only
**Branch**: feat/calendar-date-range-filter
**Commits**: 579dc1c (feat), 9c9aeb9 (docs), e932668 (fix)

## Completed Tasks (PR1)

- [x] 1.1 Add `@@index([doctorId, date])` on Appointment in `backend/prisma/schema.prisma`
- [x] 1.2 Update `appointmentService.getDoctorAppointments()` to accept `{ startDate?, endDate? }` with Prisma gte/lte
- [x] 1.3 Parse `startDate`/`endDate` query params with ISO validation in `doctorPanelController`; return 400 on invalid format or endDate<startDate
- [x] 1.4 Add `getAppointments({ startDate, endDate })` to `doctorPanelApi` in `src/services/api.ts` with query string builder

## Post-Verify Fixes (PR1)

- [x] **Fix date validation**: Replace `Date.parse()` check with `isValidISODate()` round-trip validation that rejects semantically invalid dates like `2026-02-31` (commit `e932668`)

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `backend/prisma/schema.prisma` | Modified | Added `@@index([doctorId, date])` on Appointment |
| `backend/prisma/migrations/20260613163304_add_appointment_doctor_date_index/migration.sql` | Created | Migration: CREATE INDEX |
| `backend/src/services/appointmentService.ts` | Modified | Added DateRange interface, gte/lte date filter |
| `backend/src/controllers/doctorPanelController.ts` | Modified | ISO date validation with round-trip check for semantically invalid dates, 400 error responses |
| `src/services/api.ts` | Modified | Query string builder for getAppointments |

## Deviations from Design

None — implementation matches design.

## Issues Found

- Prisma generate had a Windows file-lock EPERM — not blocking. The index is DB-only; Prisma client API is unchanged.
- **Verify WARNING fixed**: `Date.parse()` silently corrects overflow dates (e.g. `2026-02-31` → Mar 3). Added `isValidISODate()` round-trip check that rejects such inputs.

## Remaining Tasks

- Phase 2 (PR2): Calendar shell + week view (7 tasks)
- Phase 3 (PR3): Day + month views (3 tasks)
- Phase 4 (PR4): Appointment popup (3 tasks)