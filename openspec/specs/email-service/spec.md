# Email Service Specification

## Purpose

Defines the `EmailService` abstraction for sending transactional emails via Resend, including fire-and-forget behavior, configuration, and error handling.

## Requirements

### Requirement: Email Service Interface

The system SHALL provide an `EmailService` interface with a `send(to, subject, body)` method that accepts a recipient email, subject line, and plain-text body. The interface SHALL be injectable into services that need to send emails.

#### Scenario: Interface defines send method

- GIVEN a service needs to send a transactional email
- WHEN the service calls `emailService.send(to, subject, body)`
- THEN the method returns a `Promise<void>` and accepts exactly three string parameters

#### Scenario: Interface is injectable

- GIVEN `appointmentService` requires email capability
- WHEN the service is instantiated
- THEN an `EmailService` implementation is injected via constructor or DI container

### Requirement: Resend Provider Implementation

The system MUST implement `EmailService` using the Resend SDK (`resend` npm package). The implementation MUST read `RESEND_API_KEY` and `RESEND_FROM` from environment variables.

#### Scenario: Resend sends email with correct parameters

- GIVEN valid `RESEND_API_KEY` and `RESEND_FROM` are set
- WHEN `send("patient@example.com", "Subject", "Body")` is called
- THEN Resend SDK is invoked with `from: RESEND_FROM`, `to`, `subject`, and `text: body`

#### Scenario: Missing API key throws error

- GIVEN `RESEND_API_KEY` is not set or empty
- WHEN `ResendEmailService` is instantiated or `send()` is called
- THEN the service throws or logs a configuration error

#### Scenario: Plain text only (no HTML)

- GIVEN an email is sent
- WHEN the Resend API call is constructed
- THEN only the `text` field is populated; `html` is not set

### Requirement: Fire-and-Forget Sending

The system MUST ensure email sending failures do NOT block API responses or database transactions. Email sends SHALL be wrapped in fire-and-forget promises that catch and log errors.

#### Scenario: Email failure does not block transaction

- GIVEN a patient books an appointment successfully
- WHEN the email send fails (Resend API error, network issue)
- THEN the DB transaction commits and the API returns success to the client

#### Scenario: Email failure is logged

- GIVEN `emailService.send()` is called
- WHEN the send operation throws an error
- THEN the error is caught and logged to console with context (recipient, subject, error message)

#### Scenario: Email success is logged

- GIVEN `emailService.send()` is called
- WHEN the send operation succeeds
- THEN a success log is written with recipient and subject

### Requirement: Environment Configuration

The system MUST require `RESEND_API_KEY` and `RESEND_FROM` environment variables. These SHALL be documented in `.env.example`.

#### Scenario: .env.example includes Resend config

- GIVEN a developer clones the project
- WHEN they read `backend/.env.example`
- THEN `RESEND_API_KEY=` and `RESEND_FROM=` entries are present

#### Scenario: Package includes resend dependency

- GIVEN the backend project
- WHEN `package.json` is inspected
- THEN `resend` is listed in `dependencies`

### Requirement: Mock Functions Removal

The system MUST remove `mockSendEmail` and `mockSendCode` from `backend/src/utils/verification.ts`. Only `generateCode` SHALL remain in that file.

#### Scenario: verification.ts has no mock functions

- GIVEN the codebase after migration
- WHEN `verification.ts` is read
- THEN only `generateCode` is exported; `mockSendEmail` and `mockSendCode` do not exist

#### Scenario: No imports of removed mocks

- GIVEN the codebase after migration
- WHEN the project is searched for `mockSendEmail` or `mockSendCode` references
- THEN zero import or usage references exist