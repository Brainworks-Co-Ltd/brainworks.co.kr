import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/public/PageHero";
import { PageAudience } from "@/components/public/PageAudience";
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
      <main id="main-content">
        <PageHero
          variant="plain"
          dark
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
      </main>
      <Footer />
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  return { props: { areas: await getPublishedBusinessAreas(locale === "en" ? "en" : "ko") } };
}
