# Date Range API Specification

## Purpose

Defines the backend date-range filtering capability for `GET /api/doctor/appointments` so the calendar loads only appointments within the visible date range instead of the full history.

## Requirements

### Requirement: Date Range Query Parameters

The system MUST accept optional `startDate` and `endDate` query parameters on `GET /api/doctor/appointments`. When provided, the response SHALL include only appointments whose `date` falls within the inclusive range `[startDate, endDate]`.

#### Scenario: Filter by date range

- GIVEN the doctor has appointments on 2026-06-10, 2026-06-15, and 2026-06-20
- WHEN a request is made with `startDate=2026-06-12&endDate=2026-06-18`
- THEN only the June 15 appointment is returned

#### Scenario: No date range returns all (backward compatible)

- GIVEN the endpoint is called without `startDate` or `endDate`
- WHEN the request completes
- THEN all appointments for the doctor are returned (existing behavior preserved)

#### Scenario: Only startDate provided

- GIVEN the endpoint is called with `startDate=2026-06-15` but no `endDate`
- WHEN the request completes
- THEN all appointments on or after June 15 are returned

#### Scenario: Only endDate provided

- GIVEN the endpoint is called with `endDate=2026-06-15` but no `startDate`
- WHEN the request completes
- THEN all appointments on or before June 15 are returned

### Requirement: Date Format Validation

The system MUST validate that `startDate` and `endDate` are valid ISO 8601 date strings (YYYY-MM-DD). Invalid formats SHALL return a 400 Bad Request with a descriptive error message.

#### Scenario: Valid date format accepted

- GIVEN a request with `startDate=2026-06-01&endDate=2026-06-30`
- WHEN the request is processed
- THEN the dates are accepted and the filtered results are returned

#### Scenario: Invalid date format rejected

- GIVEN a request with `startDate=01-06-2026`
- WHEN the request is processed
- THEN a 400 response is returned with error "El formato de fecha debe ser YYYY-MM-DD"

#### Scenario: EndDate before startDate rejected

- GIVEN a request with `startDate=2026-06-20&endDate=2026-06-01`
- WHEN the request is processed
- THEN a 400 response is returned with error "La fecha final debe ser posterior a la fecha inicial"

### Requirement: Frontend API Helper

The system MUST provide a frontend API helper function that accepts a date range and constructs the appropriate query string for `GET /api/doctor/appointments`. The helper SHALL be added to `doctorPanelApi` in `src/services/api.ts`.

#### Scenario: Helper builds query with both dates

- GIVEN the helper is called with `{ startDate: '2026-06-01', endDate: '2026-06-30' }`
- WHEN the request is made
- THEN the URL includes `?startDate=2026-06-01&endDate=2026-06-30`

#### Scenario: Helper works with no dates

- GIVEN the helper is called with no date range
- WHEN the request is made
- THEN the URL has no query params (backward compatible)

### Requirement: Service Layer Date Filtering

The system MUST filter appointments by date range at the Prisma query level in `appointmentService.getDoctorAppointments()`. The filter SHALL use Prisma's `gte` and `lte` operators on the `date` field.

#### Scenario: Prisma query filters by range

- GIVEN `getDoctorAppointments(doctorId, { startDate, endDate })` is called
- WHEN the Prisma query executes
- THEN the `where` clause includes `date: { gte: startDate, lte: endDate }`

#### Scenario: Expired appointment cleanup still runs

- GIVEN date-range filtering is applied
- WHEN `getDoctorAppointments` is called
- THEN `cleanupExpired()` runs before the filtered query (existing behavior preserved)
