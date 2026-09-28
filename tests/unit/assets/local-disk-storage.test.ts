import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocalDiskStorage } from "@/server/infrastructure/local-disk-storage";
import mediaHandler from "@/pages/api/media/[file]";

const FILE = "0b1c2d3e-5f6a-4b8c-9d0e-1234567890ab.webp";
let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "bw-media-"));
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(root, { recursive: true, force: true });
});

function mockResponse() {
  const response = { headersSent: false } as unknown as NextApiResponse;
  response.setHeader = vi.fn(() => response) as unknown as NextApiResponse["setHeader"];
  response.status = vi.fn(() => response) as unknown as NextApiResponse["status"];
  response.send = vi.fn(() => response) as unknown as NextApiResponse["send"];
  response.json = vi.fn(() => response) as unknown as NextApiResponse["json"];
  return response;
}

function get(file: string) {
  return { method: "GET", query: { file } } as unknown as NextApiRequest;
}

describe("서버 디스크 이미지 저장", () => {
  it("저장한 파일을 읽고 지울 수 있다", async () => {
    const storage = new LocalDiskStorage(root);
    await storage.put(`media/${FILE}`, Buffer.from("webp"));
    await expect(storage.read(`media/${FILE}`)).resolves.toEqual(Buffer.from("webp"));
    await storage.remove(`media/${FILE}`);
    await expect(storage.read(`media/${FILE}`)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("저장 폴더 밖을 가리키는 key는 거부한다", async () => {
    const storage = new LocalDiskStorage(root);
    await expect(storage.put("../outside.webp", Buffer.from("x"))).rejects.toThrow();
  });
});

describe("/media 이미지 응답", () => {
  it("저장된 이미지를 webp와 불변 캐시로 내려준다", async () => {
    vi.stubEnv("ASSET_LOCAL_DIR", root);
    await new LocalDiskStorage(root).put(`media/${FILE}`, Buffer.from("webp"));
    const response = mockResponse();
    await mediaHandler(get(FILE), response);
    expect(response.setHeader).toHaveBeenCalledWith("Content-Type", "image/webp");
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith(Buffer.from("webp"));
  });

  it.each([
    ["없는 파일", FILE],
    ["webp가 아닌 이름", "passwd"],
    ["경로 이동 문자", "..%2F.env"],
  ])("%s이면 404를 준다", async (_label, file) => {
    vi.stubEnv("ASSET_LOCAL_DIR", root);
    const response = mockResponse();
    await mediaHandler(get(file), response);
    expect(response.status).toHaveBeenCalledWith(404);
  });

  it("저장 폴더 설정이 없으면 404를 준다", async () => {
    vi.stubEnv("ASSET_LOCAL_DIR", "");
    const response = mockResponse();
    await mediaHandler(get(FILE), response);
    expect(response.status).toHaveBeenCalledWith(404);
  });
});
