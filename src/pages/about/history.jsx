import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AboutLocalNav } from "@/components/public/AboutLocalNav";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import { useLocale } from "@/shared/routing/useLocale";
import { historyItems } from "@/data/companyHistory";

export default function CompanyHistoryPage() {
  const { language } = useLocale();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SeoMetadata
        title={
          language === "ko"
            ? "회사 연혁 | 브레인웍스"
            : "Company History | Brainworks"
        }
        description={
          language === "ko"
            ? "브레인웍스의 주요 연혁을 확인합니다."
            : "Explore Brainworks milestones."
        }
      />
      <main id="main-content">
        <PageHero
          variant="media"
          media={{ kind: "image", src: "/images/about/hero.webp", alt: "" }}
          eyebrow={language === "ko" ? "About Brainworks" : "About Brainworks"}
          title={
            language === "ko" ? "브레인웍스 주요 연혁" : "Brainworks Milestones"
          }
          description={
            language === "ko"
              ? "주요 변화와 성장 과정을 시간순으로 확인합니다."
              : "A timeline of the company's major milestones and growth."
          }
        />

        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-12 lg:flex-row">
              <AboutLocalNav active="history" />

              <div className="flex-1">
                {/* 흰 바탕 위에서 해마다 가는 선으로만 나눈다. 연도는 크게 왼쪽에 붙어
                    그해 항목을 읽는 동안 따라 내려온다. 항목 앞 "26.05." 같은 날짜는
                    강조색 라벨로 떼어 본문과 구분한다. */}
                <div className="border-b border-line">
                  {historyItems.map((item) => (
                    <article
                      key={item.year}
                      className="grid gap-6 border-t border-line py-12 md:grid-cols-[180px_1fr] md:gap-12 lg:py-16"
                    >
                      <div>
                        <p className="text-[44px] font-bold leading-none tabular-nums text-accent-strong md:sticky md:top-28 lg:text-[56px]">
                          {item.year}
                        </p>
                      </div>
                      <div>
                        <h2 className="text-[15px] font-bold text-accent-text lg:text-[16px]">
                          {item.title[language]}
                        </h2>
                        <p className="mt-3 text-[20px] font-semibold leading-[1.5] break-keep text-ink-strong lg:text-[24px]">
                          {item.summary[language]}
                        </p>
                        <ul className="mt-8 space-y-4">
                          {item.bullets[language].map((bullet) => {
                            const [, date, text] = bullet.match(
                              /^(\d{2}\.\d{2}\.|[A-Z][a-z]{2} \d{4}:)\s*(.*)$/,
                            ) || [null, null, bullet];
                            return (
                              <li
                                key={bullet}
                                className="grid grid-cols-[72px_1fr] gap-4 text-[16px] leading-[1.65] break-keep lg:grid-cols-[88px_1fr]"
                              >
                                <span className="font-semibold tabular-nums text-accent-text">
                                  {date ? date.replace(/[.:]$/, "") : ""}
                                </span>
                                <span className="text-ink">{text}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
