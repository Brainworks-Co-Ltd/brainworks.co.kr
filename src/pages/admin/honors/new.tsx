import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { createEmptyHonor, HonorForm } from "@/components/admin/HonorForm";
import { requireAdminPage } from "@/server/auth/require-admin";
import { listAdminHonors } from "@/server/modules/honors/repository";

export default function NewHonor({ nextOrder }: { nextOrder: number }) {
  return (
    <AdminShell activePath="/admin/honors">
      <AdminPageHeader
        title="새 수상 및 인증"
        description="확인된 언어의 제목부터 초안으로 저장하고 게시할 수 있습니다."
      />
      <div className="mt-8">
        <HonorForm initial={createEmptyHonor(nextOrder)} />
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const items = await listAdminHonors();
  const nextOrder =
    Math.max(
      0,
      ...items
        .filter((item) => item.honorType === "AWARD")
        .map((item) => item.displayOrder),
    ) + 1;
  return { props: { nextOrder } };
}
