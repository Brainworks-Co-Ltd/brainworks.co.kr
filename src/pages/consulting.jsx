import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocale } from "@/shared/routing/useLocale";
import { ContactCtaBlock } from "@/components/public/ContactCtaBlock";
import { PageHero } from "@/components/public/PageHero";
import { PageAudience } from "@/components/public/PageAudience";
import { EditorialSection } from "@/components/public/EditorialSection";
import { SeoMetadata } from "@/components/public/SeoMetadata";

const copy = {
  ko: {
    heroTitle: "AI 컨설팅",
    heroSubtitle: "전략 수립부터 구축, 고도화까지 현장에 맞춘 AI 컨설팅 제공",
    heroCta: "상담 요청",
    valueTitle: "주요 컨설팅 가치",
    processTitle: "컨설팅 단계",
    caseTitle: "주요 컨설팅 사례",
    contactTitle: "AI로 어떤 문제를 해결하고 싶으신가요?",
    contactDesc:
      "팀에서 겪고 있는 과제를 알려주시면, 데이터 진단부터 파일럿 설계까지 맞춤 제안을 드립니다.",
  },
  en: {
    heroTitle: "AI Consulting",
    heroSubtitle:
      "We deliver AI consulting tailored to your operations—from strategy to deployment and optimisation.",
    heroCta: "Request a Consultation",
    valueTitle: "How We Create Value",
    processTitle: "Consulting Methodology",
    caseTitle: "Representative Engagements",
    contactTitle: "What challenge do you want AI to solve?",
    contactDesc:
      "Share your current initiatives and we will propose data diagnostics, pilots, and deployment plans aligned to your goals.",
  },
};

const offerings = [
  {
    id: "strategy",
    title: {
      ko: "AI 전략 및 로드맵",
      en: "AI Strategy & Roadmap",
    },
    description: {
      ko: "비즈니스 목표와 조직 역량을 고려한 중장기 AI 전략 수립",
      en: "We craft mid-to-long term AI roadmaps aligned with your business objectives and internal capabilities.",
    },
    bullets: {
      ko: [
        "현황 진단 및 성숙도 평가",
        "우선 과제 발굴 및 ROI 분석",
        "데이터·기술 아키텍처 설계",
        "거버넌스 및 운영 체계 수립",
      ],
      en: [
        "Current-state assessment & maturity scoring",
        "Priority use-case discovery with ROI modelling",
        "Data & technology architecture design",
        "Governance and operating model definition",
      ],
    },
  },
  {
    id: "delivery",
    title: {
      ko: "AI 솔루션 설계와 구축",
      en: "Solution Design & Implementation",
    },
    description: {
      ko: "파일럿 설계부터 모델 개발, MLOps 환경 구성까지 전주기 지원",
      en: "End-to-end execution covering pilot design, model development, and MLOps enablement.",
    },
    bullets: {
      ko: [
        "파일럿 및 PoC 설계·운영",
        "모델 개발 및 성능 개선",
        "MLOps/데이터 파이프라인 구축",
        "서비스 전환 및 운영 이관",
      ],
      en: [
        "Pilot and PoC planning & execution",
        "Model engineering and performance optimisation",
        "MLOps and data pipeline build-out",
        "Transition to production and runbook handover",
      ],
    },
  },
  {
    id: "adoption",
    title: {
      ko: "조직 내 정착과 확산",
      en: "Adoption & Change Management",
    },
    description: {
      ko: "교육과 거버넌스를 통해 조직 전체로 AI 활용 문화 확산",
      en: "We help embed AI across the organisation through education programmes and governance.",
    },
    bullets: {
      ko: [
        "AI 교육·코칭 프로그램 운영",
        "성과 관리 지표 체계화",
        "사내 거버넌스/CoE 구축",
        "지속적 고도화를 위한 체계 마련",
      ],
      en: [
        "Run AI enablement workshops and coaching",
        "Operationalise KPI tracking & value measurement",
        "Establish in-house governance / CoE",
        "Set up continuous improvement frameworks",
      ],
    },
  },
];

const processSteps = [
  {
    id: 1,
    title: {
      ko: "문제 정의",
      en: "Define",
    },
    desc: {
      ko: "비즈니스 목표, 제약 조건, 데이터를 함께 검토하여 명확한 목표 설정",
      en: "Align on business objectives, constraints, and available data to establish clear goals.",
    },
  },
  {
    id: 2,
    title: {
      ko: "데이터 진단",
      en: "Diagnose",
    },
    desc: {
      ko: "데이터 품질과 프로세스를 분석하고 개선 계획 수립",
      en: "Assess data quality and processes to design remediation and preparation plans.",
    },
  },
  {
    id: 3,
    title: {
      ko: "파일럿 설계",
      en: "Design",
    },
    desc: {
      ko: "파일럿 범위와 지표, 모델링 접근 방법 정의",
      en: "Design pilot scope, success metrics, and modelling approach.",
    },
  },
  {
    id: 4,
    title: {
      ko: "구현 및 검증",
      en: "Deliver",
    },
    desc: {
      ko: "모델을 개발·검증하고 MLOps 환경으로 연결",
      en: "Build and validate the solution, connecting it to MLOps for deployment.",
    },
  },
  {
    id: 5,
    title: {
      ko: "확산과 정착",
      en: "Scale",
    },
    desc: {
      ko: "성과 검증 후 교육, 운영 체계로 확장하여 조직 내 확산 지원",
      en: "Scale proven value through training, governance, and operating processes.",
    },
  },
];

export default function Consulting() {
  const { language } = useLocale();
  const t = copy[language];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SeoMetadata
        title={`${t.heroTitle} | Brainworks`}
        description={t.heroSubtitle}
      />
      <main id="main-content">
        <PageHero
          variant="plain"
          dark
          eyebrow="Brainworks Consulting"
          title={t.heroTitle}
          description={t.heroSubtitle}
          action={{
            href: "/contact?topic=consulting",
            label: t.heroCta,
          }}
          secondaryAction={{
            href: "/services",
            label:
              language === "ko" ? "AI 솔루션 보기" : "Explore AI solutions",
          }}
        />
        {/* 진입 분기 — docs/designs/detail-page-roles.md */}
        <PageAudience
          audience="무엇을 어떻게 도입할지부터 정해야 하는 담당자"
          scope="대상 문제와 제공 가치, 진행 과정을 설명하고 상담으로 연결합니다."
          redirects={[
              { href: "/services", label: "도입할 제품이 정해졌다면 AI 솔루션" },
              { href: "/education", label: "인력 양성이 목적이라면 AI 전문교육" },
          ]}
        />


        <EditorialSection
          eyebrow="Consulting value"
          title={t.valueTitle}
          surface="plain"
        >
          <div className="grid gap-6">
            {offerings.map((item) => (
              <article
                key={item.id}
                className="grid gap-6 rounded-[var(--bw-radius-card)] border border-[var(--bw-line-strong)] bg-[var(--bw-color-surface-muted)] p-[var(--bw-space-6)] md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] md:gap-12"
              >
                <h3 className="bw-h2 text-[var(--bw-color-ink)]">
                  {item.title[language]}
                </h3>
                <div>
                  <p className="bw-body max-w-2xl text-[var(--bw-color-muted)]">
                    {item.description[language]}
                  </p>
                  <ul className="mt-6 grid gap-x-8 gap-y-3 text-sm text-[var(--bw-color-ink)] sm:grid-cols-2">
                    {item.bullets[language].map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--bw-color-brand)]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </EditorialSection>

        <EditorialSection
          eyebrow="Consulting process"
          title={t.processTitle}
          surface="muted"
        >
          <ol className="grid gap-4">
            {processSteps.map((step) => (
              <li
                key={step.id}
                className="grid gap-4 rounded-[var(--bw-radius-card)] border border-[var(--bw-line-strong)] bg-[var(--bw-color-surface)] p-[var(--bw-space-6)] md:grid-cols-[5rem_minmax(0,0.5fr)_minmax(0,1fr)] md:items-start md:gap-8"
              >
                <div>
                  <span className="bw-marker">0{step.id}</span>
                </div>
                <h3 className="bw-title text-[var(--bw-color-ink)]">
                  {step.title[language]}
                </h3>
                <p className="bw-body text-[var(--bw-color-muted)]">
                  {step.desc[language]}
                </p>
              </li>
            ))}
          </ol>
        </EditorialSection>

        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ContactCtaBlock
            title={t.contactTitle}
            description={t.contactDesc}
            href="/contact?topic=consulting"
            label={t.heroCta}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
