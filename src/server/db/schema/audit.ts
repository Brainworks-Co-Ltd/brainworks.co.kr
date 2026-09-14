import {
  check,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { adminAccounts } from "@/server/db/schema/auth";

export const actorTypeEnum = pgEnum("actor_type", ["ADMIN", "SYSTEM"]);

export const auditActors = pgTable(
  "audit_actors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorType: actorTypeEnum("actor_type").notNull(),
    adminAccountId: text("admin_account_id").references(
      () => adminAccounts.id,
      { onDelete: "restrict" },
    ),
    systemKey: text("system_key"),
    displayName: text("display_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "audit_actors_owner_ck",
      sql`(${table.actorType} = 'ADMIN' AND ${table.adminAccountId} IS NOT NULL AND ${table.systemKey} IS NULL) OR (${table.actorType} = 'SYSTEM' AND ${table.adminAccountId} IS NULL AND ${table.systemKey} IS NOT NULL)`,
    ),
  ],
);
