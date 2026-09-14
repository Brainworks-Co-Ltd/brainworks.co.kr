import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { createEmptyNews, NewsForm } from "@/components/admin/NewsForm";
import { requireAdminPage } from "@/server/auth/require-admin";

export default function NewNews() {
  return (
    <AdminShell activePath="/admin/news">
      <AdminPageHeader
        title="새 뉴스"
        description="국문 또는 영문 중 준비된 내용부터 초안으로 저장할 수 있습니다."
      />
      <div className="mt-8">
        <NewsForm initial={createEmptyNews()} />
      </div>
    </AdminShell>
  );
}

export const getServerSideProps = requireAdminPage;
