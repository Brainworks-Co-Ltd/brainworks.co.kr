import { HttpError } from "@/server/http/errors";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertValidNewsSlug(slug: string) {
  if (!slugPattern.test(slug)) {
    throw new HttpError(
      "PUBLICATION_INVALID",
      "공개 주소 이름은 영문 소문자, 숫자, 하이픈만 쓸 수 있습니다.",
    );
  }
}

export function assertPublishableNews(input: {
  slug: string;
  locales: Record<string, { title?: string; bodyMarkdown?: string }>;
}) {
  assertValidNewsSlug(input.slug);

  for (const locale of ["ko", "en"]) {
    const content = input.locales[locale];
    if (!content?.title?.trim() || !content.bodyMarkdown?.trim()) {
      throw new HttpError("PUBLICATION_INVALID");
    }
  }
}

export function isPublishedNews(
  itemStatus: "ACTIVE" | "ARCHIVED",
  publicationStatus: "DRAFT" | "PUBLISHED" | "HIDDEN",
) {
  return itemStatus === "ACTIVE" && publicationStatus === "PUBLISHED";
}

export function resolveSlugRedirect(
  requestedSlug: string,
  currentSlug: string,
  slugHistory: string[],
) {
  return slugHistory.includes(requestedSlug) ? currentSlug : null;
}
