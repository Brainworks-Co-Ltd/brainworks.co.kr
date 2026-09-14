import Link from "next/link";
import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
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

export default function AdminAiSolutions({
  items,
  areaLabels,
}: {
  items: AdminAiSolutionList;
  areaLabels: Record<string, string>;
}) {
  return (
    <AdminShell activePath="/admin/ai-solutions">
      <AdminPageHeader
        title="AI 솔루션"
        description="고정된 사업 영역 안에서 솔루션의 내용, 이미지, 순서와 언어별 게시 상태를 관리합니다."
        action={
          <Link
            href="/admin/ai-solutions/new"
            className="inline-flex min-h-10 items-center rounded-full bg-[var(--bw-color-ink)] px-4 text-sm font-semibold text-white"
          >
            새 솔루션
          </Link>
        }
      />
      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {items.length ? (
          <ul className="divide-y divide-slate-200">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-xs text-slate-500">
                    {areaLabels[item.businessAreaKey] || item.businessAreaKey} · 순서 {item.displayOrder} · {item.itemStatus === "ARCHIVED" ? "보관" : "활성"}
                  </p>
                  <h2 className="mt-1 font-semibold">
                    {item.locales.ko?.name || item.locales.en?.name || "이름 없음"}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    국문 {publicationStatusLabel[item.locales.ko?.publicationStatus] || "없음"}
                    {" · "}영문 {publicationStatusLabel[item.locales.en?.publicationStatus] || "없음"}
                  </p>
                </div>
                <Link
                  href={`/admin/ai-solutions/${item.id}`}
                  className="text-sm font-semibold underline-offset-4 hover:underline"
                >
                  편집
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-sm text-slate-500">등록된 AI 솔루션이 없습니다.</p>
        )}
      </section>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const [items, areas] = await Promise.all([
    listAdminAiSolutions(),
    listAdminBusinessAreaOptions(),
  ]);
  const publicLabels = new Map(
    publicBusinessAreas.map((area) => [area.id, area.name.ko]),
  );
  return {
    props: {
      items,
      areaLabels: Object.fromEntries(
        areas.map((area) => [
          area.publicKey,
          publicLabels.get(area.publicKey) || area.publicKey,
        ]),
      ),
    },
  };
}
