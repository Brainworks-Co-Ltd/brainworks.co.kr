import type { GetServerSidePropsContext } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import PopupNoticeRegion from "@/components/popup-notices/PopupNoticeRegion";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getAdminPopupNotice } from "@/server/modules/popup-notices/repository";

type PopupPreviewProps = {
  notice: {
    id: string;
    title: string;
    bodyMarkdown: string | null;
    imageUrl: string | null;
    imageAlt: string | null;
    detailUrl: string | null;
    dismissalRevision: number;
    displayOrder: number;
  };
};

export default function PopupPreview({ notice }: PopupPreviewProps) {
  return (
    <AdminShell activePath="/admin/popup-notices">
      <p className="text-sm text-slate-500">
        실제 공개 팝업 미리보기 · 공개 상태는 변경되지 않습니다.
      </p>
      <PopupNoticeRegion notices={[notice]} />
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const id =
    typeof context.params?.contentId === "string" ? context.params.contentId : "";
  const item = await getAdminPopupNotice(id);
  const locale = item.locales.find((value) => value.locale === "ko");
  return {
    props: {
      notice: {
        id: `admin-preview-${item.id}`,
        title: locale?.title || "제목 없음",
        bodyMarkdown: locale?.bodyMarkdown || null,
        imageUrl: locale?.imageUrl || null,
        imageAlt: locale?.imageAlt || null,
        detailUrl: null,
        dismissalRevision: item.dismissalRevision,
        displayOrder: locale?.displayOrder || 0,
      },
    },
  };
}
