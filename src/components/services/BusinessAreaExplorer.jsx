import { useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedBusinessAreas } from "@/data/businessAreas";
import DetailSectionHead from "@/components/public/DetailSectionHead";
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
  const activeId = areas.some((area) => area.id === queryArea)
    ? queryArea
    : areas[0]?.id || "";
  const tabs = useRef(new Map());

  const activeArea = areas.find((area) => area.id === activeId) || areas[0];

  const selectArea = (id) => {
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
      id="business-areas"
      aria-label={
        language === "ko" ? "사업 영역 탐색" : "Business area explorer"
      }
      /* 고정 헤더가 목적지를 덮지 않도록 여백을 둔다 */
      className="scroll-mt-24"
    >
      <div
        role="tablist"
        aria-label={language === "ko" ? "사업 영역" : "Business areas"}
        className="flex flex-wrap gap-3 border-b border-[var(--bw-color-line)] pb-3"
      >
        {areas.map((area) => (
          <button
            key={area.id}
            id={`area-tab-${area.id}`}
            aria-controls="area-panel"
            ref={(element) => {
              if (element) tabs.current.set(area.id, element);
              else tabs.current.delete(area.id);
            }}
            type="button"
            role="tab"
            aria-selected={area.id === activeArea.id}
            tabIndex={area.id === activeArea.id ? 0 : -1}
            className={`inline-flex h-9 items-center whitespace-nowrap rounded-full border px-4 text-[14px] font-medium transition ${area.id === activeArea.id ? "border-transparent bg-accent text-[var(--bw-on-dark)]" : "border-line bg-tint text-muted-foreground hover:text-ink-strong"}`}
            onClick={() => selectArea(area.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                const index =
                  (areas.findIndex((item) => item.id === area.id) + 1) %
                  areas.length;
                selectArea(areas[index].id);
                tabs.current.get(areas[index].id)?.focus();
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                const index =
                  (areas.findIndex((item) => item.id === area.id) -
                    1 +
                    areas.length) %
                  areas.length;
                selectArea(areas[index].id);
                tabs.current.get(areas[index].id)?.focus();
              }
              if (event.key === "Home" || event.key === "End") {
                event.preventDefault();
                const target =
                  event.key === "Home" ? areas[0] : areas[areas.length - 1];
                selectArea(target.id);
                tabs.current.get(target.id)?.focus();
              }
            }}
          >
            {area.title}
          </button>
        ))}
      </div>

      <div
        id="area-panel"
        role="tabpanel"
        aria-labelledby={`area-tab-${activeArea.id}`}
        tabIndex={0}
      >
        {/* 선택한 산업의 설명을 읽고 바로 솔루션을 비교한다. 첫 화면 이미지는 반복하지 않는다. */}
        <div
          key={activeArea.id}
          className="bw-reveal grid grid-cols-1 gap-8 rounded-[24px] bg-tint p-8 lg:grid-cols-2 lg:p-10"
        >
          <div>
            <p className="text-[14px] font-bold text-accent-text">
              {activeArea.title}
            </p>
            <h2 className="mt-4 text-[28px] font-semibold text-ink-strong">
              {activeArea.subtitle}
            </h2>
          </div>
          <div>
            <p className="text-[16px] leading-[1.6] text-muted-foreground">
              {activeArea.description}
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center rounded-full bg-ink-strong px-6 text-[15px] font-semibold text-white transition hover:opacity-90"
              href={`/contact?topic=solution&area=${encodeURIComponent(activeArea.id)}`}
            >
              {language === "ko" ? "이 영역 문의하기" : "Discuss this area"}
            </Link>
          </div>
        </div>

        <div className="mt-14">
          <DetailSectionHead eyebrow="Solutions" title={activeArea.title} />
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
                void router.push(
                  `/contact?topic=solution&area=${activeArea.id}`,
                )
              }
              className="mt-6"
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {activeArea.solutions.map((solution, index) => (
                <article
                  key={solution.id}
                  style={{ transitionDelay: `${Math.min(index, 6) * 80}ms` }}
                  className="bw-reveal flex flex-col rounded-[24px] bg-tint p-8 lg:p-10"
                >
                  {solution.image ? (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-white">
                      <Image
                        src={solution.image}
                        alt={solution.imageAlt || solution.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <h4
                    className={`text-[22px] font-semibold text-ink-strong ${solution.image ? "mt-6" : ""}`}
                  >
                    {solution.title}
                  </h4>
                  {solution.description ? (
                    <p className="mt-3 text-[16px] leading-[1.6] text-muted-foreground">
                      {solution.description}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
