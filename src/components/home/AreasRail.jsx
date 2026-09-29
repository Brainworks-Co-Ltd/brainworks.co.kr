import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedPath } from "@/shared/routing/routes";
import HomeCard from "@/components/home/HomeCard";
import SectionTitle from "@/components/public/SectionTitle";
import { homeCopy } from "@/data/homeCopy";

/*
 * 사업 영역 넷을 한 줄에 고정하고, 각 영역 카드 아래에 그 영역의 솔루션을
 * 매단다. 영역이 분류, 솔루션이 그 안의 제품이라는 관계를 한 섹션에서 보인다.
 * 솔루션 줄은 기존 나타남 효과(.bw-reveal)에 순서 지연만 줘서 위에서부터
 * 차례로 드러난다. 모션 시간과 곡선은 --bw-motion-move 하나를 그대로 쓴다.
 */
const STAGGER_MS = 90;

export default function AreasRail({ areas = [] }) {
  const { language } = useLocale();
  const listPath = getLocalizedPath("solutions.list", language);

  return (
    <section className="py-[120px] lg:py-[250px]">
      <SectionTitle sub={homeCopy.solutionsSection.title[language]}>
        {homeCopy.areasSection.title[language]}
      </SectionTitle>
      <ul className="inner grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
        {areas.map((area) => {
          const href = `${listPath}?area=${encodeURIComponent(area.id)}#business-areas`;
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
              <ul className="mt-6 grid gap-4 border-t border-line pt-5">
                {(area.solutions || []).map((solution, index) => (
                  <li
                    key={solution.id}
                    className="bw-reveal"
                    style={{ transitionDelay: `${(index + 1) * STAGGER_MS}ms` }}
                  >
                    <Link
                      href={href}
                      className="group flex items-center gap-3 text-[16px] font-semibold text-ink-strong transition-colors hover:text-accent-text"
                    >
                      <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={solution.image}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </span>
                      <span className="leading-[1.4]">{solution.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
