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
  areaStatus: "ACTIVE" | "ARCHIVED",
  areaPublicationStatus: "DRAFT" | "PUBLISHED" | "HIDDEN",
) {
  return (
    isPublicContent(solutionStatus, solutionPublicationStatus) &&
    isPublicContent(areaStatus, areaPublicationStatus)
  );
}
