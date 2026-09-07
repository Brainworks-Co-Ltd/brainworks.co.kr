import { HttpError } from "@/server/http/errors";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertValidNewsSlug(slug: string) {
  if (!slugPattern.test(slug)) {
    throw new HttpError("PUBLICATION_INVALID");
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

export function validateNewsQuery(query: {
  q?: string | string[];
  category?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
}) {
  const value = (input: string | string[] | undefined) =>
    Array.isArray(input) ? input[0] || "" : input || "";
  const page = Number.parseInt(value(query.page), 10);
  const pageSize = Number.parseInt(value(query.pageSize), 10);

  return {
    q: value(query.q).trim().slice(0, 100),
    category: value(query.category).trim().slice(0, 50),
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 1000) : 1,
    pageSize:
      Number.isFinite(pageSize) && pageSize > 0 ? Math.min(pageSize, 12) : 12,
  };
}
