import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/server/db/client";
import { assets } from "@/server/db/schema/assets";
import { getReadyAssetUrl } from "@/server/modules/assets/asset-url";
import { storeImageAsset } from "@/server/modules/assets/upload-service";
import { getTestActorId, hasTestDatabase } from "./setup";

describe.skipIf(!hasTestDatabase)("이미지 업로드 중복 처리", () => {
  let actorId = "";
  let root = "";
  const previousDir = process.env.ASSET_LOCAL_DIR;

  beforeAll(async () => {
    actorId = await getTestActorId();
    root = await mkdtemp(path.join(tmpdir(), "bw-upload-"));
    process.env.ASSET_LOCAL_DIR = root;
  });

  afterAll(async () => {
    if (previousDir === undefined) delete process.env.ASSET_LOCAL_DIR;
    else process.env.ASSET_LOCAL_DIR = previousDir;
    await rm(root, { recursive: true, force: true });
  });

  it("같은 파일을 두 번 올리면 같은 이미지를 돌려주고 행은 하나만 남는다", async () => {
    const buffer = await sharp({
      create: { width: 4, height: 3, channels: 3, background: "#123456" },
    })
      .png()
      .toBuffer();
    const checksum = createHash("sha256").update(buffer).digest("hex");

    const first = await storeImageAsset(
      { buffer, filename: "same.png", mimeType: "image/png" },
      actorId,
    );
    const second = await storeImageAsset(
      { buffer, filename: "again.png", mimeType: "image/png" },
      actorId,
    );

    expect(second).toEqual(first);
    expect(first.url).toBeTruthy();
    expect(first.url).toBe(await getReadyAssetUrl(first.id));
    const rows = await getDb()
      .select({ id: assets.id })
      .from(assets)
      .where(eq(assets.checksum, checksum));
    expect(rows).toEqual([{ id: first.id }]);
  });

  it("이미지가 없으면 주소도 없다", async () => {
    await expect(getReadyAssetUrl(null)).resolves.toBeNull();
  });
});
