import nodemailer from "nodemailer";
import { HttpError } from "@/server/http/errors";
import { testMailPort } from "@/server/infrastructure/test-mail";
import type { MailPort, PasswordResetMessage } from "@/server/ports/mail";

export class SmtpPasswordResetMailPort implements MailPort {
  private readonly transporter;

  constructor(private readonly from: string) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    if (!host || !user || !password || !Number.isInteger(port)) {
      throw new HttpError("DEPENDENCY_UNAVAILABLE");
    }
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
  }

  async sendPasswordReset(message: PasswordResetMessage) {
    await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: "Brainworks 관리자 비밀번호 재설정",
      text: [
        "Brainworks 관리자 계정의 비밀번호 재설정 요청을 받았습니다.",
        "",
        `아래 주소에서 새 비밀번호를 설정해 주세요: ${message.url}`,
        "",
        "요청하지 않았다면 이 메일을 무시해 주세요.",
      ].join("\n"),
    });
  }
}

export function createPasswordResetMailPort() {
  const environment = process.env.APP_ENV || process.env.NODE_ENV || "local";
  if (["local", "test", "development"].includes(environment)) {
    return testMailPort;
  }
  const from = process.env.SMTP_FROM;
  if (!from) throw new HttpError("DEPENDENCY_UNAVAILABLE");
  return new SmtpPasswordResetMailPort(from);
}
