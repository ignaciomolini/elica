# Apply Progress: medical-shifts-calendar-view

**Change**: medical-shifts-calendar-view
**Mode**: Standard (no test runner)
**Delivery**: stacked-to-main

## Completed Tasks (PR1)

- [x] 1.1 Add `@@index([doctorId, date])` on Appointment in `backend/prisma/schema.prisma`
- [x] 1.2 Update `appointmentService.getDoctorAppointments()` to accept `{ startDate?, endDate? }` with Prisma gte/lte
- [x] 1.3 Parse `startDate`/`endDate` query params with ISO validation in `doctorPanelController`; return 400 on invalid format or endDate<startDate
- [x] 1.4 Add `getAppointments({ startDate, endDate })` to `doctorPanelApi` in `src/services/api.ts` with query string builder

### Post-Verify Fixes (PR1)

- [x] **Fix date validation**: Replace `Date.parse()` check with `isValidISODate()` round-trip validation that rejects semantically invalid dates like `2026-02-31` (commit `e932668`)

### PR1 Commits

579dc1c (feat), 9c9aeb9 (docs), e932668 (fix)

## Completed Tasks (PR2)

- [x] 2.1 Add `date-fns` to `package.json`
- [x] 2.2 Create `src/store/calendarStore.ts`: Zustand store with viewMode, currentDate, appointments, loading, error, popup state, and actions
- [x] 2.3 Create `src/components/calendar/statusColors.ts`: AppointmentStatus → Tailwind classes
- [x] 2.4 Create `src/components/calendar/calendarUtils.ts`: getWeekDays, getMonthGrid, getHoursRange, formatSlotKey using date-fns
- [x] 2.5 Create `src/components/calendar/WeekView.tsx`: 7-col grid, hourly rows respecting DoctorSchedule, clickable cells with status colors
- [x] 2.6 Create `src/components/calendar/CalendarView.tsx`: container with view toggle, date nav, range label
- [x] 2.7 Replace table in `src/pages/doctor/Appointments.tsx` with `<CalendarView />`

### PR2 Commits

4020a2b (feat: add date-fns), 9577153 (feat: store, colors, utils), f4f7927 (feat: week view), be8d0ce (feat: CalendarView shell + route wiring), cc3d31e (fix: remove unused imports)

### Post-Verify Fixes (PR2 — Warning Corrections)

- [x] **W1 Empty state**: Added "No hay turnos para esta semana" banner in WeekView when `!loading && appointments.length === 0`
- [x] **W2 Arrow key navigation**: Implemented Left/Right (days) and Up/Down (hours) navigation in week grid with `data-row`/`data-col` attributes and `gridRef`-based focus scanning; skips day-off cells (tabIndex=-1)
- [x] **W3 Focus ring**: Added `focus:ring-2 focus:ring-primary-500 focus:outline-none` classes to all interactive calendar cells
- [x] **W4 Missing imports**: Added `startOfDay` and `endOfDay` to date-fns import list in `calendarStore.ts`
- [x] **W5 Double loading indicator**: Removed duplicate loading guard from WeekView; CalendarView owns the loading state display

### PR2 Post-Verify Commits

4a1a6a3 (fix: add missing startOfDay/endOfDay imports), 549ef76 (fix: resolve 5 PR2 verification warnings)

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `backend/prisma/schema.prisma` | Modified | Added `@@index([doctorId, date])` on Appointment |
| `backend/prisma/migrations/20260613163304_add_appointment_doctor_date_index/migration.sql` | Created | Migration: CREATE INDEX |
| `backend/src/services/appointmentService.ts` | Modified | Added DateRange interface, gte/lte date filter |
| `backend/src/controllers/doctorPanelController.ts` | Modified | ISO date validation, 400 errors |
| `src/services/api.ts` | Modified | Query string builder for getAppointments |
| `package.json` | Modified | Added date-fns dependency |
| `package-lock.json` | Modified | Lockfile for date-fns |
| `src/store/calendarStore.ts` | Modified | Added startOfDay/endOfDay to date-fns imports (post-verify W4) |
| `src/components/calendar/statusColors.ts` | Created | PENDING→amber, CONFIRMED→primary, CANCELLED→faded-red |
| `src/components/calendar/calendarUtils.ts` | Created | getWeekDays, getMonthGrid, getHoursRange, formatSlotKey, getScheduleForDay |
| `src/components/calendar/WeekView.tsx` | Modified | Post-verify: empty state (W1), arrow key nav (W2), focus ring (W3), removed duplicate loading (W5), added gridRef/data-row/data-col |
| `src/components/calendar/CalendarView.tsx` | Created | View toggle (day/week/month), date nav, range label, Spanish locale |
| `src/pages/doctor/Appointments.tsx` | Modified | Replaced HTML table with CalendarView component |

## Completed Tasks (PR3)

- [x] 3.1 Create `src/components/calendar/DayView.tsx`: single-day hourly rows, respects DoctorSchedule hours
- [x] 3.2 Create `src/components/calendar/MonthView.tsx`: month grid with day cells expanding vertically to list all appointments for that day (no overflow cap), per product decision
- [x] 3.3 Wire DayView and MonthView into CalendarView view-mode routing

### PR3 Commits

e95cbc6 (feat: add day view), 7976abb (feat: add month view), 97c06b4 (feat: wire views into CalendarView)

## Files Changed (PR3)

| File | Action | What Was Done |
|------|--------|---------------|
| `src/components/calendar/DayView.tsx` | Created | Single-day hourly grid with DoctorSchedule hour range, appointment cells, empty state, arrow key nav |
| `src/components/calendar/MonthView.tsx` | Created | Month grid with expanding day cells showing all appointments per day, status colors, click-to-edit |
| `src/components/calendar/CalendarView.tsx` | Modified | Replaced placeholder stubs with DayView and MonthView imports and routing |

## Deviations from Design

- **MonthView overflow**: The design spec says "+N more" overflow after 3 appointments. The task spec overrides this with "no overflow cap, expand to show all" per product decision. Implementation follows the task spec (task 3.2): all appointments are listed in each day cell with no truncation.

## Issues Found

None.

## Remaining Tasks

- Phase 4 (PR4): Appointment popup (3 tasks)