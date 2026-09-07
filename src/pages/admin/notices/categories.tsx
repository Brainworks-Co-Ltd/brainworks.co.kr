import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  NoticeCategoryForm,
  type AdminNoticeCategory,
} from "@/components/admin/NoticeCategoryForm";
import { requireAdminPage } from "@/server/auth/require-admin";
import { listAdminNoticeCategories } from "@/server/modules/notices/category-repository";

export default function NoticeCategories({
  categories,
}: {
  categories: AdminNoticeCategory[];
}) {
  return (
    <AdminShell activePath="/admin/notices">
      <AdminPageHeader
        title="공지 카테고리"
        description="공지 작성 화면에서 선택할 분류 이름과 순서를 관리합니다. 사용 중인 분류는 삭제하지 않고 비활성화합니다."
      />
      <div className="mt-8">
        <NoticeCategoryForm categories={categories} />
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  return { props: { categories: await listAdminNoticeCategories() } };
}
