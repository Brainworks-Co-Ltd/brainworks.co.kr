import type { GetServerSideProps } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import {
  getAdminDashboardData,
  type AdminDashboardData,
  type DashboardContentType,
} from "@/server/modules/admin/dashboard";

const contentLabels: Record<DashboardContentType, string> = {
  news: "뉴스",
  notices: "공지사항",
  "popup-notices": "팝업 공지",
  honors: "수상 및 인증",
};

const statusLabels: Record<string, string> = {
  DRAFT: "임시저장",
  SCHEDULED: "예약 게시",
  PUBLISHED: "게시",
  HIDDEN: "숨김",
  UNPUBLISHED: "게시 중단",
};

const quickActions = [
  { label: "새 뉴스", href: "/admin/news/new", detail: "뉴스 작성" },
  {
    label: "새 공지사항",
    href: "/admin/notices/new",
    detail: "공지 작성",
  },
  {
    label: "새 팝업 공지",
    href: "/admin/popup-notices/new",
    detail: "홈 노출 공지 작성",
  },
  {
    label: "수상 및 인증 관리",
    href: "/admin/honors",
    detail: "목록과 공개 상태",
  },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function StatusCounts({ counts }: { counts: Record<string, number> }) {
  const visible = Object.entries(counts).filter(([, count]) => count > 0);
  if (!visible.length) {
    return <span className="text-sm text-[var(--bw-color-muted)]">없음</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {visible.map(([status, count]) => (
        <span
          key={status}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs"
        >
          <span className="text-[var(--bw-color-muted)]">
            {statusLabels[status] ?? status}
          </span>
          <strong>{count}</strong>
        </span>
      ))}
    </div>
  );
}

function WorkItem({ item }: { item: AdminDashboardData["attention"][number] }) {
  return (
    <li className="flex flex-col gap-2 border-b border-slate-200 py-4 last:border-b-0 md:flex-row md:items-center md:justify-between md:gap-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--bw-color-muted)]">
          <span>{contentLabels[item.contentType]}</span>
          <span>{item.locale === "ko" ? "한국어" : "English"}</span>
          <span className="rounded-full bg-[var(--bw-color-surface-muted)] px-2 py-0.5 text-[var(--bw-color-ink)]">
            {statusLabels[item.publicationStatus] ?? item.publicationStatus}
          </span>
        </div>
        <p className="mt-1 truncate font-semibold">{item.title}</p>
      </div>
      <div className="flex shrink-0 items-center gap-4 text-sm">
        <span className="text-[var(--bw-color-muted)]">
          {formatDate(item.updatedAt)}
        </span>
        <a
          href={item.adminHref}
          className="font-semibold underline-offset-4 hover:underline"
        >
          편집
        </a>
      </div>
    </li>
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
        description="게시 전 콘텐츠와 최근 변경을 확인하고 다음 작업으로 이동합니다."
      />
      <section className="mt-8" aria-labelledby="content-status-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="content-status-heading" className="text-xl font-semibold">
              콘텐츠 상태
            </h2>
            <p className="mt-1 text-sm text-[var(--bw-color-muted)]">
              활성 및 보관 항목과 언어별 게시 상태입니다.
            </p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-[760px] w-full text-left text-sm">
            <caption className="sr-only">콘텐츠 유형별 운영 상태</caption>
            <thead className="border-b border-slate-200 bg-[var(--bw-color-surface-muted)] text-xs text-[var(--bw-color-muted)]">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">
                  콘텐츠
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  항목
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  한국어
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  English
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dashboard.summary.map((item) => (
                <tr key={item.contentType}>
                  <th scope="row" className="px-5 py-4 font-semibold">
                    {contentLabels[item.contentType]}
                  </th>
                  <td className="px-5 py-4 text-[var(--bw-color-muted)]">
                    활성 {item.activeCount}, 보관 {item.archivedCount}
                  </td>
                  <td className="px-5 py-4">
                    <StatusCounts counts={item.locales.ko} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusCounts counts={item.locales.en} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section
          className="rounded-2xl border border-slate-200 bg-white px-5 md:px-6"
          aria-labelledby="attention-heading"
        >
          <div className="border-b border-slate-200 py-5">
            <h2 id="attention-heading" className="text-xl font-semibold">
              처리할 항목
            </h2>
            <p className="mt-1 text-sm text-[var(--bw-color-muted)]">
              임시저장 또는 게시 중단 상태인 콘텐츠입니다.
            </p>
          </div>
          {dashboard.attention.length ? (
            <ul>
              {dashboard.attention.map((item) => (
                <WorkItem key={item.id} item={item} />
              ))}
            </ul>
          ) : (
            <p className="py-8 text-sm text-[var(--bw-color-muted)]">
              지금 처리할 항목이 없습니다.
            </p>
          )}
        </section>

        <section
          className="rounded-2xl border border-slate-200 bg-white px-5 md:px-6"
          aria-labelledby="recent-heading"
        >
          <div className="border-b border-slate-200 py-5">
            <h2 id="recent-heading" className="text-xl font-semibold">
              최근 변경
            </h2>
            <p className="mt-1 text-sm text-[var(--bw-color-muted)]">
              가장 최근에 수정된 콘텐츠입니다.
            </p>
          </div>
          {dashboard.recent.length ? (
            <ul>
              {dashboard.recent.map((item) => (
                <WorkItem key={item.id} item={item} />
              ))}
            </ul>
          ) : (
            <p className="py-8 text-sm text-[var(--bw-color-muted)]">
              아직 변경된 콘텐츠가 없습니다.
            </p>
          )}
        </section>
      </div>

      <section className="mt-10" aria-labelledby="quick-actions-heading">
        <div>
          <h2 id="quick-actions-heading" className="text-xl font-semibold">
            빠른 작성 및 관리
          </h2>
          <p className="mt-1 text-sm text-[var(--bw-color-muted)]">
            자주 쓰는 콘텐츠 관리 화면으로 바로 이동합니다.
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => (
            <a
              key={action.href + action.label}
              href={action.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[var(--bw-color-ink)]"
            >
              <span className="font-semibold group-hover:underline group-hover:underline-offset-4">
                {action.label}
              </span>
              <span className="mt-1 block text-sm text-[var(--bw-color-muted)]">
                {action.detail}
              </span>
            </a>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  return { props: { dashboard: await getAdminDashboardData() } };
};
