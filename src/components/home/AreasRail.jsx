import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedPath } from "@/shared/routing/routes";
import HomeCard from "@/components/home/HomeCard";
import SectionTitle, { Arrow } from "@/components/public/SectionTitle";
import { homeCopy } from "@/data/homeCopy";

/*
 * 사업 영역 넷을 한 줄에 고정하고, 각 영역 카드 아래에 그 영역의 솔루션을
 * 매단다. 영역이 분류, 솔루션이 그 안의 제품이라는 관계를 한 섹션에서 보인다.
 * 폰에서는 한 단으로 내리고, 영역은 작은 그림과 제목 한 줄, 솔루션은 그 제목에
 * 맞춰 들여 쓴 글자 목록으로 둬서 상하위가 글자 단계와 들여쓰기로 읽히게 한다.
 * 솔루션 줄은 기존 나타남 효과(.bw-reveal)에 순서 지연만 줘서 위에서부터
 * 차례로 드러난다. 모션 시간과 곡선은 --bw-motion-move 하나를 그대로 쓴다.
 */
const STAGGER_MS = 90;

export default function AreasRail({ areas = [] }) {
  const { language } = useLocale();
  const listPath = getLocalizedPath("solutions.list", language);

  return (
    <section className="py-[120px] lg:py-[250px]">
      <div className="inner">
        <SectionTitle sub={homeCopy.solutionsSection.title[language]}>
          {homeCopy.areasSection.title[language]}
        </SectionTitle>
      </div>
      <ul className="inner grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
        {areas.map((area) => {
          const href = `${listPath}?area=${encodeURIComponent(area.id)}#business-areas`;
          const solutions = area.solutions || [];
          return (
            <li key={area.id}>
              <div className="bw-reveal">
                <HomeCard
                  href={href}
                  image={area.heroImage}
                  alt={area.title || area.name || ""}
                  title={area.title || area.name}
                  description={area.subtitle}
                />
              </div>
              {/* 들여쓰기는 폰 영역 머리의 그림 폭(96px)과 간격(16px)을 더한 값이다.
                  게시된 솔루션이 없는 영역은 구분선만 남지 않게 목록을 그리지 않는다. */}
              {solutions.length > 0 ? (
                <ul className="mt-2 grid pl-[112px] md:mt-6 md:gap-4 md:border-t md:border-line md:pl-0 md:pt-5">
                  {solutions.map((solution, index) => (
                    <li
                      key={solution.id}
                      className="bw-reveal"
                      style={{
                        transitionDelay: `${(index + 1) * STAGGER_MS}ms`,
                      }}
                    >
                      <Link
                        href={href}
                        className="group flex min-h-11 items-center gap-2 break-keep text-[15px] font-medium text-ink-strong transition-colors hover:text-accent-text md:min-h-0 md:gap-3 md:text-[16px] md:font-semibold"
                      >
                        <span className="relative hidden h-12 w-16 shrink-0 overflow-hidden rounded-lg md:block">
                          <Image
                            src={solution.image}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </span>
                        <span className="leading-[1.4]">{solution.title}</span>
                        {/* 폰에는 썸네일이 없어 글자만으로는 누를 수 있는 줄로 안 보인다. */}
                        <Arrow className="shrink-0 text-accent-text transition-transform duration-200 group-hover:translate-x-1 md:hidden" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
