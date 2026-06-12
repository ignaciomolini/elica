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
  to: string,
  subject: string,
  body: string
): void {
  emailService.send(to, subject, body).then(
    () => console.log(`[EMAIL] Sent to ${to}: ${subject}`),
    (err) => console.error(`[EMAIL] Failed to ${to}: ${subject}`, err)
  );
}