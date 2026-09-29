import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";

const items = [
  {
    key: "overview",
    href: "/about",
    label: { ko: "CEO 인사말", en: "CEO Message" },
  },
  {
    key: "history",
    href: "/about/history",
    label: { ko: "회사 연혁", en: "Company History" },
  },
  {
    key: "honors",
    href: "/about/honors",
    label: { ko: "수상 및 인증", en: "Awards & Certifications" },
  },
];

export function AboutLocalNav({ active }) {
  const { language } = useLocale();

  return (
    <nav
      aria-label={language === "ko" ? "회사소개 하위 메뉴" : "About submenu"}
      className="mb-10 lg:mb-0 lg:w-56 lg:shrink-0"
    >
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active === item.key ? "page" : undefined}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${active === item.key ? "bg-[var(--bw-color-ink)] text-white" : "text-[var(--bw-color-muted)] hover:bg-[var(--bw-color-surface-muted)] hover:text-[var(--bw-color-ink)]"}`}
          >
            {item.label[language]}
          </Link>
        ))}
      </div>
    </nav>
  );
}
