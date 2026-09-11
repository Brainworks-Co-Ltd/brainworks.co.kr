import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { NoticeForm, type NoticeFormValue } from "@/components/admin/NoticeForm";
import type { AdminNoticeCategory } from "@/components/admin/NoticeCategoryForm";
import { requireAdminPage } from "@/server/auth/require-admin";
import { listAdminNoticeCategories } from "@/server/modules/notices/category-repository";
import { getAdminNotice } from "@/server/modules/notices/repository";
import { toDateTimeLocal } from "@/lib/datetime-local";

export default function EditNotice({
  notice,
  categories,
}: {
  notice: NoticeFormValue;
  categories: AdminNoticeCategory[];
}) {
  return (
    <AdminShell activePath="/admin/notices">
      <AdminPageHeader
        title={notice.locales.ko.title || notice.locales.en.title || "공지사항 편집"}
        description={`공지 번호 ${notice.publicNumber} · 내용을 저장한 뒤 언어별로 게시할 수 있습니다.`}
      />
      <div className="mt-8">
        <NoticeForm initial={notice} categories={categories} />
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const noticeId =
    typeof context.params?.noticeId === "string" ? context.params.noticeId : "";
  const [item, categories] = await Promise.all([
    getAdminNotice(noticeId),
    listAdminNoticeCategories(),
  ]);
  const locales = Object.fromEntries(
    item.locales.map((locale) => [
      locale.locale,
      {
        title: locale.title,
        bodyMarkdown: locale.bodyMarkdown,
        publicationStatus: locale.publicationStatus,
        publishStartsAt: toDateTimeLocal(locale.publishStartsAt),
        publishEndsAt: toDateTimeLocal(locale.publishEndsAt),
      },
    ]),
  ) as NoticeFormValue["locales"];
  return {
    props: {
      notice: {
        id: item.id,
        version: item.version,
        publicNumber: item.publicNumber,
        itemStatus: item.itemStatus,
        categoryId: item.categoryId || "",
        displayDate: String(item.displayDate),
        isPinned: item.isPinned,
        pinOrder: item.pinOrder || 1,
        locales,
      },
      categories,
    },
  };
}
