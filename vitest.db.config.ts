import path from "node:path";
import { defineConfig } from "vitest/config";

// vitest는 .env를 자동으로 읽지 않는다. dotenv 없이 Node 내장 로더로 채운다.
try {
  process.loadEnvFile?.(".env");
} catch {
  // .env가 없으면 CI가 넘겨준 환경 변수를 그대로 쓴다.
}

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    globalSetup: ["tests/db/global-setup.ts"],
    setupFiles: ["tests/db/setup.ts"],
    // 테스트 DB 한 벌을 공유하므로 파일을 순차 실행한다.
    fileParallelism: false,
    // `*.db.test.ts`도 이 글롭에 포함된다.
    include: ["tests/db/**/*.test.ts"],
  },
});
