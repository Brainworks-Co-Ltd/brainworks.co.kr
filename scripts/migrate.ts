import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { getDatabaseUrl } from "@/server/env";

async function main() {
  const client = postgres(getDatabaseUrl(), { max: 1, prepare: false });

  try {
    await migrate(drizzle(client), {
      migrationsFolder: "src/server/db/migrations",
    });
  } finally {
    await client.end({ timeout: 5 });
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
