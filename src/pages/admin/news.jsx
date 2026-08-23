import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";

export default function AdminNewsPlaceholder() {
  return (
    <AdminShell activePath="/admin/news">
      <AdminPageHeader
        title="뉴스"
        description="뉴스 수직 슬라이스에서 목록과 편집 기능을 연결합니다."
      />
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm leading-7 text-[var(--bw-color-muted)]">
          관리자 인증이 적용된 영역입니다. 콘텐츠 편집 기능은 다음
          체크포인트에서 연결됩니다.
        </p>
      </section>
    </AdminShell>
  );
}

export const getServerSideProps = requireAdminPage;
