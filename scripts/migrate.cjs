const postgres = require("postgres");
const { drizzle } = require("drizzle-orm/postgres-js");
const { migrate } = require("drizzle-orm/postgres-js/migrator");

const databaseUrl = process.env.DATABASE_URL;
const migrationsFolder = process.env.MIGRATIONS_DIR;
if (!databaseUrl || !migrationsFolder) throw new Error("DATABASE_URL과 MIGRATIONS_DIR가 필요합니다.");
const client = postgres(databaseUrl, { max: 1, prepare: false });
migrate(drizzle(client), { migrationsFolder })
  .then(() => client.end({ timeout: 5 }))
  .catch(async (error) => { await client.end({ timeout: 5 }); throw error; });
