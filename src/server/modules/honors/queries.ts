import { asc, and, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { assets } from "@/server/db/schema/assets";
import { honorLocales, honors } from "@/server/db/schema/honors";
import { resolvePublicAssetUrl } from "@/server/modules/assets/public-url";
import awardsData from "@/utils/awardsData";
import certificationsData from "@/utils/certificationsData";

export type PublishedHonor = {
  slug?: string;
  type?: "AWARD" | "CERTIFICATION";
  year: number;
  date?: string;
  title: Partial<Record<"ko" | "en", string>>;
  org: Partial<Record<"ko" | "en", string>>;
  description?: Partial<Record<"ko" | "en", string>>;
  image: string;
  displayOrder: number;
};

type PublishedHonors = { awards: PublishedHonor[]; certifications: PublishedHonor[] };

function staticHonors(): PublishedHonors {
  return {
    awards: awardsData.map((item, index) => ({ ...item, image: item.image || "", type: "AWARD", displayOrder: index + 1 })),
    certifications: certificationsData.map((item, index) => ({ ...item, image: item.image || "", type: "CERTIFICATION", displayOrder: index + 1 })),
  };
}

export async function getPublishedHonors(locale: "ko" | "en"): Promise<PublishedHonors> {
  if (!process.env.DATABASE_URL) return staticHonors();
  const rows = await getDb()
    .select({ id: honors.id, type: honors.honorType, year: honors.occurredYear, date: honors.occurredOn, displayOrder: honors.displayOrder, title: honorLocales.title, organization: honorLocales.organization, description: honorLocales.description, storageKey: assets.storageKey })
    .from(honors)
    .innerJoin(honorLocales, eq(honorLocales.honorId, honors.id))
    .leftJoin(assets, and(eq(assets.id, honors.imageAssetId), eq(assets.status, "READY")))
    .where(and(eq(honors.itemStatus, "ACTIVE"), eq(honorLocales.locale, locale), eq(honorLocales.publicationStatus, "PUBLISHED")))
    .orderBy(asc(honors.honorType), asc(honors.displayOrder));
  return {
    awards: rows.filter((row) => row.type === "AWARD").map((row) => ({ slug: row.id, year: row.year, date: row.date ? String(row.date) : "", title: { [locale]: row.title }, org: { [locale]: row.organization }, description: { [locale]: row.description }, image: (row.storageKey && resolvePublicAssetUrl(row.storageKey)) || "", displayOrder: row.displayOrder })),
    certifications: rows.filter((row) => row.type === "CERTIFICATION").map((row) => ({ slug: row.id, year: row.year, title: { [locale]: row.title }, org: { [locale]: row.organization }, description: { [locale]: row.description }, image: (row.storageKey && resolvePublicAssetUrl(row.storageKey)) || "", displayOrder: row.displayOrder })),
  };
}
