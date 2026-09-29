export type PasswordResetMessage = {
  to: string;
  url: string;
};

export interface MailPort {
  sendPasswordReset(message: PasswordResetMessage): Promise<void>;
}
