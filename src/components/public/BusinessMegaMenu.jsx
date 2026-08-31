import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/*
 * 사업 영역 메뉴.
 *
 * 네 서비스를 같은 높이로 세운다. 승인 기획 07 §12는 솔루션·컨설팅·교육·
 * 글로벌을 "별개 상품이 아니라 동행의 단계"로 배열하라고 한다. 넷은 동등하다.
 *
 * 이전에는 마키나락스식으로 왼쪽에 대표 카드를 두고 오른쪽에 링크를 몰았다
 * (2026-08-24 메가메뉴 설계). 그 카드의 존재 이유는 사업 영역 heroImage였는데
 * 자산이 낡아 이미지를 걷어내면서 절반이 빈 상자가 됐고, 컨설팅·교육·글로벌은
 * 좁은 열의 맨 아래로 밀려 묻혔다.
 *
 * 대표 카드를 없애고 넷을 나란히 둔다. 사업 영역 넷은 솔루션 아래에만 건다.
 */

export function BusinessMegaMenu({
  menu,
  routeKey,
  onClose,
  onMouseEnter,
  onMouseLeave,
  panelId,
  panelLabel,
}) {
  const entries = [
    {
      id: "solutions",
      label: menu.featured.label,
      href: menu.featured.href,
      isActive: routeKey === "solutions.list",
      areas: menu.areas,
    },
    ...menu.services.map((service) => ({
      id: service.id,
      label: service.label,
      href: service.href,
      isActive: service.activeRouteKeys.includes(routeKey),
      areas: [],
    })),
  ];

  return (
    <div
      id={panelId}
      role="region"
      aria-label={panelLabel}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed left-1/2 top-16 z-50 max-h-[calc(100vh-5rem)] w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto rounded-[var(--bw-radius-card)] border border-[var(--bw-color-line)] bg-[var(--bw-color-surface)] p-3 shadow-xl"
    >
      <ul className="grid gap-0.5">
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link
              href={entry.href}
              onClick={onClose}
              aria-current={entry.isActive ? "page" : undefined}
              className="group flex items-center justify-between gap-4 rounded-[var(--bw-radius-control)] px-4 py-3 text-base font-semibold text-[var(--bw-color-ink)] transition hover:bg-[var(--bw-color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bw-color-brand)]/40"
            >
              {entry.label}
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 shrink-0 text-[var(--bw-color-muted)] transition group-hover:text-[var(--bw-color-ink)]"
              />
            </Link>

            {entry.areas.length ? (
              <ul className="mb-2 grid gap-0.5 pl-3">
                {entry.areas.map((area) => (
                  <li key={area.id}>
                    <Link
                      href={area.href}
                      onClick={onClose}
                      className="block rounded-[var(--bw-radius-control)] px-4 py-2 text-sm text-[var(--bw-color-muted)] transition hover:bg-[var(--bw-color-surface-muted)] hover:text-[var(--bw-color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bw-color-brand)]/40"
                    >
                      {area.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BusinessMegaMenu;
