import { and, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { assets } from "@/server/db/schema/assets";
import { resolvePublicAssetUrl } from "@/server/modules/assets/public-url";

/** 편집 화면 썸네일용. READY가 아닌 이미지에는 주소를 주지 않는다. */
export async function getReadyAssetUrl(assetId: string | null | undefined) {
  if (!assetId) return null;
  const [asset] = await getDb()
    .select({ storageKey: assets.storageKey })
    .from(assets)
    .where(and(eq(assets.id, assetId), eq(assets.status, "READY")))
    .limit(1);
  return asset ? resolvePublicAssetUrl(asset.storageKey) : null;
}
