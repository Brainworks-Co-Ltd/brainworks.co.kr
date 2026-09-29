import { HttpError } from "@/server/http/errors";

const requiredLocales = new Set(["ko", "en"]);

export function assertCompleteLocales(locales: string[]) {
  const actual = new Set(locales);
  if (
    actual.size !== requiredLocales.size ||
    actual.size !== locales.length ||
    [...requiredLocales].some((locale) => !actual.has(locale))
  ) {
    throw new HttpError("PUBLICATION_INVALID");
  }
}

export function assertDraftLocales(
  locales: Record<"ko" | "en", { title?: string }>,
) {
  if (![locales.ko.title, locales.en.title].some((title) => title?.trim())) {
    throw new HttpError(
      "PUBLICATION_INVALID",
      "국문 또는 영문 제목을 입력해 주세요.",
    );
  }
}

export function assertContinuousOrder(orders: number[]) {
  if (orders.length === 0) {
    return true;
  }

  const sorted = [...orders].sort((a, b) => a - b);
  return sorted.every((order, index) => order === index + 1);
}

export function assertExpectedVersion(
  actualVersion: number,
  expectedVersion: number,
) {
  if (actualVersion !== expectedVersion) {
    throw new HttpError("VERSION_CONFLICT", "VERSION_CONFLICT");
  }
}

export function isPublicContent(
  itemStatus: "ACTIVE" | "ARCHIVED",
  publicationStatus: "DRAFT" | "PUBLISHED" | "HIDDEN",
) {
  return itemStatus === "ACTIVE" && publicationStatus === "PUBLISHED";
}

export function isPublicSolution(
  solutionStatus: "ACTIVE" | "ARCHIVED",
  solutionPublicationStatus: "DRAFT" | "PUBLISHED" | "HIDDEN",
) {
  return isPublicContent(solutionStatus, solutionPublicationStatus);
}
