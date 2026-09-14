import nodemailer from "nodemailer";
import type { ContactMail, MailPort } from "@/server/modules/contact/mail-port";
import { HttpError } from "@/server/http/errors";

export class SesMailPort implements MailPort {
  private readonly transporter;
  constructor(private readonly from: string) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    if (!host || !user || !password || !Number.isInteger(port)) throw new HttpError("DEPENDENCY_UNAVAILABLE");
    this.transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass: password }, connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000 });
  }
  async send(message: ContactMail) { await this.transporter.sendMail({ from: this.from, to: message.to, replyTo: message.replyTo, subject: message.subject, text: message.text }); }
}

export class TestMailPort implements MailPort {
  readonly messages: ContactMail[] = [];
  async send(message: ContactMail) { this.messages.push(message); }
}

export function createContactMailPort() {
  const environment = process.env.APP_ENV || process.env.NODE_ENV || "local";
  if (environment === "local" || environment === "test") return new TestMailPort();
  const from = process.env.SMTP_FROM;
  if (!from) throw new HttpError("DEPENDENCY_UNAVAILABLE");
  return new SesMailPort(from);
}
