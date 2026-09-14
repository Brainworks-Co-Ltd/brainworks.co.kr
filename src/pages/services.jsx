import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/public/PageHero";
import { PageAudience } from "@/components/public/PageAudience";
import { ContactCtaBlock } from "@/components/public/ContactCtaBlock";
import { StatementBand } from "@/components/public/StatementBand";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import BusinessAreaExplorer from "@/components/services/BusinessAreaExplorer";
import { useLocale } from "@/shared/routing/useLocale";
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
        {/* 상단 계약 — docs/designs/detail-page-roles.md
            눈썹이 페이지 이름, h1이 대상, 설명이 범위다. 대상 문장을 접힘선 위로
            올려 첫 화면만 보고 "이 페이지가 나를 위한 것인가"를 판단할 수 있게 한다.
            문구는 새로 짓지 않고 03-02와 03-03 원문을 그대로 옮겼다. */}
        <PageHero
          variant="media"
          media={{ kind: "image", src: "/images/services/hero/manufacturing.webp", alt: "" }}
          eyebrow={language === "ko" ? "AI 솔루션" : "AI Solutions"}
          title={
            language === "ko"
              ? "특정 산업 현장의 문제를 풀 AI 제품을 찾는 담당자"
              : "Teams looking for an AI product to solve a problem on the floor"
          }
          description={
            language === "ko"
              ? "제조, 에이전트, 헬스케어·바이오, 스마트시티·안전 네 영역의 솔루션을 다룹니다."
              : "Covers solutions across four domains: manufacturing, agents, healthcare and bio, and smart city and safety."
          }
          action={{
            href: "/contact?topic=solution",
            label: language === "ko" ? "솔루션 문의" : "Discuss a solution",
          }}
        />
        <PageAudience
          redirects={[
            {
              href: "/consulting",
              label:
                language === "ko"
                  ? "무엇을 도입할지부터 정해야 한다면 AI 컨설팅"
                  : "Still deciding what to adopt? See AI Consulting",
            },
            {
              href: "/education",
              label:
                language === "ko"
                  ? "조직 역량부터 키워야 한다면 AI 전문교육"
                  : "Need to build team capability first? See AI Professional Education",
            },
          ]}
        />

        <div className="mx-auto max-w-6xl px-6">
          <BusinessAreaExplorer areas={areas} />
        </div>

        {/* 문구는 새로 짓지 않는다. 08 §1.1이 대표 메시지 원문[src:1]으로
            인용한 문장을 §1.4의 합니다체로 옮긴 것이다. */}
        <StatementBand
          eyebrow={language === "ko" ? "브레인웍스가 믿는 것" : "What we believe"}
          text={
            language === "ko"
              ? "AI가 모든 산업과 조직에 보편적으로 적용될 수 있다고 믿지 않습니다. 산업마다 다른 해결책을 설계합니다."
              : "We do not believe one AI fits every industry. We design a different answer for each."
          }
        />

        <section className="mx-auto max-w-5xl px-6">
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
  return { props: { areas: await getPublishedBusinessAreas(locale === "en" ? "en" : "ko") } };
}
