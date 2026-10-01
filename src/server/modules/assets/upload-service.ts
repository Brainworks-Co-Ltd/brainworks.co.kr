import { createHash, randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import Busboy from "busboy";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { assets } from "@/server/db/schema/assets";
import { HttpError } from "@/server/http/errors";
import { createWebImageVariant } from "@/server/infrastructure/sharp-image";
import { LocalDiskStorage } from "@/server/infrastructure/local-disk-storage";
import { S3ObjectStorage } from "@/server/infrastructure/s3-storage";
import { resolvePublicAssetUrl } from "@/server/modules/assets/public-url";
import { assertImageUploadMetadata } from "@/server/modules/assets/upload-policy";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function readMultipartImage(request: IncomingMessage) {
  return new Promise<{ buffer: Buffer; filename: string; mimeType: string }>(
    (resolve, reject) => {
      const parser = Busboy({
        headers: request.headers,
        limits: { files: 1, fileSize: MAX_IMAGE_BYTES },
      });
      const chunks: Buffer[] = [];
      let filename = "upload";
      let mimeType = "";
      let sawFile = false;
      parser.on("file", (_field, file, info) => {
        sawFile = true;
        filename = info.filename || filename;
        mimeType = info.mimeType || "";
        file.on("data", (chunk: Buffer) => chunks.push(chunk));
        file.on("limit", () => reject(new HttpError("IMAGE_TOO_LARGE")));
      });
      parser.on("error", () => reject(new HttpError("BAD_REQUEST")));
      parser.on("finish", () => {
        try {
          if (!sawFile || chunks.length === 0) {
            reject(new HttpError("BAD_REQUEST"));
            return;
          }
          const buffer = Buffer.concat(chunks);
          assertImageUploadMetadata({ mimeType, bytes: buffer.length });
          resolve({ buffer, filename, mimeType });
        } catch (error) {
          reject(error);
        }
      });
      request.pipe(parser);
    },
  );
}

function getStorage() {
  const localDir = process.env.ASSET_LOCAL_DIR;
  if (localDir) return new LocalDiskStorage(localDir);
  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) throw new HttpError("DEPENDENCY_UNAVAILABLE");
  return new S3ObjectStorage({
    bucket,
    region,
    endpoint: process.env.S3_ENDPOINT,
  });
}

export type StoredImageAsset = {
  id: string;
  width: number | null;
  height: number | null;
  url: string | null;
};

/**
 * 원본 SHA-256이 같은 READY 이미지가 있으면 새로 변환하거나 저장하지 않고 그 이미지를 돌려준다.
 * 같은 그림을 국문과 영문 팝업에 함께 쓸 수 있게 된다.
 */
export async function storeImageAsset(
  upload: { buffer: Buffer; filename: string; mimeType: string },
  actorId: string,
): Promise<StoredImageAsset> {
  const checksum = createHash("sha256").update(upload.buffer).digest("hex");
  const [existing] = await getDb()
    .select({
      id: assets.id,
      width: assets.width,
      height: assets.height,
      storageKey: assets.storageKey,
    })
    .from(assets)
    .where(and(eq(assets.checksum, checksum), eq(assets.status, "READY")))
    .limit(1);
  if (existing) {
    return {
      id: existing.id,
      width: existing.width,
      height: existing.height,
      url: resolvePublicAssetUrl(existing.storageKey),
    };
  }

  const variant = await createWebImageVariant(upload.buffer);
  const key = `media/${randomUUID()}.webp`;
  const storage = getStorage();
  await storage.put(key, variant.buffer, variant.mimeType);
  try {
    const [asset] = await getDb()
      .insert(assets)
      .values({
        assetType: "IMAGE",
        status: "READY",
        storageKey: key,
        originalFilename: upload.filename,
        declaredMime: upload.mimeType,
        detectedMime: variant.mimeType,
        bytes: variant.buffer.length,
        width: variant.width,
        height: variant.height,
        checksum,
        inspectionResult: { sourceBytes: upload.buffer.length },
        createdByActorId: actorId,
      })
      .returning({
        id: assets.id,
        width: assets.width,
        height: assets.height,
      });
    return { ...asset, url: resolvePublicAssetUrl(key) };
  } catch (error) {
    await storage.remove(key).catch(() => undefined);
    throw error;
  }
}

export async function uploadImageAsset(
  request: IncomingMessage,
  actorId: string,
) {
  return storeImageAsset(await readMultipartImage(request), actorId);
}
