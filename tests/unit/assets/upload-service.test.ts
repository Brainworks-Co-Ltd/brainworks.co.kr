import type { IncomingMessage } from "node:http";
import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { readMultipartImage } from "@/server/modules/assets/upload-service";

function multipart(
  boundary: string,
  contentType: string,
  filename: string,
  content: Buffer = Buffer.from("%PDF-1.4 fake"),
) {
  const head = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: ${contentType}\r\n\r\n`,
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  const request = Readable.from([
    Buffer.concat([head, content, tail]),
  ]) as unknown as IncomingMessage;
  request.headers = { "content-type": `multipart/form-data; boundary=${boundary}` };
  request.method = "POST";
  return request;
}

function withTimeout<T>(promise: Promise<T>) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 5000),
    ),
  ]);
}

describe("이미지 업로드 검증", () => {
  it("허용되지 않는 형식이면 무한 대기하지 않고 IMAGE_TYPE_NOT_ALLOWED로 거부한다", async () => {
    await expect(
      withTimeout(readMultipartImage(multipart("xyz", "application/pdf", "doc.pdf"))),
    ).rejects.toMatchObject({ code: "IMAGE_TYPE_NOT_ALLOWED" });
  });

  it("10MB를 넘으면 IMAGE_TOO_LARGE로 거부한다", async () => {
    await expect(
      withTimeout(
        readMultipartImage(
          multipart("xyz", "image/png", "big.png", Buffer.alloc(10 * 1024 * 1024 + 1)),
        ),
      ),
    ).rejects.toMatchObject({ code: "IMAGE_TOO_LARGE" });
  });
});
