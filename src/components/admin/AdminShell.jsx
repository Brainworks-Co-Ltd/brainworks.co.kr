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
    <div className="min-h-screen bg-white text-[var(--bw-color-ink)]">
      <Head>
        <meta name="robots" content="noindex,nofollow" key="robots" />
      </Head>
      <div className="grid min-h-screen lg:grid-cols-[232px_minmax(0,1fr)]">
        <aside className="flex flex-col border-b border-[var(--bw-color-line)] bg-[var(--bw-color-ink)] px-5 py-6 text-white lg:border-b-0">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 text-base font-semibold tracking-[-0.02em]"
          >
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[var(--bw-accent-strong,#8b93ea)]" />
            Brainworks Admin
          </Link>
          <nav
            aria-label="관리자 메뉴"
            className="mt-4 flex gap-1 overflow-x-auto pb-1 lg:mt-8 lg:grid lg:overflow-visible lg:pb-0"
          >
            {navigation.map((item) => {
              const active = activePath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-3 rounded-[var(--bw-radius-control)] px-3 py-2.5 text-sm font-medium transition ${active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
                >
                  <span
                    aria-hidden
                    className={`h-5 w-0.5 rounded-full ${active ? "bg-[var(--bw-accent-strong,#8b93ea)]" : "bg-transparent"}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 flex flex-wrap gap-1 border-t border-white/10 pt-4 text-sm lg:mt-auto lg:grid lg:pt-5">
            <Link
              href="/"
              className="rounded-[var(--bw-radius-control)] px-3 py-2 text-white/65 hover:bg-white/5 hover:text-white"
            >
              홈페이지 바로가기
            </Link>
            <Link
              href="/admin/account"
              aria-current={activePath === "/admin/account" ? "page" : undefined}
              className={`rounded-[var(--bw-radius-control)] px-3 py-2 hover:bg-white/5 hover:text-white ${activePath === "/admin/account" ? "text-white" : "text-white/65"}`}
            >
              계정 설정
            </Link>
            <button
              type="button"
              disabled={isSigningOut}
              onClick={signOut}
              className="rounded-[var(--bw-radius-control)] px-3 py-2 text-left text-white/65 hover:bg-white/5 hover:text-white disabled:opacity-60"
            >
              {isSigningOut ? "로그아웃 중…" : "로그아웃"}
            </button>
            {signOutError ? (
              <p role="alert" className="px-3 text-xs leading-5 text-amber-300">
                {signOutError}
              </p>
            ) : null}
          </div>
        </aside>
        <main id="main-content" className="min-w-0 px-6 py-8 md:px-10 md:py-10">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
