import type { GetServerSideProps } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";

export default function AdminHome() {
  return (
    <AdminShell>
      <AdminPageHeader
        title="운영 개요"
        description="콘텐츠 상태와 다음 운영 작업을 확인합니다."
      />
      <section
        className="mt-8 grid gap-5 md:grid-cols-3"
        aria-label="운영 요약"
      >
        {[
          ["뉴스", "콘텐츠 관리"],
          ["공지사항", "게시 상태 확인"],
          ["AI 솔루션", "사업 영역 관리"],
        ].map(([title, description]) => (
          <article
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-[var(--bw-color-muted)]">
              {description}
            </p>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}

export const getServerSideProps: GetServerSideProps = requireAdminPage;
