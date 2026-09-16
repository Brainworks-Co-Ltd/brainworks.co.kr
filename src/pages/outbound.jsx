import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocale } from "@/shared/routing/useLocale";
import { PageHero } from "@/components/public/PageHero";
import { PageAudience } from "@/components/public/PageAudience";
import { ContactCtaBlock } from "@/components/public/ContactCtaBlock";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import DetailSectionHead from "@/components/public/DetailSectionHead";

/* 국가명과 파트너 수는 원본 지도 이미지(public/images/outbound)에 적힌 그대로다.
   국내는 지도 아래 "Korea 10개사"로 따로 적혀 있던 값이다. */
const partnerCountries = [
  { key: "korea", label: { ko: "대한민국", en: "Korea" }, count: 10 },
  {
    key: "uzbekistan",
    label: { ko: "우즈베키스탄", en: "Uzbekistan" },
    count: 8,
  },
  { key: "vietnam", label: { ko: "베트남", en: "Vietnam" }, count: 4 },
  { key: "indonesia", label: { ko: "인도네시아", en: "Indonesia" }, count: 3 },
  { key: "usa", label: { ko: "미국", en: "U.S.A." }, count: 1 },
  { key: "qatar", label: { ko: "카타르", en: "Qatar" }, count: 1 },
  { key: "poland", label: { ko: "폴란드", en: "Poland" }, count: 1 },
  { key: "australia", label: { ko: "호주", en: "Australia" }, count: 1 },
  { key: "singapore", label: { ko: "싱가포르", en: "Singapore" }, count: 1 },
];

const copy = {
  ko: {
    heroTitle: "글로벌 프로그램",
    // 상단 계약 — docs/designs/detail-page-roles.md (2026-09-16 개정).
    // heroTitle은 SeoMetadata와 화면 h1이 함께 쓴다.
    heroSubtitle:
      "해외 비즈니스 네트워크 구축과 글로벌 확장, 글로벌 AI 전문 교육을 지원하는 풀 패키지 프로그램",
    ctaPrimary: "상담 요청",
    sectionTitle: "주요 프로그램",
    aiSectionTitle: "글로벌 AI 전문 교육 프로그램",
    aiSectionSubtitle:
      "실전 중심의 해커톤, 인턴십, 교육 과정을 통해 글로벌 AI 인재를 양성합니다.",
    contactTitle: "해외 진출, 글로벌 AI 교육 문의",
    contactSubtitle:
      "희망 지역과 목표를 공유해 주시면 맞춤형 글로벌 엑셀러레이션 로드맵과 제휴 네트워크를 제안드립니다.",
    contactCta: "상담 요청",
  },
  en: {
    heroTitle: "Global Program",
    heroSubtitle:
      "A full-service accelerator that secures overseas buyers and accelerates your global expansion, supporting global AI education.",
    ctaPrimary: "Request a Consultation",
    sectionTitle: "Programme Components",
    aiSectionTitle: "Global AI Professional Programmes",
    aiSectionSubtitle:
      "Develop global-ready AI talent through hackathons, internships, and expert-led courses.",
    contactTitle: "Tell Us Your Global Plan",
    contactSubtitle:
      "Share your target regions and objectives so we can craft a tailored accelerator roadmap and introduce partners.",
    contactCta: "Request a Consultation",
  },
};

const programs = [
  {
    id: "business-matching",
    badge: { ko: "1대1 비즈니스 매칭", en: "1:1 Business Matching" },
    title: {
      ko: "해외 현지 기업과의 1:1 비즈니스 매칭",
      en: "Personalised Matching with Overseas Buyers",
    },
    description: {
      ko: "인도네시아, 베트남, 우즈베키스탄 등 주요 신흥 시장의 기업과 연결하여 신규 바이어 확보와 파트너십 매칭",
      en: "Connect with vetted companies in Indonesia, Vietnam, Uzbekistan, and other growth markets to secure new buyers and partners.",
    },
    bullets: {
      ko: [
        "현지 시장 분석과 타겟 바이어 리스트업",
        "비즈니스 미팅 일정 조율 및 통역 지원",
        "사후 후속 협상 및 계약 체결 컨설팅",
      ],
      en: [
        "Local market intelligence and curated buyer shortlists",
        "Meeting scheduling, facilitation, and interpretation support",
        "Post-meeting negotiation and contract advisory",
      ],
    },
  },
  {
    id: "exhibition-participation",
    badge: { ko: "글로벌 전시회 참여", en: "Global Exhibition Participation" },
    title: {
      ko: "글로벌 전시회 부스 운영 및 홍보",
      en: "End-to-end Support for Global Exhibitions",
    },
    description: {
      ko: "베트남 ICTCOMM, 일본 IT WEEK, 미국 CES, 스페인 MWC 등 글로벌 전시회 참가를 위한 부스 설계 및 홍보, 프로그램 기획",
      en: "Handle booth design and marketing for shows such as Vietnam ICTCOMM, Japan IT WEEK, CES, and MWC.",
    },
    bullets: {
      ko: [
        "전시회 선정과 참가 신청 대행",
        "부스 설계와 시공, 프로모션 콘텐츠 제작",
        "현장 운영 스태프 및 실시간 리드 관리",
      ],
      en: [
        "Recommend events and manage registration logistics",
        "Design and build booths, create promotional assets",
        "On-site staffing and real-time lead capture management",
      ],
    },
  },
  {
    id: "exhibition-scouting",
    badge: { ko: "글로벌 전시회 탐방", en: "Global Exhibition Scouting" },
    title: {
      ko: "바이어 탐색형 글로벌 전시회 탐방",
      en: "Scouting Tours for New Buyers & Partners",
    },
    description: {
      ko: "전시회 현장을 탐방하며 바이어와 파트너를 발굴할 수 있도록 이동, 숙박, 네트워킹 프로그램",
      en: "Discover buyers and partners through curated exhibition tours covering travel, lodging, and networking.",
    },
    bullets: {
      ko: [
        "탐방 일정, 숙박, 이동편 기획 및 운영",
        "비즈니스 매칭과 네트워킹 세션 구성",
        "시장 트렌드 브리핑 및 현장 통역 지원",
      ],
      en: [
        "Plan and manage travel, accommodation, and agenda",
        "Arrange business matching and networking sessions",
        "Provide trend briefings and on-site interpretation",
      ],
    },
  },
  {
    id: "global-training",
    badge: { ko: "글로벌 연수", en: "Global Training" },
    title: {
      ko: "해외 연수로 글로벌 역량 강화",
      en: "Executive Programmes & Immersion Trips",
    },
    description: {
      ko: "미국과 베트남 주요 대학 및 기업과 연계한 연수 프로그램으로 글로벌 역량 강화",
      en: "Strengthen global capability through immersion programmes with universities and companies across the US and Vietnam.",
    },
    bullets: {
      ko: [
        "기업 맞춤형 글로벌 역량 진단과 커리큘럼 설계",
        "대학과 기업 현장 연계 세미나 및 워크숍",
        "연수 이후 글로벌 전략 실행 코칭",
      ],
      en: [
        "Assess capability gaps and build tailored curricula",
        "Deliver seminars and workshops with partner universities and enterprises",
        "Provide post-programme coaching to execute global strategies",
      ],
    },
  },
];

const aiPrograms = [
  {
    id: "global-hackathon",
    title: { ko: "글로벌 해커톤", en: "Global Hackathon" },
    description: {
      ko: "다국적 팀 빌딩과 글로벌 멘토단의 피드백으로 실전 문제를 해결하는 집중 프로그램",
      en: "An immersive hackathon where multinational teams solve real briefs with guidance from global mentors.",
    },
    bullets: {
      ko: [
        "3~5인 다국적 팀 구성 및 문제 정의 워크숍",
        "글로벌 멘토와 투자자 피드백과 데모 세션",
        "우수 팀 글로벌 데모데이 참가 및 파트너 연계",
      ],
      en: [
        "Form 3-5 member cross-border teams with facilitated problem framing",
        "Daily feedback from global mentors and investors",
        "Top teams invited to international demo days and partner intros",
      ],
    },
  },
  {
    id: "global-ai-internship",
    title: { ko: "글로벌 AI 인턴십", en: "Global AI Internship" },
    description: {
      ko: "해외 파트너 기업과 연계한 8~12주 프로젝트 인턴십으로 현장 실무 역량 강화",
      en: "An 8-12 week placement with overseas partners delivering hands-on AI projects.",
    },
    bullets: {
      ko: [
        "도메인 맞춤형 프로젝트 매칭과 온보딩",
        "현지 멘토와 주간 성과 리뷰와 코칭",
        "귀국 후 포트폴리오 및 커리어 상담 제공",
      ],
      en: [
        "Tailored project matching and onboarding support",
        "Weekly performance reviews with on-site mentors",
        "Post-programme portfolio and career coaching",
      ],
    },
  },
  {
    id: "global-ai-education",
    title: { ko: "글로벌 AI 교육", en: "Global AI Education" },
    description: {
      ko: "대학과 기관 연계형 커리큘럼으로 최신 AI 기술과 글로벌 사례 학습",
      en: "Modular courses for universities and organisations covering advanced AI and global best practices.",
    },
    bullets: {
      ko: [
        "LLM, 생성형 AI, 윤리 등 최신 트렌드 AI 심화 모듈",
        "해외 대학 연계 AI 전문 교육 및 인증",
        "수료생 글로벌 커뮤니티 및 후속 프로젝트 연계",
      ],
      en: [
        "Deep-dive modules on LLMs, generative AI, ethics, and deployment",
        "Case studies anchored in global enterprise implementations",
        "Alumni community access with follow-on project opportunities",
      ],
    },
  },
];

export default function Outbound() {
  const { language } = useLocale();
  const t = copy[language];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SeoMetadata
        title={`${t.heroTitle} | Brainworks`}
        description={t.heroSubtitle}
      />

      <main id="main-content" data-accent="global" className="pb-16">
        <PageHero
          variant="media"
          media={{
            kind: "image",
            src: "/images/services/hero/smartcity.webp",
            alt: "",
          }}
          eyebrow={language === "ko" ? "사업 영역" : "Business"}
          title={t.heroTitle}
          description={t.heroSubtitle}
          chips={programs.map((item) => item.badge[language])}
          action={{
            href: "/contact?topic=global",
            label: t.ctaPrimary,
          }}
        />
        {/* 대상 분기만 담당한다. 페이지 이름과 서비스 설명은 히어로가 맡는다. */}
        <PageAudience
          redirects={[
            {
              href: "/education",
              label:
                language === "ko"
                  ? "국내 교육 과정이라면 AI 전문교육"
                  : "Looking for domestic training? See AI Professional Education",
            },
            {
              href: "/services",
              label:
                language === "ko"
                  ? "AI 제품 도입이라면 AI 솔루션"
                  : "Adopting an AI product? See AI Solutions",
            },
          ]}
        />

        {/* 파트너 망은 표가 아니라 이름으로 보여준다. 나라 이름을 크게 세우고
            파트너 수는 곁의 작은 숫자로 붙인다. 읽을 표가 아니라 한눈에 지나가는
            면이 되도록 어두운 구간에 얹는다. 이 페이지의 유일한 어두운 구간이다. */}
        <section className="bg-ink-strong text-white">
          <div className="inner text-center">
            <p className="text-[16px] font-semibold text-accent-strong">
              Global network
            </p>
            <h2 className="mt-4 text-[28px] font-semibold leading-[1.3] lg:text-[40px]">
              {language === "ko"
                ? "전세계 12개국 이상의 파트너와 일합니다"
                : "We work with partners across more than 12 countries"}
            </h2>
            <ul className="mt-14 flex flex-wrap items-baseline justify-center gap-x-10 gap-y-6 lg:mt-20 lg:gap-x-14">
              {partnerCountries.map((country, index) => (
                <li
                  key={country.key}
                  style={{ transitionDelay: `${Math.min(index, 8) * 60}ms` }}
                  className="bw-reveal flex items-baseline gap-2"
                >
                  <span className="text-[26px] font-semibold leading-none lg:text-[38px]">
                    {country.label[language]}
                  </span>
                  <span className="text-[15px] font-semibold text-accent-strong lg:text-[17px]">
                    {country.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <div className="inner">
            <DetailSectionHead
              eyebrow="Global programs"
              title={t.sectionTitle}
            />
            <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-2 lg:gap-y-16">
              {programs.map((program, index) => (
                <article
                  key={program.id}
                  /* 순차 등장 지연. 전환과 저동작 대응은 industrial.css의 .bw-reveal이 맡는다. */
                  style={{ transitionDelay: `${Math.min(index, 6) * 80}ms` }}
                  className="bw-reveal border-t border-line pt-8"
                >
                  <p className="text-[16px] font-bold text-accent-text">
                    {program.badge[language]}
                  </p>
                  <h3 className="mt-3 text-[22px] font-semibold text-ink-strong lg:text-[28px]">
                    {program.title[language]}
                  </h3>
                  <p className="mt-3 text-[18px] leading-[1.75]">
                    {program.description[language]}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {program.bullets[language].map((bullet) => (
                      <li
                        key={[program.id, bullet].join("-")}
                        className="flex items-start gap-2 text-[17px] leading-[1.7]"
                      >
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="inner">
            <DetailSectionHead
              eyebrow="Global AI programs"
              title={t.aiSectionTitle}
              description={t.aiSectionSubtitle}
            />
            <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-3 lg:gap-y-16">
              {aiPrograms.map((program, index) => (
                <article
                  key={program.id}
                  /* 순차 등장 지연. 전환과 저동작 대응은 industrial.css의 .bw-reveal이 맡는다. */
                  style={{ transitionDelay: `${Math.min(index, 6) * 80}ms` }}
                  className="bw-reveal border-t border-line pt-8"
                >
                  <p className="text-[16px] font-bold text-accent-text">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-[22px] font-semibold text-ink-strong lg:text-[28px]">
                    {program.title[language]}
                  </h3>
                  <p className="mt-3 text-[18px] leading-[1.75]">
                    {program.description[language]}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {program.bullets[language].map((bullet) => (
                      <li
                        key={[program.id, bullet].join("-")}
                        className="flex items-start gap-2 text-[17px] leading-[1.7]"
                      >
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="inner">
          <ContactCtaBlock
            title={t.contactTitle}
            description={t.contactSubtitle}
            href="/contact?topic=global"
            label={t.contactCta}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
