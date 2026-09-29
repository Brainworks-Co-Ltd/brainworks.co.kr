import type { NextApiRequest, NextApiResponse } from "next";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { assets } from "@/server/db/schema/assets";
import { noticeAttachments, noticeLocales, notices } from "@/server/db/schema/notices";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { HttpError } from "@/server/http/errors";
import { effectiveNoticeVisibility } from "@/server/modules/notices/domain";
import { canIssueDownloadUrl } from "@/server/modules/assets/document-policy";
import { S3ObjectStorage } from "@/server/infrastructure/s3-storage";
import { parseNoticePublicNumber } from "@/server/modules/notices/contracts";

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: { code: "BAD_REQUEST", message: "GET만 허용됩니다." } });
    return;
  }
  const identifier = typeof request.query.slug === "string" ? request.query.slug : "";
  const publicNumber = parseNoticePublicNumber(identifier);
  if (!publicNumber) throw new HttpError("NOT_FOUND");
  const attachmentId = typeof request.query.attachmentId === "string" ? request.query.attachmentId : "";
  const locale = request.query.locale === "en" ? "en" : "ko";
  const row = await getDb()
    .select({ storageKey: assets.storageKey, assetStatus: assets.status, itemStatus: notices.itemStatus, publicationStatus: noticeLocales.publicationStatus, startsAt: noticeLocales.publishStartsAt, endsAt: noticeLocales.publishEndsAt })
    .from(noticeAttachments)
    .innerJoin(assets, eq(assets.id, noticeAttachments.assetId))
    .innerJoin(noticeLocales, eq(noticeLocales.id, noticeAttachments.noticeLocaleId))
    .innerJoin(notices, eq(notices.id, noticeLocales.noticeId))
    .where(and(eq(noticeAttachments.id, attachmentId), eq(notices.publicNumber, publicNumber), eq(noticeLocales.locale, locale)))
    .limit(1);
  const current = row[0];
  const visible = current && current.itemStatus === "ACTIVE" && effectiveNoticeVisibility({ status: current.publicationStatus, startsAt: current.startsAt, endsAt: current.endsAt });
  if (!current || !visible || !canIssueDownloadUrl({ noticePublished: true, assetReady: current.assetStatus === "READY" })) throw new HttpError("NOT_FOUND");
  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) throw new HttpError("DEPENDENCY_UNAVAILABLE");
  const storage = new S3ObjectStorage({ bucket, region, endpoint: process.env.S3_ENDPOINT });
  const createSignedDownloadUrl = (storage as unknown as { createSignedDownloadUrl?: (key: string, expiresInSeconds: number) => Promise<string> }).createSignedDownloadUrl;
  if (!createSignedDownloadUrl) throw new HttpError("DEPENDENCY_UNAVAILABLE");
  response.status(302).setHeader("Location", await createSignedDownloadUrl(current.storageKey, 300)).end();
}

export default withApiErrorBoundary(handler);
