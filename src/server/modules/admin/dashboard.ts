import { readdir, stat, statfs } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import {
  BACKUP_MAX_AGE_HOURS,
  DISK_WARNING_RATIO,
  POPUP_LIMIT,
  RECENT_LIMIT,
  STALE_DRAFT_DAYS,
  UPCOMING_DAYS,
} from "@/lib/admin-dashboard";
import {
  displayPublicationState,
  type StoredPublicationStatus,
} from "@/lib/publication-state";

/*
 * 운영 현황은 로그인하자마자 오늘 손댈 일이 있는지 알려 주는 화면이다.
 * 위에서부터 문제 경고, 지금 홈페이지에 보이는 것, 7일 안에 바뀌는 것,
 * 한 언어만 게시된 항목, 작성 중인 초안, 최근 변경 순으로 보여 준다.
 * 계산은 buildAdminDashboardData 하나가 맡고, DB와 서버 상태 읽기는
 * getAdminDashboardData가 맡는다.
 */

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

/** 언어별 공개 상태. 공지와 팝업은 게시 기간을 반영한다. */
export type DashboardState =
  | "DRAFT"
  | "SCHEDULED"
  | "LIVE"
  | "ENDED"
  | "HIDDEN"
  | "UNPUBLISHED";

export type DashboardRow = {
  contentType: DashboardContentType;
  contentId: string;
  itemStatus: DashboardItemStatus;
  locale: DashboardLocale;
  /** DB에 저장된 언어별 상태 */
  publicationStatus: string;
  localeUpdatedAt: string | Date;
  title: string;
  adminHref: string;
  /** 공지와 팝업만 채운다 */
  publishStartsAt?: string | Date | null;
  publishEndsAt?: string | Date | null;
  /** 공지만 채운다 */
  isPinned?: boolean | null;
  /** 뉴스만 채운다 */
  hasCover?: boolean | null;
  /** 이 언어를 마지막으로 고친 관리자 */
  actorName?: string | null;
};

export type DashboardSignals = {
  /** 최근 7일 메일 발송에 실패한 문의 */
  contactFailures: { count: number; latestAt: string | null };
  /** 서버 백업과 디스크. 운영 서버에서만 확인한다. */
  server: {
    checked: boolean;
    latestBackupAt: string | null;
    diskUsedRatio: number | null;
  };
};

export type DashboardWarning = {
  kind: "contact" | "backup" | "disk";
  message: string;
};

export type LivePopup = {
  contentId: string;
  title: string;
  adminHref: string;
  endsAt: string | null;
  daysLeft: number | null;
};

export type PinnedNotice = {
  contentId: string;
  title: string;
  adminHref: string;
  locales: DashboardLocale[];
};

export type UpcomingChange = {
  id: string;
  contentType: "notices" | "popup-notices";
  title: string;
  locale: DashboardLocale;
  adminHref: string;
  change: "start" | "end";
  at: string;
  daysLeft: number;
};

export type OneLanguageItem = {
  contentId: string;
  contentType: DashboardContentType;
  title: string;
  adminHref: string;
  publicLocale: DashboardLocale;
  /** 공개 쪽 언어가 지금 게시 중인지, 게시 예약인지 */
  publicState: "LIVE" | "SCHEDULED";
  otherState: DashboardState;
  otherHasTitle: boolean;
  updatedAt: string;
};

export type DraftItem = {
  contentId: string;
  contentType: DashboardContentType;
  title: string;
  adminHref: string;
  locales: DashboardLocale[];
  updatedAt: string;
  stale: boolean;
};

export type RecentItem = {
  contentId: string;
  contentType: DashboardContentType;
  title: string;
  adminHref: string;
  locale: DashboardLocale;
  state: DashboardState;
  archived: boolean;
  updatedAt: string;
  actorName: string | null;
};

export type AdminDashboardData = {
  warnings: DashboardWarning[];
  live: {
    popupLimit: number;
    popups: Record<DashboardLocale, LivePopup[]>;
    pinnedNotices: PinnedNotice[];
  };
  upcoming: UpcomingChange[];
  oneLanguage: OneLanguageItem[];
  drafts: DraftItem[];
  newsWithoutCover: { contentId: string; title: string; adminHref: string }[];
  recent: RecentItem[];
};


const DAY_MS = 24 * 60 * 60 * 1000;
const windowedContentTypes = new Set<DashboardContentType>([
  "notices",
  "popup-notices",
]);

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function toIso(value: string | Date) {
  return toDate(value).toISOString();
}

function titleOf(row: DashboardRow) {
  return row.title.trim();
}

/** 서울 달력으로 며칠 남았는지 센다. 오늘이면 0, 내일이면 1이다. 한국은 일광 절약 시간이 없어 +9시간 고정으로 충분하다. */
const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;
function seoulDay(value: Date) {
  return Math.floor((value.getTime() + SEOUL_OFFSET_MS) / DAY_MS);
}
function daysUntil(at: Date, now: Date) {
  return Math.max(0, seoulDay(at) - seoulDay(now));
}

export function dashboardState(row: DashboardRow, now: Date): DashboardState {
  if (windowedContentTypes.has(row.contentType)) {
    return displayPublicationState(
      row.publicationStatus as StoredPublicationStatus,
      row.publishStartsAt,
      row.publishEndsAt,
      now,
    );
  }
  if (row.publicationStatus === "PUBLISHED") return "LIVE";
  if (row.publicationStatus === "HIDDEN") return "HIDDEN";
  if (row.publicationStatus === "UNPUBLISHED") return "UNPUBLISHED";
  return "DRAFT";
}

/** 공개 중이거나 공개가 예약된 언어. 한 언어만 게시 판정과 초안 판정에 쓴다. */
function isPublicOrScheduled(state: DashboardState) {
  return state === "LIVE" || state === "SCHEDULED";
}

type Enriched = DashboardRow & { state: DashboardState; updated: Date };

function groupByContent(rows: Enriched[]) {
  const groups = new Map<string, Enriched[]>();
  for (const row of rows) {
    const key = `${row.contentType}:${row.contentId}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(row);
    else groups.set(key, [row]);
  }
  return [...groups.values()];
}

function latestRow(rows: Enriched[]) {
  return rows.reduce((latest, row) =>
    row.updated > latest.updated ? row : latest,
  );
}

/** 국문 제목을 먼저, 없으면 영문 제목을 쓴다. */
function preferredTitle(rows: Enriched[]) {
  const ko = rows.find((row) => row.locale === "ko" && titleOf(row));
  const en = rows.find((row) => row.locale === "en" && titleOf(row));
  return titleOf(ko ?? en ?? rows[0]) || "제목 없음";
}

function buildWarnings(signals: DashboardSignals, now: Date): DashboardWarning[] {
  const warnings: DashboardWarning[] = [];
  if (signals.contactFailures.count > 0) {
    warnings.push({
      kind: "contact",
      message: `최근 7일 동안 문의 ${signals.contactFailures.count}건이 메일로 전달되지 않았습니다. 문의 내용은 저장하지 않아서 되살릴 수 없으니 메일 설정을 먼저 확인해 주세요.`,
    });
  }
  if (signals.server.checked) {
    const latest = signals.server.latestBackupAt
      ? new Date(signals.server.latestBackupAt)
      : null;
    if (!latest) {
      warnings.push({
        kind: "backup",
        message: "서버에서 DB 백업 파일을 찾지 못했습니다. 백업 작업이 돌고 있는지 확인해 주세요.",
      });
    } else {
      const hours = (now.getTime() - latest.getTime()) / (60 * 60 * 1000);
      if (hours > BACKUP_MAX_AGE_HOURS) {
        warnings.push({
          kind: "backup",
          message: `마지막 DB 백업이 ${Math.floor(hours)}시간 전입니다. 백업은 6시간마다 돌아야 합니다.`,
        });
      }
    }
    const ratio = signals.server.diskUsedRatio;
    if (ratio !== null && ratio >= DISK_WARNING_RATIO) {
      warnings.push({
        kind: "disk",
        message: `서버 디스크를 ${Math.round(ratio * 100)}% 쓰고 있습니다. 업로드 이미지와 백업이 같은 디스크에 쌓입니다.`,
      });
    }
  }
  return warnings;
}

export const emptySignals: DashboardSignals = {
  contactFailures: { count: 0, latestAt: null },
  server: { checked: false, latestBackupAt: null, diskUsedRatio: null },
};

export function buildAdminDashboardData(
  input: DashboardRow[],
  now: Date = new Date(),
  signals: DashboardSignals = emptySignals,
): AdminDashboardData {
  const rows: Enriched[] = input.map((row) => ({
    ...row,
    state: dashboardState(row, now),
    updated: toDate(row.localeUpdatedAt),
  }));
  const active = rows.filter((row) => row.itemStatus === "ACTIVE");
  const activeGroups = groupByContent(active);

  // 1. 지금 홈페이지에 보이는 것
  const popups: Record<DashboardLocale, LivePopup[]> = { ko: [], en: [] };
  for (const row of active) {
    if (row.contentType !== "popup-notices" || row.state !== "LIVE") continue;
    const endsAt = row.publishEndsAt ? toDate(row.publishEndsAt) : null;
    popups[row.locale].push({
      contentId: row.contentId,
      title: titleOf(row) || "제목 없음",
      adminHref: row.adminHref,
      endsAt: endsAt ? endsAt.toISOString() : null,
      daysLeft: endsAt ? daysUntil(endsAt, now) : null,
    });
  }
  for (const locale of ["ko", "en"] as const) {
    // 곧 끝나는 팝업을 위에. 종료일이 없으면 맨 아래.
    popups[locale].sort(
      (a, b) =>
        (a.endsAt ? Date.parse(a.endsAt) : Infinity) -
        (b.endsAt ? Date.parse(b.endsAt) : Infinity),
    );
  }

  const pinnedNotices: PinnedNotice[] = activeGroups
    .filter((group) => group[0].contentType === "notices" && group[0].isPinned)
    .map((group) => ({
      group,
      locales: group
        .filter((row) => row.state === "LIVE")
        .map((row) => row.locale)
        .sort(),
    }))
    .filter(({ locales }) => locales.length > 0)
    .map(({ group, locales }) => ({
      contentId: group[0].contentId,
      title: preferredTitle(group),
      adminHref: group[0].adminHref,
      locales,
    }));

  // 2. 7일 안에 바뀌는 것
  const horizon = now.getTime() + UPCOMING_DAYS * DAY_MS;
  const upcoming: UpcomingChange[] = [];
  for (const row of active) {
    if (!windowedContentTypes.has(row.contentType)) continue;
    const contentType = row.contentType as UpcomingChange["contentType"];
    const startsAt = row.publishStartsAt ? toDate(row.publishStartsAt) : null;
    const endsAt = row.publishEndsAt ? toDate(row.publishEndsAt) : null;
    if (row.state === "SCHEDULED" && startsAt && startsAt.getTime() <= horizon) {
      upcoming.push({
        id: `${row.contentId}:${row.locale}:start`,
        contentType,
        title: titleOf(row) || "제목 없음",
        locale: row.locale,
        adminHref: row.adminHref,
        change: "start",
        at: startsAt.toISOString(),
        daysLeft: daysUntil(startsAt, now),
      });
    }
    // 예약된 항목도 7일 안에 끝나면 종료를 같이 보여 준다.
    if (
      isPublicOrScheduled(row.state) &&
      endsAt &&
      endsAt.getTime() <= horizon
    ) {
      upcoming.push({
        id: `${row.contentId}:${row.locale}:end`,
        contentType,
        title: titleOf(row) || "제목 없음",
        locale: row.locale,
        adminHref: row.adminHref,
        change: "end",
        at: endsAt.toISOString(),
        daysLeft: daysUntil(endsAt, now),
      });
    }
  }
  upcoming.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

  // 3. 한 언어만 게시된 항목
  const oneLanguage: OneLanguageItem[] = [];
  for (const group of activeGroups) {
    const publicRows = group.filter((row) => isPublicOrScheduled(row.state));
    if (publicRows.length !== 1) continue;
    const publicRow = publicRows[0];
    const other = group.find((row) => row.locale !== publicRow.locale);
    oneLanguage.push({
      contentId: publicRow.contentId,
      contentType: publicRow.contentType,
      title: titleOf(publicRow) || "제목 없음",
      adminHref: publicRow.adminHref,
      publicLocale: publicRow.locale,
      publicState: publicRow.state === "SCHEDULED" ? "SCHEDULED" : "LIVE",
      otherState: other?.state ?? "DRAFT",
      otherHasTitle: Boolean(other && titleOf(other)),
      updatedAt: latestRow(group).updated.toISOString(),
    });
  }
  oneLanguage.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  // 4. 작성 중인 초안. 모든 언어가 초안이고 제목이 하나라도 있는 항목만 센다.
  // 숨김, 게시 중단, 게시 종료가 섞인 항목은 일부러 내린 글이라 초안으로 보지 않는다.
  // 보관했다가 복원한 글은 모든 언어가 초안으로 돌아가므로 여기에 다시 들어온다.
  const staleBefore = now.getTime() - STALE_DRAFT_DAYS * DAY_MS;
  const drafts: DraftItem[] = activeGroups
    .filter(
      (group) =>
        group.every((row) => row.state === "DRAFT") &&
        group.some((row) => titleOf(row)),
    )
    .map((group) => {
      const updated = latestRow(group).updated;
      return {
        contentId: group[0].contentId,
        contentType: group[0].contentType,
        title: preferredTitle(group),
        adminHref: group[0].adminHref,
        locales: group
          .filter((row) => row.state === "DRAFT" && titleOf(row))
          .map((row) => row.locale)
          .sort(),
        updatedAt: updated.toISOString(),
        stale: updated.getTime() < staleBefore,
      };
    })
    // 오래 방치된 초안이 묻히지 않게 오래된 순으로 둔다.
    .sort((a, b) => Date.parse(a.updatedAt) - Date.parse(b.updatedAt));

  const newsWithoutCover = activeGroups
    .filter(
      (group) =>
        group[0].contentType === "news" &&
        group[0].hasCover === false &&
        group.some((row) => row.state === "LIVE"),
    )
    .map((group) => ({
      contentId: group[0].contentId,
      title: preferredTitle(group),
      adminHref: group[0].adminHref,
    }));

  // 6. 최근 변경. 보관한 항목도 포함한다.
  const recent: RecentItem[] = groupByContent(rows)
    .map(latestRow)
    .sort((a, b) => b.updated.getTime() - a.updated.getTime())
    .slice(0, RECENT_LIMIT)
    .map((row) => ({
      contentId: row.contentId,
      contentType: row.contentType,
      title: titleOf(row) || "제목 없음",
      adminHref: row.adminHref,
      locale: row.locale,
      state: row.state,
      archived: row.itemStatus === "ARCHIVED",
      updatedAt: toIso(row.updated),
      actorName: row.actorName ?? null,
    }));

  return {
    warnings: buildWarnings(signals, now),
    live: { popupLimit: POPUP_LIMIT, popups, pinnedNotices },
    upcoming,
    oneLanguage,
    drafts,
    newsWithoutCover,
    recent,
  };
}

async function readContactFailures(): Promise<DashboardSignals["contactFailures"]> {
  const [row] = (await getDb().execute(sql`
    SELECT count(*)::int AS count, max(created_at) AS "latestAt"
    FROM contact_submission_receipts
    WHERE processing_status = 'FAILED' AND created_at > now() - interval '7 days'
  `)) as unknown as { count: number; latestAt: string | Date | null }[];
  return {
    count: Number(row?.count ?? 0),
    latestAt: row?.latestAt ? toIso(row.latestAt) : null,
  };
}

/**
 * 운영 서버에서만 백업과 디스크를 본다. 백업은 cron이 BACKUP_DIR(기본
 * /var/lib/brainworks/backups)에 brainworks-*.dump로 남긴다.
 * 읽기에 실패해도 운영 현황은 떠야 하므로 오류는 삼키고 확인 못 함으로 둔다.
 */
async function readServerSignals(): Promise<DashboardSignals["server"]> {
  if (process.env.NODE_ENV !== "production") return emptySignals.server;
  const backupDir = process.env.BACKUP_DIR || "/var/lib/brainworks/backups";
  let latestBackupAt: string | null = null;
  try {
    // pg_dump는 접속 전에 출력 파일부터 만들어서 실패해도 .dump가 남는다.
    // 백업 스크립트는 성공한 뒤에만 .sha256을 쓰므로 짝이 있는 덤프만 센다.
    const all = await readdir(backupDir);
    const names = all.filter(
      (name) =>
        name.startsWith("brainworks-") &&
        name.endsWith(".dump") &&
        all.includes(`${name}.sha256`),
    );
    const times = await Promise.all(
      names.map(async (name) => (await stat(path.join(backupDir, name))).mtimeMs),
    );
    if (times.length) latestBackupAt = new Date(Math.max(...times)).toISOString();
  } catch {
    latestBackupAt = null;
  }
  let diskUsedRatio: number | null = null;
  try {
    const disk = await statfs(backupDir);
    if (disk.blocks > 0) diskUsedRatio = 1 - disk.bavail / disk.blocks;
  } catch {
    diskUsedRatio = null;
  }
  return { checked: true, latestBackupAt, diskUsedRatio };
}

export async function getAdminDashboardData(
  now: Date = new Date(),
): Promise<AdminDashboardData> {
  if (!process.env.DATABASE_URL) {
    return buildAdminDashboardData([], now);
  }

  const rowsPromise = getDb().execute(sql`
    WITH content_items AS (
      SELECT 'news'::text AS "contentType", n.id::text AS "contentId", n.item_status::text AS "itemStatus", nl.locale::text AS locale, nl.publication_status::text AS "publicationStatus", nl.updated_at AS "localeUpdatedAt", nl.title AS title, ('/admin/news/' || n.id::text) AS "adminHref", NULL::timestamptz AS "publishStartsAt", NULL::timestamptz AS "publishEndsAt", NULL::boolean AS "isPinned", (n.cover_asset_id IS NOT NULL) AS "hasCover", nl.updated_by_actor_id AS "actorId"
      FROM news n INNER JOIN news_locales nl ON nl.news_id = n.id
      UNION ALL
      SELECT 'notices'::text, n.id::text, n.item_status::text, nl.locale::text, nl.publication_status::text, nl.updated_at, nl.title, ('/admin/notices/' || n.id::text), nl.publish_starts_at, nl.publish_ends_at, n.is_pinned, NULL::boolean, nl.updated_by_actor_id
      FROM notices n INNER JOIN notice_locales nl ON nl.notice_id = n.id
      UNION ALL
      SELECT 'popup-notices'::text, p.id::text, p.item_status::text, pl.locale::text, pl.publication_status::text, pl.updated_at, pl.title, ('/admin/popup-notices/' || p.id::text), pl.publish_starts_at, pl.publish_ends_at, NULL::boolean, NULL::boolean, pl.updated_by_actor_id
      FROM popup_notices p INNER JOIN popup_notice_locales pl ON pl.popup_notice_id = p.id
      UNION ALL
      SELECT 'honors'::text, h.id::text, h.item_status::text, hl.locale::text, hl.publication_status::text, hl.updated_at, hl.title, ('/admin/honors/' || h.id::text), NULL::timestamptz, NULL::timestamptz, NULL::boolean, NULL::boolean, hl.updated_by_actor_id
      FROM honors h INNER JOIN honor_locales hl ON hl.honor_id = h.id
      UNION ALL
      SELECT 'ai-solutions'::text, s.id::text, s.item_status::text, sl.locale::text, sl.publication_status::text, sl.updated_at, sl.name, ('/admin/ai-solutions/' || s.id::text), NULL::timestamptz, NULL::timestamptz, NULL::boolean, NULL::boolean, sl.updated_by_actor_id
      FROM ai_solutions s INNER JOIN ai_solution_locales sl ON sl.ai_solution_id = s.id
    )
    SELECT c."contentType", c."contentId", c."itemStatus", c.locale, c."publicationStatus", c."localeUpdatedAt", c.title, c."adminHref", c."publishStartsAt", c."publishEndsAt", c."isPinned", c."hasCover",
      -- audit_actors.display_name은 모든 관리자가 "관리자"로 들어가 있어 계정 이름을 먼저 쓴다.
      COALESCE(NULLIF(acc.name, ''), acc.email, a.display_name) AS "actorName"
    FROM content_items c
    LEFT JOIN audit_actors a ON a.id = c."actorId"
    LEFT JOIN admin_accounts acc ON acc.id = a.admin_account_id
  `) as unknown as Promise<DashboardRow[]>;

  const [rows, contactFailures, server] = await Promise.all([
    rowsPromise,
    readContactFailures(),
    readServerSignals(),
  ]);

  return buildAdminDashboardData(rows, now, { contactFailures, server });
}
