import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  PopupNoticeForm,
  type PopupNoticeFormValue,
  type PopupNoticeLinkOption,
} from "@/components/admin/PopupNoticeForm";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getAdminNoticeList } from "@/server/modules/notices/queries";
import { getAdminPopupNotice } from "@/server/modules/popup-notices/repository";

function toDateTimeLocal(value: Date | string | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
}

export default function EditPopupNotice({
  popupNotice,
  notices,
}: {
  popupNotice: PopupNoticeFormValue;
  notices: PopupNoticeLinkOption[];
}) {
  return (
    <AdminShell activePath="/admin/popup-notices">
      <AdminPageHeader
        title={
          popupNotice.locales.ko.title ||
          popupNotice.locales.en.title ||
          "팝업 공지 편집"
        }
        description="변경 내용을 저장한 뒤 언어별 노출 기간과 게시 상태를 적용할 수 있습니다."
      />
      <div className="mt-8">
        <PopupNoticeForm initial={popupNotice} notices={notices} />
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const id =
    typeof context.params?.popupNoticeId === "string"
      ? context.params.popupNoticeId
      : "";
  const [item, noticeItems] = await Promise.all([
    getAdminPopupNotice(id),
    getAdminNoticeList(),
  ]);
  const locales = Object.fromEntries(
    item.locales.map((locale) => [
      locale.locale,
      {
        title: locale.title,
        bodyMarkdown: locale.bodyMarkdown || "",
        imageAssetId: locale.imageAssetId || "",
        imageAlt: locale.imageAlt || "",
        imageUrl: locale.imageUrl || "",
        displayOrder: locale.displayOrder,
        publicationStatus: locale.publicationStatus,
        publishStartsAt: toDateTimeLocal(locale.publishStartsAt),
        publishEndsAt: toDateTimeLocal(locale.publishEndsAt),
      },
    ]),
  ) as PopupNoticeFormValue["locales"];
  return {
    props: {
      popupNotice: {
        id: item.id,
        version: item.version,
        itemStatus: item.itemStatus,
        noticeId: item.noticeId || "",
        dismissalRevision: item.dismissalRevision,
        locales,
      },
      notices: noticeItems
        .filter((notice) => notice.itemStatus === "ACTIVE")
        .map((notice) => ({
          id: notice.id,
          publicNumber: notice.publicNumber,
          title:
            notice.locales.ko?.title || notice.locales.en?.title || "제목 없음",
        })),
    },
  };
}
