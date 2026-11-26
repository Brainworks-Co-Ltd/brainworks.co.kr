import { HttpError } from "@/server/http/errors";

export function assertPublishableNews(input: {
  locales: Record<string, { title?: string; bodyMarkdown?: string }>;
}) {
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
