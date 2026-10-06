import { FormEvent, useState } from "react";
import { primaryButtonClass, inputClass } from "@/components/admin/fields";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { normalizeReturnTo } from "@/server/auth/policy";
import { isOriginMismatch } from "@/lib/admin-api";

export default function AdminSignIn() {
  const router = useRouter();
  const returnTo = normalizeReturnTo(router.query.returnTo);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, callbackURL: returnTo }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (isOriginMismatch({ status: response.status, message: payload?.message })) {
          setError(
            `접속 주소가 서버의 APP_ORIGIN 설정과 다릅니다. 현재 주소(${window.location.origin})로 APP_ORIGIN을 맞춘 뒤 다시 시도해 주세요.`,
          );
          return;
        }
        setError("이메일 또는 비밀번호를 확인해 주세요.");
        return;
      }
      await router.push(returnTo);
    } catch {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bw-admin flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <Head>
        <meta name="robots" content="noindex,nofollow" key="robots" />
      </Head>
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[var(--bw-shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-muted)]">
          Brainworks Admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.025em]">
          관리자 로그인
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--bw-color-muted)]">
          승인된 관리자 계정으로 로그인해 주세요.
        </p>
        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid content-start gap-2 text-sm font-medium" htmlFor="email">
            이메일
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="grid content-start gap-2 text-sm font-medium" htmlFor="password">
            비밀번호
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
          </label>
          {error ? (
            <p
              role="alert"
              className="rounded-[var(--bw-radius-control)] border-l-4 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${primaryButtonClass} w-full`}
          >
            {isSubmitting ? "확인 중…" : "로그인"}
          </button>
        </form>
        <Link
          href="/admin/auth/forgot-password"
          className="mt-6 block text-center text-sm text-[var(--bw-color-muted)] underline-offset-4 hover:underline"
        >
          비밀번호를 잊으셨나요?
        </Link>
      </section>
    </main>
  );
}
