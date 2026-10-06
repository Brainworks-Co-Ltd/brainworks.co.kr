import Link from "next/link";
import type { GetServerSideProps } from "next";
import type { ReactNode } from "react";
import { CircleCheck, Inbox, TriangleAlert } from "lucide-react";
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

/** 받침이 있으면 "과", 없으면 "와". 한글이 아니면 "와"로 둔다. */
function withAnd(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return `${word}${code >= 0 && code < 11172 && code % 28 !== 0 ? "과" : "와"}`;
}

/** ["영문 팝업", "상단 고정 공지"] → "영문 팝업과 상단 고정 공지" */
function joinKorean(words: string[]) {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -2).map((word) => `${word}, `).join("")}${withAnd(words[words.length - 2])} ${words[words.length - 1]}`;
}

/*
 * 위계. 페이지 제목 > 열 제목(굵은 글자와 잉크 선) > 패널 제목(18px) >
 * 항목 제목(15px 잉크) > 보조 정보(13px 회색). 안내 문장은 13px 회색으로만 쓰고,
 * 비어 있다는 상태는 패널마다 콜아웃 하나로만 말한다.
 * 색은 이유가 있을 때만 쓴다. 할 일 건수는 잉크, 할 일이 없으면 초록, 경고는 빨강.
 */

/** 패널 제목 옆 건수. 0건이면 그리지 않는다(콜아웃이 말한다). */
function Count({ value, strong = false }: { value: number; strong?: boolean }) {
  if (!value) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums ${strong ? "bg-[var(--bw-color-ink)] text-white" : "bg-slate-100 text-[var(--bw-color-ink)]"}`}
    >
      {value}건
    </span>
  );
}

function Panel({
  id,
  title,
  count,
  note,
  children,
}: {
  id: string;
  title: string;
  count?: ReactNode;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={`${cardClass} min-w-0`}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 id={id} className="text-lg font-semibold tracking-[-0.02em]">
          {title}
        </h3>
        {count}
      </div>
      {note ? <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** 비어 있음, 할 일 없음 같은 상태 문장. 노션 콜아웃처럼 면과 아이콘으로 안내 문장과 구분한다. */
function Callout({
  tone = "empty",
  children,
}: {
  tone?: "empty" | "ok";
  children: ReactNode;
}) {
  const ok = tone === "ok";
  const Icon = ok ? CircleCheck : Inbox;
  return (
    <p
      className={`flex items-center gap-3 rounded-[var(--bw-radius-control)] px-4 py-3.5 text-[15px] font-semibold ${ok ? "bg-emerald-50 text-emerald-900" : "bg-slate-100 text-[var(--bw-color-ink)]"}`}
    >
      <Icon
        aria-hidden
        className={`size-5 shrink-0 ${ok ? "text-emerald-700" : "text-slate-500"}`}
      />
      {children}
    </p>
  );
}

/** 목록 한 줄. 보조 정보를 제목 바로 위에 붙여서 둘이 멀어지지 않게 한다. */
function Row({
  meta,
  href,
  title,
  badge,
}: {
  meta: ReactNode;
  href: string;
  title: string;
  badge?: ReactNode;
}) {
  return (
    <li className="grid gap-1 py-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        {meta}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href={href}
          title={title}
          className="block min-w-0 truncate text-[15px] font-medium text-[var(--bw-color-ink)] underline-offset-4 hover:underline"
        >
          {title}
        </Link>
        {badge ? <span className="shrink-0">{badge}</span> : null}
      </div>
    </li>
  );
}

const listClass =
  "divide-y divide-[var(--bw-color-line)] border-y border-[var(--bw-color-line)]";

function Warnings({ warnings }: { warnings: AdminDashboardData["warnings"] }) {
  if (!warnings.length) return null;
  return (
    <section
      aria-labelledby="warnings-heading"
      className="mt-8 rounded-[var(--bw-radius-card)] border-2 border-red-600 bg-red-50 p-5"
    >
      <h2
        id="warnings-heading"
        className="flex items-center gap-2 font-semibold text-red-800"
      >
        <TriangleAlert aria-hidden className="size-5" />
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

/** 팝업 자리. 칸 수가 곧 동시 노출 한도라서 숫자와 붙여 보여 준다. */
function Slots({ used, limit }: { used: number; limit: number }) {
  const full = used >= limit;
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className="flex gap-1">
        {Array.from({ length: limit }, (_, index) => (
          <span
            key={index}
            className={`h-2.5 w-4 rounded-sm ${index < used ? "bg-[var(--bw-color-ink)]" : "bg-white ring-1 ring-inset ring-slate-400"}`}
          />
        ))}
      </span>
      <span className="text-sm font-semibold tabular-nums text-[var(--bw-color-ink)]">
        <span aria-hidden>
          {used}/{limit}
        </span>
        <span className="sr-only">
          동시에 띄울 수 있는 {limit}개 중 {used}개
        </span>
      </span>
      {full ? <span className="text-sm font-semibold text-amber-800">가득 참</span> : null}
    </span>
  );
}

function Column({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="grid min-w-0 content-start gap-4">
      <h2
        id={id}
        className="border-b-2 border-[var(--bw-color-ink)] pb-2 text-base font-bold text-[var(--bw-color-ink)]"
      >
        {title}
      </h2>
      <div className="grid gap-6">{children}</div>
    </section>
  );
}

function LiveNow({ live }: { live: AdminDashboardData["live"] }) {
  const locales = (["ko", "en"] as const).filter((locale) => live.popups[locale].length);
  const missing = [
    ...(["ko", "en"] as const)
      .filter((locale) => !live.popups[locale].length)
      .map((locale) => `${localeLabels[locale]} 팝업`),
    ...(live.pinnedNotices.length ? [] : ["상단 고정 공지"]),
  ];
  const nothing = !locales.length && !live.pinnedNotices.length;
  return (
    <Panel id="live-heading" title="지금 홈페이지에 보이는 것">
      {nothing ? (
        <Callout>지금 홈페이지에 떠 있는 팝업과 고정 공지가 없습니다.</Callout>
      ) : (
        <div className="grid gap-5">
          {locales.map((locale) => {
            const popups = live.popups[locale];
            const full = popups.length >= live.popupLimit;
            return (
              <div key={locale}>
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="text-sm font-semibold text-slate-500">
                    {localeLabels[locale]} 팝업
                  </h4>
                  <Slots used={popups.length} limit={live.popupLimit} />
                </div>
                {full ? (
                  <p className="mt-1 text-xs text-amber-800">
                    {live.popupLimit}개까지 동시에 띄울 수 있어 새 팝업을 올리려면 하나를 내려야 합니다.
                  </p>
                ) : null}
                <ul className={`mt-2 ${listClass}`}>
                  {popups.map((popup) => (
                    <Row
                      key={popup.contentId}
                      href={popup.adminHref}
                      title={popup.title}
                      meta={
                        popup.endsAt
                          ? `${formatDateTime(popup.endsAt)} 종료`
                          : "내릴 때까지 노출"
                      }
                    />
                  ))}
                </ul>
              </div>
            );
          })}
          {/* 빠진 것은 콜아웃 하나로 모아 팝업 바로 아래, 고정 공지 위에 둔다. */}
          {missing.length ? (
            <Callout>
              {missing.length === 1 && missing[0] === "상단 고정 공지"
                ? "상단에 고정된 공지가 없습니다."
                : `${joinKorean(missing)}${missing[missing.length - 1] === "상단 고정 공지" ? "는" : "은"} 지금 없습니다.`}
            </Callout>
          ) : null}
          {live.pinnedNotices.length ? (
            <div>
              <h4 className="text-sm font-semibold text-slate-500">상단 고정 공지</h4>
              <ul className={`mt-2 ${listClass}`}>
                {live.pinnedNotices.map((notice) => (
                  <Row
                    key={notice.contentId}
                    href={notice.adminHref}
                    title={notice.title}
                    meta={`${notice.locales.map((locale) => localeLabels[locale]).join(", ")} 게시 중`}
                  />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </Panel>
  );
}

function Upcoming({ items }: { items: AdminDashboardData["upcoming"] }) {
  return (
    <Panel
      id="upcoming-heading"
      title={`${UPCOMING_DAYS}일 안에 바뀌는 공지와 팝업`}
      count={<Count value={items.length} />}
    >
      {items.length ? (
        <ul className={listClass}>
          {items.map((item) => (
            <Row
              key={item.id}
              href={item.adminHref}
              title={item.title}
              meta={
                <>
                  <span className="font-semibold text-[var(--bw-color-ink)]">
                    {dayText(item.daysLeft)} {item.change === "start" ? "시작" : "종료"}
                  </span>
                  <span>{formatDateTime(item.at)}</span>
                  <span>
                    {contentLabels[item.contentType]} {localeLabels[item.locale]}
                  </span>
                </>
              }
            />
          ))}
        </ul>
      ) : (
        <Callout>예정된 시작이나 종료가 없습니다.</Callout>
      )}
    </Panel>
  );
}

function OneLanguage({ items }: { items: AdminDashboardData["oneLanguage"] }) {
  return (
    <Panel
      id="one-language-heading"
      title="한 언어만 게시된 글"
      count={<Count value={items.length} strong />}
      note={items.length ? "일부러 한 언어만 쓰는 글은 그대로 둬도 됩니다." : undefined}
    >
      {items.length ? (
        <ul className={listClass}>
          {items.map((item) => {
            const other = item.publicLocale === "ko" ? "en" : "ko";
            const otherLabel =
              item.otherState === "DRAFT" && !item.otherHasTitle
                ? "비어 있음"
                : stateLabels[item.otherState];
            return (
              <Row
                key={`${item.contentType}:${item.contentId}`}
                href={item.adminHref}
                title={item.title}
                meta={`${contentLabels[item.contentType]} ${localeLabels[item.publicLocale]} ${stateLabels[item.publicState]}`}
                badge={
                  <StatusBadge status="DRAFT" label={`${localeLabels[other]} ${otherLabel}`} />
                }
              />
            );
          })}
        </ul>
      ) : (
        <Callout tone="ok">한 언어만 게시된 글이 없습니다.</Callout>
      )}
    </Panel>
  );
}

function Drafts({ drafts }: { drafts: AdminDashboardData["drafts"] }) {
  return (
    <Panel
      id="drafts-heading"
      title="작성 중인 초안"
      count={<Count value={drafts.length} strong />}
      note={drafts.length ? "오래 손대지 않은 초안이 위에 있습니다." : undefined}
    >
      {drafts.length ? (
        <ul className={listClass}>
          {drafts.map((draft) => (
            <Row
              key={`${draft.contentType}:${draft.contentId}`}
              href={draft.adminHref}
              title={draft.title}
              meta={
                <>
                  <span>
                    {contentLabels[draft.contentType]}{" "}
                    {draft.locales.map((locale) => localeLabels[locale]).join(", ")} 작성 중
                  </span>
                  <span
                    className={draft.stale ? "font-semibold text-amber-800" : undefined}
                  >
                    {formatDate(draft.updatedAt)} 수정
                    {draft.stale ? `, ${STALE_DRAFT_DAYS}일 넘게 손대지 않음` : ""}
                  </span>
                </>
              }
            />
          ))}
        </ul>
      ) : (
        <Callout tone="ok">작성 중인 초안이 없습니다.</Callout>
      )}
    </Panel>
  );
}

function NewsWithoutCover({ items }: { items: AdminDashboardData["newsWithoutCover"] }) {
  if (!items.length) return null;
  return (
    <Panel
      id="no-cover-heading"
      title="대표 이미지 없는 뉴스"
      count={<Count value={items.length} strong />}
      note="홈과 소식 목록에 사진 대신 '이미지 없음' 칸이 보입니다."
    >
      <ul className={listClass}>
        {items.map((news) => (
          <Row key={news.contentId} href={news.adminHref} title={news.title} meta="뉴스 게시 중" />
        ))}
      </ul>
    </Panel>
  );
}

function Todo({ dashboard }: { dashboard: AdminDashboardData }) {
  const total =
    dashboard.oneLanguage.length + dashboard.drafts.length + dashboard.newsWithoutCover.length;
  if (!total) return <Callout tone="ok">확인할 항목이 없습니다.</Callout>;
  return (
    <>
      <OneLanguage items={dashboard.oneLanguage} />
      <Drafts drafts={dashboard.drafts} />
      <NewsWithoutCover items={dashboard.newsWithoutCover} />
    </>
  );
}

function Recent({ items }: { items: AdminDashboardData["recent"] }) {
  return (
    <Column id="recent-heading" title="최근 변경">
      {items.length ? (
        <ul className={`${cardClass} ${listClass} border-x py-0`}>
          {items.map((item) => (
            <Row
              key={`${item.contentType}:${item.contentId}`}
              href={item.adminHref}
              title={item.title}
              meta={
                <>
                  {item.actorName ? (
                    <span className="font-semibold text-slate-700">{item.actorName}</span>
                  ) : null}
                  <span>{formatDateTime(item.updatedAt)}</span>
                  <span>
                    {contentLabels[item.contentType]} {localeLabels[item.locale]}
                  </span>
                </>
              }
              badge={
                item.archived ? (
                  <StatusBadge status="ARCHIVED" label="보관" />
                ) : (
                  <StatusBadge status={item.state} label={stateLabels[item.state]} />
                )
              }
            />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">아직 변경된 콘텐츠가 없습니다.</p>
      )}
    </Column>
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
      {/*
        왼쪽은 게시 현황, 오른쪽은 확인할 항목. 열마다 패널을 위아래로 쌓아서
        짧은 패널 옆에 빈칸이 생기지 않는다. 좁은 화면에서는 왼쪽 열이 먼저 온다.
      */}
      <div className="mt-8 grid items-start gap-8 xl:grid-cols-2">
        <Column id="status-column" title="게시 현황">
          <LiveNow live={dashboard.live} />
          <Upcoming items={dashboard.upcoming} />
        </Column>
        <Column id="todo-column" title="확인할 항목">
          <Todo dashboard={dashboard} />
        </Column>
      </div>
      <div className="mt-10">
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
