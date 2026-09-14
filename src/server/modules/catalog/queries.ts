import { and, asc, eq } from "drizzle-orm";
import { getLocalizedBusinessAreas } from "@/data/businessAreas";
import { getDb } from "@/server/db/client";
import { assets } from "@/server/db/schema/assets";
import {
  aiSolutionLocales,
  aiSolutions,
  businessAreas,
} from "@/server/db/schema/catalog";
import { resolvePublicAssetUrl } from "@/server/modules/assets/public-url";

/**
 * 사업 영역 자체는 고정 공개 분류이며, 각 영역의 솔루션만 관리자 게시 상태를
 * 반영한다.
 */
export async function getPublishedBusinessAreas(locale: "ko" | "en") {
  const areas = getLocalizedBusinessAreas(locale);
  if (!process.env.DATABASE_URL) return areas;

  const rows = await getDb()
    .select({
      id: aiSolutions.id,
      businessAreaKey: businessAreas.publicKey,
      displayOrder: aiSolutions.displayOrder,
      name: aiSolutionLocales.name,
      summary: aiSolutionLocales.summary,
      imageAlt: aiSolutionLocales.imageAlt,
      storageKey: assets.storageKey,
    })
    .from(aiSolutions)
    .innerJoin(businessAreas, eq(businessAreas.id, aiSolutions.businessAreaId))
    .innerJoin(
      aiSolutionLocales,
      eq(aiSolutionLocales.aiSolutionId, aiSolutions.id),
    )
    .innerJoin(assets, eq(assets.id, aiSolutions.imageAssetId))
    .where(
      and(
        eq(aiSolutions.itemStatus, "ACTIVE"),
        eq(businessAreas.itemStatus, "ACTIVE"),
        eq(aiSolutionLocales.locale, locale),
        eq(aiSolutionLocales.publicationStatus, "PUBLISHED"),
        eq(assets.status, "READY"),
      ),
    )
    .orderBy(asc(businessAreas.displayOrder), asc(aiSolutions.displayOrder));

  return areas.map((area) => ({
    ...area,
    solutions: rows
      .filter((solution) => solution.businessAreaKey === area.id)
      .map((solution) => ({
        id: solution.id,
        title: solution.name,
        description: solution.summary,
        image: resolvePublicAssetUrl(solution.storageKey) || "",
        imageAlt: solution.imageAlt || "",
      })),
  }));
}
