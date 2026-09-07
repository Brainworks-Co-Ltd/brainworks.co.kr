import Link from "next/link";
import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { listAdminHonors } from "@/server/modules/honors/repository";

const statusLabel: Record<string, string> = {
  DRAFT: "초안",
  PUBLISHED: "게시 중",
  HIDDEN: "숨김",
};

export default function AdminHonors({
  items,
}: {
  items: Awaited<ReturnType<typeof listAdminHonors>>;
}) {
  return (
    <AdminShell activePath="/admin/honors">
      <AdminPageHeader
        title="수상 및 인증"
        description="수상과 인증을 유형별 순서로 배치하고 국문·영문을 각각 게시합니다."
        action={
          <Link
            href="/admin/honors/new"
            className="inline-flex min-h-10 items-center rounded-full bg-[var(--bw-color-ink)] px-4 text-sm font-semibold text-white"
          >
            새 항목
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
                    {item.honorType === "AWARD" ? "수상" : "인증"} · {item.occurredYear} · 순서 {item.displayOrder} · {item.itemStatus === "ARCHIVED" ? "보관" : "활성"}
                  </p>
                  <h2 className="mt-1 font-semibold">
                    {item.locales.ko?.title || item.locales.en?.title || "제목 없음"}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    국문 {statusLabel[item.locales.ko?.publicationStatus] || "없음"}
                    {" · "}영문 {statusLabel[item.locales.en?.publicationStatus] || "없음"}
                  </p>
                </div>
                <Link
                  href={`/admin/honors/${item.id}`}
                  className="text-sm font-semibold underline-offset-4 hover:underline"
                >
                  편집
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-sm text-slate-500">등록된 수상 및 인증이 없습니다.</p>
        )}
      </section>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  return { props: { items: await listAdminHonors() } };
}
