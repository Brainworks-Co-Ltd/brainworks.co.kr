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
        <PageHero
          variant="media"
          media={{ kind: "image", src: "/images/services/hero/manufacturing.webp", alt: "" }}
          eyebrow={language === "ko" ? "Brainworks AI" : "Brainworks AI"}
          title={language === "ko" ? "AI 솔루션" : "AI Solutions"}
          description={
            language === "ko"
              ? "사업 영역별 문제와 솔루션을 살펴보고, 필요한 협업을 시작하세요."
              : "Explore our domains, solutions, and the problems we help teams solve."
          }
          action={{
            href: "/contact?topic=solution",
            label: language === "ko" ? "솔루션 문의" : "Discuss a solution",
          }}
        />
        {/* 진입 분기 — docs/designs/detail-page-roles.md */}
        <PageAudience
          audience="특정 산업 현장의 문제를 풀 AI 제품을 찾는 담당자"
          scope="제조, 에이전트, 헬스케어·바이오, 스마트시티·안전 네 영역의 솔루션을 다룹니다."
          redirects={[
              { href: "/consulting", label: "무엇을 도입할지부터 정해야 한다면 AI 컨설팅" },
              { href: "/education", label: "조직 역량부터 키워야 한다면 AI 전문교육" },
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
