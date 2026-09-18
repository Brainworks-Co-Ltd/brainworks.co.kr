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

        {/* 문구는 대표 메시지(08 §1.1, src:1)의 긍정형 주장 둘을 합친 것이다.
            "믿지 않는다"는 원문의 부정 문장은 강조하면 하지 않을 일을 세우는 꼴이라 뺐다.
            강조 구절은 문구와 함께 정한다. */}
        <StatementBand
          eyebrow={
            language === "ko" ? "브레인웍스가 믿는 것" : "What we believe"
          }
          text={
            language === "ko"
              ? "현장에서 곧바로 쓰이는 AI를 산업마다 다르게 설계합니다."
              : "AI that works on the floor from day one, designed differently for each industry."
          }
          emphasis={
            language === "ko"
              ? ["곧바로 쓰이는", "산업마다 다르게"]
              : // en 초안, 회사 확인
                ["works on the floor", "differently for each industry"]
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
