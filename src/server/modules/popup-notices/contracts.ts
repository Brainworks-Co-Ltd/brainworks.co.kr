export type PopupLocale = "ko" | "en";

export type PopupLocaleInput = {
  title: string;
  bodyMarkdown?: string | null;
  imageAssetId?: string | null;
  imageAlt?: string | null;
  displayOrder?: number;
};

export type PopupCommandInput = {
  noticeId?: string | null;
  locales: Record<PopupLocale, PopupLocaleInput>;
};

export type PopupPublicationWindow = {
  startsAt?: Date | null;
  endsAt?: Date | null;
};
