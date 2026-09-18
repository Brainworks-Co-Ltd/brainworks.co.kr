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
import kai from "@/assets/clients/client1.png";
import katech from "@/assets/clients/client2.jpg";
import dmi from "@/assets/clients/client3.png";
import dip from "@/assets/clients/client4.png";
import kosme from "@/assets/clients/client5.jpg";
import kpc from "@/assets/clients/client6.jpg";
import cni from "@/assets/clients/client7.png";
import ipa from "@/assets/clients/client8.png";

const copy = {
  ko: {
    title: "수상 및 인증",
    subtitle: "브레인웍스의 우수한 AI 기술력 기반 수상 및 인증",
    awardsLabel: "주요 수상 이력",
    certificationsLabel: "주요 인증 현황",
    awardAltSuffix: "수상 이미지",
    certAltSuffix: "인증 이미지",
    partnersLabel: "함께하는 협력 기관",
  },
  en: {
    title: "Awards & Certifications",
    subtitle:
      "A comprehensive view of the accolades and certifications that validate Brainworks’ expertise.",
    awardsLabel: "Awards",
    certificationsLabel: "Certifications",
    awardAltSuffix: "award image",
    certAltSuffix: "certification image",
    partnersLabel: "Partners",
  },
};

/*
 * 협력 기관. 메인 로고 띠와 교육 페이지 고객 로고를 합치고 중복(KOSME, IPA)을 뺐다.
 * 이름은 로고에 적힌 기관명이다. DMI는 로고에 약칭만 있어 약칭으로 둔다.
 * public/images/partners의 로고는 각 기관 사이트와 위키미디어 공용에서 받았고,
 * 어두운 배경용 흰 글자 로고(대구대, MGA, GITC)는 흰 부분을 잉크색으로 바꿨다.
 */
const partnerGroups = [
  {
    id: "organizations",
    label: { ko: "공공기관과 기업", en: "Public institutions & companies" },
    items: [
      {
        id: "kai",
        name: { ko: "한국항공우주산업", en: "Korea Aerospace Industries" },
        logo: kai,
      },
      {
        id: "katech",
        name: { ko: "한국자동차연구원", en: "KATECH" },
        logo: katech,
      },
      {
        id: "kosme",
        name: { ko: "중소벤처기업진흥공단", en: "KOSME" },
        logo: kosme,
      },
      {
        id: "kpc",
        name: { ko: "한국생산성본부", en: "Korea Productivity Center" },
        logo: kpc,
      },
      {
        id: "ipa",
        name: {
          ko: "한국IT비즈니스진흥협회",
          en: "Korea IT Business Promotion Association",
        },
        logo: ipa,
      },
      {
        id: "dip",
        name: {
          ko: "대구디지털혁신진흥원",
          en: "Daegu Digital Innovation Promotion Agency",
        },
        logo: dip,
      },
      {
        id: "jntp",
        name: { ko: "전남테크노파크", en: "Jeonnam Technopark" },
        logo: "/images/education/전남tp.png",
      },
      {
        id: "cni",
        name: { ko: "충남연구원", en: "ChungNam Institute" },
        logo: cni,
      },
      {
        id: "nipa",
        name: {
          ko: "정보통신산업진흥원",
          en: "National IT Industry Promotion Agency",
        },
        logo: "/images/partners/nipa.png",
      },
      {
        id: "gitc",
        name: {
          ko: "경북IT융합산업기술원",
          en: "Gyeongbuk IT Convergence Industry Technology Institute",
        },
        logo: "/images/partners/gitc.png",
      },
      { id: "dmi", name: { ko: "DMI", en: "DMI" }, logo: dmi },
    ],
  },
  {
    id: "universities",
    label: { ko: "대학", en: "Universities" },
    items: [
      {
        id: "cnu",
        name: { ko: "충남대학교", en: "Chungnam National University" },
        logo: "/images/education/충남대.png",
      },
      {
        id: "sch",
        name: { ko: "순천향대학교", en: "Soonchunhyang University" },
        logo: "/images/education/순천향대학교.jpg",
      },
      {
        id: "kongju",
        name: { ko: "국립공주대학교", en: "Kongju National University" },
        logo: "/images/education/공주대.png",
      },
      {
        id: "jnu",
        name: { ko: "전남대학교", en: "Chonnam National University" },
        logo: "/images/partners/jnu.png",
      },
      {
        id: "scnu",
        name: { ko: "국립순천대학교", en: "Sunchon National University" },
        logo: "/images/partners/scnu.png",
      },
      {
        id: "inje",
        name: { ko: "인제대학교", en: "Inje University" },
        logo: "/images/partners/inje-ci.png",
      },
      {
        id: "daegu",
        name: { ko: "대구대학교", en: "Daegu University" },
        logo: "/images/partners/daegu.png",
      },
      {
        id: "mga",
        name: {
          ko: "Middle Georgia State University",
          en: "Middle Georgia State University",
        },
        logo: "/images/partners/mga.png",
      },
    ],
  },
];

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
    <div className="min-h-screen bg-[var(--bw-color-surface-muted)]">
      <Header />
      <SeoMetadata title={`${t.title} | Brainworks`} description={t.subtitle} />
      <main id="main-content">
        <PageHero
          variant="media"
          media={{ kind: "image", src: "/images/about/hero.webp", alt: "" }}
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
                          className="grid gap-6 bg-white px-6 py-8 md:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] md:items-center md:gap-10 md:px-8"
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
                          className="grid gap-6 bg-white px-6 py-8 md:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] md:items-center md:gap-10 md:px-8"
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

                  <section>
                    <SectionHeader eyebrow="Partners" title={t.partnersLabel} />
                    <div className="mt-6 space-y-10">
                      {partnerGroups.map((group) => (
                        <div key={group.id}>
                          <h3 className="text-[15px] font-bold text-accent-text">
                            {group.label[language]}
                          </h3>
                          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {group.items.map((partner) => (
                              <li
                                key={partner.id}
                                className="flex h-24 items-center justify-center rounded-2xl border border-line bg-white px-5"
                              >
                                <Image
                                  src={partner.logo}
                                  alt={partner.name[language]}
                                  width={160}
                                  height={48}
                                  className="h-12 w-auto max-w-full object-contain"
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
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

export async function getServerSideProps({ locale }) {
  const data = await getPublishedHonors(locale === "en" ? "en" : "ko");
  return { props: data };
}
