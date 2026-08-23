import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getPublishedNewsList } from "@/server/modules/news/query-service";

export default function AdminNews({ items }) {
  return (
    <AdminShell activePath="/admin/news">
      <AdminPageHeader
        title="뉴스"
        description="국문·영문 게시 상태와 공개 소식을 관리합니다."
        action={
          <a
            href="/admin/news/new"
            className="inline-flex min-h-10 items-center rounded-full bg-[var(--bw-color-ink)] px-4 text-sm font-semibold text-white"
          >
            새 뉴스
          </a>
        }
      />
      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {items.length === 0 ? (
          <p className="p-6 text-sm text-[var(--bw-color-muted)]">
            등록된 뉴스가 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {items.map((item) => (
              <li
                key={item.slug}
                className="flex flex-col gap-2 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-xs text-[var(--bw-color-muted)]">
                    {item.category} · {item.date}
                  </p>
                  <h2 className="mt-1 font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-[var(--bw-color-muted)]">
                    {item.summary}
                  </p>
                </div>
                <a
                  href={`/news/${item.slug}`}
                  className="text-sm font-semibold underline-offset-4 hover:underline"
                >
                  공개 보기
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}

export async function getServerSideProps(context) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const items = (await getPublishedNewsList({ locale: "ko" })).items;
  return { props: { items } };
}
