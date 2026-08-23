import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { normalizeReturnTo } from "@/server/auth/policy";

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
    <main className="flex min-h-screen items-center justify-center bg-[var(--bw-color-surface-muted)] px-6 py-12">
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
          <label className="grid gap-2 text-sm font-medium" htmlFor="email">
            이메일
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 outline-none focus:border-[var(--bw-color-brand)] focus:ring-2 focus:ring-[var(--bw-color-brand)]/30"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium" htmlFor="password">
            비밀번호
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 outline-none focus:border-[var(--bw-color-brand)] focus:ring-2 focus:ring-[var(--bw-color-brand)]/30"
            />
          </label>
          {error ? (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-11 rounded-full bg-[var(--bw-color-ink)] px-5 text-sm font-semibold text-white hover:bg-black disabled:cursor-wait disabled:opacity-60"
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
