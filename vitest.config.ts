import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    // 실제 Postgres에 붙는 테스트는 npm run test:db 전용이다.
    exclude: [...configDefaults.exclude, "tests/db/**/*.db.test.ts"],
  },
});
