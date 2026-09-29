import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { createEmptyNotice, NoticeForm } from "@/components/admin/NoticeForm";
import type { AdminNoticeCategory } from "@/components/admin/NoticeCategoryForm";
import { requireAdminPage } from "@/server/auth/require-admin";
import { listAdminNoticeCategories } from "@/server/modules/notices/category-repository";

export default function NewNotice({
  categories,
}: {
  categories: AdminNoticeCategory[];
}) {
  return (
    <AdminShell activePath="/admin/notices">
      <AdminPageHeader
        title="새 공지사항"
        description="국문 또는 영문 중 준비된 내용부터 초안으로 저장할 수 있습니다. 공개 번호는 저장할 때 자동으로 발급됩니다."
      />
      <div className="mt-8">
        <NoticeForm initial={createEmptyNotice()} categories={categories} />
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  return { props: { categories: await listAdminNoticeCategories() } };
}
