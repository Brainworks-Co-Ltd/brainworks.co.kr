import React from "react";
import Header from "@/components/Header";
import IndustrialHero from "@/components/industrial/IndustrialHero";
import DomainGrid from "@/components/industrial/DomainGrid";
import LatestNews from "@/components/home/LatestNews";
import Clients from "@/components/Clients";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import PopupNoticeRegion from "@/components/popup-notices/PopupNoticeRegion";
import { SeoMetadata } from "@/components/public/SeoMetadata";
import { useLocale } from "@/shared/routing/useLocale";
import { getPublishedNewsList } from "@/server/modules/news/query-service";
import { getPublishedPopupNotices } from "@/server/modules/popup-notices/queries";

export default function Home({ newsItems, popupNotices }) {
  const { language } = useLocale();
  return (
    <div className="min-h-screen">
      <Header />
      <SeoMetadata
        title={language === "ko" ? "브레인웍스" : "Brainworks"}
        description={
          language === "ko"
            ? "브레인웍스는 제조, 의료, 도시, 상담 현장에 AI 자동화를 구축합니다."
            : "Brainworks builds AI automation for manufacturing, healthcare, city operations, and customer support."
        }
      />
      <main id="main-content">
        <PopupNoticeRegion notices={popupNotices} />
        {/*
          순서는 승인 기획 07의 핵심 여정을 따른다.
          정체성 → 사업 영역 → 신뢰 근거 → 다음 행동.
          고객사 로고는 신뢰 근거이므로 사업 영역 뒤에 온다.
        */}
        <IndustrialHero />
        <DomainGrid />
        <Clients />
        <LatestNews items={newsItems} />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  const currentLocale = locale === "en" ? "en" : "ko";
  const [newsList, popupNotices] = await Promise.all([
    getPublishedNewsList({ locale: currentLocale }),
    getPublishedPopupNotices(currentLocale),
  ]);

  return {
    props: {
      newsItems: newsList.items,
      popupNotices,
    },
  };
}
