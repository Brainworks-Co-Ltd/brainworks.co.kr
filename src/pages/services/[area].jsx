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

export default function BusinessAreaDetail({ area }) {
  const { language } = useLocale();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SeoMetadata
        title={
          language === "ko"
            ? `${area.title} | 브레인웍스`
            : `${area.title} | Brainworks`
        }
        description={area.description}
      />
      <main id="main-content" data-accent="solution">
        <PageHero
          variant="media"
          media={{
            kind: "image",
            src: area.heroImage,
            alt: "",
          }}
          eyebrow={language === "ko" ? "사업 영역" : "Business"}
          title={area.title}
          description={area.description}
          chips={
            area.solutions.length > 0
              ? area.solutions.map((solution) => solution.title)
              : null
          }
          action={{
            href: "/contact?topic=solution",
            label: language === "ko" ? "솔루션 문의" : "Discuss a solution",
          }}
        />

        {area.solutions.length > 0 ? (
          <section>
            <div className="inner">
              <DetailSectionHead
                eyebrow="Solutions"
                title={
                  language === "ko"
                    ? "현장에 적용한 솔루션"
                    : "Solutions in the field"
                }
              />
              <div className="flex flex-col gap-y-20 lg:gap-y-28">
                {area.solutions.map((solution, index) => {
                  const isEvenRow = index % 2 === 1;
                  const detail =
                    solution.detail && solution.detail !== solution.description
                      ? solution.detail
                      : null;

                  return (
                    <article
                      key={solution.id}
                      className="bw-reveal grid grid-cols-1 gap-10 lg:grid-cols-2"
                      style={{
                        transitionDelay: `${Math.min(index, 6) * 80}ms`,
                      }}
                    >
                      <div
                        className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${
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
                      <div className="flex flex-col justify-center">
                        <h3 className="text-[22px] font-semibold text-ink-strong lg:text-[28px]">
                          {solution.title}
                        </h3>
                        <p className="mt-3 text-[18px] leading-[1.75]">
                          {solution.description}
                        </p>
                        {detail ? (
                          <p className="mt-3 text-[17px] leading-[1.7] text-muted-foreground">
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
