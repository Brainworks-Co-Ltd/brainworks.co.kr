import type { NextApiRequest, NextApiResponse } from "next";
import { withApiErrorBoundary } from "@/server/http/api-handler";
import { HttpError } from "@/server/http/errors";
import { LocalDiskStorage } from "@/server/infrastructure/local-disk-storage";

// 업로드 서비스가 만드는 파일 이름은 `{uuid}.webp` 하나뿐이다.
const FILE_NAME = /^[A-Za-z0-9-]+\.webp$/;

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const root = process.env.ASSET_LOCAL_DIR;
  const file = request.query.file;
  if (!root || typeof file !== "string" || !FILE_NAME.test(file)) {
    throw new HttpError("NOT_FOUND");
  }
  let body: Buffer;
  try {
    body = await new LocalDiskStorage(root).read(`media/${file}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new HttpError("NOT_FOUND");
    }
    throw error;
  }
  response.setHeader("Content-Type", "image/webp");
  response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  response.status(200).send(body);
}

export const config = { api: { responseLimit: false } };
export default withApiErrorBoundary(handler, ["GET", "HEAD"]);
