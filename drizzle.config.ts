import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema/*.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://brainworks:brainworks_dev@localhost:5433/brainworks_dev",
  },
  strict: true,
  verbose: true,
});
