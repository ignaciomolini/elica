# Tasks: Medical Shifts Calendar View

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~970 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (backend) → PR 2 (shell+week) → PR 3 (day+month) → PR 4 (popup) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending — feature-branch-chain recommended |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend date-range filtering | PR 1 | base=feature/tracker; 4 files, ~120 lines |
| 2 | Calendar shell + week view | PR 2 | base=PR1-branch; 7 files, ~300 lines |
| 3 | Day + month views | PR 3 | base=PR2-branch; 2 files + utils mods, ~210 lines |
| 4 | Appointment popup | PR 4 | base=PR3-branch; 1 file + store wiring, ~270 lines |

## Phase 1: Backend (PR 1)

- [x] 1.1 Add `@@index([doctorId, date])` on Appointment in `backend/prisma/schema.prisma`
- [x] 1.2 Update `appointmentService.getDoctorAppointments()` to accept `{ startDate?, endDate? }` with Prisma gte/lte
- [x] 1.3 Parse `startDate`/`endDate` query params with ISO validation in `doctorPanelController`; return 400 on invalid format or endDate<startDate
- [x] 1.4 Add `getAppointments({ startDate, endDate })` to `doctorPanelApi` in `src/services/api.ts` with query string builder

## Phase 2: Calendar Foundation (PR 2)

- [x] 2.1 Add `date-fns` to `package.json`
- [x] 2.2 Create `src/store/calendarStore.ts`: Zustand store with viewMode, currentDate, appointments, loading, error, popup state, and actions (setViewMode, navigate, goToToday, fetchAppointments, openPopup, closePopup)
- [x] 2.3 Create `src/components/calendar/statusColors.ts`: AppointmentStatus → Tailwind classes (amber/pending, teal/confirmed, red-faded/cancelled)
- [x] 2.4 Create `src/components/calendar/calendarUtils.ts`: getWeekDays, getMonthGrid, getHoursRange, formatSlotKey using date-fns
- [x] 2.5 Create `src/components/calendar/WeekView.tsx`: 7-col grid, hourly rows respecting DoctorSchedule, clickable cells with status colors
- [x] 2.6 Create `src/components/calendar/CalendarView.tsx`: container with view toggle (day/week/month), date nav (prev/next/today), current range label
- [x] 2.7 Replace table in `src/pages/doctor/Appointments.tsx` with `<CalendarView />`; remove old DoctorAppointments component

## Phase 3: Additional Views (PR 3)

- [ ] 3.1 Create `src/components/calendar/DayView.tsx`: single-day hourly rows, respects DoctorSchedule hours
- [ ] 3.2 Create `src/components/calendar/MonthView.tsx`: month grid with day cells expanding vertically to list all appointments for that day (no overflow cap), per product decision
- [ ] 3.3 Wire DayView and MonthView into CalendarView view-mode routing

## Phase 4: Appointment Popup (PR 4)

- [ ] 4.1 Run `npx shadcn@latest add dialog` to install shadcn Dialog component
- [ ] 4.2 Create `src/components/calendar/AppointmentPopup.tsx`: shadcn Dialog with create/edit mode, patient form fields, confirm/cancel/delete actions, error display
- [ ] 4.3 Wire cell click → openPopup (create on empty slot, edit on existing) and post-action calendar refresh in calendarStore

## Phase 5: Verification (QA)

- [ ] 5.1 Manual QA: API date-range filter returns correct subset (browser devtools + seeded DB)
- [ ] 5.2 Manual QA: day/week/month views render, navigate correctly, respect DoctorSchedule hours
- [ ] 5.3 Manual QA: popup create/edit/cancel/delete flows succeed and refresh calendar
- [ ] 5.4 Manual QA: status colors match spec, loading spinner, empty state messages, +N more overflow, keyboard arrow nav, focus ring
