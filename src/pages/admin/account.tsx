import { type FormEvent, useState } from "react";
import type { GetServerSidePropsContext } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  requireAdmin,
  requireAdminPage,
} from "@/server/auth/require-admin";
import { isOriginMismatch } from "@/lib/admin-api";

type Account = {
  name: string;
  email: string;
  role: string;
  accountStatus: string;
};

export default function AdminAccount({ account }: { account: Account }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호와 확인 값이 일치하지 않습니다.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (isOriginMismatch({ status: response.status, message: payload?.message })) {
          setError(
            `접속 주소가 서버의 APP_ORIGIN 설정과 다릅니다. 현재 주소(${window.location.origin})로 APP_ORIGIN을 맞춘 뒤 다시 시도해 주세요.`,
          );
          return;
        }
        setError("현재 비밀번호를 확인하거나 새 비밀번호 조건을 확인해 주세요.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("비밀번호를 변경했습니다. 다른 기기의 로그인은 종료됩니다.");
    } catch {
      setError("비밀번호를 변경하지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminShell activePath="/admin/account">
      <AdminPageHeader
        title="계정 설정"
        description="현재 로그인한 관리자 정보를 확인하고 비밀번호를 변경합니다."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">계정 정보</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-slate-500">이름</dt>
              <dd className="mt-1 font-medium">{account.name || "관리자"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">이메일</dt>
              <dd className="mt-1 font-medium">{account.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">권한</dt>
              <dd className="mt-1 font-medium">
                {account.role === "ADMIN" ? "관리자" : account.role}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">계정 상태</dt>
              <dd className="mt-1 font-medium">
                {account.accountStatus === "ACTIVE"
                  ? "사용 중"
                  : account.accountStatus}
              </dd>
            </div>
          </dl>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">비밀번호 변경</h2>
          <form className="mt-5 grid gap-4" onSubmit={changePassword}>
            <label className="grid gap-2 text-sm font-medium">
              현재 비밀번호
              <input
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="min-h-11 rounded-xl border border-slate-300 px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              새 비밀번호
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="min-h-11 rounded-xl border border-slate-300 px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              새 비밀번호 확인
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="min-h-11 rounded-xl border border-slate-300 px-3"
              />
            </label>
            {error ? (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p role="status" className="text-sm text-emerald-700">
                {message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 rounded-full bg-[var(--bw-color-ink)] px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "변경 중…" : "비밀번호 변경"}
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const guard = await requireAdminPage(context);
  if ("redirect" in guard) return guard;
  const session = await requireAdmin(context.req);
  const user = session.user as typeof session.user & {
    role?: string;
    accountStatus?: string;
  };
  return {
    props: {
      account: {
        name: user.name || "",
        email: user.email,
        role: user.role || "ADMIN",
        accountStatus: user.accountStatus || "ACTIVE",
      },
    },
  };
}
