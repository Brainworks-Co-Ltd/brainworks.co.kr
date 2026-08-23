import Link from "next/link";
import type { GetServerSideProps } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";

type NewsSummary = { slug: string; version: number } | null;

export default function EditNews({ news }: { news: NewsSummary }) {
  return (
    <AdminShell activePath="/admin/news">
      <AdminPageHeader
        title="뉴스 수정"
        description="로케일별 원문과 게시 상태를 확인합니다."
      />
      {news ? (
        <section className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-[var(--bw-color-muted)]">
            현재 슬러그: {news.slug}
          </p>
          <p className="text-sm text-[var(--bw-color-muted)]">
            버전: {news.version}
          </p>
          <p className="text-sm leading-7 text-[var(--bw-color-muted)]">
            편집 입력과 게시 명령은 같은 버전을 기준으로 저장되어 충돌 시 현재
            입력을 덮어쓰지 않습니다.
          </p>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-[var(--bw-color-muted)]">
            DB 연결 후 편집 데이터를 불러옵니다.
          </p>
        </section>
      )}
      <Link
        href="/admin/news"
        className="mt-6 inline-flex text-sm font-semibold underline-offset-4 hover:underline"
      >
        뉴스 목록으로 돌아가기
      </Link>
    </AdminShell>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  if (!process.env.DATABASE_URL) return { props: { news: null } };
  const { getAdminNews } = await import("@/server/modules/news/repository");
  try {
    const record = await getAdminNews(context.params?.newsId as string);
    return { props: { news: { slug: record.slug, version: record.version } } };
  } catch {
    return { notFound: true };
  }
};
