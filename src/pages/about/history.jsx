import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AboutLocalNav } from "@/components/public/AboutLocalNav";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import { useLocale } from "@/shared/routing/useLocale";
import { historyItems, historyAccentPalette } from "@/data/companyHistory";

export default function CompanyHistoryPage() {
  const { language } = useLocale();

  return (
    <div id="main-content" className="min-h-screen bg-gray-50">
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
      <PageHero
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
              <div className="mt-12 space-y-8">
                {historyItems.map((item, index) => {
                  const accent =
                    historyAccentPalette[index % historyAccentPalette.length];
                  return (
                    <article
                      key={item.year}
                      className="relative overflow-hidden rounded-[var(--bw-radius-card)] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <div
                        className={
                          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r " +
                          accent
                        }
                        aria-hidden="true"
                      />
                      <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,_140px)_1fr] md:p-8">
                        <div className="flex flex-col gap-2">
                          <span className="text-3xl font-semibold text-slate-900">
                            {item.year}
                          </span>{" "}
                        </div>
                        <div className="space-y-4">
                          <p className="text-base text-slate-600">
                            {item.summary[language]}
                          </p>
                          <ul className="space-y-3 text-sm text-slate-700">
                            {item.bullets[language].map((bullet, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span
                                  className={
                                    "mt-1 inline-flex h-1.5 w-6 rounded-full bg-gradient-to-r " +
                                    accent
                                  }
                                  aria-hidden="true"
                                />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
