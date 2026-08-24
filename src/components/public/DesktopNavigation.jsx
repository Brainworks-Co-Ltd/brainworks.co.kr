import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function DesktopNavigation({
  items,
  activeGroup,
  routeKey,
  navigationLabel,
}) {
  const [openGroup, setOpenGroup] = useState(null);
  const navigationRef = useRef(null);
  const triggerRefs = useRef(new Map());

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key !== "Escape" || !openGroup) return;

      const previous = openGroup;
      setOpenGroup(null);
      requestAnimationFrame(() => triggerRefs.current.get(previous)?.focus());
    };

    const closeOnPointerDown = (event) => {
      if (!navigationRef.current?.contains(event.target)) {
        setOpenGroup(null);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnPointerDown);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnPointerDown);
    };
  }, [openGroup]);

  return (
    <nav ref={navigationRef} aria-label={navigationLabel}>
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          if (item.type === "link") {
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={activeGroup === item.id ? "page" : undefined}
                  className="rounded-full px-3 py-2 text-sm font-medium text-[var(--bw-color-muted)] transition hover:bg-[var(--bw-color-surface-muted)] hover:text-[var(--bw-color-ink)]"
                >
                  {item.label}
                </Link>
              </li>
            );
          }

          const isOpen = openGroup === item.id;

          return (
            <li key={item.id} className="relative">
              <button
                ref={(element) => {
                  if (element) {
                    triggerRefs.current.set(item.id, element);
                  } else {
                    triggerRefs.current.delete(item.id);
                  }
                }}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`public-nav-panel-${item.id}`}
                data-current={activeGroup === item.id ? "true" : undefined}
                onClick={() =>
                  setOpenGroup((current) =>
                    current === item.id ? null : item.id,
                  )
                }
                className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition ${activeGroup === item.id || isOpen ? "bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-ink)]" : "text-[var(--bw-color-muted)] hover:bg-[var(--bw-color-surface-muted)] hover:text-[var(--bw-color-ink)]"}`}
              >
                {item.label}
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen ? (
                <div
                  id={`public-nav-panel-${item.id}`}
                  role="region"
                  aria-label={`${item.label} 하위 메뉴`}
                  className="absolute right-0 top-[calc(100%+0.75rem)] z-50 min-w-72 rounded-[var(--bw-radius-card)] border border-slate-200 bg-white p-3 shadow-xl"
                >
                  <ul className="grid gap-1">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.href}
                          aria-current={
                            child.activeRouteKeys.includes(routeKey)
                              ? "page"
                              : undefined
                          }
                          onClick={() => setOpenGroup(null)}
                          className="block rounded-xl px-4 py-3 transition hover:bg-[var(--bw-color-surface-muted)]"
                        >
                          <span className="block text-sm font-semibold text-[var(--bw-color-ink)]">
                            {child.label}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[var(--bw-color-muted)]">
                            {child.description}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
