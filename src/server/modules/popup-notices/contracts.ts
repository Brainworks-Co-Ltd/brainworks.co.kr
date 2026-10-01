export type PopupLocale = "ko" | "en";

export type PopupLocaleInput = {
  title: string;
  bodyMarkdown?: string | null;
  imageAssetId?: string | null;
  imageAlt?: string | null;
  displayOrder?: number;
  /** 빠지면 저장된 값을 그대로 두고, null이면 비운다. */
  publishStartsAt?: Date | null;
  publishEndsAt?: Date | null;
};

export type PopupCommandInput = {
  noticeId?: string | null;
  locales: Record<PopupLocale, PopupLocaleInput>;
};

export type PopupPublicationWindow = {
  startsAt?: Date | null;
  endsAt?: Date | null;
};
