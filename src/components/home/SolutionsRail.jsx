import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedPath } from "@/shared/routing/routes";
import Rail from "@/components/public/Rail";
import SectionTitle, { Arrow } from "@/components/public/SectionTitle";
import { homeCopy } from "@/data/homeCopy";

export default function SolutionsRail({ areas = [] }) {
  const { language } = useLocale();
  const listPath = getLocalizedPath("solutions.list", language);
  const solutions = areas.flatMap((area) =>
    (area.solutions || []).map((solution) => ({
      ...solution,
      areaId: area.id,
    })),
  );

  return (
    <section className="py-[120px] lg:py-[250px]">
      <SectionTitle>{homeCopy.solutionsSection.title[language]}</SectionTitle>
      <div className="bw-reveal">
        <Rail>
          {solutions.map((solution) => (
            <li
              key={solution.id}
              /* 면이 없는 카드라 그림자를 얹으면 글자 둘레에 네모난 자국만
                 남는다. 띄우는 대신 그림을 밀고 글자 색을 바꾼다. */
              className="group flex h-full w-[300px] flex-col lg:w-[409px]"
            >
              <Link
                href={`${listPath}?area=${encodeURIComponent(solution.areaId)}#business-areas`}
                className="flex h-full flex-col"
              >
                <div className="relative aspect-[409/268] overflow-hidden rounded-2xl">
                  <Image
                    src={solution.image}
                    alt={solution.imageAlt || solution.title || ""}
                    fill
                    sizes="409px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-6 text-[18px] font-semibold text-ink-strong transition-colors group-hover:text-accent-text lg:text-[22px]">
                  {solution.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.6] lg:text-[16px]">
                  {solution.description}
                </p>
                <p className="mt-auto inline-flex items-center gap-2 pt-4 text-[15px] font-semibold text-ink transition-colors group-hover:text-accent-text">
                  {language === "ko" ? "자세히 보기" : "Learn more"}{" "}
                  <Arrow className="transition-transform duration-200 group-hover:translate-x-1" />
                </p>
              </Link>
            </li>
          ))}
        </Rail>
      </div>
    </section>
  );
}
