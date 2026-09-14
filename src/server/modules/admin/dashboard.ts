import { sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";

export const dashboardContentTypes = [
  "news",
  "notices",
  "popup-notices",
  "honors",
] as const;

export type DashboardContentType = (typeof dashboardContentTypes)[number];
export type DashboardLocale = "ko" | "en";
export type DashboardItemStatus = "ACTIVE" | "ARCHIVED";

export type DashboardRow = {
  contentType: DashboardContentType;
  contentId: string;
  itemStatus: DashboardItemStatus;
  locale: DashboardLocale;
  publicationStatus: string;
  itemUpdatedAt: string | Date;
  localeUpdatedAt: string | Date;
  title: string;
  adminHref: string;
};

export type DashboardItem = {
  id: string;
  contentId: string;
  contentType: DashboardContentType;
  title: string;
  locale: DashboardLocale;
  publicationStatus: string;
  updatedAt: string;
  adminHref: string;
};

export type DashboardSummary = {
  contentType: DashboardContentType;
  activeCount: number;
  archivedCount: number;
  locales: {
    ko: Record<string, number>;
    en: Record<string, number>;
  };
};

export type AdminDashboardData = {
  summary: DashboardSummary[];
  attention: DashboardItem[];
  recent: DashboardItem[];
};

const statusSets: Record<DashboardContentType, readonly string[]> = {
  news: ["DRAFT", "PUBLISHED", "HIDDEN"],
  notices: ["DRAFT", "SCHEDULED", "PUBLISHED", "UNPUBLISHED"],
  "popup-notices": ["DRAFT", "SCHEDULED", "PUBLISHED", "UNPUBLISHED"],
  honors: ["DRAFT", "PUBLISHED", "HIDDEN"],
};

function emptyStatusCounts(contentType: DashboardContentType) {
  return Object.fromEntries(
    statusSets[contentType].map((status) => [status, 0]),
  );
}

function toTime(value: string | Date) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

function toIso(value: string | Date) {
  return (value instanceof Date ? value : new Date(value)).toISOString();
}

function toDashboardItem(row: DashboardRow): DashboardItem {
  return {
    id: `${row.contentType}:${row.contentId}:${row.locale}`,
    contentId: row.contentId,
    contentType: row.contentType,
    title: row.title || "제목 없음",
    locale: row.locale,
    publicationStatus: row.publicationStatus,
    updatedAt: toIso(row.localeUpdatedAt),
    adminHref: row.adminHref,
  };
}

export function buildAdminDashboardData(
  rows: DashboardRow[],
): AdminDashboardData {
  const summary = dashboardContentTypes.map((contentType) => {
    const contentRows = rows.filter((row) => row.contentType === contentType);
    const itemStatuses = new Map<string, DashboardItemStatus>();
    for (const row of contentRows) {
      itemStatuses.set(row.contentId, row.itemStatus);
    }

    const locales = {
      ko: emptyStatusCounts(contentType),
      en: emptyStatusCounts(contentType),
    };
    for (const row of contentRows) {
      if (row.itemStatus === "ACTIVE") {
        locales[row.locale][row.publicationStatus] =
          (locales[row.locale][row.publicationStatus] ?? 0) + 1;
      }
    }

    return {
      contentType,
      activeCount: [...itemStatuses.values()].filter(
        (status) => status === "ACTIVE",
      ).length,
      archivedCount: [...itemStatuses.values()].filter(
        (status) => status === "ARCHIVED",
      ).length,
      locales,
    };
  });

  const attention = rows
    .filter(
      (row) =>
        row.itemStatus === "ACTIVE" &&
        ["DRAFT", "HIDDEN", "UNPUBLISHED"].includes(row.publicationStatus),
    )
    .sort((a, b) => toTime(b.localeUpdatedAt) - toTime(a.localeUpdatedAt))
    .slice(0, 8)
    .map(toDashboardItem);

  const latestByContent = new Map<string, DashboardRow>();
  for (const row of rows) {
    const key = `${row.contentType}:${row.contentId}`;
    const current = latestByContent.get(key);
    if (
      !current ||
      toTime(row.localeUpdatedAt) > toTime(current.localeUpdatedAt)
    ) {
      latestByContent.set(key, row);
    }
  }
  const recent = [...latestByContent.values()]
    .sort((a, b) => toTime(b.localeUpdatedAt) - toTime(a.localeUpdatedAt))
    .slice(0, 8)
    .map(toDashboardItem);

  return { summary, attention, recent };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (!process.env.DATABASE_URL) {
    return buildAdminDashboardData([]);
  }

  const rows = (await getDb().execute(sql`
    WITH content_items AS (
      SELECT 'news'::text AS "contentType", n.id::text AS "contentId", n.item_status::text AS "itemStatus", nl.locale::text AS locale, nl.publication_status::text AS "publicationStatus", n.updated_at AS "itemUpdatedAt", nl.updated_at AS "localeUpdatedAt", nl.title AS title, ('/admin/news/' || n.id::text) AS "adminHref"
      FROM news n INNER JOIN news_locales nl ON nl.news_id = n.id
      UNION ALL
      SELECT 'notices'::text, n.id::text, n.item_status::text, nl.locale::text, nl.publication_status::text, n.updated_at, nl.updated_at, nl.title, ('/admin/notices/' || n.id::text)
      FROM notices n INNER JOIN notice_locales nl ON nl.notice_id = n.id
      UNION ALL
      SELECT 'popup-notices'::text, p.id::text, p.item_status::text, pl.locale::text, pl.publication_status::text, p.updated_at, pl.updated_at, pl.title, ('/admin/popup-notices/' || p.id::text)
      FROM popup_notices p INNER JOIN popup_notice_locales pl ON pl.popup_notice_id = p.id
      UNION ALL
      SELECT 'honors'::text, h.id::text, h.item_status::text, hl.locale::text, hl.publication_status::text, h.updated_at, hl.updated_at, hl.title, '/admin/honors'
      FROM honors h INNER JOIN honor_locales hl ON hl.honor_id = h.id
    )
    SELECT "contentType", "contentId", "itemStatus", locale, "publicationStatus", "itemUpdatedAt", "localeUpdatedAt", title, "adminHref"
    FROM content_items
  `)) as unknown as DashboardRow[];

  return buildAdminDashboardData(rows);
}
