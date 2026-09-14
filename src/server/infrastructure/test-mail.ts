import type { MailPort, PasswordResetMessage } from "@/server/ports/mail";

export class TestMailPort implements MailPort {
  readonly messages: PasswordResetMessage[] = [];

  async sendPasswordReset(message: PasswordResetMessage) {
    this.messages.push(message);
  }
}

export const testMailPort = new TestMailPort();
