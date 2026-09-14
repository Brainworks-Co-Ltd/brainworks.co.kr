export type NoticeLocale = "ko" | "en";

export type NoticeLocaleInput = {
  title: string;
  bodyMarkdown: string;
};

export type NoticeCommandInput = {
  categoryId?: string | null;
  displayDate: string;
  isPinned?: boolean;
  pinOrder?: number | null;
  locales: Record<NoticeLocale, NoticeLocaleInput>;
};

export type NoticePublicationWindow = {
  startsAt?: Date | null;
  endsAt?: Date | null;
};

export function parseNoticePublicNumber(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const publicNumber = Number(value);
  return Number.isSafeInteger(publicNumber) ? publicNumber : null;
}
