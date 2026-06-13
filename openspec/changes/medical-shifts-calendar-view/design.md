# Design: Medical Shifts Calendar View

## Technical Approach

Replace the HTML-table doctor appointments view with a custom interactive calendar (day/week/month) built on `date-fns` + Tailwind CSS grid. A new Zustand `calendarStore` holds visible date range, view mode, and appointments. The backend gains `startDate`/`endDate` query params on `GET /api/doctor/appointments` with a Prisma composite index. The `AppointmentPopup` (shadcn Dialog) handles create/edit/cancel/delete via existing backend mutations.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Calendar rendering | react-big-calendar vs custom date-fns+Tailwind | Library: fast but CSS conflicts with Tailwind v4 + theming pain. Custom: more effort, full control. | **Custom** — matches existing teal/mint design system, no CSS-in-JS clash |
| State management | URL search params vs Zustand store | URL: shareable links. Zustand: simpler, matches existing pattern (authStore, bookingStore). | **Zustand store** — consistent with project conventions; URL params not needed for doctor-only view |
| Popup dialog | Custom modal vs shadcn Dialog | Custom: zero deps. shadcn: accessible, matches existing UI kit. | **shadcn Dialog** — need to add via `shadcn add dialog`; gets focus trap, Escape, backdrop for free |
| Month overflow | "+N more" link vs expand-in-cell | "+N more": cleaner. Expand: spec requires showing all up to 3, then "+N more". | **Show first 3 + "+N more"** per spec |
| Prisma index | None vs `@@index([doctorId, date])` | None: slow on large datasets. Index: fast range scans. | **Add composite index** — `getDoctorAppointments` filters by `doctorId` + date range |

## Data Flow

```
User clicks nav/toggle
        |
        v
  calendarStore.setDateRange(startDate, endDate)
        |
        +---> doctorPanelApi.getAppointments({ startDate, endDate })
        |           |
        |           v
        |     GET /api/doctor/appointments?startDate=...&endDate=...
        |           |
        |           v
        |     doctorPanelController → appointmentService.getDoctorAppointments(doctorId, { startDate, endDate })
        |           |
        |           v
        |     Prisma: where { doctorId, date: { gte, lte } }
        |
        +---> calendarStore.setAppointments(data)
                    |
                    v
              CalendarView re-renders → DayView | WeekView | MonthView
                    |
                    v (cell click)
              AppointmentPopup opens (create | edit mode)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/prisma/schema.prisma` | Modify | Add `@@index([doctorId, date])` on `Appointment` |
| `backend/src/services/appointmentService.ts` | Modify | `getDoctorAppointments` accepts optional `{ startDate?, endDate? }` and applies Prisma `gte`/`lte` |
| `backend/src/controllers/doctorPanelController.ts` | Modify | Parse `startDate`/`endDate` query params with ISO validation, pass to service |
| `src/services/api.ts` | Modify | `doctorPanelApi.getAppointments` accepts optional `{ startDate?, endDate? }` and builds query string |
| `src/store/calendarStore.ts` | Create | Zustand store: `viewMode`, `currentDate`, `dateRange`, `appointments`, `loading`, `error`, actions |
| `src/components/calendar/calendarUtils.ts` | Create | Pure functions: `getWeekDays`, `getMonthGrid`, `getHoursRange`, `formatSlotKey` using `date-fns` |
| `src/components/calendar/CalendarView.tsx` | Create | Container: toolbar (toggle + nav + today), renders DayView/WeekView/MonthView, fetches on range change |
| `src/components/calendar/DayView.tsx` | Create | Hourly rows for single day; each row is a clickable cell |
| `src/components/calendar/WeekView.tsx` | Create | 7-column grid, hourly rows; cells show patient name or empty |
| `src/components/calendar/MonthView.tsx` | Create | Month grid; day cells list up to 3 appointments + "+N more" |
| `src/components/calendar/AppointmentPopup.tsx` | Create | shadcn Dialog: create/edit form, confirm/cancel/delete actions |
| `src/components/calendar/statusColors.ts` | Create | Maps `AppointmentStatus` → Tailwind classes |
| `src/pages/doctor/Appointments.tsx` | Modify | Replace table with `<CalendarView />` wrapper |
| `package.json` | Modify | Add `date-fns` dependency |

## Interfaces / Contracts

### API Contract

```
GET /api/doctor/appointments?startDate=2026-06-01&endDate=2026-06-30

Response: Appointment[] (same shape as current)

Validation:
- startDate/endDate: optional, ISO 8601 (YYYY-MM-DD)
- endDate < startDate → 400 "La fecha final debe ser posterior a la fecha inicial"
- Invalid format → 400 "El formato de fecha debe ser YYYY-MM-DD"
- No params → returns all (backward compatible)
```

### Zustand Store Shape

```typescript
interface CalendarState {
  viewMode: 'day' | 'week' | 'month';
  currentDate: Date;
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  popup: { open: boolean; mode: 'create' | 'edit'; date?: Date; time?: string; appointment?: Appointment };

  setViewMode: (mode: 'day' | 'week' | 'month') => void;
  navigate: (direction: 'prev' | 'next') => void;
  goToToday: () => void;
  fetchAppointments: () => Promise<void>;
  openPopup: (mode: 'create' | 'edit', date?: Date, time?: string, appointment?: Appointment) => void;
  closePopup: () => void;
}
```

### Status Color Map

| Status | Tailwind Classes | Hex Approx |
|--------|-----------------|------------|
| PENDING | `bg-amber-50 border-amber-200 text-amber-800` | Warm yellow |
| CONFIRMED | `bg-primary-50 border-primary-200 text-primary-800` | Site teal |
| CANCELLED | `bg-red-50/50 border-red-200/50 text-red-400` | Faded red |

## Accessibility

- Calendar grid: `role="grid"` with `aria-label`. Day cells: `role="gridcell"`.
- Arrow keys navigate between cells (Left/Right = days, Up/Down = hours/weeks).
- `tabIndex={0}` on focused cell; `focus:ring-2 focus:ring-primary-500 focus:outline-none`.
- Popup: shadcn Dialog provides focus trap, `aria-modal`, Escape-to-close, backdrop click.
- Toolbar buttons have `aria-label` (e.g., "Previous week", "Next month").

## PR Chain Plan (400-line budget)

| PR | Scope | Est. Lines | Files |
|----|-------|-----------|-------|
| **PR 1: Backend date-range** | Index + service + controller + API helper | ~120 | schema.prisma, appointmentService.ts, doctorPanelController.ts, api.ts |
| **PR 2: Calendar shell + week view** | Store, utils, CalendarView, WeekView, statusColors, route wiring | ~300 | calendarStore.ts, calendarUtils.ts, CalendarView.tsx, WeekView.tsx, statusColors.ts, Appointments.tsx |
| **PR 3: Day + month views** | DayView, MonthView | ~250 | DayView.tsx, MonthView.tsx, calendarUtils.ts additions |
| **PR 4: Appointment popup** | AppointmentPopup with create/edit/cancel/delete | ~300 | AppointmentPopup.tsx, calendarStore.ts additions |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `calendarUtils` pure functions (week days, month grid, hour range) | Manual verification until Vitest is added |
| Unit | Status color map returns correct classes | Manual |
| Integration | API date-range filter returns correct subset | Manual via browser devtools + seeded DB |
| E2E | Full calendar flow: navigate → click cell → create → confirm → cancel | Manual QA checklist |

## Migration / Rollout

No data migration required. The Prisma index addition is a non-breaking `migrate dev`. The backend query params are additive (no params = existing behavior). Frontend route change is a drop-in replacement; old `DoctorAppointments` table code is removed in PR 2.

## Open Questions

- [ ] Should the doctor's working hours (from `DoctorSchedule`) constrain which hours appear in Day/Week views, or use a fixed 08:00–20:00 range?
- [ ] Does the create flow from the doctor panel use `createConfirmedAppointment` (skip verification) or the public `createAppointment` (with SMS code)?
