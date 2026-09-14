import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

export default async function globalSetup() {
  const databaseUrl = process.env.DATABASE_TEST_URL;
  if (!databaseUrl) {
    console.warn(
      "DATABASE_TEST_URL이 없어 실제 Postgres에 붙는 테스트를 건너뜁니다.",
    );
    return;
  }

  const client = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    onnotice: () => undefined,
  });
  try {
    await migrate(drizzle(client), {
      migrationsFolder: "src/server/db/migrations",
    });
  } finally {
    await client.end({ timeout: 5 });
  }
}
