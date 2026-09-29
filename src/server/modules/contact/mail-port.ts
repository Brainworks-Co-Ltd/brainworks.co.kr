export type ContactMail = { to: string; subject: string; text: string; replyTo: string };

export interface MailPort {
  send(message: ContactMail): Promise<void>;
}
