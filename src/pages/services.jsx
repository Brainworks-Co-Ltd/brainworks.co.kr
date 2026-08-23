import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageHero } from "@/components/public/PageHero";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import BusinessAreaExplorer from "@/components/services/BusinessAreaExplorer";
import { useLocale } from "@/shared/routing/useLocale";

export default function Services() {
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
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <BusinessAreaExplorer />
        </div>
      </main>
      <Footer />
    </div>
  );
}
