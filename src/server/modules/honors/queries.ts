import { asc, and, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { honorLocales, honors } from "@/server/db/schema/honors";
import awardsData from "@/utils/awardsData";
import certificationsData from "@/utils/certificationsData";

function staticHonors() {
  return {
    awards: awardsData.map((item, index) => ({ ...item, type: "AWARD", displayOrder: index + 1 })),
    certifications: certificationsData.map((item, index) => ({ ...item, type: "CERTIFICATION", displayOrder: index + 1 })),
  };
}

export async function getPublishedHonors(locale: "ko" | "en") {
  if (!process.env.DATABASE_URL) return staticHonors();
  const rows = await getDb()
    .select({ id: honors.id, type: honors.honorType, year: honors.occurredYear, date: honors.occurredOn, displayOrder: honors.displayOrder, title: honorLocales.title, organization: honorLocales.organization, description: honorLocales.description, imageAssetId: honors.imageAssetId })
    .from(honors)
    .innerJoin(honorLocales, eq(honorLocales.honorId, honors.id))
    .where(and(eq(honors.itemStatus, "ACTIVE"), eq(honorLocales.locale, locale), eq(honorLocales.publicationStatus, "PUBLISHED")))
    .orderBy(asc(honors.honorType), asc(honors.displayOrder));
  return {
    awards: rows.filter((row) => row.type === "AWARD").map((row) => ({ slug: row.id, year: row.year, date: row.date ? String(row.date) : "", title: { [locale]: row.title }, org: { [locale]: row.organization }, description: { [locale]: row.description }, image: "", displayOrder: row.displayOrder })),
    certifications: rows.filter((row) => row.type === "CERTIFICATION").map((row) => ({ slug: row.id, year: row.year, title: { [locale]: row.title }, org: { [locale]: row.organization }, description: { [locale]: row.description }, image: "", displayOrder: row.displayOrder })),
  };
}
