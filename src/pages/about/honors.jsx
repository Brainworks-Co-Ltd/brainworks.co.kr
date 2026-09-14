import React from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AboutLocalNav } from "@/components/public/AboutLocalNav";
import { PageHero } from "@/components/public/PageHero";
import { SectionHeader } from "@/components/public/SectionHeader";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import { useLocale } from "@/shared/routing/useLocale";
import awardsData from "@/utils/awardsData";
import certificationsData from "@/utils/certificationsData";
import { getPublishedHonors } from "@/server/modules/honors/queries";

const copy = {
  ko: {
    title: "수상 및 인증",
    subtitle: "브레인웍스의 우수한 AI 기술력 기반 수상 및 인증",
    awardsLabel: "주요 수상 이력",
    certificationsLabel: "주요 인증 현황",
    awardAltSuffix: "수상 이미지",
    certAltSuffix: "인증 이미지",
  },
  en: {
    title: "Awards & Certifications",
    subtitle:
      "A comprehensive view of the accolades and certifications that validate Brainworks’ expertise.",
    awardsLabel: "Awards",
    certificationsLabel: "Certifications",
    awardAltSuffix: "award image",
    certAltSuffix: "certification image",
  },
};

const formatAwardPeriod = (year, date) => {
  if (!date) {
    return String(year);
  }
  const match = String(date).match(/^(\d{4})-(\d{2})/);
  if (match) {
    const [, y, m] = match;
    return `${y}/${m}`;
  }
  return String(year);
};

export default function HonorsPage({
  awards = awardsData,
  certifications = certificationsData,
}) {
  const { language } = useLocale();
  const t = copy[language];

  return (
    <div
      id="main-content"
      className="min-h-screen bg-[var(--bw-color-surface-muted)]"
    >
      <Header />
      <SeoMetadata title={`${t.title} | Brainworks`} description={t.subtitle} />
      <PageHero
        variant="plain"
        eyebrow="About Brainworks"
        title={t.title}
        description={t.subtitle}
      />

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-12 lg:flex-row">
            <AboutLocalNav active="honors" />

            <div className="flex-1">
              <div className="mt-12 space-y-16">
                <section>
                  <SectionHeader eyebrow="Awards" title={t.awardsLabel} />
                  <div className="mt-6 divide-y divide-[var(--bw-color-line)] border-y border-[var(--bw-color-line)]">
                    {awards.map((award, index) => (
                      <article
                        key={[award.slug || award.title.ko, award.year].join(
                          "-",
                        )}
                        className="grid gap-6 bg-white py-8 md:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] md:items-center md:gap-10"
                      >
                        <div className="relative flex h-40 w-full items-center justify-center bg-[var(--bw-color-surface-muted)] p-6 md:h-32">
                          {award.image ? (
                            <Image
                              src={award.image}
                              alt={`${award.title[language]} ${t.awardAltSuffix}`}
                              fill
                              sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 90vw"
                              className="object-contain"
                            />
                          ) : (
                            // 상장 사진을 아직 받지 못한 수상. 다른 해 이미지를 돌려쓰지 않는다.
                            <span className="text-sm font-semibold text-[var(--bw-color-muted)]">
                              {formatAwardPeriod(award.year, award.date)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[var(--bw-color-muted)]">
                            <span>#{String(index + 1).padStart(2, "0")}</span>
                            <span>
                              {formatAwardPeriod(award.year, award.date)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-[var(--bw-color-ink)]">
                            {award.title[language]}
                          </h3>
                          <p className="text-sm text-[var(--bw-color-muted)]">
                            {award.org[language]}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section>
                  <SectionHeader
                    eyebrow="Certifications"
                    title={t.certificationsLabel}
                  />
                  <div className="mt-6 divide-y divide-[var(--bw-color-line)] border-y border-[var(--bw-color-line)]">
                    {certifications.map((cert) => (
                      <article
                        key={[cert.slug || cert.title.ko, cert.org.ko].join(
                          "-",
                        )}
                        className="grid gap-6 bg-white py-8 md:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] md:items-center md:gap-10"
                      >
                        <div className="relative flex h-40 w-full items-center justify-center bg-[var(--bw-color-surface-muted)] p-6 md:h-32">
                          <Image
                            src={cert.image}
                            alt={`${cert.title[language]} ${t.certAltSuffix}`}
                            fill
                            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 90vw"
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[var(--bw-color-muted)]">
                            <span>{cert.org[language]}</span>
                            <span>{cert.year}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-[var(--bw-color-ink)]">
                            {cert.title[language]}
                          </h3>
                          <p className="text-sm text-[var(--bw-color-muted)]">
                            {cert.description[language]}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  const data = await getPublishedHonors(locale === "en" ? "en" : "ko");
  return { props: data };
}
