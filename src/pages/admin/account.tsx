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
        <h2 className="text-lg font-semibold">계정 설정</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--bw-color-muted)]">
          계정 설정 기능은 추후 개발 예정입니다.
        </p>
      </section>
    </AdminShell>
  );
}

export const getServerSideProps: GetServerSideProps = requireAdminPage;
