import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocaleSwitchPath } from "@/shared/routing/routes";

const navItems = [
  { href: "/", label: { ko: "홈", en: "Home" } },
  { href: "/about", label: { ko: "회사소개", en: "About" } },
  { href: "/services", label: { ko: "AI 솔루션", en: "AI Solutions" } },
  { href: "/consulting", label: { ko: "AI 컨설팅", en: "AI Consulting" } },
  { href: "/education", label: { ko: "AI 전문교육", en: "AI Academy" } },
  {
    href: "/global-programs",
    label: { ko: "글로벌 프로그램", en: "Global Programs" },
  },
  { href: "/news", label: { ko: "소식", en: "News" } },
  { href: "/contact", label: { ko: "문의하기", en: "Contact" } },
];

export default function Header() {
  const router = useRouter();
  const { language } = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const targetLocale = language === "ko" ? "en" : "ko";

  const toggleLanguage = () => {
    void router.push(
      getLocaleSwitchPath(router.asPath, targetLocale),
      undefined,
      {
        locale: targetLocale,
      },
    );
  };

  const isCurrent = (href) => {
    const currentPath =
      router.asPath.split(/[?#]/, 1)[0].replace(/\/$/, "") || "/";
    const targetPath = href.replace(/\/$/, "") || "/";
    return (
      currentPath === targetPath ||
      (targetPath !== "/" && currentPath.startsWith(`${targetPath}/`))
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={language === "ko" ? "브레인웍스 홈" : "Brainworks home"}
        >
          <img src="/images/회사로고.png" alt="" className="h-9 w-auto" />
          <span className="sr-only">Brainworks</span>
        </Link>

        <nav
          aria-label={language === "ko" ? "주요 메뉴" : "Primary navigation"}
          className="hidden lg:block"
        >
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${isCurrent(item.href) ? "bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-ink)]" : "text-[var(--bw-color-muted)] hover:bg-[var(--bw-color-surface-muted)] hover:text-[var(--bw-color-ink)]"}`}
                >
                  {item.label[language]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-[var(--bw-color-ink)] transition hover:border-[var(--bw-color-ink)]"
          >
            {language === "ko" ? "EN" : "KO"}
          </button>
          <button
            type="button"
            aria-label={language === "ko" ? "메뉴 열기" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-[var(--bw-color-ink)] lg:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <nav
          aria-label={language === "ko" ? "모바일 메뉴" : "Mobile navigation"}
          className="border-t border-slate-200 bg-white px-5 py-3 lg:hidden"
        >
          <ul className="mx-auto max-w-[1440px] space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-medium text-[var(--bw-color-ink)] hover:bg-[var(--bw-color-surface-muted)]"
                >
                  {item.label[language]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
