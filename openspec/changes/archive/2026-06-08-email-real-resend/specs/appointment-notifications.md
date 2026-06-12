# Appointment Notifications Specification

## Purpose

Defines transactional email notifications for all patient-triggered appointment events. Only patient actions trigger emails; admin actions do NOT send emails.

## Requirements

### Requirement: Booking Verification Email

The system MUST send an email with a verification code when a patient successfully books an appointment. The email SHALL include the 6-digit code, appointment details (doctor, date, time), and instructions to verify.

#### Scenario: Patient books appointment receives code email

- GIVEN a patient completes the booking flow with valid data
- WHEN the appointment is created in the database (PENDING, unverified)
- THEN an email is sent to the patient's email with the 6-digit verification code

#### Scenario: Booking email includes appointment details

- GIVEN an appointment is created for Dr. García on 15/07/2026 at 10:00
- WHEN the booking email is sent
- THEN the email body includes the doctor name, date, and time

#### Scenario: Booking failure does not send email

- GIVEN the booking fails (slot unavailable, validation error)
- WHEN the transaction rolls back or throws
- THEN no email is sent

### Requirement: Verification Confirmation Email

The system MUST send a confirmation email when a patient successfully verifies their appointment code. The email SHALL confirm the appointment is now CONFIRMED with full details.

#### Scenario: Patient verifies code receives confirmation

- GIVEN a patient has a PENDING appointment with a valid code
- WHEN the patient submits the correct verification code
- THEN a confirmation email is sent indicating the appointment is confirmed

#### Scenario: Invalid code does not send email

- GIVEN a patient submits an incorrect verification code
- WHEN verification fails with "Código de verificación inválido"
- THEN no confirmation email is sent

#### Scenario: Expired appointment does not send email

- GIVEN the appointment has expired (past expiresAt)
- WHEN the patient attempts verification
- THEN the appointment is deleted and no confirmation email is sent

### Requirement: Cancellation Email (Patient-Triggered)

The system MUST send a cancellation email when a patient cancels their own appointment (via `cancelWithCode` or `cancelAppointment`). The email SHALL include the cancelled appointment details.

#### Scenario: Patient cancels with code receives email

- GIVEN a patient has a confirmed appointment
- WHEN the patient cancels using their action code
- THEN a cancellation email is sent with doctor name, date, and time

#### Scenario: Admin cancel does NOT send email

- GIVEN an admin cancels an appointment via `updateAppointmentStatus`
- WHEN the appointment status changes to CANCELLED
- THEN no cancellation email is sent to the patient

### Requirement: Resend Verification Code Email

The system MUST send an email with a new verification code when a patient requests a resend. The new code SHALL replace the previous one and extend the expiration window.

#### Scenario: Patient resends code receives new code email

- GIVEN a patient has a PENDING unverified appointment
- WHEN the patient requests a code resend
- THEN an email is sent with a new 6-digit verification code

#### Scenario: Resend generates new code

- GIVEN the original verification code was "123456"
- WHEN the patient requests a resend
- THEN the appointment stores a different code and the email contains the new code

#### Scenario: Resend on expired appointment fails

- GIVEN the appointment has expired
- WHEN the patient requests a code resend
- THEN an error is returned and no email is sent

#### Scenario: Resend on confirmed appointment fails

- GIVEN the appointment is already verified/confirmed
- WHEN the patient requests a code resend
- THEN an error is returned and no email is sent

### Requirement: Action Code Email (Mis Turnos)

The system MUST send an email with an action code when a patient requests to cancel or reschedule from "Mis Turnos". The code SHALL expire in 15 minutes.

#### Scenario: Patient requests action code receives email

- GIVEN a patient has a confirmed appointment
- WHEN the patient requests an action code from "Mis Turnos"
- THEN an email is sent with a 6-digit action code and 15-minute expiration notice

#### Scenario: Action code email includes expiration info

- GIVEN an action code is generated
- WHEN the email is sent
- THEN the email body mentions the code expires in 15 minutes

#### Scenario: Action code on cancelled appointment fails

- GIVEN the appointment is already cancelled
- WHEN the patient requests an action code
- THEN an error is returned and no email is sent

### Requirement: Patient-Only Email Triggering

The system MUST NOT send emails for admin-triggered actions: admin cancel (`updateAppointmentStatus`), admin reschedule (`adminRescheduleAppointment`), and admin create confirmed (`createConfirmedAppointment`).

#### Scenario: Admin reschedule does not send email

- GIVEN an admin reschedules an appointment via `adminRescheduleAppointment`
- WHEN the appointment time is updated
- THEN no email is sent to the patient

#### Scenario: Admin create confirmed does not send email

- GIVEN an admin creates a confirmed appointment via `createConfirmedAppointment`
- WHEN the appointment is created with CONFIRMED status
- THEN no email is sent to the patient

### Requirement: Email Content Consistency

The system SHOULD use consistent email formatting across all notification types. Each email SHALL include: patient greeting, appointment details (doctor, date, time), and Elica branding in the subject line.

#### Scenario: All emails include Elica branding

- GIVEN any patient-triggered email is sent
- WHEN the subject line is inspected
- THEN it contains "Elica" as the sender identifier

#### Scenario: All emails include appointment details

- GIVEN any appointment-related email is sent
- WHEN the email body is inspected
- THEN it includes the doctor name, date, and time of the appointment
