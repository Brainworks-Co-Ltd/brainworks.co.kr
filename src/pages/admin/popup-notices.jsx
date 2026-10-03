import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { primaryButtonClass, StatusBadge } from "@/components/admin/fields";
import { displayPublicationLabel } from "@/lib/publication-state";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getAdminPopupNoticeList } from "@/server/modules/popup-notices/queries";

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

export default function AdminPopupNotices({ items }) {
  return (
    <AdminShell activePath="/admin/popup-notices">
      <AdminPageHeader
        title="팝업 공지"
        description="홈 첫 화면에 띄우는 팝업입니다. 언어별로 노출 기간을 정해 게시하고, 공지사항 연결은 선택입니다."
        action={
          <Link href="/admin/popup-notices/new" className={primaryButtonClass}>
            새 팝업 공지
          </Link>
        }
      />
      <section className="mt-8 overflow-hidden rounded-[var(--bw-radius-card)] border border-[var(--bw-color-line)] bg-white">
        {items.length ? (
          <ul className="divide-y divide-[var(--bw-color-line)]">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 truncate font-semibold">
                    {item.locales.ko?.title || item.locales.en?.title || "제목 없음"}
                    {item.itemStatus === "ARCHIVED" ? (
                      <StatusBadge status="ARCHIVED" label="보관" />
                    ) : null}
                  </h2>
                  <div className="mt-1.5 flex flex-wrap gap-3">
                    <LocaleStatus label="국문" state={item.locales.ko?.displayState} />
                    <LocaleStatus label="영문" state={item.locales.en?.displayState} />
                  </div>
                </div>
                <Link
                  href={`/admin/popup-notices/${item.id}`}
                  className="shrink-0 text-sm font-semibold underline-offset-4 hover:underline"
                >
                  편집
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-sm text-slate-500">등록된 팝업 공지가 없습니다.</p>
        )}
      </section>
    </AdminShell>
  );
}

export async function getServerSideProps(context) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  return { props: { items: await getAdminPopupNoticeList() } };
}
