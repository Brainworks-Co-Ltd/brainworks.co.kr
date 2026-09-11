import { FormEvent, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

export default function ResetPassword() {
  const router = useRouter();
  const token =
    typeof router.query.token === "string" ? router.query.token : "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password, token }),
      });
      setMessage(
        response.ok
          ? "비밀번호가 변경되었습니다."
          : "재설정 링크가 만료되었거나 올바르지 않습니다.",
      );
    } catch {
      setMessage("요청을 처리하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bw-color-surface-muted)] px-6 py-12">
      <Head>
        <meta name="robots" content="noindex,nofollow" key="robots" />
      </Head>
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[var(--bw-shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-muted)]">
          Brainworks Admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.025em]">
          새 비밀번호 설정
        </h1>
        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium" htmlFor="password">
            새 비밀번호
            <input
              id="password"
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 px-3 outline-none focus:border-[var(--bw-color-brand)] focus:ring-2 focus:ring-[var(--bw-color-brand)]/30"
            />
          </label>
          {message ? (
            <p
              role="status"
              className="rounded-xl bg-[var(--bw-color-surface-muted)] p-4 text-sm leading-7 text-[var(--bw-color-muted)]"
            >
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="min-h-11 rounded-full bg-[var(--bw-color-ink)] px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? "저장 중…" : "비밀번호 저장"}
          </button>
        </form>
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
