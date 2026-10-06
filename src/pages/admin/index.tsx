import Link from "next/link";
import type { GetServerSideProps } from "next";
import type { ReactNode } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  cardClass,
  primaryButtonClass,
  secondaryButtonClass,
  StatusBadge,
} from "@/components/admin/fields";
import { requireAdminPage } from "@/server/auth/require-admin";
import { STALE_DRAFT_DAYS, UPCOMING_DAYS } from "@/lib/admin-dashboard";
import {
  getAdminDashboardData,
  type AdminDashboardData,
  type DashboardContentType,
  type DashboardLocale,
  type DashboardState,
} from "@/server/modules/admin/dashboard";

const contentLabels: Record<DashboardContentType, string> = {
  news: "뉴스",
  notices: "공지사항",
  "popup-notices": "팝업 공지",
  honors: "수상 및 인증",
  "ai-solutions": "AI 솔루션",
};

const localeLabels: Record<DashboardLocale, string> = { ko: "국문", en: "영문" };

const stateLabels: Record<DashboardState, string> = {
  DRAFT: "초안",
  SCHEDULED: "게시 예약",
  LIVE: "게시 중",
  ENDED: "게시 종료",
  HIDDEN: "숨김",
  UNPUBLISHED: "게시 중단",
};

// 서버와 브라우저가 같은 글자를 그리도록 시간대를 고정한다.
const dateTimeFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatDateTime(value: string) {
  return dateTimeFormat.format(new Date(value));
}

function formatDate(value: string) {
  return dateFormat.format(new Date(value));
}

function dayText(daysLeft: number) {
  if (daysLeft <= 0) return "오늘";
  if (daysLeft === 1) return "내일";
  return `${daysLeft}일 뒤`;
}

function Panel({
  id,
  title,
  description,
  children,
  className = "",
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={`${cardClass} min-w-0 ${className}`}>
      <h2 id={id} className="text-lg font-semibold tracking-[-0.02em]">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}

function ItemLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block min-w-0 truncate font-semibold underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}

function Warnings({ warnings }: { warnings: AdminDashboardData["warnings"] }) {
  if (!warnings.length) return null;
  return (
    <section
      aria-labelledby="warnings-heading"
      className="mt-8 rounded-[var(--bw-radius-card)] border-2 border-red-600 bg-red-50 p-5"
    >
      <h2 id="warnings-heading" className="font-semibold text-red-800">
        바로 확인해야 할 문제
      </h2>
      <ul className="mt-2 grid gap-2 text-sm leading-6 text-red-900">
        {warnings.map((warning) => (
          <li key={warning.kind}>{warning.message}</li>
        ))}
      </ul>
    </section>
  );
}

function LiveNow({ live }: { live: AdminDashboardData["live"] }) {
  return (
    <Panel
      id="live-heading"
      title="지금 홈페이지에 보이는 것"
      description="방문자가 지금 보는 팝업과 상단 고정 공지입니다."
    >
      <div className="grid gap-5">
        {(["ko", "en"] as const).map((locale) => {
          const popups = live.popups[locale];
          const full = popups.length >= live.popupLimit;
          return (
            <div key={locale}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">
                  {localeLabels[locale]} 팝업
                </h3>
                <span
                  className={`text-xs font-semibold ${full ? "text-red-700" : "text-slate-500"}`}
                >
                  {popups.length}/{live.popupLimit}
                  {full ? " 자리 없음" : ""}
                </span>
              </div>
              {popups.length ? (
                <ul className="mt-2 divide-y divide-[var(--bw-color-line)] border-y border-[var(--bw-color-line)]">
                  {popups.map((popup) => (
                    <li
                      key={popup.contentId}
                      className="flex items-center justify-between gap-3 py-2.5 text-sm"
                    >
                      <ItemLink href={popup.adminHref}>{popup.title}</ItemLink>
                      <span className="shrink-0 text-xs text-slate-500">
                        {popup.endsAt
                          ? `${formatDateTime(popup.endsAt)} 종료`
                          : "종료일 없음"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-2">
                  <Empty>노출 중인 팝업이 없습니다.</Empty>
                </div>
              )}
            </div>
          );
        })}
        <div>
          <h3 className="text-sm font-semibold">상단 고정 공지</h3>
          {live.pinnedNotices.length ? (
            <ul className="mt-2 divide-y divide-[var(--bw-color-line)] border-y border-[var(--bw-color-line)]">
              {live.pinnedNotices.map((notice) => (
                <li
                  key={notice.contentId}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <ItemLink href={notice.adminHref}>{notice.title}</ItemLink>
                  <span className="shrink-0 text-xs text-slate-500">
                    {notice.locales.map((locale) => localeLabels[locale]).join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-2">
              <Empty>고정된 공지가 없습니다.</Empty>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

function Upcoming({ items }: { items: AdminDashboardData["upcoming"] }) {
  return (
    <Panel
      id="upcoming-heading"
      title={`${UPCOMING_DAYS}일 안에 바뀌는 것`}
      description="게시가 시작되거나 끝나는 공지와 팝업입니다. 날짜를 바꾸려면 편집 화면에서 저장합니다."
    >
      {items.length ? (
        <ul className="divide-y divide-[var(--bw-color-line)] border-y border-[var(--bw-color-line)]">
          {items.map((item) => (
            <li key={item.id} className="grid gap-1 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <StatusBadge
                  status={item.change === "start" ? "SCHEDULED" : "ENDED"}
                  label={item.change === "start" ? "게시 시작" : "게시 종료"}
                />
                <span>
                  {contentLabels[item.contentType]} {localeLabels[item.locale]}
                </span>
                <span>
                  {formatDateTime(item.at)}, {dayText(item.daysLeft)}
                </span>
              </div>
              <ItemLink href={item.adminHref}>{item.title}</ItemLink>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>{UPCOMING_DAYS}일 안에 시작하거나 끝나는 게시가 없습니다.</Empty>
      )}
    </Panel>
  );
}

function OneLanguage({ items }: { items: AdminDashboardData["oneLanguage"] }) {
  return (
    <Panel
      id="one-language-heading"
      title="한 언어만 게시된 항목"
      description="한쪽 언어로만 공개 중이거나 공개를 예약한 글입니다. 일부러 한 언어만 쓰는 글이면 그대로 두면 됩니다."
    >
      {items.length ? (
        <ul className="divide-y divide-[var(--bw-color-line)] border-y border-[var(--bw-color-line)]">
          {items.map((item) => {
            const other = item.publicLocale === "ko" ? "en" : "ko";
            return (
              <li
                key={`${item.contentType}:${item.contentId}`}
                className="flex flex-col gap-1.5 py-3 text-sm md:flex-row md:items-center md:justify-between md:gap-4"
              >
                <div className="grid min-w-0 gap-1">
                  <span className="text-xs text-slate-500">
                    {contentLabels[item.contentType]}
                  </span>
                  <ItemLink href={item.adminHref}>{item.title}</ItemLink>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    {localeLabels[item.publicLocale]}
                    <StatusBadge status={item.publicState} label={stateLabels[item.publicState]} />
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    {localeLabels[other]}
                    <StatusBadge
                      status={item.otherState}
                      label={
                        item.otherState === "DRAFT" && !item.otherHasTitle
                          ? "비어 있음"
                          : stateLabels[item.otherState]
                      }
                    />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty>모든 게시물이 두 언어로 공개되어 있습니다.</Empty>
      )}
    </Panel>
  );
}

function Drafts({
  drafts,
  newsWithoutCover,
}: {
  drafts: AdminDashboardData["drafts"];
  newsWithoutCover: AdminDashboardData["newsWithoutCover"];
}) {
  return (
    <Panel
      id="drafts-heading"
      title="작성 중인 초안"
      description={`모든 언어가 초안인 글입니다. 오래된 순으로 놓았고, ${STALE_DRAFT_DAYS}일 넘게 그대로인 글에 표시를 붙였습니다.`}
    >
      {drafts.length ? (
        <ul className="divide-y divide-[var(--bw-color-line)] border-y border-[var(--bw-color-line)]">
          {drafts.map((draft) => (
            <li
              key={`${draft.contentType}:${draft.contentId}`}
              className="flex flex-col gap-1.5 py-3 text-sm md:flex-row md:items-center md:justify-between md:gap-4"
            >
              <div className="grid min-w-0 gap-1">
                <span className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {contentLabels[draft.contentType]}
                  <span>
                    {draft.locales.map((locale) => localeLabels[locale]).join(", ")} 작성 중
                  </span>
                  {draft.stale ? (
                    <StatusBadge status="DRAFT" label={`${STALE_DRAFT_DAYS}일 넘게 그대로`} />
                  ) : null}
                </span>
                <ItemLink href={draft.adminHref}>{draft.title}</ItemLink>
              </div>
              <span className="shrink-0 text-xs text-slate-500">
                {formatDate(draft.updatedAt)} 수정
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>작성 중인 초안이 없습니다.</Empty>
      )}
      {newsWithoutCover.length ? (
        <div className="mt-5">
          <h3 className="text-sm font-semibold">대표 이미지 없이 게시된 뉴스</h3>
          <p className="mt-1 text-xs text-slate-500">
            홈과 소식 목록에 이미지 대신 자리표시가 보입니다.
          </p>
          <ul className="mt-2 divide-y divide-[var(--bw-color-line)] border-y border-[var(--bw-color-line)]">
            {newsWithoutCover.map((news) => (
              <li key={news.contentId} className="py-2.5 text-sm">
                <ItemLink href={news.adminHref}>{news.title}</ItemLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  );
}

function Recent({ items }: { items: AdminDashboardData["recent"] }) {
  return (
    <Panel
      id="recent-heading"
      title="최근 변경"
      description="누가 언제 무엇을 고쳤는지 보여 줍니다."
      className="xl:col-span-2"
    >
      {items.length ? (
        <ul className="divide-y divide-[var(--bw-color-line)] border-y border-[var(--bw-color-line)]">
          {items.map((item) => (
            <li
              key={`${item.contentType}:${item.contentId}`}
              className="flex flex-col gap-1.5 py-3 text-sm md:flex-row md:items-center md:justify-between md:gap-4"
            >
              <div className="grid min-w-0 gap-1">
                <span className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {contentLabels[item.contentType]} {localeLabels[item.locale]}
                  {item.archived ? (
                    <StatusBadge status="ARCHIVED" label="보관" />
                  ) : (
                    <StatusBadge status={item.state} label={stateLabels[item.state]} />
                  )}
                </span>
                <ItemLink href={item.adminHref}>{item.title}</ItemLink>
              </div>
              <span className="shrink-0 text-xs text-slate-500">
                {item.actorName ? `${item.actorName}, ` : ""}
                {formatDateTime(item.updatedAt)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>아직 변경된 콘텐츠가 없습니다.</Empty>
      )}
    </Panel>
  );
}

export default function AdminHome({
  dashboard,
}: {
  dashboard: AdminDashboardData;
}) {
  return (
    <AdminShell>
      <AdminPageHeader
        title="운영 현황"
        description="지금 홈페이지에 보이는 것과 처리할 일을 모았습니다."
        action={
          <>
            <Link href="/admin/news/new" className={primaryButtonClass}>
              새 뉴스
            </Link>
            <Link href="/admin/notices/new" className={secondaryButtonClass}>
              새 공지
            </Link>
            <Link href="/admin/popup-notices/new" className={secondaryButtonClass}>
              새 팝업
            </Link>
          </>
        }
      />
      <Warnings warnings={dashboard.warnings} />
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <LiveNow live={dashboard.live} />
        <Upcoming items={dashboard.upcoming} />
        <OneLanguage items={dashboard.oneLanguage} />
        <Drafts drafts={dashboard.drafts} newsWithoutCover={dashboard.newsWithoutCover} />
        <Recent items={dashboard.recent} />
      </div>
    </AdminShell>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  return { props: { dashboard: await getAdminDashboardData() } };
};
