import {
  parseNoticePublicNumber,
  type NoticeLocale,
} from "@/server/modules/notices/contracts";

type PublishedNoticeRouteQueries<Notice> = {
  getByPublicNumber: (
    publicNumber: number,
    locale: NoticeLocale,
  ) => Promise<Notice | null>;
  getPublicNumberByLegacySlug: (
    slug: string,
    locale: NoticeLocale,
  ) => Promise<number | null>;
};

export async function resolvePublishedNoticeRoute<Notice>(
  identifier: string,
  locale: NoticeLocale,
  queries: PublishedNoticeRouteQueries<Notice>,
) {
  const publicNumber = parseNoticePublicNumber(identifier);
  if (publicNumber) {
    const notice = await queries.getByPublicNumber(publicNumber, locale);
    if (notice) return { kind: "notice" as const, notice };
  }

  const legacyPublicNumber = await queries.getPublicNumberByLegacySlug(
    identifier,
    locale,
  );
  if (!legacyPublicNumber) return { kind: "notFound" as const };

  return {
    kind: "redirect" as const,
    destination: `${locale === "en" ? "/en" : ""}/notices/${legacyPublicNumber}`,
  };
}
