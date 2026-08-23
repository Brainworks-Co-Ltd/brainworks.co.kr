import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirectTo: "/admin/auth/reset-password",
        }),
      });
    } finally {
      setSubmitted(true);
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
          비밀번호 재설정
        </h1>
        {submitted ? (
          <p className="mt-5 rounded-xl bg-[var(--bw-color-surface-muted)] p-4 text-sm leading-7 text-[var(--bw-color-muted)]">
            계정이 존재하는 경우 재설정 안내를 보냈습니다. 메일함을 확인해
            주세요.
          </p>
        ) : (
          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium" htmlFor="email">
              관리자 이메일
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-11 rounded-xl border border-slate-300 px-3 outline-none focus:border-[var(--bw-color-brand)] focus:ring-2 focus:ring-[var(--bw-color-brand)]/30"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 rounded-full bg-[var(--bw-color-ink)] px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "전송 중…" : "재설정 메일 보내기"}
            </button>
          </form>
        )}
        <Link
          href="/admin/auth/sign-in"
          className="mt-6 block text-center text-sm text-[var(--bw-color-muted)] underline-offset-4 hover:underline"
        >
          로그인으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
