import Link from "next/link";

const navigation = [
  { href: "/admin", label: "운영 현황" },
  { href: "/admin/news", label: "뉴스" },
  { href: "/admin/notices", label: "공지사항" },
  { href: "/admin/popup-notices", label: "팝업 공지" },
  { href: "/admin/honors", label: "수상 및 인증" },
  { href: "/admin/ai-solutions/areas", label: "AI 솔루션" },
];

export function AdminShell({ children, activePath = "/admin" }) {
  return (
    <div className="min-h-screen bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-ink)]">
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
              공개 사이트 보기
            </Link>
            <Link
              href="/admin/account"
              className="mt-3 block text-sm text-[var(--bw-color-muted)] hover:text-[var(--bw-color-ink)]"
            >
              계정 설정
            </Link>
          </div>
        </aside>
        <main id="main-content" className="px-6 py-8 md:px-10 md:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
