# Calendar View Specification

## Purpose

Defines the interactive calendar UI for doctors to view their appointments in day, week, and month views on `/medico/turnos`. Replaces the existing HTML-table `DoctorAppointments` component.

## Requirements

### Requirement: View Mode Toggle

The system MUST provide three calendar view modes — day, week, and month — accessible via a toggle control. The default view SHALL be week.

#### Scenario: Default view is week

- GIVEN a doctor navigates to `/medico/turnos`
- WHEN the calendar renders
- THEN the week view is displayed by default

#### Scenario: Switch to day view

- GIVEN the doctor is on any calendar view
- WHEN the doctor clicks the "Day" toggle button
- THEN the calendar displays a single day with hourly time slots

#### Scenario: Switch to month view

- GIVEN the doctor is on any calendar view
- WHEN the doctor clicks the "Month" toggle button
- THEN the calendar displays a full month grid with all appointments per day cell

### Requirement: Date Navigation

The system MUST allow navigation between dates using previous/next controls appropriate to the current view mode. The displayed date range SHALL update immediately.

#### Scenario: Navigate to next week

- GIVEN the doctor is viewing the week of June 8-14, 2026
- WHEN the doctor clicks the "Next" navigation button
- THEN the calendar displays the week of June 15-21, 2026

#### Scenario: Navigate to previous day

- GIVEN the doctor is viewing June 15, 2026 in day view
- WHEN the doctor clicks the "Previous" navigation button
- THEN the calendar displays June 14, 2026

#### Scenario: Navigate to today

- GIVEN the doctor is viewing any date other than today
- WHEN the doctor clicks the "Today" button
- THEN the calendar navigates to the current date in the active view mode

### Requirement: Status-Based Color Coding

The system MUST color each appointment cell based on its `status` field. The color mapping SHALL be: PENDING = yellow/amber, CONFIRMED = green/teal, CANCELLED = red with reduced opacity.

#### Scenario: Pending appointment shows yellow

- GIVEN an appointment has status `PENDING`
- WHEN the appointment renders in any calendar view
- THEN the cell background uses a yellow/amber color

#### Scenario: Confirmed appointment shows green

- GIVEN an appointment has status `CONFIRMED`
- WHEN the appointment renders in any calendar view
- THEN the cell background uses a green/teal color matching the site palette

#### Scenario: Cancelled appointment shows faded red

- GIVEN an appointment has status `CANCELLED`
- WHEN the appointment renders in any calendar view
- THEN the cell background uses a red color with reduced visual emphasis (opacity or muted tone)

### Requirement: Day View Layout

The system MUST display hourly time slots for a single day, starting from the doctor's earliest configured hour to the latest. Each slot SHALL show the appointment patient name and time, or be empty if no appointment exists.

#### Scenario: Day view shows hourly grid

- GIVEN the doctor has time slots from 08:00 to 18:00 on June 15
- WHEN day view renders for June 15
- THEN each hour from 08:00 to 18:00 is displayed as a row

#### Scenario: Empty slot shows no appointment

- GIVEN a time slot at 10:00 has no appointment
- WHEN day view renders
- THEN the 10:00 slot cell is empty and clickable for creating an appointment

### Requirement: Week View Layout

The system MUST display a 7-day grid with time slots as rows and days as columns. Each cell SHALL show the appointment for that day+time combination, or be empty.

#### Scenario: Week view shows 7-day grid

- GIVEN the doctor is viewing the week of June 8-14
- WHEN week view renders
- THEN columns show Monday through Sunday and rows show hourly slots

#### Scenario: Cell shows appointment for that day+time

- GIVEN an appointment exists on Wednesday June 10 at 14:00
- WHEN week view renders for that week
- THEN the Wednesday 14:00 cell displays the patient name

### Requirement: Month View Layout

The system MUST display a calendar month grid where each day cell expands to show all appointments for that day. The cell SHALL list patient names and times for each appointment, truncated if more than 3 appointments exist.

#### Scenario: Month view shows full month grid

- GIVEN the doctor is viewing June 2026
- WHEN month view renders
- THEN a grid shows all days of June with correct weekday alignment

#### Scenario: Day cell lists appointments

- GIVEN June 15 has 2 appointments (Maria at 09:00, Juan at 14:00)
- WHEN month view renders
- THEN the June 15 cell shows both appointments with patient name and time

#### Scenario: More than 3 appointments shows overflow indicator

- GIVEN a day has 5 appointments
- WHEN month view renders
- THEN the cell shows the first 3 appointments and a "+2 more" indicator

### Requirement: Appointment Cell Click

The system MUST open the appointment popup when the doctor clicks on any existing appointment cell in any view mode. The popup SHALL be pre-filled with the clicked appointment's data for editing.

#### Scenario: Click existing appointment opens edit popup

- GIVEN an appointment exists at 14:00 on June 15
- WHEN the doctor clicks that appointment cell
- THEN the appointment popup opens with the appointment data loaded for editing

#### Scenario: Click empty time slot opens create popup

- GIVEN the 10:00 slot on June 15 has no appointment
- WHEN the doctor clicks that empty slot
- THEN the appointment popup opens in create mode for that date and time

### Requirement: Loading and Empty States

The system MUST display a loading indicator while fetching appointments and an empty state message when no appointments exist for the visible date range.

#### Scenario: Loading state during fetch

- GIVEN the calendar is loading appointments for the current date range
- WHEN the API request is in progress
- THEN a loading spinner or "Cargando turnos..." message is displayed

#### Scenario: Empty state for date range with no appointments

- GIVEN the doctor has no appointments in the visible week
- WHEN the week view renders after loading completes
- THEN an empty state message "No hay turnos para esta semana" is shown

### Requirement: Keyboard Accessibility

The system MUST support keyboard navigation through calendar cells using arrow keys. Focus SHALL be visible and follow the grid structure of the current view.

#### Scenario: Arrow key navigation in week view

- GIVEN focus is on the Wednesday 14:00 cell in week view
- WHEN the doctor presses the right arrow key
- THEN focus moves to the Thursday 14:00 cell

#### Scenario: Visible focus ring

- GIVEN any calendar cell receives keyboard focus
- WHEN the cell is focused
- THEN a visible focus ring (Tailwind `focus:ring`) is displayed
