export type NoticeLocale = "ko" | "en";

export type NoticeLocaleInput = {
  title: string;
  bodyMarkdown: string;
};

export type NoticeCommandInput = {
  slug: string;
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
