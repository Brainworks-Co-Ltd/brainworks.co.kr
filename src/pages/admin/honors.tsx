import Link from "next/link";
import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  cardTitleClass,
  primaryButtonClass,
  StatusBadge,
} from "@/components/admin/fields";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { requireAdminPage } from "@/server/auth/require-admin";
import { listAdminHonors } from "@/server/modules/honors/repository";

const statusLabel: Record<string, string> = {
  DRAFT: "초안",
  PUBLISHED: "게시 중",
  HIDDEN: "숨김",
};

const groups = [
  { type: "AWARD", label: "수상" },
  { type: "CERTIFICATION", label: "인증" },
] as const;

type AdminHonorList = Awaited<ReturnType<typeof listAdminHonors>>;

function LocaleStatus({ label, status }: { label: string; status?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      {label}
      <StatusBadge
        status={status || "NONE"}
        label={statusLabel[status || ""] || "없음"}
      />
    </span>
  );
}

export default function AdminHonors({ items }: { items: AdminHonorList }) {
  return (
    <AdminShell activePath="/admin/honors">
      <AdminPageHeader
        title="수상 및 인증"
        description="수상과 인증을 각각 관리하고 국문, 영문을 따로 게시합니다. 공개 화면의 순서는 화살표로 바꿉니다."
        action={
          <Link href="/admin/honors/new" className={primaryButtonClass}>
            새 항목
          </Link>
        }
      />
      <div className="mt-8 grid gap-8">
        {groups.map((group) => {
          const rows = items.filter((item) => item.honorType === group.type);
          const active = rows.filter((item) => item.itemStatus === "ACTIVE");
          return (
            <section key={group.type} aria-labelledby={`honor-${group.type}`}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 id={`honor-${group.type}`} className={cardTitleClass}>
                  {group.label}
                </h2>
                <span className="text-xs text-slate-500">활성 {active.length}개</span>
              </div>
              <ul className="mt-3 divide-y divide-[var(--bw-color-line)] rounded-[var(--bw-radius-card)] border border-[var(--bw-color-line)] bg-white">
                {rows.length ? (
                  rows.map((item) => {
                    const position = active.findIndex((row) => row.id === item.id);
                    return (
                      <li
                        key={item.id}
                        className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          {item.itemStatus === "ACTIVE" ? (
                            <ReorderButtons
                              endpoint={`/api/admin/honors/${item.id}/move`}
                              version={item.version}
                              first={position <= 0}
                              last={position === active.length - 1}
                            />
                          ) : (
                            <StatusBadge status="ARCHIVED" label="보관" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500">{item.occurredYear}</p>
                            <h3 className="mt-0.5 truncate font-semibold">
                              {item.locales.ko?.title || item.locales.en?.title || "제목 없음"}
                            </h3>
                            <div className="mt-1.5 flex flex-wrap gap-3">
                              <LocaleStatus label="국문" status={item.locales.ko?.publicationStatus} />
                              <LocaleStatus label="영문" status={item.locales.en?.publicationStatus} />
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/admin/honors/${item.id}`}
                          className="shrink-0 text-sm font-semibold underline-offset-4 hover:underline"
                        >
                          편집
                        </Link>
                      </li>
                    );
                  })
                ) : (
                  <li className="p-5 text-sm text-slate-500">아직 항목이 없습니다.</li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  return { props: { items: await listAdminHonors() } };
}
