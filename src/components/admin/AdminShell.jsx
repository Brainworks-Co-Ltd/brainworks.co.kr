import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { isOriginMismatch } from "@/lib/admin-api";

const navigation = [
  { href: "/admin", label: "운영 현황" },
  { href: "/admin/news", label: "뉴스" },
  { href: "/admin/notices", label: "공지사항" },
  { href: "/admin/popup-notices", label: "팝업 공지" },
  { href: "/admin/honors", label: "수상 및 인증" },
  { href: "/admin/ai-solutions", label: "AI 솔루션" },
];

export function AdminShell({ children, activePath = "/admin" }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  async function signOut() {
    setIsSigningOut(true);
    setSignOutError("");
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (isOriginMismatch({ status: response.status, message: payload?.message })) {
          setSignOutError(
            `접속 주소가 서버의 APP_ORIGIN 설정과 다릅니다. 현재 주소(${window.location.origin})로 APP_ORIGIN을 맞춘 뒤 다시 시도해 주세요.`,
          );
          setIsSigningOut(false);
          return;
        }
        throw new Error("로그아웃 요청 실패");
      }
      await router.replace("/admin/auth/sign-in");
    } catch {
      setSignOutError("로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setIsSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-ink)]">
      <Head>
        <meta name="robots" content="noindex,nofollow" key="robots" />
      </Head>
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white px-6 py-6 lg:border-b-0 lg:border-r">
          <Link
            href="/admin"
            className="text-lg font-semibold tracking-[-0.025em]"
          >
            Brainworks Admin
          </Link>
          <nav aria-label="관리자 메뉴" className="mt-8 grid gap-2">
            {navigation.map((item) => {
              const active = activePath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-[var(--bw-color-ink)] text-white" : "text-[var(--bw-color-muted)] hover:bg-[var(--bw-color-surface-muted)] hover:text-[var(--bw-color-ink)]"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-10 border-t border-slate-200 pt-5">
            <Link
              href="/"
              className="text-sm text-[var(--bw-color-muted)] hover:text-[var(--bw-color-ink)]"
            >
              홈페이지 바로가기
            </Link>
            <Link
              href="/admin/account"
              className="mt-3 block text-sm text-[var(--bw-color-muted)] hover:text-[var(--bw-color-ink)]"
            >
              계정 설정
            </Link>
            <button
              type="button"
              disabled={isSigningOut}
              onClick={signOut}
              className="mt-3 block min-h-10 text-sm text-[var(--bw-color-muted)] hover:text-[var(--bw-color-ink)] disabled:opacity-60"
            >
              {isSigningOut ? "로그아웃 중…" : "로그아웃"}
            </button>
            {signOutError ? (
              <p role="alert" className="mt-2 text-xs leading-5 text-red-700">
                {signOutError}
              </p>
            ) : null}
          </div>
        </aside>
        <main id="main-content" className="px-6 py-8 md:px-10 md:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
