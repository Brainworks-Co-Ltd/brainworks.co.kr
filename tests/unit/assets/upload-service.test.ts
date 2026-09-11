import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { readMultipartImage } from "@/server/modules/assets/upload-service";

function multipart(boundary: string, contentType: string, filename: string) {
  const body =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    `Content-Type: ${contentType}\r\n\r\n` +
    `%PDF-1.4 fake\r\n` +
    `--${boundary}--\r\n`;
  const request = Readable.from([Buffer.from(body)]) as any;
  request.headers = { "content-type": `multipart/form-data; boundary=${boundary}` };
  request.method = "POST";
  return request;
}

describe("이미지 업로드 검증", () => {
  it("허용되지 않는 형식이면 무한 대기하지 않고 BAD_REQUEST로 거부한다", async () => {
    const request = multipart("xyz", "application/pdf", "doc.pdf");
    await expect(
      Promise.race([
        readMultipartImage(request),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
      ]),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
