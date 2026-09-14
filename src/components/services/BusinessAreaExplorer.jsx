import { useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedBusinessAreas } from "@/data/businessAreas";
import { SolutionCard } from "@/components/public/SolutionCard";
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
            className={`min-h-11 whitespace-nowrap rounded-full border px-4 py-3 text-sm font-medium transition ${area.id === activeArea.id ? "border-transparent bg-[var(--bw-accent)] text-[var(--bw-ink)]" : "border-[var(--bw-color-line)] bg-[var(--bw-color-surface-muted)] text-[var(--bw-color-muted)] hover:border-[var(--bw-line-strong)] hover:text-[var(--bw-color-ink)]"}`}
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
        <div className="bw-area-intro" key={activeArea.id}>
          <div>
            <p className="bw-label text-[var(--bw-accent-text)]">
              {activeArea.title}
            </p>
            <h2 className="bw-h1 mt-4">{activeArea.subtitle}</h2>
          </div>
          <div>
            <p className="bw-body text-[var(--bw-muted)]">
              {activeArea.description}
            </p>
            <Link
              className="ind-btn bw-area-intro__link"
              href={`/contact?topic=solution&area=${encodeURIComponent(activeArea.id)}`}
            >
              {language === "ko" ? "이 영역 문의하기" : "Discuss this area"}
            </Link>
          </div>
        </div>

        <div className="mt-14">
          {/* 개수 표기를 두지 않는다. 카드마다 01 / 04 진행 표기가 이미 있어 중복이고,
            목록 옆에 총계를 붙이면 세어 준 만큼의 정보가 늘지 않는다. */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--bw-color-muted)]">
              {language === "ko" ? "솔루션" : "Solutions"}
            </p>
            <h3 className="bw-h2 mt-3 text-[var(--bw-color-ink)]">
              {activeArea.title}
            </h3>
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
                void router.push(
                  `/contact?topic=solution&area=${activeArea.id}`,
                )
              }
              className="mt-6"
            />
          ) : (
            <div className="mt-8 grid gap-6 md:mt-12 lg:grid-cols-2">
              {activeArea.solutions.map((solution, index) => (
                <SolutionCard
                  key={solution.id}
                  index={index + 1}
                  total={activeArea.solutions.length}
                  title={solution.title}
                  description={solution.description}
                  image={solution.image}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
