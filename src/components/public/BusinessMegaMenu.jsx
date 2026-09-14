import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function BusinessMegaMenu({
  menu,
  routeKey,
  onClose,
  onMouseEnter,
  onMouseLeave,
  panelId,
  panelLabel,
}) {
  const [activeAreaId, setActiveAreaId] = useState(menu.areas[0]?.id || "");
  const [failedImage, setFailedImage] = useState("");
  const activeArea =
    menu.areas.find((area) => area.id === activeAreaId) || menu.areas[0];

  useEffect(() => {
    setActiveAreaId(menu.areas[0]?.id || "");
    setFailedImage("");
  }, [menu]);

  const selectArea = (area) => {
    setActiveAreaId(area.id);
    setFailedImage("");
  };

  return (
    <div
      id={panelId}
      role="region"
      aria-label={panelLabel}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed left-1/2 top-16 z-50 grid max-h-[calc(100vh-5rem)] w-[min(56rem,calc(100vw-2rem))] -translate-x-1/2 grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-8 overflow-y-auto rounded-[var(--bw-radius-feature)] border border-slate-200 bg-white p-6 shadow-xl"
    >
      <Link
        href={menu.featured.href}
        onClick={onClose}
        className="group overflow-hidden rounded-[var(--bw-radius-card)] border border-[var(--bw-color-line)] bg-[var(--bw-color-surface-muted)] transition hover:border-[var(--bw-color-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bw-color-brand)]/40"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bw-color-surface)]">
          {activeArea && failedImage !== activeArea.image ? (
            <img
              src={activeArea.image}
              alt={activeArea.alt}
              loading="eager"
              onError={() => setFailedImage(activeArea.image)}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
            />
          ) : (
            <div
              role="img"
              aria-label={
                activeArea?.alt ||
                (menu.featured.label === "AI 솔루션"
                  ? "AI 솔루션"
                  : menu.featured.label)
              }
              className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-[var(--bw-color-muted)]"
            >
              {menu.featured.label}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 p-5">
          <span className="text-lg font-semibold text-[var(--bw-color-ink)]">
            {menu.featured.label}
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="size-5 text-[var(--bw-color-muted)] transition group-hover:text-[var(--bw-color-ink)]"
          />
        </div>
      </Link>

      <div className="grid content-start gap-8 py-1">
        <section aria-labelledby={`${panelId}-areas-title`}>
          <h3
            id={`${panelId}-areas-title`}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bw-color-muted)]"
          >
            AI 사업 분야
          </h3>
          <ul className="mt-4 grid gap-1">
            {menu.areas.map((area) => (
              <li key={area.id}>
                <Link
                  href={area.href}
                  aria-current={
                    routeKey === "solutions.list" ? "page" : undefined
                  }
                  onMouseEnter={() => selectArea(area)}
                  onFocus={() => selectArea(area)}
                  onClick={onClose}
                  className="block rounded-xl px-3 py-2.5 text-base font-medium text-[var(--bw-color-ink)] transition hover:bg-[var(--bw-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bw-color-brand)]/40"
                >
                  {area.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={`${panelId}-services-title`}>
          <h3
            id={`${panelId}-services-title`}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--bw-color-muted)]"
          >
            서비스
          </h3>
          <ul className="mt-4 grid gap-1">
            {menu.services.map((service) => (
              <li key={service.id}>
                <Link
                  href={service.href}
                  aria-current={
                    service.activeRouteKeys.includes(routeKey)
                      ? "page"
                      : undefined
                  }
                  onClick={onClose}
                  className="block rounded-xl px-3 py-2.5 text-base font-medium text-[var(--bw-color-ink)] transition hover:bg-[var(--bw-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bw-color-brand)]/40"
                >
                  {service.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
