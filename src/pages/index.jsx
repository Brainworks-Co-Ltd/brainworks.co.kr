import React from "react";
import Header from "@/components/Header";
import IndustrialHero from "@/components/industrial/IndustrialHero";
import DomainGrid from "@/components/industrial/DomainGrid";
import LatestNews from "@/components/home/LatestNews";
import Clients from "@/components/Clients";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import PopupNoticeRegion from "@/components/popup-notices/PopupNoticeRegion";
import { getPublishedNewsList } from "@/server/modules/news/query-service";
import { getPublishedPopupNotices } from "@/server/modules/popup-notices/queries";
import { getPublishedBusinessAreas } from "@/server/modules/catalog/queries";

export default function Home({ newsItems, popupNotices, areas }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <PopupNoticeRegion notices={popupNotices} />
        <IndustrialHero />
        <Clients />
        <DomainGrid />
        <LatestNews items={newsItems} />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  const currentLocale = locale === "en" ? "en" : "ko";
  const newsItems = (
    await getPublishedNewsList({
      locale: currentLocale,
    })
  ).items;
  const popupNotices = await getPublishedPopupNotices(currentLocale);
  const areas = await getPublishedBusinessAreas(currentLocale);

  return {
    props: {
      newsItems,
      popupNotices,
      areas,
    },
  };
}
