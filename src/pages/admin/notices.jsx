import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  primaryButtonClass,
  secondaryButtonClass,
  StatusBadge,
} from "@/components/admin/fields";
import { displayPublicationLabel } from "@/lib/publication-state";
import { requireAdminPage } from "@/server/auth/require-admin";
import { listAdminNoticeCategories } from "@/server/modules/notices/category-repository";
import { getAdminNoticeList } from "@/server/modules/notices/queries";

function LocaleStatus({ label, state }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      {label}
      <StatusBadge
        status={state || "NONE"}
        label={displayPublicationLabel[state] || "없음"}
      />
    </span>
  );
}

export default function AdminNotices({ data, categoryNames }) {
  return (
    <AdminShell activePath="/admin/notices">
      <AdminPageHeader
        title="공지사항"
        description="국문과 영문 공지의 초안, 게시 기간, 공개 상태를 관리합니다."
        action={
          <>
            <Link href="/admin/notices/categories" className={secondaryButtonClass}>
              카테고리 관리
            </Link>
            <Link href="/admin/notices/new" className={primaryButtonClass}>
              새 공지
            </Link>
          </>
        }
      />
      <section className="mt-8 overflow-hidden rounded-[var(--bw-radius-card)] border border-[var(--bw-color-line)] bg-white">
        {data.items.length ? (
          <ul className="divide-y divide-[var(--bw-color-line)]">
            {data.items.map((item) => {
              const live =
                item.locales.ko?.displayState === "LIVE" ||
                item.locales.en?.displayState === "LIVE";
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>공지 번호 {item.publicNumber}</span>
                      <span>{item.displayDate}</span>
                      {categoryNames[item.categoryId] ? (
                        <span className="rounded-[var(--bw-radius-control)] bg-slate-100 px-2 py-0.5 font-semibold text-[var(--bw-color-ink)]">
                          {categoryNames[item.categoryId]}
                        </span>
                      ) : null}
                      {item.isPinned ? (
                        <span className="font-semibold text-[var(--bw-color-brand-strong)]">상단 고정</span>
                      ) : null}
                      {item.itemStatus === "ARCHIVED" ? (
                        <StatusBadge status="ARCHIVED" label="보관" />
                      ) : null}
                    </p>
                    <h2 className="mt-1 truncate font-semibold">
                      {item.locales.ko?.title || item.locales.en?.title || "제목 없음"}
                    </h2>
                    <div className="mt-1.5 flex flex-wrap gap-3">
                      <LocaleStatus label="국문" state={item.locales.ko?.displayState} />
                      <LocaleStatus label="영문" state={item.locales.en?.displayState} />
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-4 text-sm">
                    <Link
                      href={`/admin/notices/${item.id}`}
                      className="font-semibold underline-offset-4 hover:underline"
                    >
                      편집
                    </Link>
                    {live ? (
                      <Link
                        href={`/notices/${item.publicNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold underline-offset-4 hover:underline"
                      >
                        공개 보기
                      </Link>
                    ) : (
                      <span className="text-slate-400">아직 공개되지 않음</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-6 text-sm text-slate-500">등록된 공지사항이 없습니다.</p>
        )}
      </section>
    </AdminShell>
  );
}

export async function getServerSideProps(context) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const [items, categories] = await Promise.all([
    getAdminNoticeList(),
    listAdminNoticeCategories(),
  ]);
  const categoryNames = Object.fromEntries(
    categories.map((category) => [
      category.id,
      category.locales.ko?.name || category.locales.en?.name || "",
    ]),
  );
  return { props: { data: { items }, categoryNames } };
}
