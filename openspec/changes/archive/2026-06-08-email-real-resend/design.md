# Design: Real Email Integration with Resend

## Technical Approach

Replace 6 mock notification calls in `appointmentService.ts` with real Resend email delivery. Introduce a thin `EmailService` interface + `ResendEmailService` implementation as a module-level singleton (matching the existing `prisma` singleton pattern). Wrap all `emailService.send()` calls in fire-and-forget promises placed AFTER database commits. Remove 3 admin-triggered mock calls without replacement. Remove both mock functions from `verification.ts`.

## Architecture Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| **DI pattern** | Constructor injection, module singleton, factory function | Module-level singleton | Matches existing `prisma` singleton pattern (`import prisma from "../lib/prisma.js"`). No DI container exists. Free-function service style. Zero refactoring of controller/service signatures. |
| **Resend client init** | Lazy init, startup init, per-request init | Eager init at module load | Resend SDK is lightweight. `dotenv.config()` runs in `index.ts` before any route loads. Fail fast on missing config. |
| **Fire-and-forget placement** | Inside `$transaction`, after `$transaction`, in controller | After `$transaction` commits | Email must only fire on successful DB commit. Placing after the `await prisma.$transaction(...)` line guarantees this. Controllers stay unaware of email. |
| **Email body format** | HTML templates, plain text | Plain text only | Per proposal scope. Can upgrade to HTML later without interface change. |

## Data Flow

### Fire-and-Forget Pattern

```
Controller                    Service                         EmailService
    │                           │                                  │
    ├── createAppointment() ──→ │                                  │
    │                           ├── prisma.$transaction(tx => {    │
    │                           │     ... DB work ...              │
    │                           │     return appointment           │
    │                           │   })                             │
    │                           │                                  │
    │                           ├── emailService.sendAndForget() ─→│
    │                           │                                  ├── Resend API (async)
    │                           │                                  │   └── catch + log
    │                           │                                  │
    │ ←── return appointment ──│                                  │
```

### 5 Patient Email Triggers

| # | Trigger Function | Email Content | Fire-after |
|---|-----------------|---------------|------------|
| 1 | `createAppointment` | Verification code + doctor/date/time | After `$transaction` callback returns (line 123) |
| 2 | `verifyAppointment` | Confirmation: appointment is CONFIRMED | After `$transaction` array resolves (line 170) |
| 3 | `cancelAppointment` | Cancellation with doctor/date/time | After `$transaction` array resolves (line 207) |
| 4 | `cancelWithCode` | Cancellation with doctor/date/time | After `$transaction` array resolves (line 449) |
| 5 | `requestActionCode` | Action code + 15-min expiry notice | After `prisma.appointment.update` (line 407) |
| 6 | `resendVerificationCode` | New verification code | After `prisma.appointment.update` (line 712) |

### Admin Calls Removed (No Replacement)

| Function | Line(s) | Current Mock Call |
|----------|---------|-------------------|
| `updateAppointmentStatus` | 305-309 | `mockSendEmail(... "Turno cancelado")` |
| `adminRescheduleAppointment` | 596-600 | `mockSendEmail(... "Turno modificado")` |
| `createConfirmedAppointment` | 659-663 | `mockSendEmail(... "Turno confirmado")` |

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/src/services/emailService.ts` | Create | `EmailService` interface + `ResendEmailService` class + exported singleton `emailService` + `sendAndForget` helper |
| `backend/src/services/appointmentService.ts` | Modify | Import `emailService`; replace 3 `mockSendCode` → `emailService.sendAndForget`; add 3 new patient email triggers; remove 3 admin `mockSendEmail` calls; remove mock imports |
| `backend/src/utils/verification.ts` | Modify | Delete `mockSendCode` and `mockSendEmail`; keep only `generateCode` |
| `backend/package.json` | Modify | Add `resend` to dependencies |
| `backend/.env.example` | Modify | Add `RESEND_API_KEY=` and `RESEND_FROM=` |

## Interfaces / Contracts

```typescript
// backend/src/services/emailService.ts

import { Resend } from "resend";

export interface EmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

export class ResendEmailService implements EmailService {
  private client: Resend;
  private from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not set");
    this.client = new Resend(apiKey);
    this.from = process.env.RESEND_FROM ?? "Elica <noreply@elica.com>";
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    await this.client.emails.send({ from: this.from, to, subject, text: body });
  }
}

export const emailService: EmailService = new ResendEmailService();

export function sendAndForget(
  to: string, subject: string, body: string
): void {
  emailService.send(to, subject, body).then(
    () => console.log(`[EMAIL] Sent to ${to}: ${subject}`),
    (err) => console.error(`[EMAIL] Failed to ${to}: ${subject}`, err)
  );
}
```

### Integration in appointmentService.ts

```typescript
// Replace:
import { generateCode, mockSendCode, mockSendEmail } from "../utils/verification.js";
// With:
import { generateCode } from "../utils/verification.js";
import { sendAndForget } from "./emailService.js";

// Example: createAppointment — move email AFTER transaction
export async function createAppointment(input: CreateAppointmentInput) {
  // ...
  const appointment = await prisma.$transaction(async (tx) => {
    // ... all DB work (lines 18-123) ...
    // REMOVE: mockSendCode(verificationCode, patientPhone);  ← line 116
    return { ...appointment, verificationCode, verificationToken };
  });

  // Fire-and-forget AFTER commit
  const dateStr = appointment.date.toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  sendAndForget(
    input.patientEmail,
    "Verifica tu turno - Elica",
    `Hola ${input.patientName}, tu código de verificación es: ${appointment.verificationCode}\n` +
    `Turno con ${appointment.doctor.name} - ${dateStr} a las ${appointment.startTime}\n` +
    `El código vence en 5 minutos.`
  );

  return appointment;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `ResendEmailService.send()` calls Resend SDK with correct params | Mock `Resend` class; verify `emails.send` args |
| Unit | `sendAndForget` catches errors without throwing | Spy on `console.error`; trigger rejection |
| Unit | `verification.ts` exports only `generateCode` | Import check; no `mockSendEmail`/`mockSendCode` symbols |
| Integration | Each patient trigger sends email after DB commit | Mock `emailService`; verify called after service function returns |
| Integration | Admin functions do NOT call emailService | Mock `emailService`; verify NOT called for admin cancel/reschedule/create |
| E2E | Book appointment → receive real email via Resend | Manual test with valid `RESEND_API_KEY` |

## Migration / Rollout

No migration required. Emails are side effects only — no schema changes, no data migration. Deploy steps:
1. Add `RESEND_API_KEY` and `RESEND_FROM` to production `.env`
2. Deploy new backend code
3. Verify via health check + test booking

## Open Questions

- [ ] What is the verified sender domain for `RESEND_FROM`? (needs Resend account setup)
