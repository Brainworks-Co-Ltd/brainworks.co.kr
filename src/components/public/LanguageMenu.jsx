import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "lucide-react";

/*
 * 언어 선택. 버튼은 어느 언어 화면에서든 알아보도록 "Language"로 고정하고,
 * 현재 언어는 열린 목록의 체크 표시로 보여 준다.
 * 언어를 늘리려면 이 목록과 next.config.js의 locales에 같이 추가한다.
 */
export const LANGUAGES = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
];

export function LanguageMenu({ language, onSelect, className = "" }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const menuLabel = language === "ko" ? "언어 선택" : "Select language";

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "mousedown" && root.current?.contains(event.target))
        return;
      setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("mousedown", close);
    };
  }, [open]);

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={menuLabel}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-[16px] font-semibold text-ink-strong transition hover:border-ink-strong"
      >
        <GlobeIcon aria-hidden="true" className="size-5" />
        <span>Language</span>
        <ChevronDownIcon
          aria-hidden="true"
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <ul
          role="menu"
          aria-label={menuLabel}
          className="absolute right-0 top-[calc(100%+8px)] min-w-40 rounded-2xl border border-line bg-white p-2 shadow-[var(--bw-shadow-soft)]"
        >
          {LANGUAGES.map((item) => (
            <li key={item.code} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={item.code === language}
                lang={item.code}
                onClick={() => {
                  setOpen(false);
                  if (item.code !== language) onSelect(item.code);
                }}
                className={`flex w-full items-center justify-between gap-4 rounded-xl px-4 py-2.5 text-left text-[16px] font-medium transition hover:bg-[var(--bw-color-surface-muted)] ${item.code === language ? "text-ink-strong" : "text-muted"}`}
              >
                {item.label}
                {item.code === language ? (
                  <CheckIcon aria-hidden="true" className="size-4" />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
