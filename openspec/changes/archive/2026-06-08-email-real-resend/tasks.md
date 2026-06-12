# Tasks: Real Email Integration with Resend

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~130 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Email service + wiring + cleanup + verify | Single PR | ~130 lines across 5 files; self-contained |

## Phase 1: Foundation — Email Service

- [x] 1.1 Create `backend/src/services/emailService.ts` with `EmailService` interface, `ResendEmailService` class, and exported `sendAndForget` helper
- [x] 1.2 Add `resend` dependency to `backend/package.json`
- [x] 1.3 Add `RESEND_API_KEY=` and `RESEND_FROM=` to `backend/.env.example`

## Phase 2: Core Implementation — Appointment Service Wiring

- [x] 2.1 Update import in `appointmentService.ts`: replace `mockSendCode, mockSendEmail` with `sendAndForget` from `./emailService.js`
- [x] 2.2 Replace `mockSendCode` in `createAppointment` (line 116) with `sendAndForget` after transaction, including email body with doctor/date/time
- [x] 2.3 Add `sendAndForget` after `verifyAppointment` transaction (line 170) with confirmation email
- [x] 2.4 Add `sendAndForget` after `cancelAppointment` transaction (line 207) with cancellation email
- [x] 2.5 Add `sendAndForget` after `cancelWithCode` transaction (line 449) with cancellation email
- [x] 2.6 Replace `mockSendCode` in `requestActionCode` (line 410) with `sendAndForget`, including action code + 15-min expiry notice
- [x] 2.7 Replace `mockSendCode` in `resendVerificationCode` (line 715) with `sendAndForget` with new verification code
- [x] 2.8 Remove 3 admin `mockSendEmail` calls from `updateAppointmentStatus` (lines 305-309), `adminRescheduleAppointment` (lines 596-600), `createConfirmedAppointment` (lines 659-663)

## Phase 3: Cleanup

- [x] 3.1 Remove `mockSendEmail` and `mockSendCode` from `backend/src/utils/verification.ts`; keep only `generateCode`

## Phase 4: Verification

- [x] 4.1 Run `tsc --noEmit` to verify types compile
- [x] 4.2 Verify no `mockSendEmail` or `mockSendCode` import/usage references remain in codebase
- [ ] 4.3 Manual integration test: trigger all 6 patient flows and confirm console logs show correct email parameters
