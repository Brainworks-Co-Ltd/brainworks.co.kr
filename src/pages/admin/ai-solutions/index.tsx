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
import { businessAreas as publicBusinessAreas } from "@/data/businessAreas";
import { requireAdminPage } from "@/server/auth/require-admin";
import {
  listAdminAiSolutions,
  listAdminBusinessAreaOptions,
} from "@/server/modules/catalog/repository";

const publicationStatusLabel: Record<string, string> = {
  DRAFT: "초안",
  PUBLISHED: "게시 중",
  HIDDEN: "숨김",
};

type AdminAiSolutionList = Awaited<ReturnType<typeof listAdminAiSolutions>>;

function LocaleStatus({
  label,
  status,
}: {
  label: string;
  status?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      {label}
      <StatusBadge
        status={status || "NONE"}
        label={publicationStatusLabel[status || ""] || "없음"}
      />
    </span>
  );
}

export default function AdminAiSolutions({
  items,
  areas,
}: {
  items: AdminAiSolutionList;
  areas: { id: string; label: string }[];
}) {
  return (
    <AdminShell activePath="/admin/ai-solutions">
      <AdminPageHeader
        title="AI 솔루션"
        description="사업 영역별 솔루션의 내용과 이미지, 언어별 게시 상태를 관리합니다. 공개 화면에 보이는 순서는 화살표로 바꿉니다."
        action={
          <Link href="/admin/ai-solutions/new" className={primaryButtonClass}>
            새 솔루션
          </Link>
        }
      />
      <div className="mt-8 grid gap-8">
        {areas.map((area) => {
          const rows = items.filter((item) => item.businessAreaId === area.id);
          const active = rows.filter((item) => item.itemStatus === "ACTIVE");
          return (
            <section key={area.id} aria-labelledby={`area-${area.id}`}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 id={`area-${area.id}`} className={cardTitleClass}>
                  {area.label}
                </h2>
                <span className="text-xs text-slate-500">
                  활성 {active.length}개
                </span>
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
                              endpoint={`/api/admin/ai-solutions/${item.id}/move`}
                              version={item.version}
                              first={position <= 0}
                              last={position === active.length - 1}
                            />
                          ) : (
                            <StatusBadge status="ARCHIVED" label="보관" />
                          )}
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">
                              {item.locales.ko?.name || item.locales.en?.name || "이름 없음"}
                            </h3>
                            <div className="mt-1.5 flex flex-wrap gap-3">
                              <LocaleStatus
                                label="국문"
                                status={item.locales.ko?.publicationStatus}
                              />
                              <LocaleStatus
                                label="영문"
                                status={item.locales.en?.publicationStatus}
                              />
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/admin/ai-solutions/${item.id}`}
                          className="shrink-0 text-sm font-semibold underline-offset-4 hover:underline"
                        >
                          편집
                        </Link>
                      </li>
                    );
                  })
                ) : (
                  <li className="p-5 text-sm text-slate-500">
                    아직 솔루션이 없습니다.
                  </li>
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
  const [items, areaRows] = await Promise.all([
    listAdminAiSolutions(),
    listAdminBusinessAreaOptions(),
  ]);
  const publicLabels = new Map(
    publicBusinessAreas.map((area) => [area.id, area.name.ko]),
  );
  const areas = areaRows.map((area) => ({
    id: area.id,
    label: publicLabels.get(area.publicKey) || area.publicKey,
  }));
  return { props: { items, areas } };
}
