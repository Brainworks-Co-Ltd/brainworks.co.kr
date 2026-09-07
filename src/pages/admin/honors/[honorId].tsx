import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { HonorForm, type HonorFormValue } from "@/components/admin/HonorForm";
import { requireAdminPage } from "@/server/auth/require-admin";
import { getAdminHonor } from "@/server/modules/honors/repository";

export default function EditHonor({ honor }: { honor: HonorFormValue }) {
  return (
    <AdminShell activePath="/admin/honors">
      <AdminPageHeader
        title={honor.locales.ko.title || honor.locales.en.title || "수상 및 인증 편집"}
        description="내용과 순서를 저장한 뒤 언어별 게시 상태를 관리할 수 있습니다."
      />
      <div className="mt-8">
        <HonorForm initial={honor} />
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const id = typeof context.params?.honorId === "string" ? context.params.honorId : "";
  const item = await getAdminHonor(id);
  const locales = Object.fromEntries(
    item.locales.map((locale) => [
      locale.locale,
      {
        title: locale.title,
        organization: locale.organization,
        description: locale.description,
        imageAlt: locale.imageAlt || "",
        publicationStatus: locale.publicationStatus,
      },
    ]),
  ) as HonorFormValue["locales"];
  return {
    props: {
      honor: {
        id: item.id,
        version: item.version,
        itemStatus: item.itemStatus,
        honorType: item.honorType,
        occurredYear: item.occurredYear,
        occurredOn: item.occurredOn ? String(item.occurredOn) : "",
        displayOrder: item.displayOrder,
        imageAssetId: item.imageAssetId || "",
        locales,
      },
    },
  };
}
