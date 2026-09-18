import React from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocale } from "@/shared/routing/useLocale";
import { ContactCtaBlock } from "@/components/public/ContactCtaBlock";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import DetailSectionHead from "@/components/public/DetailSectionHead";
import { getPublishedBusinessArea } from "@/server/modules/catalog/queries";

/*
 * 영역 이름의 마지막 낱말(AI, Agent)은 네 영역이 공유하는 분류라 가늘고 옅게,
 * 앞부분(Manufacturing, Healthcare & Bio)은 이 페이지만의 것이라 굵고 희게 그린다.
 * 목록 페이지 히어로와 같은 틀을 쓰면서도 글자 굵기만으로 다른 페이지임을 알린다.
 */
function AreaHeading({ title }) {
  const words = title.split(" ");
  if (words.length < 2) return title;
  return (
    <>
      {words.slice(0, -1).join(" ")}{" "}
      <span className="font-normal text-white/60">{words.at(-1)}</span>
    </>
  );
}

export default function BusinessAreaDetail({ area }) {
  const { language } = useLocale();
  const ko = language === "ko";

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SeoMetadata
        title={ko ? `${area.title} | 브레인웍스` : `${area.title} | Brainworks`}
        description={area.description}
      />
      <main id="main-content" data-accent="solution">
        <PageHero
          variant="media"
          media={{
            kind: "video",
            src: `/videos/home/${area.id}.mp4`,
            poster: area.heroImage,
            alt: "",
          }}
          eyebrow={ko ? "AI 솔루션" : "AI Solutions"}
          title={area.title}
          heading={<AreaHeading title={area.title} />}
          description={area.description}
          chips={
            area.solutions.length > 0
              ? area.solutions.map((solution) => solution.title)
              : null
          }
          action={{
            href: "/contact?topic=solution",
            label: ko ? "솔루션 문의" : "Discuss a solution",
          }}
        />

        {area.solutions.length > 0 ? (
          <section>
            <div className="inner">
              <DetailSectionHead eyebrow="Solutions" title={area.subtitle} />
              {/* 솔루션마다 문장을 큰 글자로, 제품 이름을 작은 강조색 라벨로 놓는다.
                  목록 페이지는 이름이 크고 문장이 작으므로 위계가 뒤집혀 다른
                  페이지로 읽힌다. 문장은 데이터의 요약문을 그대로 쓴다. */}
              <div className="flex flex-col gap-y-20 lg:gap-y-32">
                {area.solutions.map((solution, index) => {
                  const isEvenRow = index % 2 === 1;
                  const detail =
                    solution.detail && solution.detail !== solution.description
                      ? solution.detail
                      : null;

                  return (
                    <article
                      key={solution.id}
                      className="bw-reveal grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-16"
                      style={{
                        transitionDelay: `${Math.min(index, 6) * 80}ms`,
                      }}
                    >
                      <div
                        className={`relative aspect-[4/3] overflow-hidden rounded-[24px] ${
                          isEvenRow ? "lg:order-2" : ""
                        }`}
                      >
                        <Image
                          src={solution.image}
                          alt={solution.imageAlt || solution.title}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 50vw, 100vw"
                        />
                      </div>
                      <div>
                        <h3 className="flex items-baseline gap-3 text-[15px] font-bold text-accent-text lg:text-[16px]">
                          <span className="tabular-nums">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {solution.title}
                        </h3>
                        <p className="mt-4 text-[26px] font-bold leading-[1.35] break-keep text-pretty text-ink-strong lg:text-[34px]">
                          {solution.description}
                        </p>
                        {detail ? (
                          <p className="mt-5 text-[17px] leading-[1.7] text-muted-foreground">
                            {detail}
                          </p>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        <section className="inner">
          <ContactCtaBlock
            title={
              ko
                ? "어느 영역의 문제인지 정해졌나요?"
                : "Know which domain your problem sits in?"
            }
            description={
              ko
                ? "현장의 문제를 알려주시면 어느 솔루션이 맞는지, 없으면 무엇을 만들어야 하는지 먼저 판단해 드립니다."
                : "Tell us the problem on your floor and we will identify the right solution, or what needs building."
            }
            href="/contact?topic=solution"
            label={ko ? "솔루션 문의" : "Discuss a solution"}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export async function getServerSideProps({ params, locale }) {
  const area = await getPublishedBusinessArea(
    params.area,
    locale === "en" ? "en" : "ko",
  );

  if (!area) {
    return { notFound: true };
  }

  return { props: { area } };
}
