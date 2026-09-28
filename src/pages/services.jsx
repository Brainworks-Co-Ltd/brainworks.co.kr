import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/public/PageHero";
import { ContactCtaBlock } from "@/components/public/ContactCtaBlock";
import { StatementBand } from "@/components/public/StatementBand";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import { Arrow } from "@/components/public/SectionTitle";
import { useLocale } from "@/shared/routing/useLocale";
import { getLocalizedPath } from "@/shared/routing/routes";
import { getPublishedBusinessAreas } from "@/server/modules/catalog/queries";

export default function Services({ areas }) {
  const { language } = useLocale();

  return (
    <div className="min-h-screen bg-white text-[var(--bw-color-ink)]">
      <Header />
      <SeoMetadata
        title={
          language === "ko"
            ? "AI 솔루션 | 브레인웍스"
            : "AI Solutions | Brainworks"
        }
        description={
          language === "ko"
            ? "브레인웍스의 네 가지 AI 사업 영역과 솔루션을 탐색합니다."
            : "Explore Brainworks AI domains and solutions."
        }
      />
      <main id="main-content" data-accent="solution">
        {/* 상단 계약 — docs/designs/detail-page-roles.md (2026-09-16 개정)
            눈썹이 내비게이션 분류, h1이 페이지 이름, 설명이 한 줄 서비스 설명이다. */}
        <PageHero
          variant="media"
          media={{
            kind: "image",
            src: "/images/home/solution.webp",
            alt: "",
          }}
          eyebrow={language === "ko" ? "사업 영역" : "Business"}
          title={language === "ko" ? "AI 솔루션" : "AI Solutions"}
          description={
            language === "ko"
              ? "제조, 에이전트, 헬스케어와 바이오, 스마트시티와 안전 네 영역의 솔루션을 다룹니다."
              : "Covers solutions across four domains: manufacturing, agents, healthcare and bio, and smart city and safety."
          }
          chips={
            areas && areas.length > 0 ? areas.map((area) => area.title) : null
          }
          action={{
            href: "/contact?topic=solution",
            label: language === "ko" ? "솔루션 문의" : "Discuss a solution",
          }}
        />

        <section>
          <div className="inner">
            <div className="grid grid-cols-1 gap-x-12 gap-y-14 lg:grid-cols-2">
              {(areas || []).map((area, index) => (
                <Link
                  key={area.id}
                  href={getLocalizedPath("solutions.detail", language, {
                    area: area.id,
                  })}
                  style={{ transitionDelay: `${Math.min(index, 6) * 80}ms` }}
                  className="bw-reveal group flex flex-col"
                >
                  <span className="relative block aspect-[16/10] overflow-hidden rounded-2xl">
                    <Image
                      src={area.heroImage}
                      alt={area.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>
                  <p className="mt-6 text-[14px] font-bold text-accent-text">
                    {area.subtitle}
                  </p>
                  <h3 className="mt-2 text-[22px] font-semibold text-ink-strong lg:text-[28px]">
                    {area.title}
                  </h3>
                  <p className="mt-3 text-[18px] leading-[1.75]">
                    {area.description}
                  </p>
                  <span className="mt-6 inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full border border-line bg-white px-6 text-[15px] font-semibold text-ink-strong transition-colors duration-200 group-hover:border-accent group-hover:text-accent-text">
                    {language === "ko" ? "자세히 보기" : "Learn more"}
                    <Arrow className="transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 결과를 말하는 한 문장이다. 앞줄은 무엇으로 일하는지, 뒷줄은 고객에게
            생기는 상태를 말한다. 뒷줄이 늘 서 있고 앞줄은 포인터가 닿을 때 밝아진다.
            영문의 "help build"는 "만듭니다"가 회사를 세운다는 뜻으로 읽히지 않게 한 것이다. */}
        <StatementBand
          eyebrow={language === "ko" ? "브레인웍스가 하는 일" : "What we do"}
          text={
            language === "ko"
              ? "각 산업에 맞는 AI로, 사람과 AI가 함께 일하는 기업을 만듭니다."
              : "With AI built for each industry, we help build companies where people and AI work together."
          }
          emphasis={
            language === "ko"
              ? ["사람과 AI가 함께 일하는 기업"]
              : // en 초안, 회사 확인
                ["companies where people and AI work together"]
          }
        />

        <section className="inner">
          <ContactCtaBlock
            title={
              language === "ko"
                ? "어느 영역의 문제인지 정해졌나요?"
                : "Know which domain your problem sits in?"
            }
            description={
              language === "ko"
                ? "현장의 문제를 알려주시면 어느 솔루션이 맞는지, 없으면 무엇을 만들어야 하는지 먼저 판단해 드립니다."
                : "Tell us the problem on your floor and we will identify the right solution, or what needs building."
            }
            href="/contact?topic=solution"
            label={language === "ko" ? "솔루션 문의" : "Discuss a solution"}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      areas: await getPublishedBusinessAreas(locale === "en" ? "en" : "ko"),
    },
  };
}
