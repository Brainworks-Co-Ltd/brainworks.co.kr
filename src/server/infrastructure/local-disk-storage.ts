import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PrivateObjectStorage } from "@/server/modules/assets/storage-port";

// 관리자가 올린 이미지를 서버 디스크에 둔다. key는 업로드 서비스가 만든 `media/{uuid}.webp`다.
export class LocalDiskStorage implements PrivateObjectStorage {
  private readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  private resolve(key: string) {
    const target = path.resolve(this.root, key);
    if (!target.startsWith(this.root + path.sep)) {
      throw new Error(`저장 경로를 벗어난 key입니다: ${key}`);
    }
    return target;
  }

  async put(key: string, body: Buffer) {
    const target = this.resolve(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, body);
  }

  async remove(key: string) {
    await rm(this.resolve(key), { force: true });
  }

  read(key: string) {
    return readFile(this.resolve(key));
  }
}
