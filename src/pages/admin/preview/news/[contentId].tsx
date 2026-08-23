import Link from "next/link";
import type { GetServerSideProps } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdminPage } from "@/server/auth/require-admin";
import { renderMarkdownPreview } from "@/server/modules/preview/preview-service";

export default function NewsPreview({ html }: { html: string }) {
  return (
    <AdminShell activePath="/admin/news">
      <AdminPageHeader
        title="뉴스 미리보기"
        description="저장 전 서버 Markdown 정제 결과입니다."
      />
      <article
        className="prose prose-lg mt-8 max-w-4xl rounded-2xl border border-slate-200 bg-white p-8"
        dangerouslySetInnerHTML={{
          __html: html || "<p>미리보기 내용이 없습니다.</p>",
        }}
      />
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
  const body = typeof context.query.body === "string" ? context.query.body : "";
  return { props: { html: renderMarkdownPreview(body) } };
};
