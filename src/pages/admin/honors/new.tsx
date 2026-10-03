import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { createEmptyHonor, HonorForm } from "@/components/admin/HonorForm";
import { requireAdminPage } from "@/server/auth/require-admin";

export default function NewHonor() {
  return (
    <AdminShell activePath="/admin/honors">
      <AdminPageHeader
        title="새 수상 및 인증"
        description="준비된 언어의 제목부터 초안으로 저장하고, 내용이 갖춰지면 언어별로 게시합니다."
      />
      <div className="mt-8">
        <HonorForm initial={createEmptyHonor()} />
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  return { props: {} };
}
