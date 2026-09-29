import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  createEmptyPopupNotice,
  PopupNoticeForm,
  type PopupNoticeLinkOption,
} from "@/components/admin/PopupNoticeForm";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getAdminNoticeList } from "@/server/modules/notices/queries";

export default function NewPopupNotice({
  notices,
}: {
  notices: PopupNoticeLinkOption[];
}) {
  return (
    <AdminShell activePath="/admin/popup-notices">
      <AdminPageHeader
        title="새 팝업 공지"
        description="준비된 언어부터 초안으로 저장하고 이미지, 연결 공지, 노출 기간과 순서를 설정할 수 있습니다."
      />
      <div className="mt-8">
        <PopupNoticeForm initial={createEmptyPopupNotice()} notices={notices} />
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const items = await getAdminNoticeList();
  return {
    props: {
      notices: items
        .filter((item) => item.itemStatus === "ACTIVE")
        .map((item) => ({
          id: item.id,
          publicNumber: item.publicNumber,
          title: item.locales.ko?.title || item.locales.en?.title || "제목 없음",
        })),
    },
  };
}
