import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { aiSolutionLocales, aiSolutions, businessAreaLocales, businessAreas } from "@/server/db/schema/catalog";
import { getLocalizedBusinessAreas } from "@/data/businessAreas";

function staticAreas(locale: "ko" | "en") { return getLocalizedBusinessAreas(locale); }

export async function getPublishedBusinessAreas(locale: "ko" | "en") {
  if (!process.env.DATABASE_URL) return staticAreas(locale);
  const areaRows = await getDb().select({ id: businessAreas.id, publicKey: businessAreas.publicKey, displayOrder: businessAreas.displayOrder, name: businessAreaLocales.name, subtitle: businessAreaLocales.subtitle, description: businessAreaLocales.description }).from(businessAreas).innerJoin(businessAreaLocales, eq(businessAreaLocales.businessAreaId, businessAreas.id)).where(and(eq(businessAreas.itemStatus, "ACTIVE"), eq(businessAreaLocales.locale, locale), eq(businessAreaLocales.publicationStatus, "PUBLISHED"))).orderBy(asc(businessAreas.displayOrder));
  if (!areaRows.length) return [];
  const solutionRows = await getDb().select({ id: aiSolutions.id, businessAreaId: aiSolutions.businessAreaId, displayOrder: aiSolutions.displayOrder, name: aiSolutionLocales.name, description: aiSolutionLocales.description }).from(aiSolutions).innerJoin(aiSolutionLocales, eq(aiSolutionLocales.aiSolutionId, aiSolutions.id)).where(and(eq(aiSolutions.itemStatus, "ACTIVE"), eq(aiSolutionLocales.locale, locale), eq(aiSolutionLocales.publicationStatus, "PUBLISHED"))).orderBy(asc(aiSolutions.displayOrder));
  const staticByKey = new Map(staticAreas(locale).map((area) => [area.id, area]));
  return areaRows.map((area) => { const fallback = staticByKey.get(area.publicKey); return { id: area.publicKey, title: area.name, subtitle: area.subtitle, description: area.description, heroImage: fallback?.heroImage || "", solutions: solutionRows.filter((solution) => solution.businessAreaId === area.id).map((solution) => ({ id: solution.id, title: solution.name, description: solution.description, image: "" })) }; });
}
