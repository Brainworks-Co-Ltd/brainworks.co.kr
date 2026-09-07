import Link from "next/link";
import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getAdminNewsList } from "@/server/modules/news/admin-queries";

const publicationStatusLabel: Record<string, string> = {
  DRAFT: "초안",
  PUBLISHED: "게시 중",
  HIDDEN: "숨김",
};

type AdminNewsList = Awaited<ReturnType<typeof getAdminNewsList>>;

function pageHref(query: { q: string; status: string }, page: number) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status !== "ALL") params.set("status", query.status);
  params.set("page", String(page));
  return `/admin/news?${params.toString()}`;
}

export default function AdminNews({
  data,
  query,
}: {
  data: AdminNewsList;
  query: { q: string; status: string };
}) {
  return (
    <AdminShell activePath="/admin/news">
      <AdminPageHeader
        title="뉴스"
        description="초안, 게시, 숨김, 보관 상태와 국문·영문 내용을 모두 확인합니다."
        action={
          <Link
            href="/admin/news/new"
            className="inline-flex min-h-10 items-center rounded-full bg-[var(--bw-color-ink)] px-4 text-sm font-semibold text-white"
          >
            새 뉴스
          </Link>
        }
      />
      <form
        method="get"
        className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_12rem_auto]"
      >
        <label className="grid gap-1 text-sm font-medium">
          검색
          <input
            name="q"
            defaultValue={query.q}
            placeholder="제목, 요약, 분류, 공개 주소"
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          상태
          <select
            name="status"
            defaultValue={query.status}
            className="min-h-11 rounded-xl border border-slate-300 px-3"
          >
            <option value="ALL">전체</option>
            <option value="DRAFT">초안</option>
            <option value="PUBLISHED">게시 중</option>
            <option value="HIDDEN">숨김</option>
            <option value="ARCHIVED">보관</option>
          </select>
        </label>
        <button className="self-end min-h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white">
          검색
        </button>
      </form>
      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {data.items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">조건에 맞는 뉴스가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {data.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-xs text-slate-500">
                    {item.category} · {item.displayDate} · {item.itemStatus === "ARCHIVED" ? "보관" : "활성"}
                  </p>
                  <h2 className="mt-1 font-semibold">
                    {item.locales.ko?.title || item.locales.en?.title || "제목 없음"}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    국문 {publicationStatusLabel[item.locales.ko?.publicationStatus] || "없음"}
                    {" · "}영문 {publicationStatusLabel[item.locales.en?.publicationStatus] || "없음"}
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <Link
                    href={`/admin/news/${item.id}`}
                    className="font-semibold underline-offset-4 hover:underline"
                  >
                    편집
                  </Link>
                  <Link
                    href={`/news/${item.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline-offset-4 hover:underline"
                  >
                    공개 보기
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <nav aria-label="뉴스 목록 페이지" className="mt-5 flex items-center justify-between">
        <span className="text-sm text-slate-500">총 {data.total}건</span>
        <div className="flex gap-2">
          {data.page > 1 ? (
            <Link
              href={pageHref(query, data.page - 1)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
            >
              이전
            </Link>
          ) : null}
          {data.page < data.totalPages ? (
            <Link
              href={pageHref(query, data.page + 1)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
            >
              다음
            </Link>
          ) : null}
        </div>
      </nav>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const q = typeof context.query.q === "string" ? context.query.q.slice(0, 100) : "";
  const status =
    typeof context.query.status === "string" ? context.query.status : "ALL";
  const page = Number(context.query.page) || 1;
  return {
    props: {
      data: await getAdminNewsList({ q, status, page }),
      query: { q, status },
    },
  };
}
