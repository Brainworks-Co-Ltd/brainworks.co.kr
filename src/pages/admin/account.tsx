import type { GetServerSideProps } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/server/auth/require-admin";

export default function AdminAccount() {
  return (
    <AdminShell activePath="/admin/account">
      <AdminPageHeader
        title="계정 설정"
        description="관리자 계정 정보와 비밀번호 설정을 관리합니다."
      />
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">계정 설정의 용도</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--bw-color-muted)]">
          관리자 계정 정보를 확인하고, 필요할 때 비밀번호를 변경하는 공간입니다.
        </p>
      </section>
    </AdminShell>
  );
}

export const getServerSideProps: GetServerSideProps = requireAdminPage;
