import {
  doublePrecision,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { VitalAttribution } from "@/shared/schemas/web-vitals";

/** 방문자 브라우저에서 잰 성능 지표. IP, UA, 방문자 식별자는 두지 않는다. 90일 지나면 지운다. */
export const webVitals = pgTable(
  "web_vitals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    value: doublePrecision("value").notNull(),
    rating: text("rating"),
    navigationType: text("navigation_type"),
    route: text("route").notNull(),
    locale: text("locale").notNull(),
    buildId: text("build_id").notNull(),
    device: text("device").notNull(),
    connection: text("connection"),
    // web-vitals가 붙인 id. CLS, INP는 숨길 때마다 같은 id로 다시 보고되어 한 행을 고쳐 쓴다.
    // Next 전용 지표는 한 번만 오므로 null이다(null끼리는 겹치지 않는다).
    metricId: text("metric_id"),
    // 느린 까닭을 가리는 원인 내역. 모양은 지표마다 다르다(src/shared/schemas/web-vitals.ts). 이전 버전 행은 null이다.
    attribution: jsonb("attribution").$type<VitalAttribution>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("web_vitals_created_at_idx").on(table.createdAt),
    index("web_vitals_name_created_at_idx").on(table.name, table.createdAt),
    uniqueIndex("web_vitals_metric_id_idx").on(table.metricId),
  ],
);
