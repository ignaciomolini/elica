# Appointment Popup Specification

## Purpose

Defines the modal popup for creating, editing, and cancelling appointments triggered from calendar cell clicks on `/medico/turnos`.

## Requirements

### Requirement: Popup Trigger Context

The system MUST open the popup in one of two modes based on the click target: "create" when clicking an empty time slot, or "edit" when clicking an existing appointment. The mode SHALL determine the popup's initial state and available actions.

#### Scenario: Empty slot click opens create mode

- GIVEN the doctor clicks an empty 10:00 slot on June 15
- WHEN the popup opens
- THEN the popup is in create mode with date=June 15 and time=10:00 pre-filled

#### Scenario: Existing appointment click opens edit mode

- GIVEN the doctor clicks an existing appointment (Maria, June 15, 14:00, PENDING)
- WHEN the popup opens
- THEN the popup is in edit mode with all appointment fields populated

### Requirement: Create Appointment Flow

The system MUST allow the doctor to create a new appointment by entering patient name, email, phone, and DNI. The appointment SHALL be created with `PENDING` status and the selected date/time.

#### Scenario: Create appointment with valid data

- GIVEN the popup is in create mode for June 15 at 10:00
- WHEN the doctor fills in patient name, email, phone, DNI and clicks "Crear"
- THEN the appointment is created with PENDING status and the popup closes

#### Scenario: Create appointment refreshes calendar

- GIVEN the doctor successfully creates an appointment
- WHEN the popup closes
- THEN the calendar view refreshes to show the new appointment in the correct cell

#### Scenario: Create requires all fields

- GIVEN the popup is in create mode
- WHEN the doctor leaves the patient name field empty and clicks "Crear"
- THEN a validation error is shown and the appointment is not created

### Requirement: Edit Appointment Flow

The system MUST allow the doctor to modify an existing appointment's patient details. The appointment's date, time, and status SHALL be editable through status action buttons (confirm, cancel).

#### Scenario: Edit patient details

- GIVEN the popup is in edit mode for an existing appointment
- WHEN the doctor modifies the patient name and clicks "Guardar"
- THEN the appointment is updated and the calendar refreshes

#### Scenario: Confirm pending appointment

- GIVEN the popup is in edit mode for a PENDING appointment
- WHEN the doctor clicks the "Confirmar" button
- THEN the appointment status changes to CONFIRMED and the popup closes

#### Scenario: Cancel appointment

- GIVEN the popup is in edit mode for a PENDING or CONFIRMED appointment
- WHEN the doctor clicks the "Cancelar" button
- THEN a confirmation dialog appears; on confirm, the status changes to CANCELLED and the popup closes

### Requirement: Delete Appointment

The system MUST allow the doctor to permanently delete an appointment from the edit popup. A confirmation dialog SHALL appear before deletion.

#### Scenario: Delete with confirmation

- GIVEN the popup is in edit mode for an existing appointment
- WHEN the doctor clicks "Eliminar" and confirms the dialog
- THEN the appointment is deleted, the slot becomes available, and the calendar refreshes

#### Scenario: Delete cancellation

- GIVEN the delete confirmation dialog is shown
- WHEN the doctor clicks "Cancelar" on the dialog
- THEN the appointment is NOT deleted and the popup remains open

### Requirement: Popup Close Behavior

The system MUST close the popup when the doctor clicks the close button, presses Escape, or clicks outside the popup area. Unsaved changes SHALL NOT trigger a confirmation prompt — the popup simply closes.

#### Scenario: Close via X button

- GIVEN the popup is open
- WHEN the doctor clicks the close (X) button
- THEN the popup closes without saving

#### Scenario: Close via Escape key

- GIVEN the popup is open
- WHEN the doctor presses the Escape key
- THEN the popup closes

#### Scenario: Close via backdrop click

- GIVEN the popup is open
- WHEN the doctor clicks outside the popup dialog
- THEN the popup closes

### Requirement: Error Handling

The system MUST display error messages from the API within the popup when create, update, or delete operations fail. The error SHALL be dismissible and not close the popup.

#### Scenario: API error on create

- GIVEN the popup is in create mode
- WHEN the API returns an error (e.g., slot no longer available)
- THEN an error message is displayed inside the popup and the form remains editable

#### Scenario: Network error on save

- GIVEN the popup is in edit mode
- WHEN the network request fails
- THEN an error message "Error de conexion. Intente nuevamente." is shown

### Requirement: Single Appointment Per Slot

The system MUST enforce that only one appointment can exist per time slot. If the slot was taken between the calendar load and the create action, the creation SHALL fail with a clear message.

#### Scenario: Slot taken by concurrent booking

- GIVEN the doctor clicks an empty slot to create an appointment
- WHEN another booking took that slot before the doctor submitted
- THEN the creation fails with "El horario ya no esta disponible" and the popup remains open
