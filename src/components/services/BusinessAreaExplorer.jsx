import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedBusinessAreas } from "@/data/businessAreas";
import { SectionHeader } from "@/components/public/SectionHeader";
import { StatePanel } from "@/components/ui/state-panel";

export default function BusinessAreaExplorer({ areas: providedAreas = null }) {
  const router = useRouter();
  const { language } = useLocale();
  const areas = useMemo(
    () => providedAreas || getLocalizedBusinessAreas(language),
    [language, providedAreas],
  );
  const queryArea =
    typeof router.query.area === "string" ? router.query.area : "";
  const [activeId, setActiveId] = useState(queryArea || areas[0]?.id || "");

  useEffect(() => {
    const nextId = areas.some((area) => area.id === queryArea)
      ? queryArea
      : areas[0]?.id || "";
    setActiveId(nextId);
  }, [areas, queryArea]);

  const activeArea = areas.find((area) => area.id === activeId) || areas[0];

  const selectArea = (id) => {
    setActiveId(id);
    void router.replace(
      { pathname: router.pathname, query: { area: id } },
      undefined,
      { shallow: true, scroll: false },
    );
  };

  if (!activeArea) {
    return (
      <StatePanel
        status="empty"
        title={
          language === "ko"
            ? "게시된 사업 영역이 없습니다."
            : "No business areas are published."
        }
        description={
          language === "ko"
            ? "문의하기에서 필요한 AI 과제를 알려주세요."
            : "Tell us about your AI challenge so we can help."
        }
        actionLabel={language === "ko" ? "문의하기" : "Contact us"}
        onAction={() => void router.push("/contact")}
      />
    );
  }

  return (
    <section
      aria-label={
        language === "ko" ? "사업 영역 탐색" : "Business area explorer"
      }
    >
      <div
        role="tablist"
        aria-label={language === "ko" ? "사업 영역" : "Business areas"}
        className="flex gap-3 overflow-x-auto border-b border-slate-200 pb-3"
      >
        {areas.map((area) => (
          <button
            key={area.id}
            type="button"
            role="tab"
            aria-selected={area.id === activeArea.id}
            tabIndex={area.id === activeArea.id ? 0 : -1}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${area.id === activeArea.id ? "bg-[var(--bw-color-ink)] text-white" : "text-[var(--bw-color-muted)] hover:bg-[var(--bw-color-surface-muted)] hover:text-[var(--bw-color-ink)]"}`}
            onClick={() => selectArea(area.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                const index =
                  (areas.findIndex((item) => item.id === area.id) + 1) %
                  areas.length;
                selectArea(areas[index].id);
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                const index =
                  (areas.findIndex((item) => item.id === area.id) -
                    1 +
                    areas.length) %
                  areas.length;
                selectArea(areas[index].id);
              }
            }}
          >
            {area.title}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative min-h-[360px] overflow-hidden rounded-[var(--bw-radius-feature)] bg-black">
          <Image
            src={activeArea.heroImage}
            alt={activeArea.title}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <SectionHeader
            eyebrow={activeArea.title}
            title={activeArea.subtitle}
            description={activeArea.description}
          />
          <Link
            href={`/contact?topic=solution&area=${encodeURIComponent(activeArea.id)}`}
            className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[var(--bw-color-ink)] px-6 py-3 text-sm font-semibold text-white hover:bg-black"
          >
            {language === "ko" ? "이 영역 문의하기" : "Discuss this area"}
          </Link>
        </div>
      </div>

      <div className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-muted)]">
              {language === "ko" ? "솔루션" : "Solutions"}
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--bw-color-ink)]">
              {activeArea.title}
            </h3>
          </div>
          <span className="text-sm text-[var(--bw-color-muted)]">
            {activeArea.solutions.length}
          </span>
        </div>
        {activeArea.solutions.length === 0 ? (
          <StatePanel
            status="empty"
            title={
              language === "ko"
                ? "준비 중인 솔루션입니다."
                : "Solutions are being prepared."
            }
            actionLabel={language === "ko" ? "문의하기" : "Contact us"}
            onAction={() =>
              void router.push(`/contact?topic=solution&area=${activeArea.id}`)
            }
            className="mt-6"
          />
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {activeArea.solutions.map((solution) => (
              <article
                key={solution.id}
                className="overflow-hidden rounded-[var(--bw-radius-card)] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[16/9] bg-[var(--bw-color-surface-muted)]">
                  <Image
                    src={solution.image}
                    alt={solution.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-[var(--bw-color-ink)]">
                    {solution.title}
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-[var(--bw-color-muted)]">
                    {solution.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
