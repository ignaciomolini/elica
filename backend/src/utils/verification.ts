export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function mockSendCode(code: string, phone: string): void {
  console.log(`[VERIFICATION] Code ${code} sent to ${phone}`);
}

export function mockSendEmail(email: string, subject: string, body: string): void {
  console.log(`[EMAIL] To: ${email}`);
  console.log(`[EMAIL] Subject: ${subject}`);
  console.log(`[EMAIL] Body: ${body}`);
}
