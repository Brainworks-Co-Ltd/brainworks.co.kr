import { sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import {
  displayPublicationState,
  type StoredPublicationStatus,
} from "@/lib/publication-state";

export const dashboardContentTypes = [
  "news",
  "notices",
  "popup-notices",
  "honors",
  "ai-solutions",
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
  /** 공지와 팝업만 채운다. 표시 상태 계산에 쓴다. */
  publishStartsAt?: string | Date | null;
  publishEndsAt?: string | Date | null;
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
  notices: ["DRAFT", "SCHEDULED", "LIVE", "ENDED", "UNPUBLISHED"],
  "popup-notices": ["DRAFT", "SCHEDULED", "LIVE", "ENDED", "UNPUBLISHED"],
  honors: ["DRAFT", "PUBLISHED", "HIDDEN"],
  "ai-solutions": ["DRAFT", "PUBLISHED", "HIDDEN"],
};

const windowedContentTypes = new Set<DashboardContentType>([
  "notices",
  "popup-notices",
]);

/** 공지와 팝업은 관리자 목록과 같은 표시 상태(게시 예약, 게시 중, 게시 종료)로 센다. */
function withDisplayStatus(row: DashboardRow, now: Date): DashboardRow {
  if (!windowedContentTypes.has(row.contentType)) return row;
  return {
    ...row,
    publicationStatus: displayPublicationState(
      row.publicationStatus as StoredPublicationStatus,
      row.publishStartsAt,
      row.publishEndsAt,
      now,
    ),
  };
}

const ATTENTION_STATUSES = new Set(["DRAFT", "HIDDEN", "UNPUBLISHED"]);

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

function sortByTimeDesc<T extends { localeUpdatedAt: string | Date }>(
  items: T[],
): T[] {
  return items
    .map((item) => ({ item, time: toTime(item.localeUpdatedAt) }))
    .sort((a, b) => b.time - a.time)
    .map(({ item }) => item);
}

export function buildAdminDashboardData(
  input: DashboardRow[],
  now: Date = new Date(),
): AdminDashboardData {
  const rows = input.map((row) => withDisplayStatus(row, now));
  const rowsByContentType = new Map<DashboardContentType, DashboardRow[]>();
  for (const row of rows) {
    const bucket = rowsByContentType.get(row.contentType);
    if (bucket) {
      bucket.push(row);
    } else {
      rowsByContentType.set(row.contentType, [row]);
    }
  }

  const summary = dashboardContentTypes.map((contentType) => {
    const contentRows = rowsByContentType.get(contentType) ?? [];
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

    let activeCount = 0;
    let archivedCount = 0;
    for (const status of itemStatuses.values()) {
      if (status === "ACTIVE") {
        activeCount += 1;
      } else if (status === "ARCHIVED") {
        archivedCount += 1;
      }
    }

    return {
      contentType,
      activeCount,
      archivedCount,
      locales,
    };
  });

  const attentionRows = rows.filter(
    (row) =>
      row.itemStatus === "ACTIVE" && ATTENTION_STATUSES.has(row.publicationStatus),
  );
  const attention = sortByTimeDesc(attentionRows)
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
  const recent = sortByTimeDesc([...latestByContent.values()])
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
      SELECT 'news'::text AS "contentType", n.id::text AS "contentId", n.item_status::text AS "itemStatus", nl.locale::text AS locale, nl.publication_status::text AS "publicationStatus", n.updated_at AS "itemUpdatedAt", nl.updated_at AS "localeUpdatedAt", nl.title AS title, ('/admin/news/' || n.id::text) AS "adminHref", NULL::timestamptz AS "publishStartsAt", NULL::timestamptz AS "publishEndsAt"
      FROM news n INNER JOIN news_locales nl ON nl.news_id = n.id
      UNION ALL
      SELECT 'notices'::text, n.id::text, n.item_status::text, nl.locale::text, nl.publication_status::text, n.updated_at, nl.updated_at, nl.title, ('/admin/notices/' || n.id::text), nl.publish_starts_at, nl.publish_ends_at
      FROM notices n INNER JOIN notice_locales nl ON nl.notice_id = n.id
      UNION ALL
      SELECT 'popup-notices'::text, p.id::text, p.item_status::text, pl.locale::text, pl.publication_status::text, p.updated_at, pl.updated_at, pl.title, ('/admin/popup-notices/' || p.id::text), pl.publish_starts_at, pl.publish_ends_at
      FROM popup_notices p INNER JOIN popup_notice_locales pl ON pl.popup_notice_id = p.id
      UNION ALL
      SELECT 'honors'::text, h.id::text, h.item_status::text, hl.locale::text, hl.publication_status::text, h.updated_at, hl.updated_at, hl.title, ('/admin/honors/' || h.id::text), NULL::timestamptz, NULL::timestamptz
      FROM honors h INNER JOIN honor_locales hl ON hl.honor_id = h.id
      UNION ALL
      SELECT 'ai-solutions'::text, s.id::text, s.item_status::text, sl.locale::text, sl.publication_status::text, s.updated_at, sl.updated_at, sl.name, ('/admin/ai-solutions/' || s.id::text), NULL::timestamptz, NULL::timestamptz
      FROM ai_solutions s INNER JOIN ai_solution_locales sl ON sl.ai_solution_id = s.id
    )
    SELECT "contentType", "contentId", "itemStatus", locale, "publicationStatus", "itemUpdatedAt", "localeUpdatedAt", title, "adminHref", "publishStartsAt", "publishEndsAt"
    FROM content_items
  `)) as unknown as DashboardRow[];

  return buildAdminDashboardData(rows);
}
