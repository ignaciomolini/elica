# Proposal: Real Email Integration with Resend

## Intent
Replace all mocked notification functions (`mockSendEmail` and `mockSendCode`) with real email delivery via Resend. Email notifications are only sent for patient-triggered actions (booking, verification, cancellation, code requests). Admin-triggered actions do NOT send emails since the admin is already logged in and sees the result immediately.

## Scope

### In Scope
- Install `resend` SDK and add `.env` config (API key, sender address)
- Create `EmailService` abstraction with a Resend implementation
- Replace all `mockSendEmail` calls with async `EmailService.send`
- Replace all `mockSendCode` calls with email (codes sent via email instead of mocked SMS)
- Remove both `mockSendEmail` and `mockSendCode` from `verification.ts`
- All 5 patient-triggered email events:
  1. Patient books appointment → email with verification code
  2. Patient verifies code → confirmation email
  3. Patient cancels appointment → cancellation email
  4. Patient resends verification code → email with new code
  5. Patient requests action code (cancel/reschedule from "Mis Turnos") → email with code
- Fire-and-forget sending so email failures do not block DB transactions

### Out of Scope
- Admin-triggered email notifications (admin cancel, reschedule, create confirmed — admin is logged in)
- HTML templates / rich formatting (keep plain text for now)
- Email queue or retry infrastructure
- Admin dashboard for email logs

## Capabilities

### New Capabilities
- `email-service`: Backend email delivery abstraction with Resend provider and fire-and-forget interface
- `appointment-notifications`: Transactional emails for all patient-triggered appointment events (booking code, verification confirmation, cancellation, action codes)

### Modified Capabilities
- None

## Approach
Introduce a thin `EmailService` interface with a `ResendEmailService` implementation. Update `appointmentService.ts` to inject the service and replace all `mockSendEmail` and `mockSendCode` calls. Wrap `emailService.send()` in fire-and-forget promises (catch+log) so DB commits are never blocked. Remove both mock functions from `verification.ts` (only `generateCode` remains). Use environment variables for Resend API key and verified sender domain.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/utils/verification.ts` | Modified | Remove `mockSendEmail` and `mockSendCode`; keep `generateCode` |
| `backend/src/services/appointmentService.ts` | Modified | Inject `EmailService`; replace all 6 mock calls (3 email + 3 code) with real email |
| `backend/src/services/emailService.ts` | New | Interface + Resend implementation |
| `backend/package.json` | Modified | Add `resend` dependency |
| `backend/.env.example` | Modified | Add `RESEND_API_KEY` and `RESEND_FROM` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Resend API key leaked in logs/env | Low | Use `.env`; never hardcode; `.env` already in `.gitignore` |
| Email failures silently lost (fire-and-forget) | Med | Log all send errors to console; monitor logs |
| Resend free tier exceeded (3k/mo) | Low | Monitor monthly volume; upgrade if needed |
| Patient receives duplicate/no email | Low | Ensure send is called once per transaction success |
| Verification codes now depend on email delivery | Med | Resend has high deliverability; add resend capability in UI |

## Rollback Plan
1. Revert `appointmentService.ts` to `mockSendEmail`/`mockSendCode` calls (restore from git).
2. Uninstall `resend` package.
3. Remove `.env` variables.
4. No data migration needed — emails are side effects only.

## Dependencies
- Resend account with verified sender domain
- `RESEND_API_KEY` and `RESEND_FROM` added to production `.env`

## Success Criteria
- [ ] All 5 patient-triggered events send real emails via Resend
- [ ] Both `mockSendEmail` and `mockSendCode` are removed from the codebase
- [ ] Admin-triggered email calls removed (no emails on admin cancel/reschedule/create)
- [ ] Email failures do not block API responses or DB transactions
- [ ] Backend compiles and passes type check (`tsc --noEmit`)
