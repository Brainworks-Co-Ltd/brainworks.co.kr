import React from "react";
import Header from "@/components/Header";
import HomeHero from "@/components/HomeHero";
import BusinessAreaCarousel from "@/components/home/BusinessAreaCarousel";
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
        <HomeHero />
        <Clients />
        <BusinessAreaCarousel areas={areas} />
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
