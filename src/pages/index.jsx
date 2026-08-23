import React from "react";
import Header from "@/components/Header";
import HomeHero from "@/components/HomeHero";
import BusinessAreaCarousel from "@/components/home/BusinessAreaCarousel";
import Clients from "@/components/Clients";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import BidNoticePopup from "@/components/BidNoticePopup";
import { getLatestNews } from "@/lib/news";
import { getActivePopups } from "@/data/popups";

export default function Home({ newsItems, popups }) {
  return (
    <div id="main-content" className="min-h-screen">
      <Header />
      <BidNoticePopup popups={popups} />
      <HomeHero />
      <BusinessAreaCarousel />
      <Clients />
      <CTA />
      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  const newsItems = getLatestNews(3);
  const popups = getActivePopups();

  return {
    props: {
      newsItems,
      popups,
    },
  };
}
