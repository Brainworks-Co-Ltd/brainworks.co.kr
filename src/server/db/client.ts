import postgres, { type Sql } from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "@/server/db/schema";
import { getDatabaseUrl } from "@/server/env";

type Database = PostgresJsDatabase<typeof schema>;

type DatabaseResources = {
  client: Sql;
  db: Database;
};

let resources: DatabaseResources | undefined;

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("서버 전용 모듈입니다.");
  }
}

export function getDb(): Database {
  assertServerOnly();
  if (!resources) {
    const client = postgres(getDatabaseUrl(), {
      max: 5,
      prepare: false,
      onnotice: () => undefined,
    });
    resources = { client, db: drizzle(client, { schema }) };
  }
  return resources.db;
}

export async function closeDb() {
  if (resources) {
    await resources.client.end({ timeout: 5 });
    resources = undefined;
  }
}
