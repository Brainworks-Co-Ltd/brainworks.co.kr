import React from "react";
import Header from "@/components/Header";
import HomeHero from "@/components/HomeHero";
import BusinessAreaCarousel from "@/components/home/BusinessAreaCarousel";
import LatestNews from "@/components/home/LatestNews";
import Clients from "@/components/Clients";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { getPublishedNewsList } from "@/server/modules/news/query-service";

export default function Home({ newsItems }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        <HomeHero />
        <BusinessAreaCarousel />
        <Clients />
        <LatestNews items={newsItems} />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  const newsItems = (
    await getPublishedNewsList({
      locale: locale === "en" ? "en" : "ko",
    })
  ).items;

  return {
    props: {
      newsItems,
    },
  };
}
