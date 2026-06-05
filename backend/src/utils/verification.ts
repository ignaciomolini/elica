export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function mockSendCode(code: string, phone: string): void {
  console.log(`[VERIFICATION] Code ${code} sent to ${phone}`);
}
