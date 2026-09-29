import sharp from "sharp";

export async function createWebImageVariant(input: Buffer) {
  const image = sharp(input, { failOn: "error" });
  const metadata = await image.metadata();
  const output = await image.webp({ quality: 82 }).toBuffer();
  return {
    buffer: output,
    width: metadata.width || 0,
    height: metadata.height || 0,
    mimeType: "image/webp",
  };
}
